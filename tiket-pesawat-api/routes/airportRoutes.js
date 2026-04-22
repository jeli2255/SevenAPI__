const express  = require('express');
const router   = express.Router();
const {
  getAllAirports,
  getAirportById,
  createAirport,
  updateAirport,
  deleteAirport,
} = require('../controllers/airportController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { validateAirport } = require('../middlewares/validate');

router.route('/')
  .get(getAllAirports)
  .post(protect, admin, validateAirport, createAirport);

router.route('/:id')
  .get(getAirportById)
  .put(protect, admin, validateAirport, updateAirport)
  .delete(protect, admin, deleteAirport);

module.exports = router;