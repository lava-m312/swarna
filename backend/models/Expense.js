const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  addedBy: { type: String, default: 'Admin' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
