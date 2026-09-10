// ===================== SWARNA SPA - DATA STORE & API CLIENT =====================

const API_BASE_URL = 'http://localhost:5000/api';

const DB = {
  users: [
    { id: 1, name: 'Swarna Admin', email: 'swarna199807', phone: '9999999999', password: 'swarna1998', role: 'admin', profileImage: '', createdAt: '2026-01-01' },
    { id: 2, name: 'Receptionist', email: 'reception@swarnaspa.com', phone: '9888888888', password: 'reception123', role: 'receptionist', profileImage: '', createdAt: '2026-01-15' },
  ],
  services: [
    { id: 1, name: 'Haircut', category: 'Hair', description: 'Professional haircut tailored to your face shape and style preference.', price: 299, discount: 0, duration: 30, gender: 'Unisex', image: 'hair', status: true, rating: 0, reviews: 0, benefits: ['Shape face perfectly', 'Fresh clean look', 'Expert advice'], prep: ['Wash hair before visit'] },
    { id: 2, name: 'Hair Styling', category: 'Hair', description: 'Creative hair styling for any occasion.', price: 499, discount: 0, duration: 45, gender: 'Women', image: 'styling', status: true, rating: 0, reviews: 0, benefits: ['Glamorous look', 'Long lasting hold'], prep: [] },
    { id: 3, name: 'Hair Wash', category: 'Hair', description: 'Deep cleansing hair wash with premium shampoo and conditioning.', price: 199, discount: 0, duration: 20, gender: 'Unisex', image: 'hairwash', status: true, rating: 0, reviews: 0, benefits: ['Clean scalp', 'Refreshing'], prep: [] },
    { id: 4, name: 'Hair Coloring', category: 'Hair', description: 'Full hair coloring with premium ammonia-free colors.', price: 1499, discount: 0, duration: 90, gender: 'Unisex', image: 'coloring', status: true, rating: 0, reviews: 0, benefits: ['Vibrant color', 'Long lasting'], prep: ['Avoid washing 24hrs before'] },
    { id: 5, name: 'Hair Spa', category: 'Hair', description: 'Nourishing hair spa with deep conditioning and scalp massage.', price: 799, discount: 0, duration: 60, gender: 'Unisex', image: 'hairspa', status: true, rating: 0, reviews: 0, benefits: ['Deep nourishment', 'Scalp health'], prep: [] },
    { id: 6, name: 'Beard Trim', category: 'Beard & Grooming', description: 'Precision beard trimming and shaping.', price: 149, discount: 0, duration: 20, gender: 'Men', image: 'beard', status: true, rating: 0, reviews: 0, benefits: ['Sharp look', 'Neat edges'], prep: [] },
    { id: 7, name: 'Clean Shave', category: 'Beard & Grooming', description: 'Traditional hot towel clean shave.', price: 199, discount: 0, duration: 25, gender: 'Men', image: 'shave', status: true, rating: 0, reviews: 0, benefits: ['Ultra-smooth skin', 'Relaxing'], prep: [] },
    { id: 8, name: 'Facial', category: 'Skin & Facial', description: 'Deep cleansing facial for glowing skin.', price: 699, discount: 0, duration: 60, gender: 'Unisex', image: 'facial', status: true, rating: 0, reviews: 0, benefits: ['Glowing skin', 'Deep hydration'], prep: ['No makeup before visit'] },
    { id: 9, name: 'Cleanup', category: 'Skin & Facial', description: 'Quick skin cleanup to refresh your skin.', price: 399, discount: 0, duration: 40, gender: 'Unisex', image: 'cleanup', status: true, rating: 0, reviews: 0, benefits: ['Fresh skin', 'Instant glow'], prep: [] },
    { id: 10, name: 'Manicure', category: 'Nails', description: 'Complete hand care: nail shaping, cuticle care, scrub, massage and polish.', price: 449, discount: 0, duration: 45, gender: 'Women', image: 'manicure', status: true, rating: 0, reviews: 0, benefits: ['Beautiful hands', 'Nail health'], prep: [] },
    { id: 11, name: 'Pedicure', category: 'Nails', description: 'Feet transformation: scrub, soak, massage and nail polish.', price: 549, discount: 0, duration: 60, gender: 'Women', image: 'pedicure', status: true, rating: 0, reviews: 0, benefits: ['Soft feet', 'Relaxing'], prep: [] },
    { id: 12, name: 'Waxing - Full Arms', category: 'Hair Removal', description: 'Smooth full arm waxing with soothing after-wax lotion.', price: 299, discount: 0, duration: 30, gender: 'Women', image: 'waxing', status: true, rating: 0, reviews: 0, benefits: ['Smooth skin', '3-4 weeks hair-free'], prep: ['Hair min 1/4 inch long'] },
    { id: 13, name: 'Threading', category: 'Hair Removal', description: 'Precise eyebrow and upper lip threading.', price: 99, discount: 0, duration: 15, gender: 'Women', image: 'threading', status: true, rating: 0, reviews: 0, benefits: ['Perfect shape', 'Clean finish'], prep: [] },
    { id: 14, name: 'Party Makeup', category: 'Makeup', description: 'Glamorous party makeup with professional products.', price: 1299, discount: 0, duration: 60, gender: 'Women', image: 'partymakeup', status: true, rating: 0, reviews: 0, benefits: ['Long-lasting', 'HD finish'], prep: ['Come with clean face'] },
    { id: 15, name: 'Bridal Makeup', category: 'Makeup', description: 'Dream bridal makeup for your special day.', price: 4999, discount: 0, duration: 180, gender: 'Women', image: 'bridalmakeup', status: true, rating: 0, reviews: 0, benefits: ['All-day lasting', 'Trial included'], prep: ['Book 2 weeks in advance'] },
  ],
  staff: [
    { id: 1, name: 'Rahul Sharma', specialization: 'Hair Stylist & Grooming', experience: 8, rating: 0, reviews: 0, services: [1,2,3,4,5,6,7], status: true, workingHours: { start: '09:00', end: '19:00' }, daysOff: [0], about: 'Hair stylist specializing in modern cuts and color techniques.' },
    { id: 2, name: 'Ananya Singh', specialization: 'Hair & Beauty Expert', experience: 6, rating: 0, reviews: 0, services: [1,2,3,4,5,8,9,10,11], status: true, workingHours: { start: '10:00', end: '20:00' }, daysOff: [1], about: 'Hair and beauty expert known for transformative makeovers.' },
    { id: 3, name: 'Meera Patel', specialization: 'Skin & Makeup Artist', experience: 5, rating: 0, reviews: 0, services: [8,9,10,11,12,13,14,15], status: true, workingHours: { start: '09:00', end: '18:00' }, daysOff: [0,1], about: 'Certified makeup artist and skincare specialist.' },
  ],
  appointments: [],
  reviews: [],
  coupons: [],
  notifications: [],
  memberships: [
    { id: 1, name: 'Silver', price: 999, duration: 12, discount: 10, color: '#c0c0c0', benefits: ['10% discount on all services', 'Priority booking', 'Birthday surprise'] },
    { id: 2, name: 'Gold', price: 1999, duration: 12, discount: 20, color: '#FFD700', benefits: ['20% discount on all services', 'Priority booking', 'Complimentary hair wash monthly', 'Birthday gift'] },
    { id: 3, name: 'Platinum', price: 2999, duration: 12, discount: 30, color: '#E5E4E2', benefits: ['30% discount on all services', 'Top priority booking', 'Exclusive members-only services', 'Dedicated stylist'] },
  ],
  branches: [
    { id: 1, name: "Swarna's - Koramangala", address: '12, 5th Block, Koramangala, Bangalore - 560034', phone: '+91-80-4567-8901', hours: '9:00 AM - 9:00 PM', lat: 12.9352, lng: 77.6245 },
  ],
  expenses: [],
  attendance: [],
  nextId: { user: 3, appointment: 1001, review: 1, coupon: 1, expense: 1, attendance: 1 },
};

