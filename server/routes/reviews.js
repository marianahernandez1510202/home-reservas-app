const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Obtener reseñas de una propiedad
// @route   GET /api/reviews/property/:propertyId
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const Review = require('../models/Review');
    
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Crear reseña
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const Booking = require('../models/Booking');
    
    // Verificar que la reserva existe y está completada
    const booking = await Booking.findById(req.body.booking);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Solo puedes dejar reseña después de completar la estancia'
      });
    }

    // Crear reseña
    req.body.user = req.user.id;
    req.body.property = booking.property;

    const review = await Review.create(req.body);

    // Actualizar rating de la propiedad
    const Property = require('../models/Property');
    const reviews = await Review.find({ property: booking.property });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    
    await Property.findByIdAndUpdate(booking.property, {
      rating: avgRating,
      reviewCount: reviews.length
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;