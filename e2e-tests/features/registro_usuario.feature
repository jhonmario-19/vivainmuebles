Feature: Registro de Usuarios

  # CP01: Registro exitoso
  Scenario: Registrar un usuario con datos válidos
    Given el usuario accede a la página de registro
    When completa el formulario con nombre "Carlos López", correo "carlos@mail.com", contraseña "Carlos1234!", teléfono "3001234567" y dirección "Calle A#123"
    And hace clic en "Registrarse"
    Then el sistema muestra el mensaje "Usuario registrado exitosamente"

  # CP02: Registro con correo duplicado
  Scenario: Intentar registrar un usuario con correo ya existente
    Given ya existe un usuario registrado con el correo "m1006790@gmail.com"
    And el usuario accede a la página de registro
    When completa el formulario con nombre "Carlos López", correo "m1006790@gmail.com", contraseña "Carlos1234!", teléfono "3001234567" y dirección "Calle A#123"
    And hace clic en "Registrarse"
    Then el sistema muestra el mensaje "El correo electrónico ya está registrado"
