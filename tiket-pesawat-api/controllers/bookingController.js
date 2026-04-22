const Booking = require('../models/Booking');
const Flight  = require('../models/Flight');
const { success, error } = require('../utils/responseFormatter');

// Format response booking
const formatBooking = (booking) => ({
  bookingId:     booking.bookingId,
  status:        booking.status,
  passenger: {
    name: booking.passengerName,
    age:  booking.passengerAge,
    seat: booking.seatNumber,
  },
  flight: booking.flightId ? {
    flightId:      booking.flightId.flightId,
    flightNumber:  booking.flightId.flightNumber,
    airline: booking.flightId.airlineId ? {
      code: booking.flightId.airlineId.code,
      name: booking.flightId.airlineId.name,
    } : null,
    origin: booking.flightId.originAirportId ? {
      code: booking.flightId.originAirportId.code,
      city: booking.flightId.originAirportId.city,
    } : null,
    destination: booking.flightId.destinationAirportId ? {
      code: booking.flightId.destinationAirportId.code,
      city: booking.flightId.destinationAirportId.city,
    } : null,
    departureTime: booking.flightId.departureTime,
    arrivalTime:   booking.flightId.arrivalTime,
  } : null,
  customer: booking.userId ? {
    userId: booking.userId.userId,
    name:   booking.userId.name,
    email:  booking.userId.email,
  } : null,
  totalPrice:  booking.totalPrice,
  bookingDate: booking.bookingDate,
  createdAt:   booking.createdAt,
  updatedAt:   booking.updatedAt,
});

// @desc  Get all bookings
// @route GET /api/bookings
const getAllBookings = async (req, res, next) => {
  try {
    const { userId, status, flightId, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (userId)   filter.userId   = userId;
    if (status)   filter.status   = status;
    if (flightId) filter.flightId = flightId;

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;

    const total    = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('userId', 'userId name email phone')
      .populate({
        path:     'flightId',
        populate: [
          { path: 'airlineId',            select: 'code name' },
          { path: 'originAirportId',      select: 'code name city' },
          { path: 'destinationAirportId', select: 'code name city' },
        ],
      })
      .skip(skip)
      .limit(limitNum)
      .sort({ bookingDate: -1 });

    const pagination = {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    };

    res.status(200).json(success('Data bookings berhasil diambil', bookings.map(formatBooking), pagination));
  } catch (err) {
    next(err);
  }
};

// @desc  Get booking by ID
// @route GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id })
      .populate('userId', 'userId name email phone')
      .populate({
        path:     'flightId',
        populate: [
          { path: 'airlineId',            select: 'code name' },
          { path: 'originAirportId',      select: 'code name city' },
          { path: 'destinationAirportId', select: 'code name city' },
        ],
      });

    if (!booking) {
      return res.status(404).json(error('Booking tidak ditemukan'));
    }
 
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json(error('Akses ditolak'));
    }

    res.status(200).json(success('Data booking berhasil diambil', formatBooking(booking)));
  } catch (err) {
    next(err);
  }
};

// @desc  Create booking
// @route POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { flightId, passengerName, passengerAge, seatNumber } = req.body;
    const flight = await Flight.findOne({ flightId: flightId.toUpperCase() });
    if (!flight) {
      return res.status(404).json(error(`Flight '${flightId}' tidak ditemukan`));
    }
    const updatedFlight = await Flight.findOneAndUpdate(
      { flightId: flightId.toUpperCase(), availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1 } },
      { new: true }
    );
    if (!updatedFlight) {
      return res.status(400).json(error('Kursi penuh, tidak bisa booking'));
    }
    const seatTaken = await Booking.findOne({
      flightId:   flight._id,
      seatNumber,
      status:     { $ne: 'cancelled' },
    });
    if (seatTaken) {
      await Flight.findOneAndUpdate(
        { flightId: flightId.toUpperCase() },
        { $inc: { availableSeats: 1 } }
      );
      return res.status(400).json(error(`Kursi ${seatNumber} sudah dipesan`));
    }

    const booking = await Booking.create({
      userId:        req.user._id,
      flightId:      flight._id,
      passengerName,
      passengerAge,
      seatNumber,
      totalPrice:    flight.price,
      status:        'confirmed',
    });

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'userId name email')
      .populate({
        path:     'flightId',
        populate: [
          { path: 'airlineId',            select: 'code name' },
          { path: 'originAirportId',      select: 'code name city' },
          { path: 'destinationAirportId', select: 'code name city' },
        ],
      });

    res.status(201).json(success('Booking berhasil dibuat', formatBooking(populated)));
  } catch (err) {
    next(err);
  }
};

// @desc  Update status booking
// @route PUT /api/bookings/:id
const updateBooking = async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) {
      return res.status(404).json(error('Booking tidak ditemukan'));
    }

    if (req.user.role !== 'admin') {
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json(error('Akses ditolak'));
      }
      if (status !== 'cancelled') {
        return res.status(403).json(error('Anda hanya bisa membatalkan booking'));
      }
    }

    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await Flight.findByIdAndUpdate(booking.flightId, {
        $inc: { availableSeats: 1 }
      });
    }

    booking.status = status;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('userId', 'userId name email')
      .populate({
        path:     'flightId',
        populate: [
          { path: 'airlineId',            select: 'code name' },
          { path: 'originAirportId',      select: 'code name city' },
          { path: 'destinationAirportId', select: 'code name city' },
        ],
      });

    res.status(200).json(success('Booking berhasil diupdate', formatBooking(populated)));
  } catch (err) {
    next(err);
  }
};

// @desc  Delete booking
// @route DELETE /api/bookings/:id
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) {
      return res.status(404).json(error('Booking tidak ditemukan'));
    }

    if (booking.status !== 'cancelled') {
      await Flight.findByIdAndUpdate(booking.flightId, {
        $inc: { availableSeats: 1 }
      });
    }

    await booking.deleteOne();
    res.status(200).json(success('Booking berhasil dihapus'));
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking };