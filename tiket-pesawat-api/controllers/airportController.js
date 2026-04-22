const Airport = require('../models/Airport');
const { success, error } = require('../utils/responseFormatter');
 
const formatAirport = (airport) => ({
  code:      airport.code,
  name:      airport.name,
  city:      airport.city,
  country:   airport.country,
  createdAt: airport.createdAt,
  updatedAt: airport.updatedAt,
});

// @desc  Get all airports
// @route GET /api/airports
const getAllAirports = async (req, res, next) => {
  try {
    const { country, city, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (country) filter.country = new RegExp(country, 'i');
    if (city)    filter.city    = new RegExp(city, 'i');

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;

    const total    = await Airport.countDocuments(filter);
    const airports = await Airport.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ code: 1 });

    const pagination = {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    };

    res.status(200).json(success('Data airports berhasil diambil', airports.map(formatAirport), pagination));
  } catch (err) {
    next(err);
  }
};

// @desc  Get airport by ID
// @route GET /api/airports/:id
const getAirportById = async (req, res, next) => {
  try {
    const airport = await Airport.findById(req.params.id);

    if (!airport) {
      return res.status(404).json(error('Airport tidak ditemukan'));
    }

    res.status(200).json(success('Data airport berhasil diambil', formatAirport(airport)));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID airport tidak valid'));
    }
    next(err);
  }
};

// @desc  Create airport
// @route POST /api/airports
const createAirport = async (req, res, next) => {
  try {
    const airport = await Airport.create(req.body);

    res.status(201).json(success('Airport berhasil dibuat', formatAirport(airport)));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json(error('Kode airport sudah digunakan'));
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(error('Validasi gagal', messages));
    }
    next(err);
  }
};

// @desc  Update airport
// @route PUT /api/airports/:id
const updateAirport = async (req, res, next) => {
  try {
    const airport = await Airport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!airport) {
      return res.status(404).json(error('Airport tidak ditemukan'));
    }

    res.status(200).json(success('Airport berhasil diupdate', formatAirport(airport)));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID airport tidak valid'));
    }
    if (err.code === 11000) {
      return res.status(400).json(error('Kode airport sudah digunakan'));
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(error('Validasi gagal', messages));
    }
    next(err);
  }
};

// @desc  Delete airport
// @route DELETE /api/airports/:id
const deleteAirport = async (req, res, next) => {
  try {
    const airport = await Airport.findByIdAndDelete(req.params.id);

    if (!airport) {
      return res.status(404).json(error('Airport tidak ditemukan'));
    }

    res.status(200).json(success('Airport berhasil dihapus'));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID airport tidak valid'));
    }
    next(err);
  }
};

module.exports = { getAllAirports, getAirportById, createAirport, updateAirport, deleteAirport };