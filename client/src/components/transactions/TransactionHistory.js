// Path: client/src/components/transactions/TransactionHistory.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice } from '../../utils/formatters';
import '../../styles/components/TransactionHistory.css';
import GenerateContractButton from '../contracts/GenerateContractButton';
import { FaFileInvoiceDollar } from 'react-icons/fa';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payments/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTransactions(response.data);
    } catch (err) {
      setError('Error al cargar el historial de transacciones');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (transactionId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payments/invoice/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al descargar la factura:', err);
    }
  };

  if (loading) return <div className="loading">Cargando transacciones...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="transactions-container">
      <h2>Historial de Transacciones</h2>
      
      {transactions.length === 0 ? (
        <p className="no-transactions">No hay transacciones registradas</p>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-header">
                <h3>{transaction.property_title}</h3>
                <span className={`status ${transaction.status}`}>
                  {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span>Fecha:</span>
                  <span>{new Date(transaction.payment_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>Monto:</span>
                  <span className="amount">{formatPrice(transaction.amount)}</span>
                </div>
                <div className="detail-row">
                  <span>Tipo:</span>
                  <span>Arriendo</span>
                </div>
              </div>

              <div className="transaction-actions">
                <button 
                  onClick={() => downloadInvoice(transaction.id)}
                  className="download-invoice-btn"
                >
                  <FaFileInvoiceDollar />
                  Descargar Factura
                </button>

                <GenerateContractButton 
                  transactionId={transaction.id} 
                  contractType={transaction.status === 'for_sale' ? 'sale' : 'rent'} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;