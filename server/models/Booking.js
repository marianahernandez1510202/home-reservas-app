const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'La fecha de check-in es obligatoria']
  },
  checkOut: {
    type: Date,
    required: [true, 'La fecha de check-out es obligatoria']
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Índices
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', BookingSchema);