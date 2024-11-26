// Path: client/src/pages/Register.js

import React from 'react';
import '../styles/pages/Register.css';
import RegisterForm from '../components/users/RegisterForm';

const Register = () => {
  return (
    <div className="register-page">
      <div className="container">
        <h1>Registro de Usuario</h1>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;