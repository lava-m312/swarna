const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const Appointment = require('./models/Appointment');
const Expense = require('./models/Expense');
const Attendance = require('./models/Attendance');
const Coupon = require('./models/Coupon');
const Notification = require('./models/Notification');
const Membership = require('./models/Membership');
const Branch = require('./models/Branch');
const AnnualMember = require('./models/AnnualMember');
const autoSeedDatabase = require('./seedData');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Normalize URL in case serverless environment strips /api prefix
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Middleware to ensure DB connection is ready before processing API routes
app.use(async (req, res, next) => {
  if (req.path === '/api/health') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err.message);
    res.status(503).json({
      error: 'Database connection failed.',
      message: err.message
    });
  }
});


// Helper for next auto-increment integer ID
async function getNextId(Model) {
  const last = await Model.findOne().sort({ id: -1 });
  return last ? last.id + 1 : 1;
}

// ===== REST API ROUTES =====

const BUSINESS_CONFIG = {
  name: "Swarna's Unisex Saloon & Spa",
  gstRegistered: true,
  gstin: '29AAACS1234A1Z5',
  state: 'Karnataka',
  stateCode: '29',
  address: 'Mig34 1st Floor, KKHB Colony, Adichunchanagiri Road, RMP Quarters Rd, LIG 3rd Stage, Kuvempu Nagara, Mysuru, Karnataka 570023',
  phone: '+91 98765 43210',
  serviceCategory: 'Group 99972 - Beauty and Physical Well-being Services',
  defaultGstRate: 5,
  cgstRate: 2.5,
  sgstRate: 2.5,
  igstRate: 5.0
};

