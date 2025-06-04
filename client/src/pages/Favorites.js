import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../components/properties/PropertyCard';
import '../styles/pages/Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavorites(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response) {
        if (err.response.status === 401) {
          setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        } else {
          setError(err.response.data.message || 'Error al cargar favoritos');
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Por favor, verifique su conexión.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, intente nuevamente.');
      }
      
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="favorites-page">
      <h1 className="page-title">Mis Favoritos</h1>
      {favorites.length === 0 ? (
        <p className="no-favorites">No tienes propiedades favoritas</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;