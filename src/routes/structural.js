const express = require('express');
const router = express.Router();
const structuralAgent = require('../agents/structural_agent/structuralAgent');

// GET /api/structural-health — get all sensor readings
router.get('/', (req, res) => {
  try {
    const readings = structuralAgent.getSensorReadings();
    const summary = structuralAgent.getSiteHealthSummary();
    res.json({ success: true, data: readings, summary, simulated: true, label: 'DEMO/SIMULATED DATA' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/structural-health/summary — site-level summary
router.get('/summary', (req, res) => {
  try {
    const summary = structuralAgent.getSiteHealthSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/structural-health/analyze — analyze a specific sensor
router.post('/analyze', async (req, res) => {
  try {
    const { sensorId } = req.body;
    if (!sensorId) return res.status(400).json({ success: false, error: 'sensorId is required' });

    const result = await structuralAgent.analyzeSensorReading(sensorId);
    if (!result) return res.status(404).json({ success: false, error: 'Sensor not found' });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
