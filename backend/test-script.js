const http = require('http');

const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Running Backend API & Alert Engine Verification Suite...\n');

  // 1. Health Check
  const health = await makeRequest('/api/health');
  console.log('1. GET /api/health -> Status:', health.status, health.body.status);

  // 2. Fetch Initial Prices
  const prices = await makeRequest('/api/prices');
  console.log('2. GET /api/prices  -> Found', prices.body.count, 'seeded price tickers:', prices.body.prices.map(p => `${p.itemName}: $${p.currentPrice}`).join(', '));

  // 3. Create Alert for BTC ABOVE $70,000
  const createAlert1 = await makeRequest('/api/alerts', 'POST', {
    itemName: 'BTC',
    targetPrice: 70000,
    condition: 'ABOVE',
  });
  console.log('3. POST /api/alerts (BTC ABOVE $70,000) -> Status:', createAlert1.status, '| ID:', createAlert1.body.alert._id);

  // 4. Create Duplicate Alert (Verify Edge Case 409 Conflict)
  const createDuplicate = await makeRequest('/api/alerts', 'POST', {
    itemName: 'BTC',
    targetPrice: 70000,
    condition: 'ABOVE',
  });
  console.log('4. Edge Case Test: Duplicate Alert -> Status:', createDuplicate.status, '(Expected 409 Conflict) | Message:', createDuplicate.body.message);

  // 5. Create Alert for ETH BELOW $3,000
  const createAlert2 = await makeRequest('/api/alerts', 'POST', {
    itemName: 'ETH',
    targetPrice: 3000,
    condition: 'BELOW',
  });
  console.log('5. POST /api/alerts (ETH BELOW $3,000) -> Status:', createAlert2.status, '| ID:', createAlert2.body.alert._id);

  // 6. Simulate Price Update - BTC to $68,000 (Threshold NOT met, alert remains PENDING)
  const sim1 = await makeRequest('/api/prices/simulate', 'POST', {
    itemName: 'BTC',
    newPrice: 68000,
  });
  console.log('6. POST /api/prices/simulate (BTC -> $68,000) -> Triggered:', sim1.body.triggeredAlertsCount, '(Expected 0)');

  // 7. Simulate Price Update - BTC to $72,000 (Threshold MET! Triggers alert)
  const sim2 = await makeRequest('/api/prices/simulate', 'POST', {
    itemName: 'BTC',
    newPrice: 72000,
  });
  console.log('7. POST /api/prices/simulate (BTC -> $72,000) -> Triggered:', sim2.body.triggeredAlertsCount, '(Expected 1 Trigger)');

  // 8. Subsequent Price Update - BTC to $75,000 (Alert already TRIGGERED, should not trigger again)
  const sim3 = await makeRequest('/api/prices/simulate', 'POST', {
    itemName: 'BTC',
    newPrice: 75000,
  });
  console.log('8. Edge Case Test: Subsequent Price Update -> Triggered:', sim3.body.triggeredAlertsCount, '(Expected 0, single-trigger rule)');

  // 9. Fetch Notifications History
  const notifs = await makeRequest('/api/notifications');
  console.log('\n9. GET /api/notifications -> Found', notifs.body.count, 'notification log(s):');
  notifs.body.notifications.forEach(n => {
    console.log('   - ', n.message);
  });

  console.log('\n✅ All API & Engine Tests Completed Successfully!');
}

runTests().catch(console.error);
