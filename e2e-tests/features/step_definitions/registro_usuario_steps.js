// features/step_definitions/registro_usuario_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const axios = require('axios');
require('chromedriver');

let driver;

// Paso adicional para CP02
Given('ya existe un usuario registrado con el correo {string}', async (correo) => {
  try {
    await axios.post('http://localhost:5000/api/users/register', {
      name: 'Usuario Existente',
      email: correo,
      password: 'Carlos1234!',
      role: 'buyer',
      phone: '3001234567',
      address: 'Calle A#123'
    });
  } catch (error) {
    // Manejo específico de errores esperados
    if (error.response) {
      const status = error.response.status;
      if (status === 409) {
        // Usuario ya existe - esto es lo que queremos para la prueba
        console.log(`Usuario con correo ${correo} ya existe (esperado para la prueba)`);
        return;
      } else if (status >= 400 && status < 500) {
        // Otros errores del cliente - los registramos pero continuamos
        console.warn(`Error del cliente al crear usuario de prueba: ${status} - ${error.message}`);
        return;
      } else {
        // Errores del servidor - los re-lanzamos porque pueden indicar problemas serios
        console.error(`Error del servidor al crear usuario de prueba: ${status} - ${error.message}`);
        throw error;
      }
    } else {
      // Errores de red u otros - los re-lanzamos
      console.error(`Error de conexión al crear usuario de prueba: ${error.message}`);
      throw error;
    }
  }
});

Given('el usuario accede a la página de registro', async () => {
  driver = await new Builder().forBrowser('chrome').build();
  await driver.get('http://localhost:3000/register');
});

When(
  'completa el formulario con nombre {string}, correo {string}, contraseña {string}, teléfono {string} y dirección {string}',
  async (nombre, correo, contraseña, telefono, direccion) => {
    await driver.wait(until.elementLocated(By.id('name')), 5000);
    await driver.findElement(By.id('name')).sendKeys(nombre);
    await driver.findElement(By.id('email')).sendKeys(correo);
    await driver.findElement(By.id('password')).sendKeys(contraseña);
    await driver.findElement(By.id('confirmPassword')).sendKeys(contraseña);
    await driver.findElement(By.id('phone')).sendKeys(telefono);
    await driver.findElement(By.id('address')).sendKeys(direccion);
  }
);

When('hace clic en "Registrarse"', async () => {
  const btn = await driver.findElement(By.css('.submit-button'));
  await btn.click();
});

Then('el sistema muestra el mensaje {string}', async (mensajeEsperado) => {
  try {
    // Esperamos si aparece una alerta (ej. alert("Registro exitoso"))
    const alerta = await driver.switchTo().alert();
    const textoAlerta = await alerta.getText();

    if (textoAlerta !== mensajeEsperado) {
      throw new Error(`Se esperaba "${mensajeEsperado}", pero apareció "${textoAlerta}"`);
    }

    await alerta.accept(); // Cerrar la alerta
  } catch (alertError) {
    // Si no hay alerta, intentamos buscar un div con id="message"
    try {
      const elMensaje = await driver.wait(until.elementLocated(By.id('message')), 5000);
      const texto = await elMensaje.getText();

      if (texto !== mensajeEsperado) {
        throw new Error(`Se esperaba "${mensajeEsperado}", pero apareció "${texto}"`);
      }
    } catch (messageError) {
      // Si tampoco encontramos el mensaje, lanzamos un error específico
      console.error('Error buscando alerta:', alertError.message);
      console.error('Error buscando mensaje:', messageError.message);
      throw new Error(`No se encontró ni alerta ni mensaje en pantalla. Errores: Alerta: ${alertError.message}, Mensaje: ${messageError.message}`);
    }
  } finally {
    // Aseguramos que el driver se cierre siempre
    if (driver) {
      await driver.quit();
    }
  }
});