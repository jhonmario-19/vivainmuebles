// Path: client/src/pages/PropertyDetails.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
//import { formatPrice } from '../utils/formatters';
import '../styles/pages/PropertyDetails.css';
import Loading from '../components/common/Loading';
import ContactForm from '../components/properties/ContactForm';
import AppointmentForm from '../components/properties/AppointmentForm';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';

const PropertyDetails = () => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

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
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los detalles de la propiedad');
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, token, navigate]);

  if (!token) {
    return null;
  }

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!property) return <div>Propiedad no encontrada</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="property-details-container">
      <div className="property-details">
        <div className="property-images">
            <img 
                src={property.image_url ? `http://localhost:5000${property.image_url}` : '/images/default-property.jpg'} 
                alt={property.title}
                className="property-main-image"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-property.jpg';
                }}
            />
        </div>
        
        <div className="property-info">
          <div className="property-header">
            <h1 className="property-title">{property.title}</h1>
            <span className={`status-badge ${property.status}`}>
              {property.status === 'for_sale' ? 'En Venta' : 'En Alquiler'}
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
            <strong>Tipo de propiedad:</strong> {' '}
            {property.property_type === 'house' ? 'Casa' :
             property.property_type === 'apartment' ? 'Apartamento' :
             property.property_type === 'commercial' ? 'Comercial' : 'Terreno'}
          </div>

          <div className="property-description">
            <h2>Descripción</h2>
            <p>{property.description}</p>
          </div>

          <div className="property-actions">
            <button 
              className="contact-button"
              onClick={() => setShowContactForm(true)}
            >
              Contactar al vendedor
            </button>
            <button 
              className="appointment-button"
              onClick={() => setShowAppointmentForm(true)}
            >
              Agendar Visita
            </button>
          </div>
        </div>
      </div>

      {showContactForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            setShowContactForm(false);
          }
        }}>
          <ContactForm 
            property={property}
            onClose={() => setShowContactForm(false)}
          />
        </div>
      )}

      {showAppointmentForm && (
        <AppointmentForm 
          property={property}
          onClose={() => setShowAppointmentForm(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetails;