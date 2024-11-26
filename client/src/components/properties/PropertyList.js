// src/components/properties/PropertyList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from './PropertyCard';
import PropertyFilters from './PropertyFilters';
import Loading from '../common/Loading';
import '../../styles/pages/Properties.css';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/properties');
        setProperties(response.data);
        setFilteredProperties(response.data); // Inicializa las propiedades filtradas
        setLoading(false);
      } catch (err) {
        setError('No se pudieron cargar las propiedades');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleFilterChange = (filters) => {
    let filtered = [...properties];

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.propertyType) {
      filtered = filtered.filter(property => property.property_type === filters.propertyType);
    }

    if (filters.status) {
      filtered = filtered.filter(property => property.status === filters.status);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= filters.maxPrice);
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= filters.bedrooms);
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= filters.bathrooms);
    }

    if (filters.minArea) {
      filtered = filtered.filter(property => property.area >= filters.minArea);
    }

    if (filters.maxArea) {
      filtered = filtered.filter(property => property.area <= filters.maxArea);
    }

    setFilteredProperties(filtered);
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="properties-container">
      <h1 className="properties-title">Propiedades Disponibles</h1>
      <PropertyFilters onFilterChange={handleFilterChange} />
      
      <div className="property-list">
        {filteredProperties.length > 0 ? (
          filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <p className="no-properties">No hay propiedades que coincidan con los filtros seleccionados</p>
        )}
      </div>
    </div>
  );
};

export default PropertyList;