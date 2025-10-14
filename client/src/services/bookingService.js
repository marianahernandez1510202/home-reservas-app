import api from './api';

const bookingService = {
  // Crear reserva
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Obtener mis reservas
  getMyBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  // Obtener una reserva
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Cancelar reserva
  cancel: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  }
};

export default bookingService;