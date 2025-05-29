const propertyController = require('../../controllers/propertyController');
const notificationController = require('../../controllers/notificationController');
const db = require('../../config/database');

jest.mock('../../config/database');
jest.mock('../../controllers/notificationController');

describe('CP02 - Pruebas de Integración para Registro de Propiedades', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos Exitosos', () => {
    it('debe registrar propiedad correctamente con imagen', async () => {
      const mockReq = {
        user: { id: 1 },
        body: {
          title: 'Casa en venta',
          description: 'Hermosa casa con jardín',
          price: '250000',
          location: 'Bogotá',
          area: '120',
          bedrooms: '3',
          bathrooms: '2',
          property_type: 'house',
          status: 'for_sale'
        },
        file: { filename: 'casa.jpg' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.execute
        .mockResolvedValueOnce([[]]) // SHOW TABLES
        .mockResolvedValueOnce([{ insertId: 123 }]); // INSERT

      await propertyController.createProperty(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Propiedad creada exitosamente',
        propertyId: 123
      });
      expect(db.execute).toHaveBeenCalledTimes(2);
    });

    it('debe registrar propiedad correctamente sin imagen', async () => {
      const mockReq = {
        user: { id: 1 },
        body: {
          title: 'Apartamento en arriendo',
          description: 'Amplio apartamento',
          price: '1500000',
          location: 'Medellín',
          area: '80',
          bedrooms: '2',
          bathrooms: '1',
          property_type: 'apartment',
          status: 'for_rent'
        },
        file: null
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.execute
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 456 }]);

      await propertyController.createProperty(mockReq, mockRes);

      expect(db.execute.mock.calls[1][1]).toContain(null); // image_url debe ser null
    });
  });

  describe('Validación de Campos', () => {
    const requiredFields = [
      'title', 'description', 'price', 'location',
      'area', 'bedrooms', 'bathrooms', 'property_type', 'status'
    ];

    requiredFields.forEach(field => {
      it(`debe fallar cuando falta el campo ${field}`, async () => {
        const mockReq = {
          user: { id: 1 },
          body: {
            title: 'Casa en venta',
            description: 'Hermosa casa con jardín',
            price: '250000',
            location: 'Bogotá',
            area: '120',
            bedrooms: '3',
            bathrooms: '2',
            property_type: 'house',
            status: 'for_sale'
          },
          file: { filename: 'casa.jpg' }
        };

        // Eliminar el campo requerido
        delete mockReq.body[field];

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        await propertyController.createProperty(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: expect.stringContaining('Error al crear la propiedad')
        });
      });
    });
  });

  describe('Manejo de Errores', () => {
    it('debe manejar error en base de datos', async () => {
      const mockReq = {
        user: { id: 1 },
        body: {
          title: 'Casa en venta',
          description: 'Hermosa casa con jardín',
          price: '250000',
          location: 'Bogotá',
          area: '120',
          bedrooms: '3',
          bathrooms: '2',
          property_type: 'house',
          status: 'for_sale'
        },
        file: { filename: 'casa.jpg' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.execute
        .mockResolvedValueOnce([[]])
        .mockRejectedValueOnce(new Error('Error de base de datos'));

      await propertyController.createProperty(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error al crear la propiedad'
      });
    });
  });

  describe('Notificaciones', () => {
    it('debe enviar notificaciones a usuarios interesados', async () => {
      const mockReq = {
        user: { id: 1 },
        body: {
          title: 'Casa en venta',
          description: 'Hermosa casa con jardín',
          price: '250000',
          location: 'Bogotá',
          area: '120',
          bedrooms: '3',
          bathrooms: '2',
          property_type: 'house',
          status: 'for_sale'
        },
        file: { filename: 'casa.jpg' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      db.execute
        .mockResolvedValueOnce([['user_preferences']]) // SHOW TABLES
        .mockResolvedValueOnce([{ user_id: 2 }, { user_id: 3 }]) // SELECT user_id
        .mockResolvedValueOnce([{ insertId: 789 }]); // INSERT

      await propertyController.createProperty(mockReq, mockRes);

      expect(notificationController.createNotification).toHaveBeenCalledTimes(2);
      expect(notificationController.createNotification).toHaveBeenCalledWith(
        2,
        'new_property',
        expect.stringContaining('Nueva propiedad disponible'),
        789
      );
    });
  });
});
