const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Configuración de timeout más largo para tests
jest.setTimeout(30000);

describe('🔐 Auth Endpoints - Suite de Pruebas', () => {
  
  beforeAll(async () => {
    // Conectar a base de datos de prueba
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/home_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Limpiar usuarios antes de cada test
    await User.deleteMany({});
  });

  // ✅ CASO DE PRUEBA 1: Registro exitoso
  describe('POST /api/auth/register', () => {
    it('CP-001: Debería registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        name: 'Juan Pérez',
        email: 'juan.test@example.com',
        password: 'Password123!',
        phone: '+52 55 1234 5678'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).toHaveProperty('name', userData.name);
      expect(res.body.user).not.toHaveProperty('password');
    });

    // ✅ CASO DE PRUEBA 2: Email duplicado
    it('CP-002: Debería rechazar email duplicado con error 409', async () => {
      const userData = {
        name: 'Usuario Test',
        email: 'duplicate@example.com',
        password: 'Password123!'
      };

      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Segundo registro (duplicado)
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/ya está registrado/i);
    });
  });

  // ✅ CASO DE PRUEBA 3: Login exitoso
  describe('POST /api/auth/login', () => {
    it('CP-003: Debería autenticar usuario con credenciales válidas', async () => {
      // Crear usuario primero
      const userData = {
        name: 'María López',
        email: 'maria.test@example.com',
        password: 'MiPassword456!'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Intentar login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userData.email);
    });

    // ✅ CASO DE PRUEBA 4: Login con credenciales inválidas
    it('CP-004: Debería rechazar credenciales inválidas con error 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/credenciales inválidas/i);
    });
  });

  // ✅ CASO DE PRUEBA 5: Obtener usuario autenticado
  describe('GET /api/auth/me', () => {
    it('CP-005: Debería obtener datos del usuario autenticado', async () => {
      // Registrar usuario
      const userData = {
        name: 'Carlos Test',
        email: 'carlos.test@example.com',
        password: 'Password789!'
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const token = registerRes.body.token;

      // Obtener datos del usuario autenticado
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).toHaveProperty('name', userData.name);
    });

    it('CP-006: Debería rechazar petición sin token con error 401', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});