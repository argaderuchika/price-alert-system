const mongoose = require('mongoose');
const { PriceMemory } = require('./memoryStore');
const { getIsMemoryMode } = require('../config/db');

const priceSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price cannot be negative'],
    },
    previousPrice: {
      type: Number,
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MongoosePrice = mongoose.model('Price', priceSchema);

module.exports = {
  findOne: (query) => getIsMemoryMode() ? PriceMemory.findOne(query) : MongoosePrice.findOne(query),
  create: (data) => getIsMemoryMode() ? PriceMemory.create(data) : MongoosePrice.create(data),
  findOneAndUpdate: (query, update, options) => getIsMemoryMode() ? PriceMemory.findOneAndUpdate(query, update, options) : MongoosePrice.findOneAndUpdate(query, update, options),
  find: (query) => getIsMemoryMode() ? PriceMemory.find(query) : MongoosePrice.find(query),
};
