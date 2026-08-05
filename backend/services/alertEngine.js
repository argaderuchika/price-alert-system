const Alert = require('../models/Alert');
const Price = require('../models/Price');
const Notification = require('../models/Notification');

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

const evaluatePriceUpdate = async (rawItemName, newPrice) => {
  const itemName = rawItemName.trim().toUpperCase();

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

  const activeAlerts = await Alert.find({
    itemName,
    status: 'PENDING',
  });

  const triggeredAlerts = [];
  const notificationsCreated = [];

  for (const alert of activeAlerts) {
    let isTriggered = false;

    if (alert.condition === 'ABOVE' && newPrice > alert.targetPrice) {
      isTriggered = true;
    } else if (alert.condition === 'BELOW' && newPrice < alert.targetPrice) {
      isTriggered = true;
    }

    if (isTriggered) {
      alert.status = 'TRIGGERED';
      alert.triggeredAt = new Date();
      alert.triggeredPrice = newPrice;
      await alert.save();

      const message = `PRICE ALERT TRIGGERED! ${alert.itemName} price is now $${newPrice.toLocaleString()} (Threshold: ${alert.condition} $${alert.targetPrice.toLocaleString()})`;

      console.log(`[ALERT TRIGGERED - ${new Date().toISOString()}]`);
      console.log(`Item:           ${alert.itemName}`);
      console.log(`Condition:      ${alert.condition}`);
      console.log(`Target Price:   $${alert.targetPrice}`);
      console.log(`Trigger Price:  $${newPrice}`);
      console.log(`Alert ID:       ${alert._id}`);
      console.log(`Message:        ${message}`);

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

      broadcastNotification({
        type: 'ALERT_TRIGGERED',
        alert,
        notification,
        price: priceDoc,
      });
    }
  }

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
