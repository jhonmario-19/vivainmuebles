// Path: client/src/components/properties/SellerInfo.js

import React from 'react';
import { FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../../styles/components/SellerInfo.css';

const SellerInfo = ({ seller }) => {
  return (
    <div className="seller-info">
      <h3 className="seller-title">Información del Vendedor</h3>
      <div className="seller-details">
        <div className="seller-detail">
          <FaUser className="seller-icon" />
          <span>{seller.name}</span>
        </div>
        {seller.phone && (
          <div className="seller-detail">
            <FaPhone className="seller-icon" />
            <span>{seller.phone}</span>
          </div>
        )}
        <div className="seller-detail">
          <FaEnvelope className="seller-icon" />
          <span>{seller.email}</span>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;