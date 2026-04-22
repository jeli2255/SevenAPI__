const User          = require('../models/User');
const generateToken = require('../utils/generateToken');
const { success, error } = require('../utils/responseFormatter');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(error('Email sudah terdaftar'));
    }

    const user = await User.create({ name, email, password, phone, role });
 
    const userData = {
      userId: user.userId,
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      phone:  user.phone,
      role:   user.role,
      token:  generateToken(user._id),
    };

    res.status(201).json(success('Registrasi berhasil', userData));
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) { 
      const userData = {
        userId: user.userId,
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        phone:  user.phone,
        role:   user.role,
        token:  generateToken(user._id),
      };

      res.status(200).json(success('Login berhasil', userData));
    } else {
      res.status(401).json(error('Email atau password salah'));
    }
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    // Ambil user yang sedang login dari req.user (di-set oleh middleware protect)
    const user = req.user;

    const userData = {
      userId: user.userId,
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      phone:  user.phone,
      role:   user.role,
      token:  generateToken(user._id),
    };

    res.status(200).json(success('Profil berhasil diambil', userData));
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
