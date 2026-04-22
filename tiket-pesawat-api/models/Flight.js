const mongoose = require('mongoose');
const Counter  = require('./Counter');

const flightSchema = new mongoose.Schema({
  flightId: {
    type:   String,
    unique: true,
  },
  airlineId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Airline',
    required: true,
  },
  flightNumber: {
    type:     String,
    required: true,
    unique:   true,
    trim:     true,
  },
  originAirportId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Airport',
    required: true,
  },
  destinationAirportId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Airport',
    required: true,
  },
  departureTime:  { type: Date,   required: true },
  arrivalTime:    { type: Date,   required: true },
  price:          { type: Number, required: true, min: 0 },
  availableSeats: { type: Number, required: true, min: 0 },
  status: {
    type:    String,
    enum:    ['scheduled', 'delayed', 'cancelled', 'completed'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});
 
flightSchema.pre('save', async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'flightId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.flightId = `FL-${String(counter.seq).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('Flight', flightSchema);