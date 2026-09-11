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

// 1. Full Database Sync Endpoint (for frontend initial load)
app.get('/api/db/all', async (req, res) => {
  try {
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

    res.json({
      users,
      services,
      staff,
      appointments,
      expenses,
      attendance,
      coupons,
      notifications,
      memberships,
      branches
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

app.post('/api/appointments', async (req, res) => {
  try {
    const { staffId, date, time, userId, serviceId, amount, duration, couponDiscount, paymentMethod, transactionId } = req.body;

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
      paymentStatus: 'Paid'
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

app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const apptId = Number(req.params.id);
    const { status, paymentStatus } = req.body;

    const appt = await Appointment.findOne({ id: apptId });
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    if (status) appt.status = status;
    if (paymentStatus) appt.paymentStatus = paymentStatus;

    await appt.save();
    res.json(appt);
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
