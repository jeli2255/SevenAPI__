const User = require('../models/User');
const { success, error } = require('../utils/responseFormatter');
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const skip     = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')       
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); 

    const pagination = {
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    };

    res.status(200).json(success('Data users berhasil diambil', users, pagination));
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json(error('User tidak ditemukan'));
    }

    res.status(200).json(success('Data user berhasil diambil', user));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID user tidak valid'));
    }
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(error('Email sudah terdaftar'));
    }

    const user = await User.create({ name, email, password, phone, role });
    const userData = {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      role:      user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json(success('User berhasil dibuat', userData));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(error('Validasi gagal', messages));
    }
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(error('User tidak ditemukan'));
    }

    if (name)  user.name  = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role)  user.role  = role;

    const updatedUser = await user.save();

    const userData = {
      _id:       updatedUser._id,
      name:      updatedUser.name,
      email:     updatedUser.email,
      phone:     updatedUser.phone,
      role:      updatedUser.role,
      createdAt: updatedUser.createdAt,
    };

    res.status(200).json(success('User berhasil diupdate', userData));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID user tidak valid'));
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json(error('Validasi gagal', messages));
    }
    next(err);
  }
};

// @desc  Delete user
// @route DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(error('User tidak ditemukan'));
    }

    await user.deleteOne();

    res.status(200).json(success('User berhasil dihapus'));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json(error('ID user tidak valid'));
    }
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };  