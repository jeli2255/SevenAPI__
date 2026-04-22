const { body, validationResult } = require('express-validator');
const { error } = require('../utils/responseFormatter');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json(error('Validasi gagal', messages));
  }
  next();
};

// ── Airline ───────────────────────────────────────────────
const airlineRules = [
  body('code')
    .notEmpty().withMessage('Kode airline wajib diisi')
    .isLength({ max: 10 }).withMessage('Kode airline maksimal 10 karakter')
    .isAlphanumeric().withMessage('Kode airline hanya boleh huruf dan angka'),
  body('name')
    .notEmpty().withMessage('Nama airline wajib diisi')
    .isLength({ max: 100 }).withMessage('Nama airline maksimal 100 karakter'),
  body('country')
    .notEmpty().withMessage('Negara airline wajib diisi'),
  body('logoUrl')
    .optional()
    .isURL().withMessage('Logo URL harus berupa URL yang valid'),
];

const validateAirline = [...airlineRules, validate];

// ── Airport ───────────────────────────────────────────────
const airportRules = [
  body('code')
    .notEmpty().withMessage('Kode airport wajib diisi')
    .isLength({ max: 10 }).withMessage('Kode airport maksimal 10 karakter')
    .isAlphanumeric().withMessage('Kode airport hanya boleh huruf dan angka'),
  body('name')
    .notEmpty().withMessage('Nama airport wajib diisi')
    .isLength({ max: 100 }).withMessage('Nama airport maksimal 100 karakter'),
  body('city')
    .notEmpty().withMessage('Kota wajib diisi'),
  body('country')
    .notEmpty().withMessage('Negara wajib diisi'),
];

const validateAirport = [...airportRules, validate];

// ── User ──────────────────────────────────────────────────
const userRules = [
  body('name')
    .notEmpty().withMessage('Nama wajib diisi'),
  body('email')
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
];

const validateUser = [...userRules, validate];

// ── Login ─────────────────────────────────────────────────
const loginRules = [
  body('email')
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('password')
    .notEmpty().withMessage('Password wajib diisi'),
];

const validateLogin = [...loginRules, validate];

// ── Flight ────────────────────────────────────────────────
const flightRules = [
  body('airlineCode')
    .notEmpty().withMessage('Kode airline wajib diisi')
    .isAlphanumeric().withMessage('Kode airline hanya boleh huruf dan angka'),
  body('flightNumber')
    .notEmpty().withMessage('Nomor penerbangan wajib diisi'),
  body('originCode')
    .notEmpty().withMessage('Kode airport asal wajib diisi')
    .isAlphanumeric().withMessage('Kode airport hanya boleh huruf dan angka'),
  body('destinationCode')
    .notEmpty().withMessage('Kode airport tujuan wajib diisi')
    .isAlphanumeric().withMessage('Kode airport hanya boleh huruf dan angka'),
  body('departureTime')
    .notEmpty().withMessage('Waktu keberangkatan wajib diisi')
    .isISO8601().withMessage('Format tanggal departureTime tidak valid'),
  body('arrivalTime')
    .notEmpty().withMessage('Waktu kedatangan wajib diisi')
    .isISO8601().withMessage('Format tanggal arrivalTime tidak valid'),
  body('price')
    .notEmpty().withMessage('Harga wajib diisi')
    .isNumeric().withMessage('Harga harus berupa angka')
    .custom(v => v >= 0).withMessage('Harga tidak boleh negatif'),
  body('availableSeats')
    .notEmpty().withMessage('Jumlah kursi wajib diisi')
    .isInt({ min: 0 }).withMessage('Kursi harus bilangan bulat positif'),
  body('status')
    .optional()
    .isIn(['scheduled', 'delayed', 'cancelled', 'completed'])
    .withMessage('Status tidak valid'),
];

const validateFlight = [...flightRules, validate];

// ── Booking — FIX: hapus isMongoId ───────────────────────
const bookingRules = [
  body('flightId')
    .notEmpty().withMessage('Flight wajib diisi'),
  body('passengerName')
    .notEmpty().withMessage('Nama penumpang wajib diisi'),
  body('passengerAge')
    .notEmpty().withMessage('Umur penumpang wajib diisi')
    .isInt({ min: 1, max: 120 }).withMessage('Umur penumpang tidak valid'),
  body('seatNumber')
    .notEmpty().withMessage('Nomor kursi wajib diisi'),
];

const validateBooking = [...bookingRules, validate];

module.exports = {
  validateAirline,
  validateAirport,
  validateUser,
  validateLogin,
  validateFlight,
  validateBooking,
};