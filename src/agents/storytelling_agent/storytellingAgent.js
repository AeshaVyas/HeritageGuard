/**
 * Personalized Heritage Storytelling Agent
 * Generates personalized cultural stories using IBM Granite LLM
 */

const graniteService = require('../../../ai/granite/graniteService');

const SUPPORTED_LANGUAGES = ['English', 'Hindi', 'Gujarati'];
const SUPPORTED_INTERESTS = [
  'Architecture', 'History', 'Religion', 'Astronomy',
  'Local Culture', 'Photography', 'Sculpture', 'Family-friendly'
];
const SUPPORTED_SITES = [
  { id: 'ahmedabad-walled-city', name: 'Ahmedabad Walled City' },
  { id: 'modhera-sun-temple', name: 'Modhera Sun Temple' },
];

/**
 * Validate storytelling request
 */
function validateRequest(req) {
  const errors = [];

  if (!req.site) errors.push('Site is required');
  if (req.language && !SUPPORTED_LANGUAGES.includes(req.language)) {
    errors.push(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }
  if (req.duration && (req.duration < 5 || req.duration > 180)) {
    errors.push('Duration must be between 5 and 180 minutes');
  }

  return errors;
}

/**
 * Generate a personalized heritage story
 */
async function generatePersonalizedStory(params) {
  const {
    site,
    language = 'English',
    interests = [],
    duration = 15,
    ageGroup = 'Adult',
    style = 'Informative and engaging',
  } = params;

  const errors = validateRequest(params);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  try {
    const result = await graniteService.generateStory({
      site,
      language,
      interests,
      duration,
      ageGroup,
      style,
    });

    return {
      success: true,
      story: result.text,
      metadata: {
        site,
        language,
        interests,
        duration,
        ageGroup,
        style,
        source: result.source,
        demo: result.demo,
        demoNotice: result.demoNotice,
        generatedAt: new Date().toISOString(),
      },
      suggestedRoute: generateSuggestedRoute(site, duration, interests),
      facts: getInterestingFacts(site, interests),
    };
  } catch (err) {
    console.error('[StorytellingAgent] Error:', err.message);
    return {
      success: false,
      error: 'Story generation failed. Please try again.',
    };
  }
}

/**
 * Generate a suggested route based on site, duration, and interests
 */
function generateSuggestedRoute(site, duration, interests) {
  const routes = {
    'ahmedabad-walled-city': {
      5: ['Teen Darwaza (2 min)', 'Sidi Saiyyed Mosque Jaali view (3 min)'],
      10: ['Teen Darwaza (2 min)', 'Jama Masjid exterior (4 min)', 'Sidi Saiyyed Mosque (4 min)'],
      15: ['Teen Darwaza (3 min)', 'Jama Masjid (5 min)', 'Nearby pol walk (4 min)', 'Sidi Saiyyed Mosque (3 min)'],
      30: ['Teen Darwaza (5 min)', 'Bhadra Fort (8 min)', 'Jama Masjid (8 min)', 'Pol neighbourhood walk (7 min)', 'Sidi Saiyyed Mosque (2 min)'],
      60: ['Teen Darwaza (5 min)', 'Bhadra Fort (10 min)', 'Jama Masjid (12 min)', 'Pol neighbourhood deep walk (15 min)', 'Sidi Saiyyed Mosque (8 min)', 'Manek Chowk (10 min)'],
    },
    'modhera-sun-temple': {
      5: ['Surya Kund overview (3 min)', 'Sabha Mandap entrance (2 min)'],
      10: ['Surya Kund (5 min)', 'Sabha Mandap carvings (3 min)', 'Sanctum view (2 min)'],
      15: ['Surya Kund descent (7 min)', 'Sabha Mandap (5 min)', 'Main Sanctum approach (3 min)'],
      30: ['Surya Kund full tour (12 min)', 'Sabha Mandap detailed study (10 min)', 'Main Sanctum (5 min)', 'Site Museum (3 min)'],
      60: ['Sunrise viewing (10 min)', 'Surya Kund all tiers (15 min)', 'Sabha Mandap apsara carvings (12 min)', 'Main Sanctum (8 min)', 'Site Museum (10 min)', 'Photography session (5 min)'],
    },
  };

  const siteKey = site?.toLowerCase().includes('modhera') ? 'modhera-sun-temple' : 'ahmedabad-walled-city';
  const siteRoutes = routes[siteKey];
  const durationKey = Object.keys(siteRoutes).reduce((prev, curr) =>
    Math.abs(parseInt(curr) - duration) < Math.abs(parseInt(prev) - duration) ? curr : prev
  );

  return siteRoutes[durationKey];
}

/**
 * Get interesting facts based on site and interests
 */
function getInterestingFacts(site, interests) {
  const allFacts = {
    'modhera-sun-temple': [
      { interest: 'Astronomy', fact: 'The Modhera Sun Temple is precisely aligned with the sunrise at the equinoxes — the sun\'s rays travel through the torana gateway to illuminate the central sanctum.' },
      { interest: 'Architecture', fact: 'The entire temple complex was built without a single drop of mortar — every stone is interlocked by dry-joint construction.' },
      { interest: 'Sculpture', fact: 'The Sabha Mandap features 108 apsara (celestial dancer) carvings, each depicted in a unique pose — no two are identical.' },
      { interest: 'History', fact: 'After Mahmud of Ghazni\'s invasion in the early 11th century, the temple was never again used for worship, but it has been preserved as a monument for nearly 1000 years.' },
      { interest: 'Religion', fact: 'The number 108 is sacred in Hindu and Jain traditions. The Surya Kund has exactly 108 miniature shrines arranged around its perimeter.' },
      { interest: 'Photography', fact: 'The best photography light is at sunrise — the golden sandstone glows in the early morning sun, recreating the original solar alignment.' },
    ],
    'ahmedabad-walled-city': [
      { interest: 'Architecture', fact: 'The wooden pol houses of Ahmedabad feature jharokha windows (oriel windows) designed for privacy — women could observe the street without being seen.' },
      { interest: 'History', fact: 'Ahmedabad was the first Indian city to receive UNESCO World Heritage City status in 2017, recognising 600+ years of living heritage.' },
      { interest: 'Local Culture', fact: 'Pols are one of the world\'s earliest examples of planned community housing with shared governance, predating modern concepts by centuries.' },
      { interest: 'Religion', fact: 'Ahmedabad\'s walled city contains an extraordinary mix of mosques, Hindu temples, Jain temples, and stepwells within walking distance of each other, reflecting centuries of religious coexistence.' },
      { interest: 'Photography', fact: 'The Sidi Saiyyed Mosque\'s "Tree of Life" stone lattice window is among the most photographed heritage elements in India — best captured in morning light.' },
      { interest: 'Family-friendly', fact: 'The Heritage Walk (departing 7:30 AM daily) is Gujarat\'s oldest heritage walk and is suitable for all ages — guides share fascinating stories of the city\'s history.' },
    ],
  };

  const siteKey = site?.toLowerCase().includes('modhera') ? 'modhera-sun-temple' : 'ahmedabad-walled-city';
  const siteFacts = allFacts[siteKey] || allFacts['ahmedabad-walled-city'];

  // Filter by interests if provided
  if (interests && interests.length > 0) {
    const matching = siteFacts.filter(f =>
      interests.some(i => f.interest.toLowerCase().includes(i.toLowerCase()))
    );
    return matching.length > 0 ? matching : siteFacts.slice(0, 3);
  }

  return siteFacts.slice(0, 3);
}

/**
 * Agent status
 */
function getAgentStatus() {
  return {
    name: 'Heritage Storytelling Agent',
    id: 'storytelling-agent',
    status: 'ACTIVE',
    lastAction: 'Generated personalized heritage story',
    currentTask: 'Ready to generate personalized cultural stories',
    riskDetected: 'LOW',
    recommendation: 'Engage visitors with personalized storytelling to enhance cultural connection',
    metrics: {
      supportedLanguages: SUPPORTED_LANGUAGES.length,
      supportedInterests: SUPPORTED_INTERESTS.length,
      supportedSites: SUPPORTED_SITES.length,
    },
  };
}

module.exports = {
  generatePersonalizedStory,
  getAgentStatus,
  SUPPORTED_LANGUAGES,
  SUPPORTED_INTERESTS,
  SUPPORTED_SITES,
};
