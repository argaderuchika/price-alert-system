const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { addSseClient, removeSseClient } = require('../services/alertEngine');

// Get notification history

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: error.message,
    });
  }
});

//    Server-Sent Events (SSE) endpoint for real-time notification pushes

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial handshake ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Stream Active' })}\n\n`);

  addSseClient(res);

  req.on('close', () => {
    removeSseClient(res);
  });
});

//   Clear notification history

router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({});
    return res.status(200).json({
      success: true,
      message: 'Notification history cleared',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error clearing notifications',
      error: error.message,
    });
  }
});

module.exports = router;
