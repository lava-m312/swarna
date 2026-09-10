const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  serviceId: { type: Number, required: true },
  staffId: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 30 },
  amount: { type: Number, required: true },
  couponDiscount: { type: Number, default: 0 },
  status: { type: String, enum: ['Confirmed', 'Pending', 'In Progress', 'Completed', 'Cancelled', 'No Show'], default: 'Confirmed' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Refunded'], default: 'Paid' },
  paymentMethod: { type: String, default: 'UPI' },
  transactionId: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
