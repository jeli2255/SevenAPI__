const express = require('express');
const router  = express.Router();
const {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require('../controllers/flightController');
const { protect, admin }  = require('../middlewares/authMiddleware');
const { validateFlight }  = require('../middlewares/validate');

router.route('/')
  .get(getAllFlights)
  .post(protect, admin, validateFlight, createFlight);

router.route('/:id')
  .get(getFlightById)
  .put(protect, admin, validateFlight, updateFlight)
  .delete(protect, admin, deleteFlight);

module.exports = router;