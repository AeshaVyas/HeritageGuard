/**
 * HeritageGuard AI — Backend Server
 * Agentic AI Platform for Smart Heritage Conservation & Tourism
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Not allowed'));
    }
  },
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Logging & Parsing ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HeritageGuard AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/sites', require('./routes/sites'));
app.use('/api/structural-health', require('./routes/structural'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/storytelling', require('./routes/storytelling'));
app.use('/api/encroachment', require('./routes/encroachment'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/conservation', require('./routes/conservation'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/agents', require('./routes/agents'));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║         HeritageGuard AI — Backend Server         ║
║   Agentic AI for Heritage Conservation & Tourism  ║
╠═══════════════════════════════════════════════════╣
║  Server:  http://localhost:${PORT}                    ║
║  Health:  http://localhost:${PORT}/health             ║
║  API:     http://localhost:${PORT}/api                ║
╚═══════════════════════════════════════════════════╝
  `);
  console.log(`[AI Mode] ${require('../ai/granite/graniteService').isGraniteConfigured() ? '\u2705 IBM Granite LLM (watsonx.ai)' : '\u26a0\ufe0f  Demo Mode (no IBM credentials)'}`);
});

module.exports = app;
