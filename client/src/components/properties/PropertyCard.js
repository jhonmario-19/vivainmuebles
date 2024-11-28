// Path: client/src/components/properties/PropertyCard.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaCreditCard, FaFileInvoiceDollar } from 'react-icons/fa';
import jsPDF from 'jspdf';
import FavoriteButton from './FavoriteButton';
import { formatPrice } from '../../utils/formatters';
import ShareButton from './ShareButton';
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

  const generateBankReceipt = () => {
    if (!token) {
      navigate('/login', { 
        state: { 
          from: `/properties`,
          message: 'Inicia sesión para generar recibos de pago' 
        }
      });
      return;
    }

    const doc = new jsPDF();
    const referenceNumber = `REF-${property.id}-${Date.now()}`;
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 3);

    // Configuración de la página
    doc.setFontSize(22);
    doc.text('VIVAINMUEBLES', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Recibo de Pago Bancario', 105, 30, { align: 'center' });

    // Información de la empresa
    doc.setFontSize(10);
    doc.text('NIT: 900.XXX.XXX-X', 105, 38, { align: 'center' });
    
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Información del recibo
    doc.setFontSize(12);
    doc.text('Número de Referencia:', 20, 60);
    doc.text(referenceNumber, 120, 60);

    doc.text('Fecha de Emisión:', 20, 70);
    doc.text(today.toLocaleDateString(), 120, 70);

    doc.text('Fecha de Vencimiento:', 20, 80);
    doc.text(dueDate.toLocaleDateString(), 120, 80);

    // Detalles de la propiedad
    doc.setFontSize(14);
    doc.text('Detalles de la Propiedad', 20, 100);

    doc.setFontSize(12);
    doc.text('Propiedad:', 20, 115);
    doc.text(property.title, 120, 115);

    doc.text('Ubicación:', 20, 125);
    doc.text(property.location, 120, 125);

    doc.text('Valor Total:', 20, 135);
    doc.text(formatPrice(property.price), 120, 135);

    // Instrucciones de pago
    doc.setFontSize(14);
    doc.text('Instrucciones de Pago', 20, 155);

    doc.setFontSize(12);
    doc.text('Banco:', 20, 170);
    doc.text('Banco Nacional', 120, 170);

    doc.text('Cuenta:', 20, 180);
    doc.text('000-XXXXXXX-XX', 120, 180);

    doc.text('Tipo de Cuenta:', 20, 190);
    doc.text('Ahorros', 120, 190);

    doc.text('Titular:', 20, 200);
    doc.text('VIVAINMUEBLES S.A.S', 120, 200);

    // Nota importante
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);
    doc.text('IMPORTANTE: Usar el número de referencia como concepto de pago', 105, 220, { align: 'center' });

    // Pie de página
    doc.setTextColor(128, 128, 128);
    doc.text('Este recibo es válido por 3 días hábiles', 105, 240, { align: 'center' });
    doc.text('Para cualquier consulta: soporte@vivainmuebles.com', 105, 245, { align: 'center' });

    // Guardar el PDF
    doc.save(`recibo-pago-${referenceNumber}.pdf`);
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
          <div className="property-actions-top">
            <div onClick={handleFavoriteClick}>
              <FavoriteButton propertyId={property.id} />
            </div>
            <ShareButton property={property} />
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
              Pagar Arriendo
            </button>
          )}

          {property.status === 'for_sale' && (
            <button 
              onClick={generateBankReceipt}
              className="bank-receipt-button"
            >
              <FaFileInvoiceDollar className="payment-icon" />
              Generar Recibo Bancario
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;