const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection error in middleware:', err);
  }
  next();
});

const alertRoutes = require('./routes/alertRoutes');
const priceRoutes = require('./routes/priceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Mount routes for both /api/* and stripped /* paths to handle Vercel serverless rewrites
app.use('/api/alerts', alertRoutes);
app.use('/alerts', alertRoutes);

app.use('/api/prices', priceRoutes);
app.use('/prices', priceRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

// Healthcheck Route
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start Server locally if run directly
if (require.main === module) {
  const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Price Alert Backend Server running on port ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    });
  };
  startServer();
}

module.exports = app;
