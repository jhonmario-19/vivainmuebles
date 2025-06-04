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
    const validations = [
      password.length >= passwordRules.minLength,
      passwordRules.hasUpperCase.test(password),
      passwordRules.hasLowerCase.test(password),
      passwordRules.hasNumber.test(password),
      passwordRules.hasSpecialChar.test(password)
    ];

    return validations.filter(Boolean).length;
  };

  const getPasswordStrengthColor = (strength) => {
    const colors = ['#ff4d4d', '#ffa64d', '#ffff4d', '#4dff4d'];
    return colors[strength - 1] || colors[0];
  };

  // Extract nested ternary operation 1: Get strength text
  const getStrengthText = (strength) => {
    if (strength === 0) return 'Muy débil';
    if (strength === 1) return 'Débil';
    if (strength === 2) return 'Media';
    if (strength === 3) return 'Fuerte';
    return 'Muy fuerte';
  };

  // Extract helper function for password validation
  const isPasswordValid = (password) => {
    const passwordErrors = validatePassword(password);
    return Object.keys(passwordErrors).length === 0;
  };

  // Extract helper function for passwords match validation
  const doPasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
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
    if (!doPasswordsMatch(password, confirmPassword)) {
      setErrors(prev => ({ ...prev, match: 'Las contraseñas no coinciden' }));
      return;
    }

    // Validar reglas de contraseña
    if (!isPasswordValid(password)) {
      const passwordErrors = validatePassword(password);
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

  // Extract helper function for requirement validation
  const isRequirementMet = (requirement) => {
    switch (requirement) {
      case 'length':
        return password.length >= passwordRules.minLength;
      case 'uppercase':
        return passwordRules.hasUpperCase.test(password);
      case 'lowercase':
        return passwordRules.hasLowerCase.test(password);
      case 'number':
        return passwordRules.hasNumber.test(password);
      case 'special':
        return passwordRules.hasSpecialChar.test(password);
      default:
        return false;
    }
  };

  // Extract nested ternary operation 2: Get bar color
  const getBarColor = (level, passwordStrength) => {
    return level <= passwordStrength ? 
      getPasswordStrengthColor(passwordStrength) : '#ddd';
  };

  // Extract nested ternary operation 3: Get input class
  const getPasswordInputClass = () => {
    return Object.keys(errors).length > 0 ? 'input-error' : '';
  };

  const getConfirmPasswordInputClass = () => {
    return errors.match ? 'input-error' : '';
  };

  // Calcular la fortaleza actual de la contraseña
  const passwordStrength = calculatePasswordStrength(password);
  const hasPasswordErrors = Object.keys(errors).length > 0;

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
            className={getPasswordInputClass()}
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
                      backgroundColor: getBarColor(level, passwordStrength)
                    }}
                  ></div>
                ))}
              </div>
              <span className="strength-text">
                Fortaleza: {getStrengthText(passwordStrength)}
              </span>
            </div>
          )}

          {/* Lista de requisitos de contraseña */}
          <div className="password-requirements">
            <h4>La contraseña debe contener:</h4>
            <ul>
              <li className={isRequirementMet('length') ? 'met' : ''}>
                Al menos {passwordRules.minLength} caracteres
              </li>
              <li className={isRequirementMet('uppercase') ? 'met' : ''}>
                Al menos una letra mayúscula
              </li>
              <li className={isRequirementMet('lowercase') ? 'met' : ''}>
                Al menos una letra minúscula
              </li>
              <li className={isRequirementMet('number') ? 'met' : ''}>
                Al menos un número
              </li>
              <li className={isRequirementMet('special') ? 'met' : ''}>
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
            className={getConfirmPasswordInputClass()}
            required
          />
          {errors.match && <div className="error-message">{errors.match}</div>}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button type="submit" disabled={loading || hasPasswordErrors}>
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;