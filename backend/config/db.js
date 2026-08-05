const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI provided. Initializing MongoMemoryServer for zero-config evaluation...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host || 'In-Memory Instance'} (${conn.connection.name})`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Error]:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Disconnected]');
    });

  } catch (error) {
    console.error(`[MongoDB Connection Failed]: ${error.message}`);
    // If standard URI failed, try falling back to memory server
    if (process.env.MONGODB_URI && !mongoServer) {
      try {
        console.log('Attempting fallback to MongoMemoryServer...');
        mongoServer = await MongoMemoryServer.create();
        const fallbackUri = mongoServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`[MongoDB Fallback Connected]: In-Memory Instance (${conn.connection.name})`);
        return;
      } catch (fallbackError) {
        console.error('[Fallback Failed]:', fallbackError.message);
      }
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
