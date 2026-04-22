const Airline = require('../models/Airline');
const { success, error } = require('../utils/responseFormatter');
 
const formatAirline = (airline) => ({
  code:      airline.code,
  name:      airline.name,
  country:   airline.country,
  logoUrl:   airline.logoUrl || null,
  createdAt: airline.createdAt,
  updatedAt: airline.updatedAt,
});

// @desc  Get all airlines
// @route GET /api/airlines
const getAllAirlines = async (req, res, next) => {
  try {
    const { country, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (country) filter.country = new RegExp(country, 'i');

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;

    const total    = await Airline.countDocuments(filter);
    const airlines = await Airline.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ code: 1 });

    const pagination = {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    };

    res.status(200).json(success('Data airlines berhasil diambil', airlines.map(formatAirline), pagination));
  } catch (err) {
    next(err);
  }
};

// @desc  Get airline by ID
// @route GET /api/airlines/:id
const getAirlineById = async (req, res, next) => {
  try {
    const airline = await Airline.findById(req.params.id);

    if (!airline) {
      return res.status(404).json(error('Airline tidak ditemukan'));
    }

    res.status(200).json(success('Data airline berhasil diambil', formatAirline(airline)));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID airline tidak valid'));
    }
    next(err);
  }
};

// @desc  Create airline
// @route POST /api/airlines
const createAirline = async (req, res, next) => {
  try {
    const airline = await Airline.create(req.body);

    res.status(201).json(success('Airline berhasil dibuat', formatAirline(airline)));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json(error('Kode airline sudah digunakan'));
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(error('Validasi gagal', messages));
    }
    next(err);
  }
};

// @desc  Update airline
// @route PUT /api/airlines/:id
const updateAirline = async (req, res, next) => {
  try {
    const airline = await Airline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!airline) {
      return res.status(404).json(error('Airline tidak ditemukan'));
    }

    res.status(200).json(success('Airline berhasil diupdate', formatAirline(airline)));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID airline tidak valid'));
    }
    if (err.code === 11000) {
      return res.status(400).json(error('Kode airline sudah digunakan'));
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(error('Validasi gagal', messages));
    }
    next(err);
  }
};

// @desc  Delete airline
// @route DELETE /api/airlines/:id
const deleteAirline = async (req, res, next) => {
  try {
    const airline = await Airline.findByIdAndDelete(req.params.id);

    if (!airline) {
      return res.status(404).json(error('Airline tidak ditemukan'));
    }

    res.status(200).json(success('Airline berhasil dihapus'));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID airline tidak valid'));
    }
    next(err);
  }
};

module.exports = { getAllAirlines, getAirlineById, createAirline, updateAirline, deleteAirline };