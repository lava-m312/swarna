const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  code: { type: String, required: true, uppercase: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['flat', 'percentage'], default: 'percentage' },
  discount: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  startDate: { type: String, required: true },
  expiryDate: { type: String, required: true },
  status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
