import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import propertyService from '../services/propertyService';
import './PropertyList.css';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    guests: ''
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await propertyService.getAll();
      setProperties(data.properties);
    } catch (err) {
      setError('Error al cargar propiedades');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await propertyService.search(filters);
      setProperties(data.properties);
    } catch (err) {
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading">Cargando propiedades...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="property-list-page">
      <div className="search-filters">
        <h2>Buscar Propiedades</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            name="city"
            placeholder="Ciudad (ej: Querétaro)"
            value={filters.city}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="guests"
            placeholder="Huéspedes"
            value={filters.guests}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Precio mín"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Precio máx"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
      </div>

      <div className="properties-grid">
        {properties.length === 0 ? (
          <p>No se encontraron propiedades</p>
        ) : (
          properties.map((property) => (
            <div key={property._id} className="property-card">
              <div className="property-image">
                <img
                  src={property.images[0] || 'https://via.placeholder.com/300x200'}
                  alt={property.title}
                />
              </div>
              <div className="property-info">
                <h3>{property.title}</h3>
                <p className="property-location">
                  📍 {property.location.city}, {property.location.state}
                </p>
                <p className="property-price">
                  ${property.pricePerNight} <span>por noche</span>
                </p>
                <p className="property-guests">
                  👥 Hasta {property.maxGuests} huéspedes
                </p>
                <Link to={`/properties/${property._id}`} className="btn btn-secondary">
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyList;