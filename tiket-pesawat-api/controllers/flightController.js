const Airport = require('../models/Airport');
const Airline = require('../models/Airline');
const Flight  = require('../models/Flight');
const { success, error } = require('../utils/responseFormatter');

const ALLOWED_SORTS = ['departureTime', 'arrivalTime', 'price', 'availableSeats'];

const formatFlight = (flight) => ({
  flightId:     flight.flightId,
  flightNumber: flight.flightNumber,
  airline: flight.airlineId ? {
    code: flight.airlineId.code,
    name: flight.airlineId.name,
  } : null,
  origin: flight.originAirportId ? {
    code: flight.originAirportId.code,
    name: flight.originAirportId.name,
    city: flight.originAirportId.city,
  } : null,
  destination: flight.destinationAirportId ? {
    code: flight.destinationAirportId.code,
    name: flight.destinationAirportId.name,
    city: flight.destinationAirportId.city,
  } : null,
  departureTime:  flight.departureTime,
  arrivalTime:    flight.arrivalTime,
  price:          flight.price,
  availableSeats: flight.availableSeats,
  status:         flight.status,
  createdAt:      flight.createdAt,
  updatedAt:      flight.updatedAt,
});

// @desc  Get all flights
// @route GET /api/flights
const getAllFlights = async (req, res, next) => {
  try {
    const {
      origin, destination, date,
      minPrice, maxPrice, airlineId, status,
      page = 1, limit = 10, sort = 'departureTime',
    } = req.query;

    const filter = {};

    if (origin) {
      const originAirport = await Airport.findOne({ code: origin.toUpperCase() });
      if (!originAirport) {
        return res.status(404).json(error(`Airport asal '${origin}' tidak ditemukan`));
      }
      filter.originAirportId = originAirport._id;
    }

    if (destination) {
      const destAirport = await Airport.findOne({ code: destination.toUpperCase() });
      if (!destAirport) {
        return res.status(404).json(error(`Airport tujuan '${destination}' tidak ditemukan`));
      }
      filter.destinationAirportId = destAirport._id;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.departureTime = { $gte: startOfDay, $lte: endOfDay };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (airlineId) filter.airlineId = airlineId;
    if (status)    filter.status    = status;

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;

    const sortField = ALLOWED_SORTS.includes(sort) ? sort : 'departureTime';

    const total   = await Flight.countDocuments(filter);
    const flights = await Flight.find(filter)
      .populate('airlineId',            'code name logoUrl')
      .populate('originAirportId',      'code name city country')
      .populate('destinationAirportId', 'code name city country')
      .skip(skip)
      .limit(limitNum)
      .sort(sortField);

    const pagination = {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    };

    res.status(200).json(success('Data flights berhasil diambil', flights.map(formatFlight), pagination));
  } catch (err) {
    next(err);
  }
};

// @desc  Get flight by ID
// @route GET /api/flights/:id
const getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findOne({ flightId: req.params.id })
      .populate('airlineId',            'code name logoUrl')
      .populate('originAirportId',      'code name city country')
      .populate('destinationAirportId', 'code name city country');

    if (!flight) {
      return res.status(404).json(error('Flight tidak ditemukan'));
    }

    res.status(200).json(success('Data flight berhasil diambil', formatFlight(flight)));
  } catch (err) {
    next(err);
  }
};

// @desc  Create flight — bisa pakai kode airline & airport langsung
// @route POST /api/flights
const createFlight = async (req, res, next) => {
  try {
    const {
      airlineCode,
      originCode,
      destinationCode,
      flightNumber,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
      status,
    } = req.body;

    const airline = await Airline.findOne({ code: airlineCode.toUpperCase() });
    if (!airline) {
      return res.status(404).json(error(`Airline '${airlineCode}' tidak ditemukan`));
    }

    const originAirport = await Airport.findOne({ code: originCode.toUpperCase() });
    if (!originAirport) {
      return res.status(404).json(error(`Airport asal '${originCode}' tidak ditemukan`));
    }

    const destAirport = await Airport.findOne({ code: destinationCode.toUpperCase() });
    if (!destAirport) {
      return res.status(404).json(error(`Airport tujuan '${destinationCode}' tidak ditemukan`));
    }

    if (new Date(departureTime) >= new Date(arrivalTime)) {
      return res.status(400).json(error('Waktu keberangkatan harus sebelum waktu kedatangan'));
    }

    const flight = await Flight.create({
      airlineId:            airline._id,
      originAirportId:      originAirport._id,
      destinationAirportId: destAirport._id,
      flightNumber,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
      status: status || 'scheduled',
    });

    const populated = await Flight.findById(flight._id)
      .populate('airlineId',            'code name')
      .populate('originAirportId',      'code name city')
      .populate('destinationAirportId', 'code name city');

    res.status(201).json(success('Flight berhasil dibuat', formatFlight(populated)));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json(error('Nomor penerbangan sudah digunakan'));
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(error('Validasi gagal', messages));
    }
    next(err);
  }
};

// @desc  Update flight
// @route PUT /api/flights/:id
const updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findOneAndUpdate(
      { flightId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('airlineId',            'code name')
      .populate('originAirportId',      'code name city')
      .populate('destinationAirportId', 'code name city');

    if (!flight) {
      return res.status(404).json(error('Flight tidak ditemukan'));
    }

    res.status(200).json(success('Flight berhasil diupdate', formatFlight(flight)));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID flight tidak valid'));
    }
    if (err.code === 11000) {
      return res.status(400).json(error('Nomor penerbangan sudah digunakan'));
    }
    next(err);
  }
};

// @desc  Delete flight
// @route DELETE /api/flights/:id
const deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findOneAndDelete({ flightId: req.params.id });

    if (!flight) {
      return res.status(404).json(error('Flight tidak ditemukan'));
    }

    res.status(200).json(success('Flight berhasil dihapus'));
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllFlights, getFlightById, createFlight, updateFlight, deleteFlight };