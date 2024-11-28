// Path: client/src/components/common/Header.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/common/Header.css';
import NotificationCenter from '../notifications/NotificationCenter';

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
         <h1 className="logo-text">VIvaInmuebles</h1>
       </Link>
       <nav className="nav-menu">
         <ul className="nav-list">
           {!token ? (
             <>
               <li className="nav-item">
                 <Link to="/properties" className="nav-link">Propiedades</Link>
               </li>
               <li className="nav-item">
                 <Link to="/login" className="nav-link">Iniciar Sesión</Link>
               </li>
               <li className="nav-item">
                 <Link to="/register" className="nav-link">Registrarse</Link>
               </li>
             </>
           ) : (
             <>
               <li className="nav-item">
                 <Link to="/properties" className="nav-link">
                   <i className="fas fa-home"></i> Propiedades
                 </Link>
               </li>
               
               {userRole === 'seller' ? (
                 <>
                   <li className="nav-item">
                     <Link to="/activity-report" className="nav-link">
                       <i className="fas fa-chart-line"></i> Reporte de Actividades
                     </Link>
                   </li>
                   <li className="nav-item">
                     <Link to="/publish-property" className="nav-link">
                       <i className="fas fa-plus-circle"></i> Publicar
                     </Link>
                   </li>
                   <li className="nav-item">
                     <Link to="/my-properties" className="nav-link">
                       <i className="fas fa-list"></i> Mis Propiedades
                     </Link>
                   </li>
                   <li className="nav-item">
                     <Link to="/appointments" className="nav-link">
                       <i className="fas fa-calendar"></i> Gestionar Citas
                     </Link>
                   </li>
                   <li className="nav-item">
                     <Link to="/transactions" className="nav-link">
                       <i className="fas fa-file-invoice-dollar"></i> Transacciones
                     </Link>
                   </li>
                 </>
               ) : (
                 <>
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
                   <li className="nav-item">
                     <Link to="/transactions" className="nav-link">
                       <i className="fas fa-file-invoice-dollar"></i> Transacciones
                     </Link>
                   </li>
                 </>
               )}
               <li className="nav-item">
                 <NotificationCenter />
               </li>
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