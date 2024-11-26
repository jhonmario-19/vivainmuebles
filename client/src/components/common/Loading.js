// Path: client/src/components/common/Loading.js

import React from 'react';
import '../../styles/common/Loading.css';

const Loading = () => {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Cargando...</p>
    </div>
  );
};

export default Loading;