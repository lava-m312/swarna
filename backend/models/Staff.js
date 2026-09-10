const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  services: [{ type: Number }],
  status: { type: Boolean, default: true },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '19:00' }
  },
  daysOff: [{ type: Number }],
  about: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
