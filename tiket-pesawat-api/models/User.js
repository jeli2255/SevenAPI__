const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Counter  = require('./Counter');

const userSchema = new mongoose.Schema({
  userId: {
    type:   String,
    unique: true,
  },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String },
  role:     { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, {
  timestamps: true,
});

// FIX: gunakan async tanpa next(), pisah dua middleware
userSchema.pre('save', async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = `USR-${String(counter.seq).padStart(3, '0')}`;
  }
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt    = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);