// Path: client/src/components/properties/ContactForm.js

import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/components/ContactForm.css';
import { formatPrice } from '../../utils/formatters';

const ContactForm = ({ property, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/contact', {
        ...formData,
        propertyId: property.id,
        propertyTitle: property.title
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-overlay">
      <div className="contact-form-container">
        <div className="contact-form-header">
          <h3>Contactar al Propietario</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
  
        {success ? (
          <div className="success-message">
            Mensaje enviado exitosamente. El propietario se pondrá en contacto contigo pronto.
          </div>
        ) : (
          <>
            <div className="property-info">
                <h4>{property.title}</h4>
                <p className="property-price">
                    {formatPrice(property.price)}
                </p>
            </div>
  
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="name">Nombre completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
  
                <div className="form-group">
                  <label htmlFor="email">Correo electrónico *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
  
                <div className="form-group">
                  <label htmlFor="phone">Teléfono *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
  
                <div className="form-group">
                  <label htmlFor="message">Mensaje *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Me interesa esta propiedad. Me gustaría recibir más información..."
                  />
                </div>
              </div>
  
              {error && <div className="error-message">{error}</div>}
  
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="cancel-button"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Contactar'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactForm;