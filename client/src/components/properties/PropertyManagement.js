// Path: client/src/components/properties/PropertyManagement.js

import React, { useState, useEffect } from 'react';
import '../../styles/pages/PropertyManagement.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';


const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      console.log('Fetching properties...'); // Debug
      const response = await axios.get('http://localhost:5000/api/properties/my-properties', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Properties received:', response.data); // Debug

      setProperties(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err); // Debug
      setError(err.response?.data?.error || 'Error al cargar las propiedades');
      setLoading(false);
    }
  };

  const handleEdit = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/properties/${propertyId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        await fetchProperties(); // Recargar la lista después de eliminar
      } catch (err) {
        console.error('Error deleting property:', err); // Debug
        setError(err.response?.data?.error || 'Error al eliminar la propiedad');
      }
    }
  };

  if (loading) return <div className="loading-container">Cargando propiedades...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="property-management">
      <h2 className="page-title">Mis Propiedades</h2>
      <div className="management-controls">
        <button 
          onClick={() => navigate('/publish-property')}
          className="add-property-button"
        >
          Publicar Nueva Propiedad
        </button>
      </div>
      
      {properties.length === 0 ? (
        <div className="no-properties">
          <p>Aún no has publicado ninguna propiedad</p>
          <p>¡Comienza publicando tu primera propiedad!</p>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-image-container">
              <img 
                src={property.image_url ? `http://localhost:5000${property.image_url}` : '/images/default-property.jpg'} 
                alt={property.title}
                className="property-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-property.jpg';
                }}
              />
                <span className={`status-tag ${property.status}`}>
                  {property.status === 'for_sale' ? 'En Venta' : 'En Alquiler'}
                </span>
              </div>
              <div className="property-info">
                <h3 className="property-title">{property.title}</h3>
                <p className="property-location">
                  <i className="location-icon">📍</i> 
                  {property.location}
                </p>
                <p className="property-price">
                  {formatPrice(property.price)}
                </p>
                <div className="property-features">
                  {property.bedrooms && (
                    <span className="feature">
                      <i className="feature-icon">🛏️</i>
                      {property.bedrooms} hab
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="feature">
                      <i className="feature-icon">🚿</i>
                      {property.bathrooms} baños
                    </span>
                  )}
                  {property.area && (
                    <span className="feature">
                      <i className="feature-icon">📏</i>
                      {property.area} m²
                    </span>
                  )}
                </div>
                <div className="property-actions">
                  <button 
                    onClick={() => handleEdit(property.id)}
                    className="edit-button"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(property.id)}
                    className="delete-button"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;