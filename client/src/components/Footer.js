// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-300">
              VivaInmuebles
            </Link>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-4">
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-300">
              Sobre Nosotros
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-300">
              Contacto
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-300">
              Política de Privacidad
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-300">
              Términos de Servicio
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} VivaInmuebles. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;