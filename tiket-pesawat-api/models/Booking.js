const mongoose = require('mongoose');
const Counter  = require('./Counter');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type:   String,
    unique: true,
  },
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  flightId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Flight',
    required: true,
  },
  bookingDate:   { type: Date,   default: Date.now },
  passengerName: { type: String, required: true, trim: true },
  passengerAge:  { type: Number, required: true, min: 1 },
  seatNumber:    { type: String, required: true, trim: true },
  totalPrice:    { type: Number, required: true, min: 0 },
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});
 
bookingSchema.pre('save', async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'bookingId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.bookingId = `BK-${String(counter.seq).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);