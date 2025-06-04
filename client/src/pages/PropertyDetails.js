// Path: client/src/pages/PropertyDetails.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/pages/PropertyDetails.css';
import Loading from '../components/common/Loading';
import ContactForm from '../components/properties/ContactForm';
import AppointmentForm from '../components/properties/AppointmentForm';
import SellerInfo from '../components/properties/SellerInfo';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';

const PropertyDetails = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: `/property/${id}` } });
      return;
    }

    const fetchProperty = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/properties/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProperty(response.data);
      } catch (err) {
        // Handle the exception properly instead of just catching and setting error
        console.error('Error fetching property:', err);
        
        // Provide more specific error messages based on the error type
        if (err.response?.status === 404) {
          setError('Propiedad no encontrada');
        } else if (err.response?.status === 401) {
          setError('No tienes autorización para ver esta propiedad');
          navigate('/login', { state: { from: `/property/${id}` } });
        } else if (err.response?.status >= 500) {
          setError('Error del servidor. Por favor, intenta más tarde');
        } else {
          setError('Error al cargar los detalles de la propiedad');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, token, navigate]);

  // Extract nested ternary operations into independent functions
  const getStatusText = (status) => {
    if (status === 'for_sale') return 'En Venta';
    if (status === 'for_rent') return 'En Alquiler';
    return status;
  };

  const getPropertyTypeText = (propertyType) => {
    switch (propertyType) {
      case 'house':
        return 'Casa';
      case 'apartment':
        return 'Apartamento';
      case 'commercial':
        return 'Comercial';
      case 'land':
        return 'Terreno';
      default:
        return propertyType;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/default-property.jpg';
  };

  const handleContactDialogClose = () => {
    setShowContactForm(false);
  };

  const handleAppointmentDialogClose = () => {
    setShowAppointmentForm(false);
  };

  // Open dialogs
  const openContactDialog = () => {
    setShowContactForm(true);
  };

  const openAppointmentDialog = () => {
    setShowAppointmentForm(true);
  };

  // Early returns for better readability
  if (!token) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!property) {
    return <div>Propiedad no encontrada</div>;
  }

  return (
    <div className="property-details-container">
      <div className="property-details">
        <div className="property-images">
          <img 
            src={property.image_url ? `http://localhost:5000${property.image_url}` : '/images/default-property.jpg'} 
            alt={property.title}
            className="property-main-image"
            onError={handleImageError}
          />
        </div>
        
        <div className="property-info">
          <div className="property-header">
            <h1 className="property-title">{property.title}</h1>
            <span className={`status-badge ${property.status}`}>
              {getStatusText(property.status)}
            </span>
          </div>

          <div className="property-price">
            {formatPrice(property.price)}
          </div>

          <div className="property-location">
            <FaMapMarkerAlt className="location-icon" />
            {property.location}
          </div>

          <div className="property-features">
            {property.bedrooms > 0 && (
              <div className="feature">
                <FaBed className="feature-icon" />
                <span>{property.bedrooms} Habitaciones</span>
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

          <div className="property-type">
            <strong>Tipo de propiedad:</strong> {getPropertyTypeText(property.property_type)}
          </div>

          <div className="property-description">
            <h2>Descripción</h2>
            <p>{property.description}</p>
          </div>

          {property.seller && <SellerInfo seller={property.seller} />}

          <div className="property-actions">
            <button 
              className="contact-button"
              onClick={openContactDialog}
              type="button"
              aria-label="Contactar al vendedor"
            >
              Contactar al vendedor
            </button>
            <button 
              className="appointment-button"
              onClick={openAppointmentDialog}
              type="button"
              aria-label="Agendar visita a la propiedad"
            >
              Agendar Visita
            </button>
          </div>
        </div>
      </div>

      {showContactForm && (
        <dialog 
          open={showContactForm}
          className="contact-dialog"
          aria-labelledby="contact-form-title"
        >
          <ContactForm 
            property={property}
            onClose={handleContactDialogClose}
          />
        </dialog>
      )}

      {showAppointmentForm && (
        <dialog 
          open={showAppointmentForm}
          className="appointment-dialog"
          aria-labelledby="appointment-form-title"
        >
          <AppointmentForm 
            property={property}
            onClose={handleAppointmentDialogClose}
          />
        </dialog>
      )}
    </div>
  );
};

export default PropertyDetails;