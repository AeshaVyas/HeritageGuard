const express = require('express');
const router = express.Router();
const multer = require('multer');
const encroachmentAgent = require('../agents/encroachment_agent/encroachmentAgent');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/encroachment — get all cases
router.get('/', (req, res) => {
  try {
    const { site, status, riskLevel } = req.query;
    const cases = encroachmentAgent.getAllCases({ site, status, riskLevel });
    res.json({ success: true, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/encroachment/sample — get sample comparison data
router.get('/sample', (req, res) => {
  try {
    const data = encroachmentAgent.getSampleComparisonData();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/encroachment/analyze — analyze an image for encroachment
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const { site, zone, imageType } = req.body;

    const result = await encroachmentAgent.analyzeImage({
      site: site || 'Unknown Site',
      zone: zone || 'Unknown Zone',
      imageType: imageType || (req.file ? 'UPLOADED' : 'SAMPLE'),
      hasFile: !!req.file,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/encroachment/:id/status — update case status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['UNDER_INVESTIGATION', 'RESOLVED', 'ESCALATED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const updated = encroachmentAgent.updateCaseStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
