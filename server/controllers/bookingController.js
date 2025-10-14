const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Crear reserva
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { property, checkIn, checkOut, guests } = req.body;

    // Verificar que la propiedad existe
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    // Calcular precio total
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = days * propertyExists.pricePerNight;

    // Crear reserva
    const booking = await Booking.create({
      property,
      user: req.user.id,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    await booking.populate('property user');

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obtener mis reservas
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('property', 'title images location pricePerNight')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obtener una reserva
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario sea el dueño de la reserva
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancelar reserva
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario sea el dueño
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Verificar que la reserva no esté ya cancelada
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'La reserva ya está cancelada'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'No especificado';
    booking.paymentStatus = 'refunded';

    await booking.save();

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};