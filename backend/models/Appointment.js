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
  stylistName: { type: String, default: '' },
  billNumber: { type: String, default: '' },
  isAnnualMember: { type: Boolean, default: false },
  annualSessionNumber: { type: Number },
  sessionCounted: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  // GST & billing fields (56th GST Council compliant: 5% for Group 99972)
  gstRate: { type: Number, default: 5 },
  gstAmount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  taxTreatment: { type: String, default: 'Intra-State' }, // 'Intra-State' (CGST+SGST), 'Inter-State' (IGST), 'Unregistered/Exempt'
  gstRegistered: { type: Boolean, default: true },
  gstDiscount: { type: Number, default: 0 }, // legacy compatibility
  serviceDiscount: { type: Number, default: 0 },
  taxableAmount: { type: Number, default: 0 },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
