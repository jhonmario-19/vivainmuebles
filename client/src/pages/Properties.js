// Path: client/src/pages/Properties.js

import React from 'react';
import '../styles/pages/Properties.css';
import PropertyList from '../components/properties/PropertyList';

const Properties = () => {
  return (
    <div className="properties-page">
      <PropertyList />
    </div>
  );
};

export default Properties;