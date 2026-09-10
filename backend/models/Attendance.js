const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  staffId: { type: Number, required: true },
  staffName: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['Full Day', 'Half Day'], required: true },
  inTime: { type: String, default: '09:00' },
  outTime: { type: String, default: '19:00' },
  note: { type: String, default: '' },
  markedBy: { type: String, default: 'Receptionist' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
