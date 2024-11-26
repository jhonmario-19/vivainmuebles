// Path: client/src/components/users/ResetPasswordForm.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/forms.css';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  // Reglas de validación de contraseña
  const passwordRules = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /\d/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
  };

  // Función para validar la contraseña
  const validatePassword = (password) => {
    const errors = {};

    if (password.length < passwordRules.minLength) {
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
  };

  // Calcular la fortaleza de la contraseña
  const calculatePasswordStrength = (password) => {
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

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrors(validatePassword(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validar que ambas contraseñas coincidan
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, match: 'Las contraseñas no coinciden' }));
      return;
    }

    // Validar reglas de contraseña
    const passwordErrors = validatePassword(password);
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        newPassword: password
      });
      alert('Contraseña actualizada exitosamente');
      navigate('/login');
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Error al restablecer la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  // Calcular la fortaleza actual de la contraseña
  const passwordStrength = calculatePasswordStrength(password);

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="reset-password-form">
        <h2>Restablecer Contraseña</h2>

        <div className="form-group">
          <label htmlFor="password">Nueva Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className={Object.keys(errors).length > 0 ? 'input-error' : ''}
            required
          />
          
          {/* Indicador de fortaleza de contraseña */}
          {password && (
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

          {/* Lista de requisitos de contraseña */}
          <div className="password-requirements">
            <h4>La contraseña debe contener:</h4>
            <ul>
              <li className={password.length >= passwordRules.minLength ? 'met' : ''}>
                Al menos {passwordRules.minLength} caracteres
              </li>
              <li className={passwordRules.hasUpperCase.test(password) ? 'met' : ''}>
                Al menos una letra mayúscula
              </li>
              <li className={passwordRules.hasLowerCase.test(password) ? 'met' : ''}>
                Al menos una letra minúscula
              </li>
              <li className={passwordRules.hasNumber.test(password) ? 'met' : ''}>
                Al menos un número
              </li>
              <li className={passwordRules.hasSpecialChar.test(password) ? 'met' : ''}>
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.match ? 'input-error' : ''}
            required
          />
          {errors.match && <div className="error-message">{errors.match}</div>}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button type="submit" disabled={loading || Object.keys(errors).length > 0}>
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;