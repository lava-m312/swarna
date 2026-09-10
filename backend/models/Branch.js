const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  hours: { type: String, default: '9:00 AM - 9:00 PM' },
  lat: { type: Number, default: 12.9352 },
  lng: { type: Number, default: 77.6245 }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
