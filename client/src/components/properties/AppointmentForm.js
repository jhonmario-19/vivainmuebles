import React, { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import '../../styles/components/AppointmentForm.css';

const AppointmentForm = ({ property, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Obtener la fecha mínima (hoy)
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Combinar fecha y hora
      const dateTime = `${formData.date}T${formData.time}:00`;

      await axios.post(
        'http://localhost:5000/api/appointments',
        {
          property_id: property.id,
          date: dateTime,
          notes: formData.notes
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form-overlay">
      <div className="appointment-form-container">
        <div className="appointment-form-header">
          <h3>Agendar Visita</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {success ? (
          <div className="success-message">
            Cita agendada exitosamente. El propietario confirmará la visita pronto.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="property-info">
              <h4>{property.title}</h4>
              <p className="property-location">{property.location}</p>
            </div>

            <div className="form-group">
              <label htmlFor="date">Fecha de Visita *</label>
              <input
                type="date"
                id="date"
                name="date"
                min={today}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Hora de Visita *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                min="09:00"
                max="18:00"
                required
              />
              <small>Horario disponible: 9:00 AM - 6:00 PM</small>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas Adicionales</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Información adicional que el propietario deba saber..."
                rows="3"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={onClose}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Agendando...' : 'Agendar Visita'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentForm;