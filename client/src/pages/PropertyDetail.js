import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import propertyService from '../services/propertyService';
import bookingService from '../services/bookingService';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const data = await propertyService.getById(id);
      setProperty(data.property);
    } catch (err) {
      setError('Error al cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    setBookingLoading(true);

    try {
      await bookingService.create({
        property: id,
        ...bookingData
      });
      
      alert('¡Reserva creada exitosamente!');
      navigate('/dashboard');
    } catch (err) {
      alert('Error al crear reserva: ' + (err.response?.data?.error || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando propiedad...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!property) return <div className="error">Propiedad no encontrada</div>;

  return (
    <div className="property-detail">
      <div className="property-header">
        <h1>{property.title}</h1>
        <p className="location">📍 {property.location.city}, {property.location.state}</p>
      </div>

      <div className="property-images">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.title}
          />
        ) : (
          <img 
            src="https://via.placeholder.com/800x400" 
            alt="Sin imagen"
          />
        )}
      </div>

      <div className="property-content">
        <div className="property-main">
          <div className="property-host">
            <h3>Anfitrión: {property.host?.name || 'Anfitrión'}</h3>
          </div>

          <div className="property-specs">
            <span>👥 {property.maxGuests} huéspedes</span>
            <span>🛏️ {property.bedrooms} recámaras</span>
            <span>🚿 {property.bathrooms} baños</span>
          </div>

          <div className="property-description">
            <h3>Descripción</h3>
            <p>{property.description}</p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="property-amenities">
              <h3>Amenidades</h3>
              <ul>
                {property.amenities.map((amenity, index) => (
                  <li key={index}>✓ {amenity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="property-sidebar">
          <div className="booking-card">
            <div className="price">
              <span className="amount">${property.pricePerNight}</span>
              <span className="period">por noche</span>
            </div>

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Check-in</label>
                <input
                  type="date"
                  name="checkIn"
                  value={bookingData.checkIn}
                  onChange={handleBookingChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Check-out</label>
                <input
                  type="date"
                  name="checkOut"
                  value={bookingData.checkOut}
                  onChange={handleBookingChange}
                  required
                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Huéspedes</label>
                <input
                  type="number"
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleBookingChange}
                  min="1"
                  max={property.maxGuests}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Procesando...' : 'Reservar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;