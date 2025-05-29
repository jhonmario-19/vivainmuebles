const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
const db = require('../../config/database');

chai.use(chaiHttp);

describe('CP01 - Pruebas de Registro de Usuario', () => {
  before(async () => {
    await db.execute('DELETE FROM users');
    console.log('Preparando entorno de prueba para CP01...');
  });

  after(async () => {
    await db.execute('DELETE FROM users');
    console.log('Limpieza completada después de CP01');
  });

  it('CP01-01: Registro exitoso de usuario', async () => {
    console.log('Ejecutando CP01-01: Registro exitoso');
    const res = await chai.request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        phone: '1234567890',
        address: 'Test Address'
      });

    console.log('Resultado CP01-01:', res.body.message || 'Error en registro');
    console.log('-----------------------------------');
  });

  it('CP01-02: Intento de registro con email existente', async () => {
    console.log('Ejecutando CP01-02: Email existente');
    await db.execute(
      'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      ['Existing User', 'existing@example.com', 'hashedpass', 'user', '1234567890', 'Existing Address']
    );

    const res = await chai.request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'user',
        phone: '1234567890',
        address: 'Test Address'
      });

    console.log('Resultado CP01-02:', res.body.error || 'Error inesperado');
    console.log('-----------------------------------');
  });

  it('CP01-03: Validación de campos requeridos', async () => {
    console.log('Ejecutando CP01-03: Campos requeridos');
    const res = await chai.request(app)
      .post('/api/users/register')
      .send({
        email: 'test2@example.com',
        password: 'password123',
        role: 'user',
        phone: '1234567890',
        address: 'Test Address'
      });

    console.log('Resultado CP01-03:', res.body.error || 'Error inesperado');
    console.log('-----------------------------------');
  });

  it('CP01-04: Manejo de errores del servidor', async () => {
    console.log('Ejecutando CP01-04: Error de servidor');
    const res = await chai.request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'error@example.com',
        password: 'password123',
        role: 'user',
        phone: '1234567890',
        address: 'Test Address'
      });

    console.log('Resultado CP01-04:', res.body.error || 'Error inesperado');
    console.log('-----------------------------------');
  });
});
