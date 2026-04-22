const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
  code:    { type: String, required: true, unique: true, uppercase: true, trim: true },
  name:    { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  logoUrl: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Airline', airlineSchema);