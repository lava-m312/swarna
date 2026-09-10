const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, default: 12 },
  discount: { type: Number, required: true },
  color: { type: String, default: '#c0c0c0' },
  benefits: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Membership', membershipSchema);
