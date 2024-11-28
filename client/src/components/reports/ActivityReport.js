// Path: client/src/components/reports/ActivityReport.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHome, FaCalendarCheck, FaEye, FaHeart, FaEnvelope } from 'react-icons/fa';
import '../../styles/components/ActivityReport.css';

const ActivityReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/activities?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReport(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el reporte de actividades');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando reporte...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!report) return <div>No hay datos disponibles</div>;

  return (
    <div className="activity-report">
      <div className="report-header">
        <h2>Reporte de Actividades</h2>
        <div className="date-range-selector">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-select"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="year">Último año</option>
          </select>
        </div>
      </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <FaHome className="stat-icon" />
          <div className="stat-content">
            <h3>Propiedades Activas</h3>
            <p className="stat-number">{report.activeProperties}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaCalendarCheck className="stat-icon" />
          <div className="stat-content">
            <h3>Citas Programadas</h3>
            <p className="stat-number">{report.totalAppointments}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaEye className="stat-icon" />
          <div className="stat-content">
            <h3>Visitas Totales</h3>
            <p className="stat-number">{report.totalViews}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaHeart className="stat-icon" />
          <div className="stat-content">
            <h3>Favoritos</h3>
            <p className="stat-number">{report.totalFavorites}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaEnvelope className="stat-icon" />
          <div className="stat-content">
            <h3>Contactos Recibidos</h3>
            <p className="stat-number">{report.totalContacts}</p>
          </div>
        </div>
      </div>

      <div className="property-details-section">
        <h3>Detalles por Propiedad</h3>
        <table className="property-table">
          <thead>
            <tr>
              <th>Propiedad</th>
              <th>Visitas</th>
              <th>Citas</th>
              <th>Favoritos</th>
              <th>Contactos</th>
            </tr>
          </thead>
          <tbody>
            {report.propertyDetails.map((property) => (
              <tr key={property.id}>
                <td>{property.title}</td>
                <td>{property.views}</td>
                <td>{property.appointments}</td>
                <td>{property.favorites}</td>
                <td>{property.contacts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityReport;