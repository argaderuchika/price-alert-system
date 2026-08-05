const express = require('express');
const router = express.Router();
const Price = require('../models/Price');
const { evaluatePriceUpdate } = require('../services/alertEngine');

//    Simulate a price update for an item and run alert evaluation

router.post('/simulate', async (req, res) => {
  try {
    const { itemName, newPrice } = req.body;

    if (!itemName || newPrice === undefined || newPrice === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemName and newPrice',
      });
    }

    const parsedPrice = Number(newPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'newPrice must be a valid non-negative number',
      });
    }

    const result = await evaluatePriceUpdate(itemName, parsedPrice);

    return res.status(200).json({
      success: true,
      message: `Price update processed for ${result.price.itemName}`,
      price: result.price,
      evaluatedAlertsCount: result.activeAlertsEvaluatedCount,
      triggeredAlertsCount: result.triggeredAlerts.length,
      triggeredAlerts: result.triggeredAlerts,
    });
  } catch (error) {
    console.error('Error simulating price update:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while simulating price update',
      error: error.message,
    });
  }
});

//    Get current price list of all items

router.get('/', async (req, res) => {
  try {
    const prices = await Price.find().sort({ lastUpdated: -1 });

    return res.status(200).json({
      success: true,
      count: prices.length,
      prices,
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching prices',
      error: error.message,
    });
  }
});

module.exports = router;