function saveDB() {
  localStorage.setItem('swarnaDB', JSON.stringify(DB));
}

async function loadDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/db/all`);
    if (res.ok) {
      const data = await res.json();
      if (data.users && data.users.length) DB.users = data.users;
      if (data.services && data.services.length) DB.services = data.services;
      if (data.staff && data.staff.length) DB.staff = data.staff;
      if (data.appointments) DB.appointments = data.appointments;
      if (data.expenses) DB.expenses = data.expenses;
      if (data.attendance) DB.attendance = data.attendance;
      if (data.coupons) DB.coupons = data.coupons;
      if (data.notifications) DB.notifications = data.notifications;
      if (data.memberships && data.memberships.length) DB.memberships = data.memberships;
      if (data.branches && data.branches.length) DB.branches = data.branches;
      saveDB();
      return true;
    }
  } catch (err) {
    console.warn('⚠️ Could not connect to Express backend API, using local storage cache.');
  }

  // Fallback to localStorage if API unavailable
  const saved = localStorage.getItem('swarnaDB');
  if (saved) {
    const parsed = JSON.parse(saved);
    const adminUser = parsed.users && parsed.users.find(u => u.role === 'admin');
    if (adminUser && adminUser.email === 'admin@swarnaspa.com') {
      localStorage.removeItem('swarnaDB');
      sessionStorage.removeItem('swarna_session');
      return false;
    }
    if (!parsed.expenses) parsed.expenses = [];
    if (!parsed.attendance) parsed.attendance = [];
    Object.assign(DB, parsed);
  }
  return false;
}
loadDB();

let currentUser = null;

async function loginUser(emailOrPhone, password, requiredRole) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, password, role: requiredRole })
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      sessionStorage.setItem('swarna_session', JSON.stringify({ id: currentUser.id, role: currentUser.role }));
      return currentUser;
    } else {
      const err = await res.json();
      if (err.error) return { error: err.error };
    }
  } catch (e) {
    console.warn('API login failed, checking local cache');
  }

  // Fallback
  const user = DB.users.find(u =>
    (u.email === emailOrPhone || u.phone === emailOrPhone || u.name.toLowerCase() === emailOrPhone.toLowerCase()) &&
    u.password === password
  );
  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;
  currentUser = user;
  sessionStorage.setItem('swarna_session', JSON.stringify({ id: user.id, role: user.role }));
  return user;
}

function logoutUser() {
  currentUser = null;
  sessionStorage.removeItem('swarna_session');
  history.replaceState(null, '', window.location.pathname);
}

function restoreSession() {
  const sess = sessionStorage.getItem('swarna_session');
  if (!sess) return null;
  const { id, role } = JSON.parse(sess);
  const user = DB.users.find(u => u.id === id && u.role === role);
  if (user) { currentUser = user; }
  return user || null;
}

async function registerUser(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const respData = await res.json();
      DB.users.push(respData.user);
      currentUser = respData.user;
      sessionStorage.setItem('swarna_session', JSON.stringify({ id: currentUser.id, role: currentUser.role }));
      saveDB();
      return currentUser;
    } else {
      const errData = await res.json();
      return { error: errData.error || 'Registration failed' };
    }
  } catch (err) {
    if (DB.users.find(u => u.email === data.email)) return { error: 'Email already registered.' };
    if (DB.users.find(u => u.phone === data.phone)) return { error: 'Phone number already registered.' };
    const user = { id: DB.nextId.user++, ...data, role: 'customer', profileImage: '', membership: null, createdAt: new Date().toISOString().split('T')[0] };
    DB.users.push(user);
    saveDB();
    currentUser = user;
    return user;
  }
}

function getDiscountedPrice(service) {
  return service.discount > 0 ? Math.round(service.price * (1 - service.discount / 100)) : service.price;
}

async function applyCoupon(code, amount) {
  try {
    const res = await fetch(`${API_BASE_URL}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount })
    });
    if (res.ok) {
      return await res.json();
    } else {
      const err = await res.json();
      return { error: err.error };
    }
  } catch (e) {
    const today = new Date().toISOString().split('T')[0];
    const coupon = DB.coupons.find(c => c.code === code && c.status && c.expiryDate >= today && c.startDate <= today);
    if (!coupon) return { error: 'Invalid or expired coupon.' };
    if (amount < coupon.minAmount) return { error: 'Minimum order required: ' + coupon.minAmount };
    let disc = coupon.type === 'flat' ? coupon.discount : Math.round(amount * coupon.discount / 100);
    return { discount: disc, coupon };
  }
}

async function createAppointment(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const resp = await res.json();
      DB.appointments.push(resp.appointment);
      if (resp.notification) DB.notifications.push(resp.notification);
      saveDB();
      return resp.appointment;
    } else {
      const err = await res.json();
      return { error: err.error || 'Failed to create appointment' };
    }
  } catch (e) {
    const conflict = DB.appointments.find(a =>
      a.staffId === data.staffId && a.date === data.date && a.time === data.time && a.status !== 'Cancelled'
    );
    if (conflict) return { error: 'This slot is already booked. Please choose another time.' };
    const appt = { id: DB.nextId.appointment++, ...data, status: 'Confirmed', paymentStatus: 'Paid', createdAt: new Date().toISOString().split('T')[0] };
    DB.appointments.push(appt);
    DB.notifications.push({ id: Date.now(), userId: data.userId, title: 'Appointment Confirmed!', message: 'Your appointment is confirmed for ' + data.date + ' at ' + data.time + '.', type: 'booking', read: false, createdAt: new Date().toISOString().split('T')[0] });
    saveDB();
    return appt;
  }
}

function getTimeSlots(staffId, date) {
  const staff = DB.staff.find(s => s.id === staffId);
  if (!staff) return [];
  const d = new Date(date);
  const day = d.getDay();
  if (staff.daysOff.includes(day)) return [];
  const slots = [];
  const [startH] = staff.workingHours.start.split(':').map(Number);
  const [endH] = staff.workingHours.end.split(':').map(Number);
  for (let h = startH; h < endH; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
      const booked = DB.appointments.find(a => a.staffId === staffId && a.date === date && a.time === time && a.status !== 'Cancelled');
      slots.push({ time, available: !booked });
    }
  }
  return slots;
}

