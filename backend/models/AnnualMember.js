const mongoose = require('mongoose');

const annualMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  package: { type: String, default: 'Annual Wellness Package' },
  totalSessions: { type: Number, default: 12 },
  sessionsCompleted: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('AnnualMember', annualMemberSchema);
