const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); // Asegúrate que server.js exporte la app
const db = require('../config/database');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Registro de Usuarios', () => {
  // Antes de cada prueba, limpiamos la base de datos de manera segura
  beforeEach(async () => {
    try {
      // Método más seguro para limpiar datos de prueba sin TRUNCATE
      // Eliminamos usuarios de prueba específicos por email
      await db.execute('DELETE FROM users WHERE email LIKE ?', ['test%@example.com']);
    } catch (error) {
      console.error('Error cleaning test data:', error);
    }
  });

  after(async () => {
    // Limpieza final antes de cerrar la conexión
    try {
      await db.execute('DELETE FROM users WHERE email LIKE ?', ['test%@example.com']);
    } catch (error) {
      console.error('Error in final cleanup:', error);
    }
    await db.end();
  });

  describe('Paso 1: Interfaz de registro', () => {
    it('debería mostrar el formulario de registro', async () => {
      const res = await chai.request(app).get('/api/users/register');
      expect(res).to.have.status(200);
      expect(res.text).to.include('form');
    });
  });

  describe('Paso 2: Llenar campos obligatorios', () => {
    it('debería permitir registro con datos válidos', async () => {
      const userData = {
        name: 'Test User',
        email: 'test1@example.com',
        password: 'password123',
        role: 'Comprador',
        phone: '1234567890',
        address: 'Test Address'
      };

      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message', 'Usuario registrado exitosamente');
      expect(res.body).to.have.property('userId');
    });

    it('debería rechazar registro con email inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'Comprador'
      };

      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'Correo electrónico inválido');
    });

    it('debería rechazar registro con contraseña corta', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com',
        password: '123',
        role: 'Comprador'
      };

      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'La contraseña debe tener al menos 8 caracteres');
    });

    it('debería rechazar registro con nombre que contiene números', async () => {
      const userData = {
        name: 'User123',
        email: 'test3@example.com',
        password: 'password123',
        role: 'Comprador'
      };

      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'El nombre no puede contener números');
    });

    it('debería rechazar registro con rol inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'test4@example.com',
        password: 'password123',
        role: 'InvalidRole'
      };

      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'El rol debe ser Comprador o Vendedor');
    });
  });

  describe('Paso 3: Validación en base de datos', () => {
    it('debería insertar el usuario en la base de datos', async () => {
      const userData = {
        name: 'DB Test User',
        email: 'test5@example.com',
        password: 'password123',
        role: 'Vendedor',
        phone: '1234567890',
        address: 'Test Address'
      };

      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(201);

      // Verificar en la base de datos directamente
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [userData.email]
      );

      expect(users.length).to.equal(1);
      expect(users[0].name).to.equal(userData.name);
      expect(users[0].role).to.equal(userData.role);
    });

    it('debería rechazar email duplicado', async () => {
      const userData = {
        name: 'Test User',
        email: 'test6@example.com',
        password: 'password123',
        role: 'Comprador'
      };

      // Primer registro
      const firstRes = await chai.request(app)
        .post('/api/users/register')
        .send(userData);
      
      expect(firstRes).to.have.status(201);

      // Segundo intento con mismo email
      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('error', 'El correo electrónico ya está registrado');
    });
  });

  describe('Paso 4: Respuesta del backend', () => {
    it('debería responder con mensaje de éxito', async () => {
      const userData = {
        name: 'Response Test User',
        email: 'test7@example.com',
        password: 'password123',
        role: 'Comprador'
      };

      const res = await chai.request(app)
        .post('/api/users/register')
        .send(userData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message', 'Usuario registrado exitosamente');
      expect(res.body).to.have.property('userId').that.is.a('number');
    });
  });
});