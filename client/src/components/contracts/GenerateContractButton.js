import React from 'react';
import { FaFileContract } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/components/GenerateContractButton.css';

const GenerateContractButton = ({ transactionId, contractType }) => {
  const handleGenerateContract = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/contracts/${transactionId}?contractType=${contractType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob'
        }
      );

      // Crear un blob y descargarlo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contractType}-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al generar contrato:', error);
      alert('Error al generar el contrato');
    }
  };

  return (
    <button 
      onClick={handleGenerateContract}
      className="generate-contract-button"
    >
      <FaFileContract className="contract-icon" />
      Generar Contrato
    </button>
  );
};

export default GenerateContractButton;