const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Price = require('../models/Price');


router.post('/', async (req, res) => {
  try {
    const { itemName, targetPrice, condition } = req.body;

    // Validation for Required fields
    if (!itemName || targetPrice === undefined || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemName, targetPrice, and condition (ABOVE or BELOW)',
      });
    }

    const trimmedItemName = String(itemName).trim().toUpperCase();
    const parsedTargetPrice = Number(targetPrice);
    const upperCondition = String(condition).trim().toUpperCase();

    // Validation for Item Name non-empty
    if (!trimmedItemName) {
      return res.status(400).json({
        success: false,
        message: 'Item name cannot be empty',
      });
    }

    // Validation for Target Price must be valid number > 0
    if (isNaN(parsedTargetPrice) || parsedTargetPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target price must be a positive number greater than 0',
      });
    }

    // Validation for Valid condition
    if (!['ABOVE', 'BELOW'].includes(upperCondition)) {
      return res.status(400).json({
        success: false,
        message: 'Condition must be either ABOVE or BELOW',
      });
    }

    // Edge Case - Duplicate Alert Prevention
    const existingDuplicate = await Alert.findOne({
      itemName: trimmedItemName,
      targetPrice: parsedTargetPrice,
      condition: upperCondition,
      status: 'PENDING',
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        message: `An active alert already exists for ${trimmedItemName} ${upperCondition} $${parsedTargetPrice}`,
        alert: existingDuplicate,
      });
    }

    // Save alert
    const alert = await Alert.create({
      itemName: trimmedItemName,
      targetPrice: parsedTargetPrice,
      condition: upperCondition,
      status: 'PENDING',
    });

    // Check if item has a current price already set and evaluate right away if threshold met
    const currentPriceDoc = await Price.findOne({ itemName: trimmedItemName });
    let immediateTriggerNotice = null;

    if (currentPriceDoc) {
      const currentPrice = currentPriceDoc.currentPrice;
      const isMet =
        (upperCondition === 'ABOVE' && currentPrice > parsedTargetPrice) ||
        (upperCondition === 'BELOW' && currentPrice < parsedTargetPrice);

      if (isMet) {
        immediateTriggerNotice = `Note: Current market price ($${currentPrice}) already satisfies this threshold!`;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Price alert created successfully',
      alert,
      notice: immediateTriggerNotice,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating price alert',
      error: error.message,
    });
  }
});


router.get('/', async (req, res) => {
  try {
    const { status, itemName } = req.query;
    const filter = {};

    if (status && ['PENDING', 'TRIGGERED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    if (itemName) {
      filter.itemName = itemName.trim().toUpperCase();
    }

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching alerts',
      error: error.message,
    });
  }
});


// Remove/delete a price alert

router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found',
      });
    }

    await alert.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Price alert removed successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting alert',
      error: error.message,
    });
  }
});

// Reactivate a triggered alert back to PENDING status

router.post('/:id/reset', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found',
      });
    }

    alert.status = 'PENDING';
    alert.triggeredAt = null;
    alert.triggeredPrice = null;
    await alert.save();

    return res.status(200).json({
      success: true,
      message: 'Price alert reactivated',
      alert,
    });
  } catch (error) {
    console.error('Error resetting alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting alert',
      error: error.message,
    });
  }
});

module.exports = router;
