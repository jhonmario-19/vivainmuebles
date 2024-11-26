// Path: client/src/pages/Login.js

import React from 'react';
import '../styles/pages/Login.css';
import LoginForm from '../components/users/LoginForm';

const Login = () => {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default Login;