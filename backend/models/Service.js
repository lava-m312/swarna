const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  duration: { type: Number, default: 30 },
  gender: { type: String, default: 'Unisex' },
  image: { type: String, default: 'hair' },
  status: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  benefits: [{ type: String }],
  prep: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
