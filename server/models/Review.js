const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: {
    cleanliness: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  title: {
    type: String,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  comment: {
    type: String,
    required: [true, 'El comentario es obligatorio'],
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  recommend: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Un usuario solo puede dejar una reseña por reserva
ReviewSchema.index({ user: 1, booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);