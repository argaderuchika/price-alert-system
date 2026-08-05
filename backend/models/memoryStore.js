const crypto = require('crypto');

const memoryDB = {
  prices: [
    { _id: 'p1', itemName: 'BTC', currentPrice: 65000, previousPrice: null, lastUpdated: new Date(), createdAt: new Date() },
    { _id: 'p2', itemName: 'ETH', currentPrice: 3400, previousPrice: null, lastUpdated: new Date(), createdAt: new Date() },
    { _id: 'p3', itemName: 'AAPL', currentPrice: 220, previousPrice: null, lastUpdated: new Date(), createdAt: new Date() },
    { _id: 'p4', itemName: 'TSLA', currentPrice: 210, previousPrice: null, lastUpdated: new Date(), createdAt: new Date() },
    { _id: 'p5', itemName: 'NVDA', currentPrice: 125, previousPrice: null, lastUpdated: new Date(), createdAt: new Date() },
  ],
  alerts: [],
  notifications: [],
};

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function matchesQuery(doc, query) {
  if (!query) return true;
  for (const key of Object.keys(query)) {
    if (doc[key] !== query[key]) return false;
  }
  return true;
}

function wrapAlert(doc) {
  return {
    ...doc,
    async save() {
      const idx = memoryDB.alerts.findIndex(a => String(a._id) === String(doc._id));
      if (idx !== -1) {
        memoryDB.alerts[idx] = { ...doc, updatedAt: new Date() };
      }
      return this;
    },
    async deleteOne() {
      memoryDB.alerts = memoryDB.alerts.filter(a => String(a._id) !== String(doc._id));
      return { deletedCount: 1 };
    }
  };
}

const AlertMemory = {
  async findOne(query) {
    const found = memoryDB.alerts.find(a => matchesQuery(a, query));
    return found ? wrapAlert(found) : null;
  },
  async create(data) {
    const doc = {
      _id: generateId(),
      itemName: data.itemName,
      targetPrice: data.targetPrice,
      condition: data.condition,
      status: data.status || 'PENDING',
      triggeredAt: data.triggeredAt || null,
      triggeredPrice: data.triggeredPrice || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryDB.alerts.unshift(doc);
    return wrapAlert(doc);
  },
  find(query) {
    const filtered = memoryDB.alerts.filter(a => matchesQuery(a, query));
    return {
      sort(sortObj) {
        let sorted = [...filtered];
        if (sortObj && sortObj.createdAt === -1) {
          sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return Promise.resolve(sorted.map(wrapAlert));
      },
      then(resolve, reject) {
        return Promise.resolve(filtered.map(wrapAlert)).then(resolve, reject);
      }
    };
  },
  async findById(id) {
    const found = memoryDB.alerts.find(a => String(a._id) === String(id));
    return found ? wrapAlert(found) : null;
  }
};

const PriceMemory = {
  async findOne(query) {
    const found = memoryDB.prices.find(p => matchesQuery(p, query));
    return found ? { ...found } : null;
  },
  async create(data) {
    const doc = {
      _id: generateId(),
      itemName: data.itemName,
      currentPrice: data.currentPrice,
      previousPrice: data.previousPrice || null,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    memoryDB.prices.push(doc);
    return { ...doc };
  },
  async findOneAndUpdate(query, update, options) {
    let doc = memoryDB.prices.find(p => matchesQuery(p, query));
    if (!doc && options && options.upsert) {
      doc = {
        _id: generateId(),
        itemName: query.itemName || update.itemName,
        currentPrice: update.currentPrice,
        previousPrice: update.previousPrice || null,
        lastUpdated: new Date(),
        createdAt: new Date(),
      };
      memoryDB.prices.push(doc);
      return { ...doc };
    }
    if (doc) {
      if (update.currentPrice !== undefined) {
        doc.previousPrice = doc.currentPrice;
        doc.currentPrice = update.currentPrice;
      }
      doc.lastUpdated = new Date();
      return { ...doc };
    }
    return null;
  },
  find(query) {
    const filtered = memoryDB.prices.filter(p => matchesQuery(p, query));
    return {
      sort(sortObj) {
        let sorted = [...filtered];
        if (sortObj && sortObj.lastUpdated === -1) {
          sorted.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        }
        return Promise.resolve(sorted.map(p => ({ ...p })));
      },
      then(resolve, reject) {
        return Promise.resolve(filtered.map(p => ({ ...p }))).then(resolve, reject);
      }
    };
  }
};

const NotificationMemory = {
  find(query) {
    const filtered = memoryDB.notifications.filter(n => matchesQuery(n, query));
    return {
      sort(sortObj) {
        let sorted = [...filtered];
        if (sortObj && sortObj.createdAt === -1) {
          sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return {
          limit(n) {
            return Promise.resolve(sorted.slice(0, n).map(doc => ({ ...doc })));
          },
          then(resolve, reject) {
            return Promise.resolve(sorted.map(doc => ({ ...doc }))).then(resolve, reject);
          }
        };
      },
      then(resolve, reject) {
        return Promise.resolve(filtered.map(doc => ({ ...doc }))).then(resolve, reject);
      }
    };
  },
  async create(data) {
    const doc = {
      _id: generateId(),
      alertId: data.alertId,
      itemName: data.itemName,
      condition: data.condition,
      targetPrice: data.targetPrice,
      triggerPrice: data.triggerPrice,
      message: data.message,
      read: false,
      createdAt: new Date(),
    };
    memoryDB.notifications.unshift(doc);
    return { ...doc };
  },
  async deleteMany() {
    memoryDB.notifications = [];
    return { deletedCount: 0 };
  }
};

module.exports = {
  AlertMemory,
  PriceMemory,
  NotificationMemory,
  memoryDB,
};
