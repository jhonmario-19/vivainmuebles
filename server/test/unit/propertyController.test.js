const propertyController = require('../../controllers/propertyController');
const db = require('../../config/database');
const notificationController = require('../../controllers/notificationController');

jest.mock('../../config/database', () => ({
  execute: jest.fn()
}));

jest.mock('../../controllers/notificationController', () => ({
  createNotification: jest.fn()
}));

describe('Validaciones', () => {

    let req, res;

  // Se ejecuta antes de cada test
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Configurar objeto req (solicitud) por defecto
    req = {
      body: {
        title: 'Casa bonita',           // Valor por defecto válido
        description: 'Descripción detallada de la propiedad', // 30 caracteres
        price: '100000',
        location: 'Calle Falsa 123, Springfield',
        area: '150',
        bedrooms: '3',
        bathrooms: '2',
        property_type: 'Casa',
        status: 'for_sale'
      },
      params: {},
      user: { id: 1 },                  // Usuario mockeado
      file: { filename: 'test.jpg' }    // Archivo mockeado
    };
    
    // Configurar objeto res (respuesta) mockeado
    res = {
      status: jest.fn().mockReturnThis(), // Permite chaining: res.status().json()
      json: jest.fn(),
    };

    db.execute.mockImplementation(() => Promise.reject(new Error('DB call should not happen in validation tests')));
  });
  // Validaciones de título
  it('debe validar que el título es requerido', async () => {
    req.body.title = '';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El título es requerido' });
  });

  it('debe validar que el título tiene al menos 5 caracteres', async () => {
    req.body.title = 'abcd';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El título debe tener al menos 5 caracteres' });
  });

  it('debe validar que el título no excede 100 caracteres', async () => {
    req.body.title = 'a'.repeat(101);
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El título no puede exceder los 100 caracteres' });
  });

  it('debe validar que el título no contiene números', async () => {
    req.body.title = 'Casa 123';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El título no puede contener números' });
  });

  // Validaciones de descripción
  it('debe validar que la descripción es requerida', async () => {
    req.body.description = '';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La descripción es requerida' });
  });

  it('debe validar que la descripción tiene al menos 20 caracteres', async () => {
    req.body.description = 'Descripción corta';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La descripción debe tener al menos 20 caracteres' });
  });

  it('debe validar que la descripción no excede 500 caracteres', async () => {
    req.body.description = 'a'.repeat(501);
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La descripción no puede exceder los 500 caracteres' });
  });

  // Validaciones de precio
  it('debe validar que el precio es numérico', async () => {
    req.body.price = 'no-numerico';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El precio debe ser un número válido' });
  });

  it('debe validar que el precio es mayor que cero', async () => {
    req.body.price = '0';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El precio debe ser mayor que cero' });
  });

  // Validaciones de área
  it('debe validar que el área es numérica', async () => {
    req.body.area = 'no-numerico';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El área debe ser un número válido' });
  });

  it('debe validar que el área es mayor que cero', async () => {
    req.body.area = '0';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El área debe ser mayor que cero' });
  });

  // Validaciones de dirección
  it('debe validar que la dirección es requerida', async () => {
    req.body.location = '';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La dirección es requerida' });
  });

  it('debe validar que la dirección tiene al menos 10 caracteres', async () => {
    req.body.location = 'Calle 1';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La dirección debe tener al menos 10 caracteres' });
  });

  it('debe validar que la dirección no excede 100 caracteres', async () => {
    req.body.location = 'a'.repeat(101);
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La dirección no puede exceder los 100 caracteres' });
  });

  // Validaciones de tipo de propiedad
  it('debe validar que el tipo de propiedad es requerido', async () => {
    req.body.property_type = '';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Tipo de propiedad inválido. Los valores válidos son: Casa, Apartamento, Terreno, Comercial' 
    });
  });

  it('debe validar que el tipo de propiedad es válido', async () => {
    req.body.property_type = 'Invalido';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Tipo de propiedad inválido. Los valores válidos son: Casa, Apartamento, Terreno, Comercial' 
    });
  });
    describe('Validaciones numéricas', () => {
    beforeEach(() => {
        // Mockear db.execute para que falle si se llama
        db.execute.mockImplementation(() => 
        Promise.reject(new Error('DB access during validation test'))
        );
    });


  // Validaciones de habitaciones
  it('debe validar que el número de habitaciones es un entero', async () => {
    req.body.bedrooms = '1.5';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El número de habitaciones debe ser un entero válido' });
  });

  it('debe validar que hay al menos 1 habitación', async () => {
    req.body.bedrooms = '0';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Debe haber al menos 1 habitación' });
  });

  // Validaciones de baños
  it('debe validar que el número de baños es un entero', async () => {
    req.body.bathrooms = '1.5';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El número de baños debe ser un entero válido' });
  });

  it('debe validar que hay al menos 1 baño', async () => {
    req.body.bathrooms = '0';
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Debe haber al menos 1 baño' });
  });

  // Validaciones de imágenes
  it('debe validar que la imagen es requerida', async () => {
    req.file = undefined;
    await propertyController.createProperty(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La imagen es requerida' });
  });

  })
  
});