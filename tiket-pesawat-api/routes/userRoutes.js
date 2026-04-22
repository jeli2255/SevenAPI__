const express = require('express');
const router  = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, admin, getAllUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
