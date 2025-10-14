const jwt = require('jsonwebtoken');  // ← DEBE estar descomentado
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado, token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado, token inválido'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `El rol ${req.user.role} no tiene permisos para esta acción`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };