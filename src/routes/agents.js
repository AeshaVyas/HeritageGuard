const express = require('express');
const router = express.Router();
const orchestrator = require('../agents/orchestrator/orchestrator');

// GET /api/agents/status — get all agent statuses
router.get('/status', (req, res) => {
  try {
    const statuses = orchestrator.getAllAgentStatuses();
    res.json({ success: true, data: statuses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/agents/system-health — overall system health
router.get('/system-health', (req, res) => {
  try {
    const health = orchestrator.getSystemHealth();
    res.json({ success: true, data: health });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/agents/events — orchestrator event log
router.get('/events', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const events = orchestrator.getEventLog(limit);
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/agents/simulation/start — start simulation
router.post('/simulation/start', (req, res) => {
  try {
    const result = orchestrator.startSimulation();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/agents/simulation/stop — stop simulation
router.post('/simulation/stop', (req, res) => {
  try {
    const result = orchestrator.stopSimulation();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/agents/simulation/status — get simulation status
router.get('/simulation/status', (req, res) => {
  try {
    const status = orchestrator.getSimulationStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/agents/analyze — run full multi-agent analysis
router.post('/analyze', async (req, res) => {
  try {
    const result = await orchestrator.runFullAnalysis();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
