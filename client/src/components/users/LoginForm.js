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
      setError('Correo electrónico o contraseña incorrectos');
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
            <Link to="/forgot-password" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
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