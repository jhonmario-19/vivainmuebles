import React, { useState } from 'react';
import { FaShare, FaCopy, FaTimes } from 'react-icons/fa';
import '../../styles/components/ShareButton.css';

const ShareButton = ({ property }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const propertyUrl = `${window.location.origin}/property/${property.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset después de 2 segundos
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="share-container">
      <button 
        className="share-button"
        onClick={() => setShowOptions(!showOptions)}
        title="Compartir propiedad"
      >
        <FaShare />
      </button>

      {showOptions && (
        <div className="share-modal">
          <div className="share-modal-header">
            <h3>Compartir Propiedad</h3>
            <button 
              className="close-button"
              onClick={() => setShowOptions(false)}
            >
              <FaTimes />
            </button>
          </div>
          <div className="share-modal-content">
            <p className="share-text">Copiar enlace de la propiedad:</p>
            <div className="link-container">
              <input 
                type="text" 
                value={propertyUrl} 
                readOnly 
                className="link-input"
              />
              <button 
                className="copy-button"
                onClick={handleCopyLink}
              >
                <FaCopy />
                {copySuccess ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;