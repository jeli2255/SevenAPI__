const express = require('express');
const router  = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, admin }  = require('../middlewares/authMiddleware');
const { validateBooking } = require('../middlewares/validate');

router.route('/')
  .get(protect, admin, getAllBookings)
  .post(protect, validateBooking, createBooking);

router.route('/:id')
  .get(protect, getBookingById)            
  .put(protect, updateBooking)          
  .delete(protect, admin, deleteBooking);

module.exports = router;