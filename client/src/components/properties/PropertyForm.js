// Path: client/src/components/properties/PropertyForm.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/forms/PropertyForm.css';

const PropertyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    property_type: 'house',
    status: 'for_sale',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('La imagen no debe superar los 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!image) {
      setError('Por favor selecciona una imagen');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No autorizado - Por favor inicia sesión');
      }

      const propertyData = new FormData();
      
      Object.keys(formData).forEach(key => {
        propertyData.append(key, formData[key]);
      });

      propertyData.append('image', image);

      await axios.post(
        'http://localhost:5000/api/properties',
        propertyData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Propiedad publicada exitosamente');
      setTimeout(() => {
        navigate('/my-properties');
      }, 2000);
      
    } catch (err) {
      console.error('Error al publicar:', err);
      setError(err.response?.data?.error || 'Error al publicar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-form-container">
      <h2 className="form-title">Publicar Nueva Propiedad</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ej: Casa moderna en zona residencial"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe las características principales de la propiedad"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
              <label htmlFor="price">Precio *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="Precio en COP"
                min="0"
                max="9999999999999.99" // Permite valores hasta 9,999,999,999,999.99
                step="0.01"
            />

          </div>

          <div className="form-group">
            <label htmlFor="area">Área (m²) *</label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              placeholder="Área en metros cuadrados"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Ubicación *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Dirección o zona"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bedrooms">Habitaciones *</label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bathrooms">Baños *</label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              onChange={handleChange}
              value={formData.bathrooms}
              required
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="property_type">Tipo de Propiedad *</label>
            <select
              id="property_type"
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              required
            >
              <option value="house">Casa</option>
              <option value="apartment">Apartamento</option>
              <option value="land">Terreno</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="for_sale">En Venta</option>
              <option value="for_rent">En Alquiler</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">Imagen de la propiedad *</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="image-input"
              required
            />
            <p className="image-help-text">
              Formato: JPG, PNG o GIF. Tamaño máximo: 5MB
            </p>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Vista previa" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  Eliminar imagen
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/my-properties')}
            className="cancel-button"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Publicando...' : 'Publicar Propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;