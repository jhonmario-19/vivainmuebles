import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaHome, FaBuilding, FaHandshake } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-blue-600 sm:pb-16 md:pb-20 lg:pb-24">
            <h1 className="text-4xl font-extrabold text-white text-center sm:text-5xl md:text-6xl">
              Encuentra tu hogar ideal
            </h1>
            <p className="mt-4 text-lg text-white text-center sm:max-w-lg sm:mx-auto">
              Explora propiedades en venta y alquiler en tu área.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/properties"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors duration-300"
              >
                <FaSearch className="mr-2" />
                Buscar Propiedades
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">¿Por qué elegirnos?</h2>
          <div className="mt-12 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-y-0 sm:gap-x-12">
            <div className="flex flex-col items-center">
              <FaHome className="h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold">Amplia Variedad de Propiedades</h3>
              <p className="mt-2 text-gray-600">
                Ofrecemos una amplia gama de propiedades para satisfacer tus necesidades.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <FaBuilding className="h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold">Asesoría Profesional</h3>
              <p className="mt-2 text-gray-600">
                Nuestro equipo de expertos está aquí para guiarte en cada paso del proceso.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <FaHandshake className="h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold">Compromiso con la Calidad</h3>
              <p className="mt-2 text-gray-600">
                Nos comprometemos a ofrecerte solo las mejores propiedades del mercado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;