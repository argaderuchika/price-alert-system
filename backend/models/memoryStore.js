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
      const idx = memoryDB.alerts.findIndex(a => String(a._id) === String(this._id));
      if (idx !== -1) {
        memoryDB.alerts[idx] = {
          ...memoryDB.alerts[idx],
          status: this.status,
          triggeredAt: this.triggeredAt,
          triggeredPrice: this.triggeredPrice,
          updatedAt: new Date(),
        };
      }
      return this;
    },
    async deleteOne() {
      memoryDB.alerts = memoryDB.alerts.filter(a => String(a._id) !== String(this._id));
      return { deletedCount: 1 };
    }
  };
}

function createMockQuery(initialList, transformFn = doc => ({ ...doc })) {
  let list = [...initialList];

  const queryObj = {
    sort(sortObj) {
      if (sortObj) {
        const key = Object.keys(sortObj)[0];
        const dir = sortObj[key];
        list.sort((a, b) => {
          let valA = a[key] instanceof Date ? a[key].getTime() : a[key];
          let valB = b[key] instanceof Date ? b[key].getTime() : b[key];
          if (valA < valB) return dir === -1 ? 1 : -1;
          if (valA > valB) return dir === -1 ? -1 : 1;
          return 0;
        });
      }
      return queryObj;
    },
    limit(n) {
      list = list.slice(0, n);
      return queryObj;
    },
    then(resolve, reject) {
      return Promise.resolve(list.map(transformFn)).then(resolve, reject);
    }
  };

  return queryObj;
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
    return createMockQuery(filtered, wrapAlert);
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
    return createMockQuery(filtered);
  }
};

const NotificationMemory = {
  find(query) {
    const filtered = memoryDB.notifications.filter(n => matchesQuery(n, query));
    return createMockQuery(filtered);
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
