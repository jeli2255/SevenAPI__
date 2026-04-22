const { error } = require('../utils/responseFormatter');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  if (err.name === 'CastError') {
    return res.status(400).json(error('ID tidak valid'));
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json(error(`Nilai '${field}' sudah digunakan`));
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(error('Validasi gagal', messages));
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(error('Token tidak valid'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(error('Token sudah kadaluarsa'));
  }
  const status  = err.status  || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json(error(message));
};

module.exports = errorHandler;