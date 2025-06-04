const { Given, When, Then, Before } = require('@cucumber/cucumber');
const { Builder, By, Key, until } = require('selenium-webdriver');
require('chromedriver');
const axios = require('axios');
const path = require('path');

let driver;

// Antes de correr CP03 y CP04, creamos el vendedor si no existe:
Before({ tags: "@crearVendedor" }, async () => {
  await axios.post('http://localhost:5000/api/users/register', {
    name: 'Vendedor Ejemplo',
    email: 'vendedor@mail.com',
    password: 'Vende123!',
    role: 'seller',
    phone: '3007654321',
    address: 'Calle Vendedor#99'
  }).catch(() => {});
});

// CP03 y CP04 llevan esta etiqueta:
Given('el vendedor ha iniciado sesión con correo {string} y contraseña {string}', async (correo, contraseña) => {
  driver = await new Builder().forBrowser('chrome').build();
  // Ajusta la URL de login si es diferente:
  await driver.get('http://localhost:3000/login');

  // Espera hasta que esté el input email:
  await driver.wait(until.elementLocated(By.id('email')), 5000);
  await driver.findElement(By.id('email')).sendKeys(correo);
  await driver.findElement(By.id('password')).sendKeys(contraseña);

  // Haz click en el botón de login (ajusta selector)
  await driver.findElement(By.css('.submit-button')).click();

  // Opcional: espera a que el login sea exitoso (ej. URL cambie o aparezca elemento del dashboard)
  await driver.wait(until.urlContains('/dashboard'), 5000);
});

Given('accede al formulario de publicación de propiedades', async () => {
  // Ajusta según tu ruta real de publicar propiedad:
  await driver.get('http://localhost:3000/publish-property');
  // Espera a que cargue el formulario:
  await driver.wait(until.elementLocated(By.id('title')), 5000);
});

// Función auxiliar para llenar el formulario con los datos de la propiedad
async function fillPropertyForm(propertyData, imagen) {
  await driver.findElement(By.id('title')).sendKeys(propertyData.titulo);
  await driver.findElement(By.id('description')).sendKeys(propertyData.descripcion);
  await driver.findElement(By.id('price')).sendKeys(propertyData.precio);
  await driver.findElement(By.id('area')).sendKeys(propertyData.area);
  await driver.findElement(By.id('address')).sendKeys(propertyData.direccion);
  await driver.findElement(By.id('propertyType')).sendKeys(propertyData.tipo);
  await driver.findElement(By.id('rooms')).sendKeys(propertyData.habitaciones);
  await driver.findElement(By.id('bathrooms')).sendKeys(propertyData.banos);

  const filePath = path.join(__dirname, '..', 'assets', imagen);
  await driver.findElement(By.id('image')).sendKeys(filePath);
}

When(
  'completa el formulario de propiedad con título {string}, descripción {string}, precio {string}, área {string}, dirección {string}, tipo {string}, habitaciones {string}, baños {string} y sube la imagen {string}',
  async function(...params) {
    const [titulo, descripcion, precio, area, direccion, tipo, habitaciones, banos, imagen] = params;
    
    const propertyData = {
      titulo,
      descripcion,
      precio,
      area,
      direccion,
      tipo,
      habitaciones,
      banos
    };

    // Usar la función auxiliar para llenar el formulario
    await fillPropertyForm(propertyData, imagen);
  }
);

When('deja el campo título vacío, ingresa descripción {string}, precio {string}, área {string}, dirección {string}, tipo {string}, habitaciones {string}, deja baños vacío y sube la imagen {string}',
  async (descripcion, precio, area, direccion, tipo, habitaciones, imagen) => {
    // Dejamos title vacío
    await driver.findElement(By.id('description')).sendKeys(descripcion);
    await driver.findElement(By.id('price')).sendKeys(precio);
    await driver.findElement(By.id('area')).sendKeys(area);
    await driver.findElement(By.id('address')).sendKeys(direccion);
    await driver.findElement(By.id('propertyType')).sendKeys(tipo);
    await driver.findElement(By.id('rooms')).sendKeys(habitaciones);
    // baños vacío => no hacemos sendKeys a bathrooms
    const filePath = path.join(__dirname, '..', 'assets', imagen);
    await driver.findElement(By.id('image')).sendKeys(filePath);
  }
);

When('hace clic en "Publicar"', async () => {
  // Ajusta el selector si tu botón tiene otra clase o id:
  const btn = await driver.findElement(By.css('.submit-button'));
  await btn.click();
});

Then('el sistema muestra el mensaje {string}', async (mensajeEsperado) => {
  // Ajusta con el selector real que usas para mostrar mensaje de éxito
  const elMensaje = await driver.wait(until.elementLocated(By.id('message')), 5000);
  const texto = await elMensaje.getText();
  if (texto !== mensajeEsperado) {
    throw new Error(`Se esperaba "${mensajeEsperado}", pero apareció "${texto}"`);
  }
  await driver.quit();
});

Then('el sistema muestra mensajes de error indicando los campos obligatorios faltantes', async () => {
  // Por ejemplo: todos los errores podrían aparecer con clase "error-message"
  const errores = await driver.findElements(By.css('.error-message'));
  if (errores.length < 1) {
    throw new Error('Se esperaba al menos un mensaje de error, pero no se encontró ninguno.');
  }
  await driver.quit();
});