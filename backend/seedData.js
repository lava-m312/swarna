const User = require('./models/User');
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const Membership = require('./models/Membership');
const Branch = require('./models/Branch');

const initialUsers = [
  { id: 1, name: 'Swarna Admin', email: 'swarna199807', phone: '9999999999', password: 'swarna1998', role: 'admin', profileImage: '', createdAt: '2026-01-01' },
  { id: 2, name: 'Receptionist', email: 'reception@swarnaspa.com', phone: '9888888888', password: 'reception123', role: 'receptionist', profileImage: '', createdAt: '2026-01-15' }
];

const initialServices = [
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
  { id: 15, name: 'Bridal Makeup', category: 'Makeup', description: 'Dream bridal makeup for your special day.', price: 4999, discount: 0, duration: 180, gender: 'Women', image: 'bridalmakeup', status: true, rating: 0, reviews: 0, benefits: ['All-day lasting', 'Trial included'], prep: ['Book 2 weeks in advance'] }
];

const initialStaff = [
  { id: 1, name: 'Rahul Sharma', specialization: 'Hair Stylist & Grooming', experience: 8, rating: 0, reviews: 0, services: [1,2,3,4,5,6,7], status: true, workingHours: { start: '09:00', end: '19:00' }, daysOff: [0], about: 'Hair stylist specializing in modern cuts and color techniques.' },
  { id: 2, name: 'Ananya Singh', specialization: 'Hair & Beauty Expert', experience: 6, rating: 0, reviews: 0, services: [1,2,3,4,5,8,9,10,11], status: true, workingHours: { start: '10:00', end: '20:00' }, daysOff: [1], about: 'Hair and beauty expert known for transformative makeovers.' },
  { id: 3, name: 'Meera Patel', specialization: 'Skin & Makeup Artist', experience: 5, rating: 0, reviews: 0, services: [8,9,10,11,12,13,14,15], status: true, workingHours: { start: '09:00', end: '18:00' }, daysOff: [0,1], about: 'Certified makeup artist and skincare specialist.' }
];

const initialMemberships = [
  { id: 1, name: 'Silver', price: 999, duration: 12, discount: 10, color: '#c0c0c0', benefits: ['10% discount on all services', 'Priority booking', 'Birthday surprise'] },
  { id: 2, name: 'Gold', price: 1999, duration: 12, discount: 20, color: '#FFD700', benefits: ['20% discount on all services', 'Priority booking', 'Complimentary hair wash monthly', 'Birthday gift'] },
  { id: 3, name: 'Platinum', price: 2999, duration: 12, discount: 30, color: '#E5E4E2', benefits: ['30% discount on all services', 'Top priority booking', 'Exclusive members-only services', 'Dedicated stylist'] }
];

const initialBranches = [
  { id: 1, name: "Swarna's - Koramangala", address: '12, 5th Block, Koramangala, Bangalore - 560034', phone: '+91-80-4567-8901', hours: '9:00 AM - 9:00 PM', lat: 12.9352, lng: 77.6245 }
];

async function autoSeedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(initialUsers);
      console.log('✅ Seeded initial Users (Admin & Receptionist)');
    }
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(initialServices);
      console.log('✅ Seeded initial Services');
    }
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      await Staff.insertMany(initialStaff);
      console.log('✅ Seeded initial Staff');
    }
    const memCount = await Membership.countDocuments();
    if (memCount === 0) {
      await Membership.insertMany(initialMemberships);
      console.log('✅ Seeded initial Memberships');
    }
    const branchCount = await Branch.countDocuments();
    if (branchCount === 0) {
      await Branch.insertMany(initialBranches);
      console.log('✅ Seeded initial Branches');
    }
  } catch (err) {
    console.error('⚠️ Auto seed warning:', err.message);
  }
}

module.exports = autoSeedDatabase;
