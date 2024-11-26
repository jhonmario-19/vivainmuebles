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
          VivaInmuebles
        </Link>
        <nav>
          <ul>
            <li><Link to="/properties">Propiedades</Link></li>
            {!token ? (
              <>
                <li><Link to="/login">Iniciar Sesión</Link></li>
                <li><Link to="/register">Registrarse</Link></li>
              </>
            ) : (
              <>
                {userRole === 'seller' && (
                  <>
                    <li>
                      <Link to="/publish-property">Publicar Propiedad</Link>
                    </li>
                    <li>
                      <Link to="/my-properties">Mis Propiedades</Link>
                    </li>
                    <li>
                      <Link to="/appointments">Gestionar Citas</Link>
                    </li>
                  </>
                )}
                {userRole === 'buyer' && (
                  <li>
                    <Link to="/appointments">Mis Citas</Link>
                    <Link to="/favorites">Mis Favoritos</Link>
                  </li>
                  
                )}
                <li>
                  <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
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