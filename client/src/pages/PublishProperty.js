// Path: client/src/pages/PublishProperty.js

import React from 'react';
import '../styles/pages/PublishProperty.css';
import PropertyForm from '../components/properties/PropertyForm';

const PublishProperty = () => {
  return (
    <div className="publish-property-page">
      <PropertyForm />
    </div>
  );
};

export default PublishProperty;