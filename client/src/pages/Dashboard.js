import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data.bookings);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Mi Dashboard</h1>
        <div className="user-info">
          <span>¡Hola, {user?.name}!</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="bookings-section">
          <h2>Mis Reservas</h2>

          {loading ? (
            <p>Cargando reservas...</p>
          ) : bookings.length === 0 ? (
            <p>No tienes reservas aún</p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <h3>{booking.property?.title}</h3>
                  <p>📅 Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                  <p>📅 Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
                  <p>👥 Huéspedes: {booking.guests}</p>
                  <p>💰 Total: ${booking.totalPrice}</p>
                  <span className={`status ${booking.status}`}>
                    {booking.status === 'confirmed' ? 'Confirmada' : 
                     booking.status === 'cancelled' ? 'Cancelada' : 
                     booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;