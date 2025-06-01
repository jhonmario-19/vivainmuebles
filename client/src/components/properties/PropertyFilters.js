// src/components/properties/PropertyFilters.js

import React, { useState } from 'react';
import '../../styles/components/PropertyFilters.css';
import { FaSearch, FaFilter } from 'react-icons/fa';

const PropertyFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    propertyType: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    minArea: '',
    maxArea: ''
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      propertyType: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: ''
    });
    onFilterChange({});
  };

  return (
    <div className="property-filters">
      <form onSubmit={handleSubmit}>
        <div className="filters-basic">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleInputChange}
              placeholder="Buscar por ubicación, título..."
              className="search-input"
            />
          </div>

          <div className="basic-filters">
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleInputChange}
              className="filter-select"
            >
              <option value="">Tipo de Propiedad</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Terreno">Terreno</option>
              <option value="Comercial">Comercial</option>
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="filter-select"
            >
              <option value="">Estado</option>
              <option value="for_sale">En Venta</option>
              <option value="for_rent">En Alquiler</option>
            </select>

            <button 
              type="button" 
              className="toggle-filters-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <FaFilter /> Más Filtros
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="filters-advanced">
            <div className="filter-group">
              <label>Precio</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  placeholder="Mín"
                  className="filter-input"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  placeholder="Máx"
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Habitaciones</label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">Cualquiera</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Baños</label>
              <select
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleInputChange}
                className="filter-select"
              >
                <option value="">Cualquiera</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Área (m²)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="minArea"
                  value={filters.minArea}
                  onChange={handleInputChange}
                  placeholder="Mín"
                  className="filter-input"
                />
                <input
                  type="number"
                  name="maxArea"
                  value={filters.maxArea}
                  onChange={handleInputChange}
                  placeholder="Máx"
                  className="filter-input"
                />
              </div>
            </div>
          </div>
        )}

        <div className="filters-actions">
          <button type="button" onClick={handleReset} className="reset-btn">
            Limpiar Filtros
          </button>
          <button type="submit" className="apply-btn">
            Aplicar Filtros
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFilters;