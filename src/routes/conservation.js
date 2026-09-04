const express = require('express');
const router = express.Router();
const conservationAgent = require('../agents/conservation_agent/conservationAgent');
const orchestrator = require('../agents/orchestrator/orchestrator');

// GET /api/conservation/report — get all reports
router.get('/report', (req, res) => {
  try {
    const { type } = req.query;
    const reports = conservationAgent.getAllReports(type);
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/conservation/report/latest — get latest report
router.get('/report/latest', (req, res) => {
  try {
    const report = conservationAgent.getLatestReport();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/conservation/report — generate a new report
router.post('/report', async (req, res) => {
  try {
    const { type = 'DAILY' } = req.body;
    if (!['DAILY', 'WEEKLY'].includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'type must be DAILY or WEEKLY' });
    }

    // Get data from all agents for report
    const analysisData = await orchestrator.runFullAnalysis();

    const result = await conservationAgent.generateReport(type.toUpperCase(), {
      structuralData: analysisData.structural,
      visitorData: analysisData.visitor,
      encroachmentData: analysisData.encroachment,
      alertsData: analysisData.combinedAlerts,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
