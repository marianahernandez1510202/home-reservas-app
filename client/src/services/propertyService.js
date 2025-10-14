import api from './api';

const propertyService = {
  // Obtener todas las propiedades
  getAll: async () => {
    const response = await api.get('/properties');
    return response.data;
  },

  // Buscar propiedades
  search: async (filters) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/properties/search?${params}`);
    return response.data;
  },

  // Obtener una propiedad
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Crear propiedad
  create: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  // Actualizar propiedad
  update: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Eliminar propiedad
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  }
};

export default propertyService;