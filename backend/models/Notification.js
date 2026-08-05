const mongoose = require('mongoose');
const { NotificationMemory } = require('./memoryStore');
const { getIsMemoryMode } = require('../config/db');

const notificationSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      uppercase: true,
    },
    condition: {
      type: String,
      enum: ['ABOVE', 'BELOW'],
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    triggerPrice: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseNotification = mongoose.model('Notification', notificationSchema);

module.exports = {
  find: (query) => getIsMemoryMode() ? NotificationMemory.find(query) : MongooseNotification.find(query),
  create: (data) => getIsMemoryMode() ? NotificationMemory.create(data) : MongooseNotification.create(data),
  deleteMany: (query) => getIsMemoryMode() ? NotificationMemory.deleteMany(query) : MongooseNotification.deleteMany(query),
};
