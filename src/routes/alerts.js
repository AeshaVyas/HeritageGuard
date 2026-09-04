const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const alertsData = require('../data/alerts.json');

let alerts = JSON.parse(JSON.stringify(alertsData));

// GET /api/alerts — get all alerts
router.get('/', (req, res) => {
  try {
    const { severity, category, status, site } = req.query;
    let result = [...alerts];

    if (severity) result = result.filter(a => a.severity === severity.toUpperCase());
    if (category) result = result.filter(a => a.category === category.toLowerCase());
    if (status) result = result.filter(a => a.status === status.toUpperCase());
    if (site) result = result.filter(a => a.site.toLowerCase().includes(site.toLowerCase()));

    // Sort by time desc
    result.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, data: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/alerts — create a new alert
router.post('/', (req, res) => {
  try {
    const { severity, category, site, title, description, aiRecommendation, agent } = req.body;
    if (!severity || !category || !site || !description) {
      return res.status(400).json({ success: false, error: 'severity, category, site, and description are required' });
    }

    const alert = {
      id: `alert-${uuidv4().substring(0, 8)}`,
      severity: severity.toUpperCase(),
      category: category.toLowerCase(),
      site,
      title: title || `${category} Alert`,
      description,
      aiRecommendation: aiRecommendation || '',
      agent: agent || 'System',
      time: new Date().toISOString(),
      status: 'NEW',
      acknowledged: false,
    };

    alerts.unshift(alert);
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/alerts/:id/status — update alert status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['NEW', 'INVESTIGATING', 'RESOLVED'];
    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const alert = alerts.find(a => a.id === req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });

    alert.status = status.toUpperCase();
    alert.acknowledged = true;
    alert.updatedAt = new Date().toISOString();

    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/alerts/stats — get alert statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      total: alerts.length,
      bySeverity: {
        CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
        HIGH: alerts.filter(a => a.severity === 'HIGH').length,
        MODERATE: alerts.filter(a => a.severity === 'MODERATE').length,
        LOW: alerts.filter(a => a.severity === 'LOW').length,
      },
      byCategory: {
        structural: alerts.filter(a => a.category === 'structural').length,
        visitor: alerts.filter(a => a.category === 'visitor').length,
        encroachment: alerts.filter(a => a.category === 'encroachment').length,
        conservation: alerts.filter(a => a.category === 'conservation').length,
        environmental: alerts.filter(a => a.category === 'environmental').length,
      },
      byStatus: {
        NEW: alerts.filter(a => a.status === 'NEW').length,
        INVESTIGATING: alerts.filter(a => a.status === 'INVESTIGATING').length,
        RESOLVED: alerts.filter(a => a.status === 'RESOLVED').length,
      },
      active: alerts.filter(a => a.status !== 'RESOLVED').length,
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
