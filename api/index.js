const app = require('../backend/server');

module.exports = (req, res) => {
  // Normalize Vercel serverless request URL path
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  }
  if (!req.url.startsWith('/api') && !req.url.startsWith('/health')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};
