const userController = require('../controllers/userController');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

jest.mock('../config/database');
jest.mock('bcryptjs');

describe('User Controller - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      phone: '1234567890',
      address: 'Test Address'
    };

    it('1. Registro exitoso - debería crear usuario y retornar 201', async () => {
      const mockReq = { body: mockUser };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mocks
      db.execute
        .mockResolvedValueOnce([[]]) // No existe usuario
        .mockResolvedValueOnce([{ insertId: 1 }]); // Insert exitoso
      
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword');

      await userController.register(mockReq, mockRes);

      // Verificaciones
      expect(db.execute).toHaveBeenCalledTimes(2);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario registrado exitosamente',
        userId: 1
      });
    });

    it('2. Email existente - debería retornar error 400', async () => {
      const mockReq = { 
        body: { ...mockUser, email: 'existente@example.com' } 
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock usuario existente
      db.execute.mockResolvedValue([[{ id: 1 }]]);

      await userController.register(mockReq, mockRes);

      expect(db.execute).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'El correo electrónico ya está registrado'
      });
    });

    it('3. Error de servidor - debería manejar errores y retornar 500', async () => {
      const mockReq = { body: mockUser };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock error
      db.execute.mockRejectedValue(new Error('DB Connection Failed'));

      await userController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error en el servidor'
      });
    });
  });
});
