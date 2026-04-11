const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sonarrHandler    = require('./handlers/sonarr');
const radarrHandler    = require('./handlers/radarr');
const overseerrHandler = require('./handlers/overseerr');
const delugeHandler    = require('./handlers/deluge');

const PORT       = process.env.PORT || 5055;
const AUTH_TOKEN = process.env.AUTH_TOKEN || null;

// Request logger
app.use((req, _res, next) => {
  if (req.method === 'POST') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Optional token auth — set AUTH_TOKEN in .env to enable
app.use((req, res, next) => {
  if (!AUTH_TOKEN) return next();
  const token = req.headers['x-auth-token'] || req.query.token;
  if (token !== AUTH_TOKEN) {
    console.warn(`[auth] Rejected request to ${req.path} — invalid token`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Health check endpoint — used by Docker and uptime monitors
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  });
});

// Webhook endpoints
app.post('/webhook/sonarr',    (req, res) => { sonarrHandler(req.body);    res.sendStatus(200); });
app.post('/webhook/radarr',    (req, res) => { radarrHandler(req.body);    res.sendStatus(200); });
app.post('/webhook/overseerr', (req, res) => { overseerrHandler(req.body); res.sendStatus(200); });
app.post('/webhook/deluge',    (req, res) => { delugeHandler(req.body);    res.sendStatus(200); });

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`\n🎬 medianotify started`);
  console.log(`   Port:  ${PORT}`);
  console.log(`   Auth:  ${AUTH_TOKEN ? 'enabled' : 'disabled'}`);
  console.log(`   Ready to receive webhooks\n`);
});
