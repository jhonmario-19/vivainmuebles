// Path: client/src/components/properties/BankReceiptButton.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import BankReceiptModal from './BankReceiptModal';
import '../../styles/components/BankReceiptButton.css';

const BankReceiptButton = ({ property }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleClick = () => {
    if (!token) {
      navigate('/login', { 
        state: { 
          from: `/property/${property.id}`,
          message: 'Inicia sesión para generar el recibo de pago' 
        }
      });
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        className="bank-receipt-button"
      >
        <FaFileInvoiceDollar className="receipt-icon" />
        Generar Recibo Bancario
      </button>

      {showModal && (
        <BankReceiptModal 
          property={property}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

BankReceiptButton.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.number.isRequired,
    // Agrega otras propiedades del objeto property si son necesarias
  }).isRequired
};

export default BankReceiptButton;