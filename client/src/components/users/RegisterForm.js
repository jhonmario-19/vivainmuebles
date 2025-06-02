// Path: client/src/components/users/RegisterForm.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/forms/RegisterForm.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Comprador',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Reglas de validación de contraseña
  const passwordRules = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /\d/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
  };

  // Función para validar la contraseña usando useCallback
  const validatePassword = useCallback((password) => {
    const errors = {};

    if (!password || password.length < passwordRules.minLength) {
      errors.length = `La contraseña debe tener al menos ${passwordRules.minLength} caracteres`;
    }
    if (!passwordRules.hasUpperCase.test(password)) {
      errors.uppercase = 'Debe contener al menos una letra mayúscula';
    }
    if (!passwordRules.hasLowerCase.test(password)) {
      errors.lowercase = 'Debe contener al menos una letra minúscula';
    }
    if (!passwordRules.hasNumber.test(password)) {
      errors.number = 'Debe contener al menos un número';
    }
    if (!passwordRules.hasSpecialChar.test(password)) {
      errors.specialChar = 'Debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)';
    }

    return errors;
  }, [passwordRules]);

  // Calcular la fortaleza de la contraseña
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    const validations = [
      password.length >= passwordRules.minLength,
      passwordRules.hasUpperCase.test(password),
      passwordRules.hasLowerCase.test(password),
      passwordRules.hasNumber.test(password),
      passwordRules.hasSpecialChar.test(password)
    ];

    strength = validations.filter(Boolean).length;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    const colors = ['#ff4d4d', '#ffa64d', '#ffff4d', '#4dff4d'];
    return colors[strength - 1] || colors[0];
  };

  useEffect(() => {
    const checkFormValidity = () => {
      // Verificar que todos los campos requeridos estén llenos
      const allFieldsFilled = Object.values(formData).every(value => value !== '');
      
      // Verificar que las contraseñas coincidan
      const passwordsMatch = formData.password === formData.confirmPassword;
      
      // Verificar que la contraseña cumpla con todos los requisitos
      const passwordErrors = validatePassword(formData.password);
      const passwordValid = Object.keys(passwordErrors).length === 0;
      
      // Verificar si el formulario es válido
      const isValid = allFieldsFilled && passwordsMatch && passwordValid;
      
      setFormValid(isValid);
    };

    checkFormValidity();
  }, [formData, validatePassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar la contraseña cuando cambia
    if (name === 'password') {
      const passwordErrors = validatePassword(value);
      setErrors(prev => ({
        ...prev,
        ...passwordErrors
      }));
    }

    // Validar que las contraseñas coincidan
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      if (name === 'confirmPassword' && value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          match: 'Las contraseñas no coinciden'
        }));
      } else if (name === 'password' && value !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          match: 'Las contraseñas no coinciden'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.match;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      });

      if (response.data) {
        <div id="message">Registro exitoso</div>
        navigate('/login');
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: err.response?.data?.error || 'Error en el registro'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Calcular la fortaleza actual de la contraseña
  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="form-title">Regístrate como</h2>
        
        <div className="role-selector">
          <div 
            className={`role-option ${formData.role === 'Comprador' ? 'selected' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, role: 'Comprador' }))}
          >
            <span className="role-icon">🏠</span>
            <h3>Comprador</h3>
            <p>Busco propiedades para comprar o rentar</p>
          </div>
          
          <div 
            className={`role-option ${formData.role === 'Vendedor' ? 'selected' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, role: 'Vendedor' }))}
          >
            <span className="role-icon">🔑</span>
            <h3>Vendedor</h3>
            <p>Quiero publicar propiedades para vender o rentar</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">Nombre Completo</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          {formData.password && (
            <div className="password-strength-container">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="strength-bar"
                    style={{
                      backgroundColor: level <= passwordStrength ? 
                        getPasswordStrengthColor(passwordStrength) : '#ddd'
                    }}
                  ></div>
                ))}
              </div>
              <span className="strength-text">
                Fortaleza: {
                  passwordStrength === 0 ? 'Muy débil' :
                  passwordStrength === 1 ? 'Débil' :
                  passwordStrength === 2 ? 'Media' :
                  passwordStrength === 3 ? 'Fuerte' :
                  'Muy fuerte'
                }
              </span>
            </div>
          )}

          <div className="password-requirements">
            <h4>La contraseña debe contener:</h4>
            <ul>
              <li className={formData.password.length >= passwordRules.minLength ? 'met' : ''}>
                Al menos {passwordRules.minLength} caracteres
              </li>
              <li className={passwordRules.hasUpperCase.test(formData.password) ? 'met' : ''}>
                Al menos una letra mayúscula
              </li>
              <li className={passwordRules.hasLowerCase.test(formData.password) ? 'met' : ''}>
                Al menos una letra minúscula
              </li>
              <li className={passwordRules.hasNumber.test(formData.password) ? 'met' : ''}>
                Al menos un número
              </li>
              <li className={passwordRules.hasSpecialChar.test(formData.password) ? 'met' : ''}>
                Al menos un carácter especial
              </li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.match ? 'input-error' : ''}
            required
          />
          {errors.match && <div className="error-message">{errors.match}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Dirección</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button 
          type="submit" 
          disabled={loading || !formValid}
          className="submit-button"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="form-footer">
          <p>¿Ya tienes una cuenta? <a href="/login">Inicia Sesión</a></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;