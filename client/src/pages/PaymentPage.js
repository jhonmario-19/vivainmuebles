// Path: client/src/pages/PaymentPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../utils/formatters';
import '../styles/pages/PaymentPage.css';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',  // Se actualizará con el nombre del usuario
    expiryDate: '11/29', // Fecha por defecto
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Obtener los datos de la propiedad
        const propertyResponse = await axios.get(
          `http://localhost:5000/api/properties/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (propertyResponse.data.status !== 'for_rent') {
          setError('Esta propiedad no está disponible para arriendo');
          return;
        }
        
        setProperty(propertyResponse.data);

        // Obtener los datos del usuario
        const userResponse = await axios.get(
          'http://localhost:5000/api/users/profile',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Actualizar el estado con el nombre del usuario
        setPaymentData(prev => ({
          ...prev,
          cardName: userResponse.data.name
        }));

      } catch (err) {
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Validaciones específicas para cada campo
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, ''); // Solo números
      value = value.substring(0, 16); // Máximo 16 dígitos
    } else if (name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, ''); // Solo números
      value = value.substring(0, 3); // Máximo 3 dígitos
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
  
    try {
      // Procesar el pago
      const response = await axios.post(
        `http://localhost:5000/api/payments/${id}`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      if (response.data.success) {
        // Mostrar mensaje de éxito y redirigir
        navigate('/payment-success', { 
          state: { 
            propertyTitle: property.title,
            amount: property.price 
          }
        });
      }
  
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pago. Por favor intente nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!property) return <div>Propiedad no encontrada</div>;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="property-summary">
          <h2>Resumen del Arriendo</h2>
          <img 
            src={property.image_url ? `http://localhost:5000${property.image_url}` : '/images/default-property.jpg'}
            alt={property.title}
            className="property-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-property.jpg';
            }}
          />
          <h3>{property.title}</h3>
          <p className="property-location">{property.location}</p>
          <div className="price-details">
            <div className="price-item">
              <span>Valor del Arriendo</span>
              <span className="price">{formatPrice(property.price)}</span>
            </div>
          </div>
        </div>

        <div className="payment-form-section">
          <h2>Información de Pago</h2>
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="cardName">Nombre en la Tarjeta</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={paymentData.cardName}
                onChange={handleInputChange}
                required
                placeholder="Como aparece en la tarjeta"
                autoComplete="off"
                readOnly // Hace el campo no editable
                className="input-readonly" // Clase para estilo visual diferente
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Número de Tarjeta</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleInputChange}
                required
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Fecha de Vencimiento</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  readOnly // Hace el campo no editable
                  className="input-readonly" // Clase para estilo visual diferente
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handleInputChange}
                  required
                  placeholder="123"
                  maxLength="3"
                  autoComplete="off"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-payment-button"
              disabled={processing}
            >
              {processing ? 'Procesando...' : `Pagar ${formatPrice(property.price)}`}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(`/property/${id}`)}
              disabled={processing}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;