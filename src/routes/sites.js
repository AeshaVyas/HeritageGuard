const express = require('express');
const router = express.Router();
const heritageSites = require('../data/heritage_sites.json');

// GET /api/sites — get all heritage sites
router.get('/', (req, res) => {
  try {
    res.json({ success: true, data: heritageSites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sites/:id — get single site
router.get('/:id', (req, res) => {
  try {
    const site = heritageSites.find(s => s.id === req.params.id);
    if (!site) return res.status(404).json({ success: false, error: 'Site not found' });
    res.json({ success: true, data: site });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
