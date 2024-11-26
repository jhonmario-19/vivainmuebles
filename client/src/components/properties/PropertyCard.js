// Path: client/src/components/properties/PropertyCard.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import FavoriteButton from './FavoriteButton';
import { formatPrice } from '../../utils/formatters';
import '../../styles/components/PropertyCard.css';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleFavoriteClick = () => {
    if (!token) {
      navigate('/login', { 
        state: { 
          from: `/properties`,
          message: 'Inicia sesión para guardar propiedades en favoritos' 
        }
      });
    }
  };

  const handleViewDetails = () => {
    if (!token) {
      navigate('/login', { state: { from: `/property/${property.id}` } });
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const handlePayment = () => {
    if (!token) {
      navigate('/login', { 
        state: { 
          from: `/property/${property.id}/payment`,
          message: 'Inicia sesión para realizar pagos' 
        }
      });
    } else {
      navigate(`/property/${property.id}/payment`);
    }
  };

  const getPropertyType = (type) => {
    switch (type) {
      case 'house':
        return 'Casa';
      case 'apartment':
        return 'Apartamento';
      case 'commercial':
        return 'Comercial';
      case 'land':
        return 'Terreno';
      default:
        return type;
    }
  };

  return (
    <div className="property-card">
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
        <div className="property-badges">
          <span className={`property-badge ${property.status}`}>
            {property.status === 'for_sale' ? 'En Venta' : 'En Alquiler'}
          </span>
          <span className="property-type-badge">
            {getPropertyType(property.property_type)}
          </span>
          <div onClick={handleFavoriteClick}>
            <FavoriteButton propertyId={property.id} />
          </div>
        </div>
      </div>

      <div className="property-content">
        <div className="property-price">{formatPrice(property.price)}</div>
        <h3 className="property-title">{property.title}</h3>
        
        <div className="property-location">
          <FaMapMarkerAlt className="location-icon" />
          <span>{property.location}</span>
        </div>

        <div className="property-features">
          {property.bedrooms > 0 && (
            <div className="feature">
              <FaBed className="feature-icon" />
              <span>{property.bedrooms} Hab</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="feature">
              <FaBath className="feature-icon" />
              <span>{property.bathrooms} Baños</span>
            </div>
          )}
          {property.area && (
            <div className="feature">
              <FaRulerCombined className="feature-icon" />
              <span>{property.area} m²</span>
            </div>
          )}
        </div>

        <div className="property-buttons">
          <button 
            onClick={handleViewDetails} 
            className="view-details-button"
          >
            Ver Detalles
          </button>

          {property.status === 'for_rent' && (
            <button 
              onClick={handlePayment} 
              className="payment-button"
            >
              <FaCreditCard className="payment-icon" />
              Pagar Mes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;