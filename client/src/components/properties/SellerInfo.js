// Path: client/src/components/properties/SellerInfo.js

import React from 'react';
import { FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../../styles/components/SellerInfo.css';
import PropTypes from 'prop-types';

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

SellerInfo.propTypes = {
  seller: PropTypes.shape({
    name: PropTypes.string.isRequired,
    phone: PropTypes.string,
    email: PropTypes.string.isRequired
  }).isRequired
};

export default SellerInfo;