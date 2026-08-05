const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: [true, 'Target price is required'],
      min: [0.0001, 'Target price must be greater than 0'],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: {
        values: ['ABOVE', 'BELOW'],
        message: 'Condition must be either ABOVE or BELOW',
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'TRIGGERED'],
      default: 'PENDING',
      index: true,
    },
    triggeredAt: {
      type: Date,
      default: null,
    },
    triggeredPrice: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent exact duplicate active alerts for the same item, condition, and target price
alertSchema.index({ itemName: 1, condition: 1, targetPrice: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
