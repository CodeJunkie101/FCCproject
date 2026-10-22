// Main file that starts the whole app.
//   Unit 3: Node.js + Express server, middleware, error handling.
//   Unit 4: connect to MongoDB.
// Run it with:  npm start

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const connect_db = require('./config/db');
const clean_request = require('./middleware/sanitize');
const { record } = require('./utils/activity_log');

const app = express();
const PORT = process.env.PORT || 4000;

// ----- middleware that runs for every request -----
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(clean_request); // remove any HTML tags from the body (Unit 3 security)

// write a log line for every create/update/delete request
app.use(function (req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    record(req.method + ' ' + req.path, '');
  }
  next();
});

// ----- API routes -----
const require_auth = require('./middleware/auth');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require_auth, require('./routes/dashboard'));
app.use('/api/properties', require_auth, require('./routes/properties'));
app.use('/api/tenants', require_auth, require('./routes/tenants'));
app.use('/api/leases', require_auth, require('./routes/leases'));
app.use('/api/maintenance', require_auth, require('./routes/maintenance'));

app.get('/api/health', function (req, res) {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ----- serve the frontend files (Units 1 and 2) -----
app.use(express.static(path.join(__dirname, 'public')));

// if no API route matched, send a 404
app.use('/api', function (req, res) {
  res.status(404).json({ error: 'Not found' });
});

// one place to handle all errors
app.use(function (err, req, res, next) {
  console.error('[error]', err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' });
  }
  res.status(500).json({ error: 'Server error' });
});

// ----- connect to the database, then start listening -----
connect_db()
  .then(function () {
    app.listen(PORT, function () {
      console.log('[server] EstateHub running on http://localhost:' + PORT);
    });
  })
  .catch(function (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  });
