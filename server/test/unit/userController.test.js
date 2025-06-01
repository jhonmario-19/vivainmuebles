const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('../../controllers/userController');
const db = require('../../config/database');

//"test": "jest",
//"test:watch": "jest --watch"

// "test": "mocha test/user.test.js --timeout 10000",
// "test:watch": "mocha test/user.test.js --watch --timeout 10000"

// Mock de la base de datos
jest.mock('../../config/database', () => ({
  execute: jest.fn()
}));

// Mock de console.error
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

const app = express();
app.use(bodyParser.json());
app.post('/register', userController.register);

describe('Controlador de Usuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registro exitoso', () => {
    it('debe registrar un usuario correctamente', async () => {
      db.execute
        .mockResolvedValueOnce([[]]) // Para verificar correo existente
        .mockResolvedValueOnce([{ insertId: 1 }]); // Para insertar usuario

      const res = await request(app).post('/register').send({
        name: "Carlos López",
        email: "carlos.lopez@test.com", // 15+ caracteres
        password: "Carlos123#",
        role: "Comprador",
        phone: "3001234567",
        address: "Calle A #123-45, Bogotá" // 10+ caracteres
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Usuario registrado exitosamente',
        userId: 1
      });
    });
  });

  describe('Validaciones de registro', () => {
    it('debe rechazar registro con correo ya existente', async () => {
      db.execute.mockResolvedValueOnce([[{ id: 1 }]]); // Simular correo existente

      const res = await request(app).post('/register').send({
        name: "Carlos López",
        email: "carlos.existente@test.com",
        password: "Carlos123#",
        role: "Comprador",
        phone: "3001234567",
        address: "Calle A #123-45, Bogotá"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El correo electrónico ya está registrado');
    });

    it('debe rechazar nombre con menos de 5 caracteres', async () => {
      const res = await request(app).post('/register').send({
        name: "Ana",
        email: "ana@test.com",
        password: "Password123!",
        role: "Comprador",
        phone: "3001234567",
        address: "Calle 10 #20-30"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El nombre debe tener entre 5 y 40 caracteres');
    });

    it('debe rechazar nombre con números', async () => {
      const res = await request(app).post('/register').send({
        name: "Carlos123",
        email: "carlos@test.com",
        password: "Password123!",
        role: "Comprador",
        phone: "3001234567",
        address: "Calle 10 #20-30"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El nombre no puede contener números');
    });

    it('debe rechazar correo electrónico inválido', async () => {
      const res = await request(app).post('/register').send({
        name: "Juan Test",
        email: "correo_invalido.com",
        password: "Password123!",
        role: "Comprador",
        phone: "3001234567",
        address: "Calle 10 #20-30"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Correo electrónico inválido');
    });

    it('debe rechazar correo electrónico corto', async () => {
      const res = await request(app).post('/register').send({
        name: "Juan Test",
        email: "a@b.co",
        password: "Password123!",
        role: "Comprador",
        phone: "3001234567",
        address: "Calle 10 #20-30"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('El correo electrónico debe tener entre 15 y 40 caracteres');
    });

    it('debe rechazar contraseña corta', async () => {
      const res = await request(app).post('/register').send({
        name: "Lucía Cortés",
        email: "lucia@correo.com",
        password: "abc12",
        role: "Comprador",
        phone: "3001234567",
        address: "Carrera 7 #30-21"
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('debe rechazar rol inválido', async () => {
        const res = await request(app).post('/register').send({
        name: "Ana López",
        email: "ana.lopez@test.com", // Correo válido de 15+ caracteres
        password: "Password123!",
        role: "Administrador",
        phone: "3001234567",
        address: "Calle 10 #20-30, Bogotá"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('El rol debe ser Comprador o Vendedor');
    });

    
    });

  describe('Errores del servidor', () => {
    it('debe manejar errores de base de datos', async () => {
      db.execute.mockRejectedValueOnce(new Error('Fallo en DB'));

      const res = await request(app).post('/register').send({
        name: "Carlos López",
        email: "carlos@test.com",
        password: "Carlos123#",
        role: "Comprador",
        phone: "3001234567",
        address: "Calle A #123-45, Bogotá"
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error en el servidor');
    });
  });
});