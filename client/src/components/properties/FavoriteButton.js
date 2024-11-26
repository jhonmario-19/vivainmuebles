// Path: client/src/components/properties/FavoriteButton.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import '../../styles/components/FavoriteButton.css';

const FavoriteButton = ({ propertyId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const checkFavoriteStatus = useCallback(async () => {
    // Si no hay token, no verificamos el estado de favorito
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/favorites/check/${propertyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setIsFavorite(response.data.isFavorite);
      setLoading(false);
    } catch (err) {
      console.error('Error al verificar favorito:', err);
      setLoading(false);
    }
  }, [propertyId, token]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const toggleFavorite = async (e) => {
    e.stopPropagation(); // Prevenir que el click se propague al card
    e.preventDefault(); // Prevenir el comportamiento por defecto

    if (!token) {
      return; // No hacer nada si no hay token, el manejo se hace en PropertyCard
    }

    try {
      if (isFavorite) {
        await axios.delete(
          `http://localhost:5000/api/favorites/${propertyId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setIsFavorite(false);
      } else {
        await axios.post(
          'http://localhost:5000/api/favorites',
          { property_id: propertyId },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setIsFavorite(true);
      }
      
      // Opcional: Mostrar una notificación de éxito
      const message = isFavorite 
        ? 'Propiedad eliminada de favoritos'
        : 'Propiedad agregada a favoritos';
      console.log(message); // Aquí podrías implementar un sistema de notificaciones
      
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
      // Opcional: Mostrar mensaje de error al usuario
      const errorMessage = 'Error al actualizar favoritos. Por favor intenta nuevamente.';
      console.error(errorMessage);
    }
  };

  if (loading) return null;

  return (
    <button 
      className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
      onClick={toggleFavorite}
      aria-label={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
      title={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
    >
      {isFavorite ? (
        <FaHeart className="favorite-icon filled" />
      ) : (
        <FaRegHeart className="favorite-icon" />
      )}
    </button>
  );
};

export default FavoriteButton;