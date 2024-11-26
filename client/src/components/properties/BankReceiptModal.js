// Path: client/src/components/properties/BankReceiptModal.js

import React from 'react';
import { formatPrice } from '../../utils/formatters';
import '../../styles/components/BankReceiptModal.css';

const BankReceiptModal = ({ property, onClose }) => {
  const today = new Date();
  const dueDate = new Date(today.setDate(today.getDate() + 3));
  const referenceNumber = `REF-${property.id}-${Date.now()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bank-receipt-overlay">
      <div className="bank-receipt-container">
        <div className="bank-receipt-header">
          <h2>Recibo de Pago Bancario</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="bank-receipt-content" id="printable-area">
          <div className="company-info">
            <h1>VIVAInmuebles</h1>
            <p>NIT: 900.XXX.XXX-X</p>
          </div>

          <div className="receipt-details">
            <div className="receipt-row">
              <span>Número de Referencia:</span>
              <span>{referenceNumber}</span>
            </div>
            <div className="receipt-row">
              <span>Fecha de Emisión:</span>
              <span>{today.toLocaleDateString()}</span>
            </div>
            <div className="receipt-row">
              <span>Fecha de Vencimiento:</span>
              <span>{dueDate.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="property-details">
            <h3>Detalles de la Propiedad</h3>
            <p><strong>Propiedad:</strong> {property.title}</p>
            <p><strong>Ubicación:</strong> {property.location}</p>
            <p><strong>Valor Total:</strong> {formatPrice(property.price)}</p>
          </div>

          <div className="payment-instructions">
            <h3>Instrucciones de Pago</h3>
            <p><strong>Banco:</strong> Banco Nacional</p>
            <p><strong>Cuenta:</strong> 000-XXXXXXX-XX</p>
            <p><strong>Tipo de Cuenta:</strong> Ahorros</p>
            <p><strong>Titular:</strong> VIVAInmuebles S.A.S</p>
            <p className="important">Usar el número de referencia como concepto de pago</p>
          </div>

          <div className="receipt-footer">
            <p>Este recibo es válido por 3 días hábiles</p>
            <p>Para cualquier consulta: soporte@vivainmuebles.com</p>
          </div>
        </div>

        <div className="receipt-actions">
          <button onClick={handlePrint} className="print-button">
            Imprimir Recibo
          </button>
          <button onClick={onClose} className="close-receipt-button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankReceiptModal;