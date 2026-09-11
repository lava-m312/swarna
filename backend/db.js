const mongoose = require('mongoose');

// Cache the connection across serverless invocations
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  // If already connected, return cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set.');
    }

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    }).then(async (m) => {
      cached.conn = m;
      console.log('✅ Connected to MongoDB Atlas successfully!');
      // Run auto-seed once connected
      try {
        const autoSeedDatabase = require('./seedData');
        await autoSeedDatabase();
      } catch (seedErr) {
        console.warn('Auto-seed note:', seedErr.message);
      }
      return m;
    }).catch(err => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
