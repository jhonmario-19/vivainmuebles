Feature: Publicación de Propiedades

  # CP03: Publicar propiedad con datos válidos
  Scenario: Registrar una propiedad con todos los campos válidos
    Given el vendedor ha iniciado sesión con correo "vendedor@mail.com" y contraseña "Vende123!"
    And accede al formulario de publicación de propiedades
    When completa el formulario de propiedad con título "Casa moderna", descripción "Casa amplia con patio", precio "300000000", área "120", dirección "Carrera 45 #23-19", tipo "Casa", habitaciones "3", baños "2" y sube la imagen "casa.jpg"
    And hace clic en "Publicar"
    Then el sistema muestra el mensaje "Propiedad registrada exitosamente"

  # CP04: Publicar propiedad con campos faltantes
  Scenario: Intentar publicar una propiedad sin completar todos los campos obligatorios
    Given el vendedor ha iniciado sesión con correo "vendedor@mail.com" y contraseña "Vende123!"
    And accede al formulario de publicación de propiedades
    When deja el campo título vacío, ingresa descripción "Casa con jardín", precio "280000000", área "140", dirección "Calle 10 #55-23", tipo "Apartamento", habitaciones "2", deja baños vacío y sube la imagen "jardin.jpg"
    And hace clic en "Publicar"
    Then el sistema muestra mensajes de error indicando los campos obligatorios faltantes
