// Path: client/src/components/users/ForgotPasswordForm.js

import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/forms.css';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/request-reset', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico para recibir un enlace de restablecimiento.</p>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Enlace'}
        </button>

        <div className="form-footer">
          <a href="/login">Volver al inicio de sesión</a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;