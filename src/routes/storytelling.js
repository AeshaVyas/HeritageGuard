const express = require('express');
const router = express.Router();
const storytellingAgent = require('../agents/storytelling_agent/storytellingAgent');

// POST /api/storytelling/generate — generate a personalized story
router.post('/generate', async (req, res) => {
  try {
    const { site, language, interests, duration, ageGroup, style } = req.body;

    if (!site) {
      return res.status(400).json({ success: false, error: 'site is required' });
    }

    const result = await storytellingAgent.generatePersonalizedStory({
      site,
      language,
      interests: Array.isArray(interests) ? interests : [interests].filter(Boolean),
      duration: parseInt(duration) || 15,
      ageGroup,
      style,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/storytelling/metadata — get supported options
router.get('/metadata', (req, res) => {
  res.json({
    success: true,
    data: {
      languages: storytellingAgent.SUPPORTED_LANGUAGES,
      interests: storytellingAgent.SUPPORTED_INTERESTS,
      sites: storytellingAgent.SUPPORTED_SITES,
    },
  });
});

module.exports = router;
