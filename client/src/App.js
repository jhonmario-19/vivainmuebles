// Path: client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Register from './pages/Register';
import Login from './pages/Login';
import PublishProperty from './pages/PublishProperty';
import PropertyManagement from './components/properties/PropertyManagement'; 
import PropertyDetails from './pages/PropertyDetails';
import EditProperty from './components/properties/EditProperty';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppointmentsManagement from './pages/AppointmentsManagement';
import Favorites from './pages/Favorites';
import './styles/App.css';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/publish-property"
              element={
                <ProtectedRoute role="seller">
                  <PublishProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-properties"
              element={
                <ProtectedRoute role="seller">
                  <PropertyManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-property/:id"
              element={
                <ProtectedRoute role="seller">
                  <EditProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/:id"
              element={
                <ProtectedRoute>
                  <PropertyDetails />
                </ProtectedRoute>
              }
            />     
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentsManagement />
                </ProtectedRoute>
              }
            />  
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />     
            <Route path="/home" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;