function getTotalExpenses() {
  return DB.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
}
function getTotalRevenue() {
  return DB.appointments.filter(a => a.paymentStatus === 'Paid').reduce((s, a) => s + a.amount, 0);
}
function getNetRevenue() {
  return getTotalRevenue() - getTotalExpenses();
}

async function apiAddExpense(expenseData) {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    });
    if (res.ok) {
      const newExp = await res.json();
      DB.expenses.push(newExp);
      saveDB();
      return newExp;
    }
  } catch (err) {
    console.warn('API error on add expense, adding locally');
  }
  const exp = { id: DB.nextId.expense++, ...expenseData, createdAt: new Date().toISOString().split('T')[0] };
  DB.expenses.push(exp);
  saveDB();
  return exp;
}

async function apiDeleteExpense(id) {
  try {
    await fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API delete expense failed, removing locally');
  }
  DB.expenses = DB.expenses.filter(e => e.id !== id);
  saveDB();
}

async function apiAddAttendance(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const rec = await res.json();
      DB.attendance.push(rec);
      saveDB();
      return rec;
    } else {
      const err = await res.json();
      return { error: err.error };
    }
  } catch (e) {
    console.warn('API attendance failed, using local');
  }
  const rec = { id: DB.nextId.attendance++, ...data, createdAt: new Date().toISOString().split('T')[0] };
  DB.attendance.push(rec);
  saveDB();
  return rec;
}

async function apiUpdateApptStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await res.json();
      const idx = DB.appointments.findIndex(a => a.id === id);
      if (idx !== -1) DB.appointments[idx] = updated;
      saveDB();
      return updated;
    }
  } catch (e) {
    console.warn('API update appt status failed');
  }
  const a = DB.appointments.find(x => x.id === id);
  if (a) { a.status = status; saveDB(); }
  return a;
}

async function apiToggleService(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/services/${id}/toggle`, { method: 'PUT' });
    if (res.ok) {
      const updated = await res.json();
      const idx = DB.services.findIndex(s => s.id === id);
      if (idx !== -1) DB.services[idx] = updated;
      saveDB();
      return updated;
    }
  } catch (e) {
    console.warn('API toggle service failed');
  }
  const s = DB.services.find(x => x.id === id);
  if (s) { s.status = !s.status; saveDB(); }
  return s;
}

async function apiSaveService(svcData) {
  try {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(svcData)
    });
    if (res.ok) {
      const created = await res.json();
      DB.services.push(created);
      saveDB();
      return created;
    }
  } catch (e) {
    console.warn('API save service failed');
  }
  const svc = { id: DB.services.length + 1, ...svcData };
  DB.services.push(svc);
  saveDB();
  return svc;
}

async function apiToggleStaff(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${id}/toggle`, { method: 'PUT' });
    if (res.ok) {
      const updated = await res.json();
      const idx = DB.staff.findIndex(s => s.id === id);
      if (idx !== -1) DB.staff[idx] = updated;
      saveDB();
      return updated;
    }
  } catch (e) {
    console.warn('API toggle staff failed');
  }
  const s = DB.staff.find(x => x.id === id);
  if (s) { s.status = !s.status; saveDB(); }
  return s;
}

async function apiAddStaffAccount(accData) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/staff-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accData)
    });
    if (res.ok) {
      const created = await res.json();
      DB.users.push(created);
      saveDB();
      return created;
    } else {
      const err = await res.json();
      return { error: err.error };
    }
  } catch (e) {
    console.warn('API add staff account failed');
  }
  if (DB.users.find(u => u.email === accData.email)) return { error: 'Login ID already exists' };
  const user = { id: DB.nextId.user++, ...accData, role: 'receptionist', profileImage: '', createdAt: new Date().toISOString().split('T')[0] };
  DB.users.push(user);
  saveDB();
  return user;
}

async function apiDeleteStaffAccount(uid) {
  try {
    await fetch(`${API_BASE_URL}/users/${uid}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('API delete staff account failed');
  }
  DB.users = DB.users.filter(u => u.id !== uid);
  saveDB();
}
