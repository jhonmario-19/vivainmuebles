const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
const db = require('../../config/database');

chai.use(chaiHttp);

describe('CP02 - Pruebas de Login de Usuario', () => {
  before(async () => {
    await db.execute('DELETE FROM users');
    // Crear usuario de prueba con contraseña hasheada (password123)
    await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Test User', 'test@example.com', '$2a$10$xD6aYJ3yL5u1B7kzqKZVO.9Q7T9wZ1e6N3nL9WQYdJ5rXs6VJ1HdO', 'user']
    );
    console.log('Preparando entorno de prueba para CP02...');
  });

  after(async () => {
    await db.execute('DELETE FROM users');
    console.log('Limpieza completada después de CP02');
  });

  it('CP02-01: Login exitoso', async () => {
    console.log('Ejecutando CP02-01: Login exitoso');
    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    console.log('Resultado CP02-01:', res.body.token ? 'Login exitoso' : 'Error en login');
    console.log('-----------------------------------');
  });

  it('CP02-02: Credenciales inválidas', async () => {
    console.log('Ejecutando CP02-02: Credenciales inválidas');
    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    console.log('Resultado CP02-02:', res.body.error || 'Error inesperado');
    console.log('-----------------------------------');
  });

  it('CP02-03: Usuario no existe', async () => {
    console.log('Ejecutando CP02-03: Usuario no existe');
    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

    console.log('Resultado CP02-03:', res.body.error || 'Error inesperado');
    console.log('-----------------------------------');
  });

  it('CP02-04: Campos requeridos', async () => {
    console.log('Ejecutando CP02-04: Campos requeridos');
    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com'
        // Falta password
      });

    console.log('Resultado CP02-04:', res.body.error || 'Error inesperado');
    console.log('-----------------------------------');
  });
});
