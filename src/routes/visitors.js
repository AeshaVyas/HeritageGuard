const express = require('express');
const router = express.Router();
const visitorAgent = require('../agents/visitor_agent/visitorAgent');

// GET /api/visitors — get current visitor data
router.get('/', (req, res) => {
  try {
    const data = visitorAgent.getCurrentVisitorData();
    res.json({ success: true, data, simulated: true, label: 'DEMO/SIMULATED DATA' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/visitors/hourly — hourly pattern
router.get('/hourly', (req, res) => {
  try {
    const data = visitorAgent.getHourlyPattern();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/visitors/weekly — weekly trend
router.get('/weekly', (req, res) => {
  try {
    const data = visitorAgent.getWeeklyTrend();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/visitors/analyze — analyze visitor flow for a site
router.post('/analyze', async (req, res) => {
  try {
    const { siteId } = req.body;
    if (!siteId) return res.status(400).json({ success: false, error: 'siteId is required' });

    const result = await visitorAgent.analyzeVisitorFlow(siteId);
    if (!result) return res.status(404).json({ success: false, error: 'Site not found' });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