// 1. Full Database Sync Endpoint (for frontend initial load)
app.get('/api/db/all', async (req, res) => {
  try {
    try { await autoSeedDatabase(); } catch(e){}
    const users = await User.find().lean();
    const services = await Service.find().lean();
    const staff = await Staff.find().lean();
    const appointments = await Appointment.find().lean();
    const expenses = await Expense.find().lean();
    const attendance = await Attendance.find().lean();
    const coupons = await Coupon.find().lean();
    const notifications = await Notification.find().lean();
    const memberships = await Membership.find().lean();
    const branches = await Branch.find().lean();
    const annualMembers = await AnnualMember.find().lean();

    res.json({
      businessConfig: BUSINESS_CONFIG,
      users,
      services,
      staff,
      appointments,
      expenses,
      attendance,
      coupons,
      notifications,
      memberships,
      branches,
      annualMembers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/business-config', (req, res) => {
  res.json(BUSINESS_CONFIG);
});

// 2. Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password, role } = req.body;
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone },
        { name: new RegExp(`^${emailOrPhone}$`, 'i') }
      ],
      password
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }
    if (user.disabled) {
      return res.status(403).json({ error: 'This account has been disabled by administrator.' });
    }
    if (role && user.role !== role) {
      return res.status(403).json({ error: `Access denied. Account is not a ${role}.` });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email already registered.' });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ error: 'Phone number already registered.' });

    const newId = await getNextId(User);
    const newUser = new User({
      id: newId,
      name,
      email,
      phone,
      password,
      role: 'customer'
    });

    await newUser.save();
    res.status(201).json({ user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. User Management
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/staff-account', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Login ID already exists.' });

    const newId = await getNextId(User);
    const newUser = new User({
      id: newId,
      name,
      email,
      phone: phone || 'N/A',
      password,
      role: role || 'receptionist'
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/password', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { newPassword } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    await User.deleteOne({ id: userId });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id/toggle-disabled', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.disabled = !user.disabled;
    await user.save();
    res.json({ message: `User ${user.disabled ? 'disabled' : 'enabled'} successfully`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Service Management
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().lean();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const newId = await getNextId(Service);
    const service = new Service({
      id: newId,
      ...req.body
    });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id/toggle', async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const service = await Service.findOne({ id: serviceId });
    if (!service) return res.status(404).json({ error: 'Service not found' });

    service.status = !service.status;
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Staff Management
app.get('/api/staff', async (req, res) => {
  try {
    const staffList = await Staff.find().lean();
    res.json(staffList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const newId = await getNextId(Staff);
    const member = new Staff({
      id: newId,
      ...req.body
    });
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/staff/:id/toggle', async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const member = await Staff.findOne({ id: staffId });
    if (!member) return res.status(404).json({ error: 'Staff member not found' });

    member.status = !member.status;
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task 3 — 90-day bookings endpoint (must be before /:id routes)
app.get('/api/appointments/recent', async (req, res) => {
  try {
    let days = parseInt(req.query.days) || 90;
    if (days > 365) days = 365;
    const statusFilter = req.query.status;

    const today = new Date().toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // date >= pastDate (covers history window) OR date >= today (future)
    // Combined: date >= pastDate already covers date >= today, so just use pastDate
    const dateQuery = { date: { $gte: pastDate } };

    let query = dateQuery;
    if (statusFilter && statusFilter !== 'all') {
      query = { ...dateQuery, status: statusFilter };
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 })
      .lean();

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const {
      staffId, date, time, userId, serviceId, amount, duration,
      couponDiscount, paymentMethod, transactionId,
      // Task 4 — walk-in & GST fields
      customerName, customerPhone, stylistName,
      gstRate, gstAmount, cgst, sgst, igst, taxTreatment, gstRegistered,
      gstDiscount, serviceDiscount, taxableAmount,
      billNumber, isAnnualMember, annualSessionNumber, sessionCounted
    } = req.body;

    const conflict = await Appointment.findOne({
      staffId: Number(staffId),
      date,
      time,
      status: { $ne: 'Cancelled' }
    });

    if (conflict) {
      return res.status(400).json({ error: 'This slot is already booked. Please choose another time.' });
    }

    const nextApptId = Math.max(1001, (await getNextId(Appointment)));
    const newAppt = new Appointment({
      id: nextApptId,
      userId: Number(userId),
      serviceId: Number(serviceId),
      staffId: Number(staffId),
      date,
      time,
      duration: duration || 30,
      amount,
      couponDiscount: couponDiscount || 0,
      paymentMethod: paymentMethod || 'UPI',
      transactionId: transactionId || '',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      // walk-in & GST fields (56th GST Council: 5% for qualifying salon services Group 99972)
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      stylistName: stylistName || '',
      gstRate: gstRate !== undefined ? Number(gstRate) : 5,
      gstAmount: gstAmount !== undefined ? Number(gstAmount) : 0,
      cgst: cgst !== undefined ? Number(cgst) : 0,
      sgst: sgst !== undefined ? Number(sgst) : 0,
      igst: igst !== undefined ? Number(igst) : 0,
      taxTreatment: taxTreatment || 'Intra-State',
      gstRegistered: gstRegistered !== undefined ? Boolean(gstRegistered) : true,
      gstDiscount: gstDiscount !== undefined ? Number(gstDiscount) : 0,
      serviceDiscount: serviceDiscount !== undefined ? Number(serviceDiscount) : 0,
      taxableAmount: taxableAmount !== undefined ? Number(taxableAmount) : 0,
      billNumber: billNumber || '',
      isAnnualMember: isAnnualMember || false,
      annualSessionNumber: annualSessionNumber !== undefined ? Number(annualSessionNumber) : undefined,
      sessionCounted: sessionCounted || false
    });

    await newAppt.save();

    // Create Notification
    const notifId = Date.now();
    const notif = new Notification({
      id: notifId,
      userId: Number(userId),
      title: 'Appointment Confirmed!',
      message: `Your appointment is confirmed for ${date} at ${time}.`,
      type: 'booking'
    });
    await notif.save();

    res.status(201).json({ appointment: newAppt, notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task 2 — PATCH with _id OR numeric id, extra fields, idempotency, Task 5 — block Completed transitions
app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const rawId = req.params.id;
    const {
      status, paymentStatus,
      gstRate, gstAmount, cgst, sgst, igst, taxTreatment, gstRegistered,
      gstDiscount, serviceDiscount, taxableAmount,
      billNumber, sessionCounted, annualSessionNumber
    } = req.body;

    // Lookup: 24-char hex → _id, otherwise numeric id
    let appt;
    if (/^[0-9a-fA-F]{24}$/.test(rawId)) {
      appt = await Appointment.findById(rawId);
    } else {
      appt = await Appointment.findOne({ id: Number(rawId) });
    }
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // Task 5 — block any change away from Completed
    if (appt.status === 'Completed' && status && status !== 'Completed') {
      return res.status(409).json({ error: 'Appointment already completed. Status cannot be changed.' });
    }

    // Idempotency: if status already matches, return current doc with 200
    if (status && appt.status === status &&
        !paymentStatus && gstRate === undefined && gstAmount === undefined &&
        cgst === undefined && sgst === undefined && igst === undefined &&
        taxTreatment === undefined && gstRegistered === undefined &&
        gstDiscount === undefined && serviceDiscount === undefined &&
        taxableAmount === undefined && billNumber === undefined &&
        sessionCounted === undefined && annualSessionNumber === undefined) {
      return res.json(appt);
    }

    // Build update object — only include fields present in body
    const update = {};
    if (status !== undefined) update.status = status;
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    if (gstRate !== undefined) update.gstRate = Number(gstRate);
    if (gstAmount !== undefined) update.gstAmount = Number(gstAmount);
    if (cgst !== undefined) update.cgst = Number(cgst);
    if (sgst !== undefined) update.sgst = Number(sgst);
    if (igst !== undefined) update.igst = Number(igst);
    if (taxTreatment !== undefined) update.taxTreatment = String(taxTreatment);
    if (gstRegistered !== undefined) update.gstRegistered = Boolean(gstRegistered);
    if (gstDiscount !== undefined) update.gstDiscount = Number(gstDiscount);
    if (serviceDiscount !== undefined) update.serviceDiscount = Number(serviceDiscount);
    if (taxableAmount !== undefined) update.taxableAmount = Number(taxableAmount);
    if (billNumber !== undefined) update.billNumber = billNumber;
    if (sessionCounted !== undefined) update.sessionCounted = sessionCounted;
    if (annualSessionNumber !== undefined) update.annualSessionNumber = Number(annualSessionNumber);

    const updated = await Appointment.findByIdAndUpdate(
      appt._id,
      { $set: update },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const apptId = Number(req.params.id);
    const result = await Appointment.deleteOne({ id: apptId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Bill/Appointment not found' });
    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6b. Annual Members
app.get('/api/annual-members', async (req, res) => {
  try {
    const members = await AnnualMember.find().lean();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/annual-members', async (req, res) => {
  try {
    const { name, phone, package: pkg, totalSessions, amount, paymentMethod } = req.body;
    const existing = await AnnualMember.findOne({ phone });
    if (existing) return res.status(400).json({ error: 'An annual membership already exists for this phone number' });

    const member = new AnnualMember({
      name,
      phone,
      package: pkg || 'Annual Wellness Package',
      totalSessions: totalSessions || 12,
      sessionsCompleted: 0,
      amount: amount || 0,
      paymentMethod: paymentMethod || 'Cash'
    });
    await member.save();

    await User.findOneAndUpdate({ phone }, { membership: 'Annual' });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/annual-members/:phone/sessions', async (req, res) => {
  try {
    const { phone } = req.params;
    const { delta } = req.body;
    const member = await AnnualMember.findOne({ phone });
    if (!member) return res.status(404).json({ error: 'Annual member not found' });

    member.sessionsCompleted = Math.max(0, (member.sessionsCompleted || 0) + (Number(delta) || 0));
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/annual-members/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    await AnnualMember.deleteOne({ phone });
    res.json({ message: 'Annual member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().lean();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { description, category, amount, date, addedBy } = req.body;
    const newId = await getNextId(Expense);

    const newExp = new Expense({
      id: newId,
      description,
      category,
      amount: Number(amount),
      date,
      addedBy: addedBy || 'Admin'
    });

    await newExp.save();
    res.status(201).json(newExp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expId = Number(req.params.id);
    await Expense.deleteOne({ id: expId });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Staff Attendance
app.get('/api/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.find().lean();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { staffId, staffName, date, type, inTime, outTime, note, markedBy } = req.body;

    const existing = await Attendance.findOne({ staffId: Number(staffId), date });
    if (existing) {
      return res.status(400).json({ error: `Attendance for ${staffName} on ${date} is already marked.` });
    }

    const newId = await getNextId(Attendance);
    const rec = new Attendance({
      id: newId,
      staffId: Number(staffId),
      staffName,
      date,
      type,
      inTime,
      outTime,
      note: note || '',
      markedBy: markedBy || 'Receptionist'
    });

    await rec.save();
    res.status(201).json(rec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Coupons
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().lean();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/apply', async (req, res) => {
  try {
    const { code, amount } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      status: true,
      startDate: { $lte: today },
      expiryDate: { $gte: today }
    });

    if (!coupon) return res.status(400).json({ error: 'Invalid or expired coupon code.' });
    if (amount < coupon.minAmount) return res.status(400).json({ error: `Minimum order amount required: ₹${coupon.minAmount}` });

    let discount = coupon.type === 'flat' ? coupon.discount : Math.round(amount * coupon.discount / 100);
    res.json({ discount, coupon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let dbError = null;
  try {
    await connectDB();
  } catch (err) {
    dbError = err.message;
  }
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    mongoStatus: isConnected ? 'connected' : 'disconnected',
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    error: dbError,
    timestamp: new Date().toISOString()
  });
});

// Start server locally; on Vercel, export app as serverless handler
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Swarna Spa Express server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('⚠️ Could not connect to MongoDB Atlas on startup:', err.message);
      app.listen(PORT, () => {
        console.log(`🚀 Swarna Spa Express server running on port ${PORT} (offline DB mode)`);
      });
    });
}

module.exports = app;
