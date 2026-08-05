const Alert = require('../models/Alert');
const Price = require('../models/Price');
const Notification = require('../models/Notification');

// Event subscribers for Server-Sent Events (SSE)
let sseClients = [];

const addSseClient = (res) => {
  sseClients.push(res);
};

const removeSseClient = (res) => {
  sseClients = sseClients.filter((client) => client !== res);
};

const broadcastNotification = (data) => {
  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};


// Process price updates and evaluate matching active alerts

const evaluatePriceUpdate = async (rawItemName, newPrice) => {
  const itemName = rawItemName.trim().toUpperCase();

  //  Update or create the price record
  const existingPriceDoc = await Price.findOne({ itemName });
  const previousPrice = existingPriceDoc ? existingPriceDoc.currentPrice : null;

  const priceDoc = await Price.findOneAndUpdate(
    { itemName },
    {
      itemName,
      currentPrice: newPrice,
      previousPrice,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  // Fetch active (PENDING) alerts for this item
  const activeAlerts = await Alert.find({
    itemName,
    status: 'PENDING',
  });

  const triggeredAlerts = [];
  const notificationsCreated = [];

  // Evaluate each active alert against new price
  for (const alert of activeAlerts) {
    let isTriggered = false;

    if (alert.condition === 'ABOVE' && newPrice > alert.targetPrice) {
      isTriggered = true;
    } else if (alert.condition === 'BELOW' && newPrice < alert.targetPrice) {
      isTriggered = true;
    }

    if (isTriggered) {
      // Mark alert as TRIGGERED
      alert.status = 'TRIGGERED';
      alert.triggeredAt = new Date();
      alert.triggeredPrice = newPrice;
      await alert.save();

      const message = `PRICE ALERT TRIGGERED! ${alert.itemName} price is now $${newPrice.toLocaleString()} (Threshold: ${alert.condition} $${alert.targetPrice.toLocaleString()})`;

      // Printable console notification (requirement: console log)
      console.log(`[ALERT TRIGGERED - ${new Date().toISOString()}]`);
      console.log(`Item:           ${alert.itemName}`);
      console.log(`Condition:      ${alert.condition}`);
      console.log(`Target Price:   $${alert.targetPrice}`);
      console.log(`Trigger Price:  $${newPrice}`);
      console.log(`Alert ID:       ${alert._id}`);
      console.log(`Message:        ${message}`);

      // Create persistent Notification
      const notification = await Notification.create({
        alertId: alert._id,
        itemName: alert.itemName,
        condition: alert.condition,
        targetPrice: alert.targetPrice,
        triggerPrice: newPrice,
        message,
      });

      triggeredAlerts.push(alert);
      notificationsCreated.push(notification);

      // Broadcast real-time SSE event to frontend
      broadcastNotification({
        type: 'ALERT_TRIGGERED',
        alert,
        notification,
        price: priceDoc,
      });
    }
  }

  // Also broadcast price update event
  broadcastNotification({
    type: 'PRICE_UPDATED',
    price: priceDoc,
  });

  return {
    price: priceDoc,
    activeAlertsEvaluatedCount: activeAlerts.length,
    triggeredAlerts,
    notificationsCreated,
  };
};

module.exports = {
  evaluatePriceUpdate,
  addSseClient,
  removeSseClient,
  broadcastNotification,
};
