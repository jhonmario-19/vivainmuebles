import React from 'react';
import AppointmentsList from '../components/appointments/AppointmentsList';
import '../styles/pages/AppointmentsManagement.css';

const AppointmentsManagement = () => {
  return (
    <div className="appointments-management-page">
      <div className="container">
        <h1 className="page-title">Gestión de Citas</h1>
        <AppointmentsList />
      </div>
    </div>
  );
};

export default AppointmentsManagement;