const express = require('express');
const {
  getProperties,
  searchProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, authorize('host', 'admin'), createProperty);

router.get('/search', searchProperties);

router.route('/:id')
  .get(getProperty)
  .put(protect, authorize('host', 'admin'), updateProperty)
  .delete(protect, authorize('host', 'admin'), deleteProperty);

module.exports = router;