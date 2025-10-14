const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

// Configuración de timeout
jest.setTimeout(30000);

describe('🔐 Auth Endpoints - Suite de Pruebas', () => {
  
  beforeAll(async () => {
    // Crear servidor MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Configurar variables de entorno ANTES de importar la app
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test_secret_key_minimum_32_characters_long';
    process.env.NODE_ENV = 'test';
    process.env.PORT = 5001;
    
    // Conectar a MongoDB en memoria
    await mongoose.connect(mongoUri);
    
    // Importar app DESPUÉS de configurar variables
    app = require('../server');
  });

  afterAll(async () => {
    // Limpiar y cerrar todo
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Limpiar todas las colecciones antes de cada test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  // ========================================
  // CASOS DE PRUEBA
  // ========================================

  // ✅ CASO DE PRUEBA 1: Registro exitoso
  test('CP-001: Debería registrar un nuevo usuario exitosamente', async () => {
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
    
    console.log('✅ CP-001: Registro exitoso - PASSED');
  });

  // ✅ CASO DE PRUEBA 2: Email duplicado
  test('CP-002: Debería rechazar email duplicado con error 409', async () => {
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
    
    console.log('✅ CP-002: Email duplicado rechazado - PASSED');
  });

  // ✅ CASO DE PRUEBA 3: Login exitoso
  test('CP-003: Debería autenticar usuario con credenciales válidas', async () => {
    const userData = {
      name: 'María López',
      email: 'maria.test@example.com',
      password: 'MiPassword456!'
    };

    // Registrar usuario
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
    
    console.log('✅ CP-003: Login exitoso - PASSED');
  });

  // ✅ CASO DE PRUEBA 4: Login con credenciales inválidas
  test('CP-004: Debería rechazar credenciales inválidas con error 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'noexiste@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toMatch(/credenciales inválidas/i);
    
    console.log('✅ CP-004: Credenciales inválidas rechazadas - PASSED');
  });

  // ✅ CASO DE PRUEBA 5: Obtener usuario autenticado
  test('CP-005: Debería obtener datos del usuario autenticado', async () => {
    const userData = {
      name: 'Carlos Test',
      email: 'carlos.test@example.com',
      password: 'Password789!'
    };

    // Registrar usuario
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
    
    console.log('✅ CP-005: Usuario autenticado obtenido - PASSED');
  });
});

// ========================================
// RESUMEN AL FINAL
// ========================================
afterAll(() => {
  console.log('\n========================================');
  console.log('📊 RESUMEN DE TESTS COMPLETADOS');
  console.log('========================================');
  console.log('✅ CP-001: Registro exitoso');
  console.log('✅ CP-002: Email duplicado');
  console.log('✅ CP-003: Login válido');
  console.log('✅ CP-004: Login inválido');
  console.log('✅ CP-005: Usuario autenticado');
  console.log('========================================');
  console.log('🎉 5 CASOS DE PRUEBA EJECUTADOS');
  console.log('========================================\n');
});