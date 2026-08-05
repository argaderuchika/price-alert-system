const mongoose = require('mongoose');

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

module.exports = mongoose.model('Notification', notificationSchema);
