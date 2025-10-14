const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'room', 'studio'],
    default: 'apartment'
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pricePerNight: {
    type: Number,
    required: [true, 'El precio por noche es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  maxGuests: {
    type: Number,
    required: true,
    min: [1, 'Debe permitir al menos 1 huésped']
  },
  bedrooms: {
    type: Number,
    default: 1,
    min: 0
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: 0
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  rules: [{
    type: String
  }],
  availability: [{
    type: Date
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
PropertySchema.index({ 'location.city': 1 });
PropertySchema.index({ pricePerNight: 1 });
PropertySchema.index({ rating: -1 });

module.exports = mongoose.model('Property', PropertySchema);