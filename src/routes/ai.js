const express = require('express');
const router = express.Router();
const graniteService = require('../../ai/granite/graniteService');
const { retrieveContext } = require('../../ai/knowledge_base/retrievalService');

// POST /api/ai/chat — chat with HeritageGuard AI
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ success: false, error: 'Message too long (max 1000 characters)' });
    }

    // Retrieve relevant context from knowledge base
    const context = retrieveContext(message);

    // Get answer from Granite
    const result = await graniteService.answerHeritageQuestion(message, context);

    res.json({
      success: true,
      answer: result.answer,
      source: result.source,
      demo: result.demo,
      demoNotice: result.demoNotice,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI service temporarily unavailable. Please try again.' });
  }
});

// GET /api/ai/status — check AI configuration
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: graniteService.isGraniteConfigured(),
      mode: graniteService.isGraniteConfigured() ? 'IBM Granite LLM (watsonx.ai)' : 'Demo Mode',
      notice: graniteService.isGraniteConfigured() ? null : 'Demo AI Mode — IBM Granite connection not configured.',
    },
  });
});

module.exports = router;
