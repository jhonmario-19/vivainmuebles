// Path: client/src/components/appointments/AppointmentsList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/components/AppointmentsList.css';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/appointments/my-appointments',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar las citas:', err);
      setError(
        err.response?.data?.message || 
        'No se pudieron cargar las citas. Por favor, intente nuevamente más tarde.'
      );
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchAppointments(); // Recargar la lista después de actualizar
    } catch (err) {
      console.error('Error al actualizar el estado de la cita:', err);
      setError(
        err.response?.data?.message || 
        `Error al ${newStatus === 'confirmed' ? 'confirmar' : 'cancelar'} la cita. Por favor, intente nuevamente.`
      );
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-badge confirmed';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="appointments-list">
      {appointments.length === 0 ? (
        <p className="no-appointments">No hay citas programadas</p>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.property_title}</h3>
                <span className={getStatusBadgeClass(appointment.status)}>
                  {getStatusText(appointment.status)}
                </span>
              </div>

              <div className="appointment-details">
                <p className="appointment-date">
                  <strong>Fecha:</strong> {' '}
                  {new Date(appointment.date).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {userRole === 'seller' ? (
                  <p><strong>Cliente:</strong> {appointment.client_name}</p>
                ) : (
                  <p><strong>Vendedor:</strong> {appointment.seller_name}</p>
                )}
                {appointment.notes && (
                  <p className="appointment-notes">
                    <strong>Notas:</strong> {appointment.notes}
                  </p>
                )}
              </div>

              {userRole === 'seller' && appointment.status === 'pending' && (
                <div className="appointment-actions">
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    className="confirm-button"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;