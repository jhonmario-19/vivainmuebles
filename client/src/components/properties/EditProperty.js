// Path: client/src/components/properties/EditProperty.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/pages/EditProperty.css';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    property_type: 'Casa',
    status: 'for_sale',
    image_url: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProperty = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setFormData(response.data);
      if (response.data.image_url) {
        setCurrentImage(response.data.image_url);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar la propiedad:', err);
      setError(
        err.response?.data?.message || 
        'No se pudo cargar la información de la propiedad. Por favor, intente nuevamente.'
      );
      setLoading(false);
      
      // Si el error es por autenticación, redirigir al login
      if (err.response?.status === 401) {
        navigate('/login', { 
          state: { 
            from: `/edit-property/${id}`,
            message: 'Por favor inicie sesión para editar la propiedad'
          }
        });
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

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

    try {
      const token = localStorage.getItem('token');
      const propertyData = new FormData();
      
      Object.keys(formData).forEach(key => {
        propertyData.append(key, formData[key]);
      });

      if (image) {
        propertyData.append('image', image);
      }

      await axios.put(
        `http://localhost:5000/api/properties/${id}`,
        propertyData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Propiedad actualizada exitosamente');
      setTimeout(() => {
        navigate('/my-properties');
      }, 2000);
    } catch (err) {
      console.error('Error al actualizar:', err);
      setError(err.response?.data?.error || 'Error al actualizar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="property-form-container">
      <h2>Editar Propiedad</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Precio</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">Área (m²)</label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Ubicación</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bedrooms">Habitaciones</label>
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
            <label htmlFor="bathrooms">Baños</label>
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
            <label htmlFor="property_type">Tipo de Propiedad</label>
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
            <label htmlFor="status">Estado</label>
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
          <label htmlFor="image">Imagen de la propiedad</label>
          <div className="image-upload-container">
            {(currentImage || imagePreview) && (
              <div className="current-image">
                <img 
                  src={imagePreview || `http://localhost:5000${currentImage}`}
                  alt="Vista previa"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    setCurrentImage(null);
                  }}
                >
                  Eliminar imagen
                </button>
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="image-input"
            />
            <p className="image-help-text">
              Formato: JPG, PNG o GIF. Tamaño máximo: 5MB
            </p>
          </div>
        </div>

        <div className="form-buttons">
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
            {loading ? 'Actualizando...' : 'Actualizar Propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;