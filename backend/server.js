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

// Ensure DB is connected for serverless function calls
let isSeeded = false;
const seedDefaultPrices = async () => {
  if (isSeeded) return;
  const Price = require('./models/Price');
  const defaults = [
    { itemName: 'BTC', currentPrice: 65000 },
    { itemName: 'ETH', currentPrice: 3400 },
    { itemName: 'AAPL', currentPrice: 220 },
    { itemName: 'TSLA', currentPrice: 210 },
    { itemName: 'NVDA', currentPrice: 125 },
  ];

  for (const item of defaults) {
    const exists = await Price.findOne({ itemName: item.itemName });
    if (!exists) {
      await Price.create(item);
    }
  }
  isSeeded = true;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    await seedDefaultPrices();
  } catch (err) {
    console.error('DB connection error in middleware:', err);
  }
  next();
});

// Routes
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/prices', require('./routes/priceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Healthcheck Route
app.get('/api/health', (req, res) => {
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
    await seedDefaultPrices();
    app.listen(PORT, () => {
      console.log(`Price Alert Backend Server running on port ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    });
  };
  startServer();
}

module.exports = app;
