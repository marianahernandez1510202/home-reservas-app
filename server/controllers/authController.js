const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar token JWT con validación
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  const expire = process.env.JWT_EXPIRE || '24h';

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }

  console.log('✅ Generando token con expire:', expire);
  return jwt.sign({ id }, secret, {
    expiresIn: expire
  });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // 🔍 DEBUG LOGS
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 JWT_SECRET existe?', !!process.env.JWT_SECRET);
    console.log('🔍 JWT_SECRET length:', process.env.JWT_SECRET?.length);
    console.log('🔍 JWT_EXPIRE:', process.env.JWT_EXPIRE);

    const { name, email, password, phone, role } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        error: 'Este email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'guest'
    });

    console.log('✅ Usuario creado:', user._id);

    // Generar token
    const token = generateToken(user._id);
    console.log('✅ Token generado exitosamente');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en register:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporcione email y contraseña'
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};