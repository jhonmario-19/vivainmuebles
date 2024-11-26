// Path: client/src/components/common/Header.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/common/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1 className="logo-text">VivaInmuebles</h1>
        </Link>
        <nav className="nav-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/properties" className="nav-link">Propiedades</Link>
            </li>
            
            {!token ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Iniciar Sesión</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Registrarse</Link>
                </li>
              </>
            ) : (
              <>
                {userRole === 'seller' ? (
                  <div className="seller-menu">
                    <li className="nav-item">
                      <Link to="/publish-property" className="nav-link">
                        <i className="fas fa-plus-circle"></i> Publicar
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/my-properties" className="nav-link">
                        <i className="fas fa-home"></i> Mis Propiedades
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/appointments" className="nav-link">
                        <i className="fas fa-calendar"></i> Citas
                      </Link>
                    </li>
                  </div>
                ) : (
                  <div className="buyer-menu">
                    <li className="nav-item">
                      <Link to="/appointments" className="nav-link">
                        <i className="fas fa-calendar"></i> Mis Citas
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/favorites" className="nav-link">
                        <i className="fas fa-heart"></i> Favoritos
                      </Link>
                    </li>
                  </div>
                )}
                <li className="nav-item">
                  <button onClick={handleLogout} className="logout-button">
                    <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;