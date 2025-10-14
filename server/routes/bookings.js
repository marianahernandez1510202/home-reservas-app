const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getMyBookings)
  .post(protect, createBooking);

router.route('/:id')
  .get(protect, getBooking);

router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;