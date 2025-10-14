const Property = require('../models/Property');

// @desc    Obtener todas las propiedades
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'active' })
      .populate('host', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Buscar propiedades
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = async (req, res) => {
  try {
    const { city, checkIn, checkOut, guests, minPrice, maxPrice } = req.query;

    let query = { status: 'active' };

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerNight.$lte = parseFloat(maxPrice);
    }

    const properties = await Property.find(query)
      .populate('host', 'name avatar')
      .sort('-rating');

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Obtener una propiedad
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'name email phone avatar bio');

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Crear propiedad
// @route   POST /api/properties
// @access  Private (Host/Admin)
exports.createProperty = async (req, res) => {
  try {
    req.body.host = req.user.id;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Actualizar propiedad
// @route   PUT /api/properties/:id
// @access  Private (Host/Admin)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para actualizar esta propiedad'
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Eliminar propiedad
// @route   DELETE /api/properties/:id
// @access  Private (Host/Admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para eliminar esta propiedad'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Propiedad eliminada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};