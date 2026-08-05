const mongoose = require('mongoose');

let isConnected = false;
let isMemoryMode = false;

const connectDB = async () => {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      isConnected = true;
      isMemoryMode = false;
      console.log('[MongoDB Connected]: Connected to Remote MongoDB Atlas');
      return;
    } catch (err) {
      console.warn('[MongoDB Connect Failed]: Falling back to in-memory JS store mode:', err.message);
    }
  }

  isMemoryMode = true;
  isConnected = true;
  console.log('[Memory DB]: Running in zero-config In-Memory JS store mode');
};

const disconnectDB = async () => {
  if (!isMemoryMode) {
    await mongoose.disconnect();
  }
  isConnected = false;
};

const getIsMemoryMode = () => isMemoryMode;

module.exports = { connectDB, disconnectDB, getIsMemoryMode };
