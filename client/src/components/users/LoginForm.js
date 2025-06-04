// Path: client/src/components/users/LoginForm.js

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/forms/LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        
        const { state } = location;
        if (state?.from) {
          navigate(state.from);
        } else if (response.data.user.role === 'seller') {
          navigate('/publish-property');
        } else {
          navigate('/properties');
        }
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response) {
        // Error de respuesta del servidor
        setError(err.response.data.message || 'Credenciales inválidas');
      } else if (err.request) {
        // Error de red
        setError('No se pudo conectar con el servidor. Por favor, verifique su conexión.');
      } else {
        // Otros errores
        setError('Ocurrió un error durante el inicio de sesión. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>¡Bienvenido de nuevo!</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-container">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Tu contraseña"
                className="form-input"
              />
            </div>
            <div className="forgot-password-link">
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading} 
            className="submit-button"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="form-footer">
            <p>
              ¿No tienes una cuenta? {' '}
              <Link to="/register" className="register-link">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;