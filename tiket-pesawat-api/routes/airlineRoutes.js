const express = require('express');
const router = express.Router();

const {
  getAllAirlines,
  getAirlineById,
  createAirline,
  updateAirline,
  deleteAirline
} = require('../controllers/airlineController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getAllAirlines)
  .post(protect, admin, createAirline);

router.route('/:id')
  .get(getAirlineById)
  .put(protect, admin, updateAirline)
  .delete(protect, admin, deleteAirline);

module.exports = router;