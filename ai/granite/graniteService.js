/**
 * HeritageGuard AI — IBM Granite LLM Service
 * Integrates with IBM watsonx.ai for AI-powered heritage conservation insights.
 * Falls back to realistic demo responses when credentials are not configured.
 */

const axios = require('axios');
require('dotenv').config();

const IBM_CLOUD_API_KEY = process.env.IBM_CLOUD_API_KEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;
const WATSONX_URL = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
const GRANITE_MODEL_ID = process.env.GRANITE_MODEL_ID || 'ibm/granite-13b-instruct-v2';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

let cachedIAMToken = null;
let tokenExpiry = null;

/**
 * Check if IBM Granite is configured (credentials present and not demo mode)
 */
function isGraniteConfigured() {
  return !DEMO_MODE && IBM_CLOUD_API_KEY && IBM_CLOUD_API_KEY !== 'your_ibm_cloud_api_key_here' && WATSONX_PROJECT_ID;
}

/**
 * Get IBM IAM access token
 */
async function getIAMToken() {
  if (cachedIAMToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedIAMToken;
  }
  try {
    const response = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: IBM_CLOUD_API_KEY,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    cachedIAMToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return cachedIAMToken;
  } catch (err) {
    console.error('[GraniteService] IAM token error:', err.message);
    throw new Error('Failed to obtain IBM IAM token');
  }
}

/**
 * Call IBM watsonx.ai text generation endpoint
 */
async function callGranite(prompt, maxNewTokens = 512) {
  const token = await getIAMToken();
  const url = `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`;

  const payload = {
    model_id: GRANITE_MODEL_ID,
    input: prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: maxNewTokens,
      min_new_tokens: 30,
      stop_sequences: [],
      repetition_penalty: 1.1,
    },
    project_id: WATSONX_PROJECT_ID,
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data?.results?.[0]?.generated_text || '';
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a personalized heritage story for a visitor
 */
async function generateStory({ site, language, interests, duration, ageGroup, style }) {
  if (!isGraniteConfigured()) {
    return getDemoStory({ site, language, interests, duration, ageGroup });
  }

  const interestStr = (interests || []).join(', ');
  const prompt = `You are a knowledgeable cultural guide for Gujarat's heritage sites.
Generate a personalized ${duration || '10'}-minute heritage story for a visitor.

Site: ${site}
Language: ${language || 'English'}
Age Group: ${ageGroup || 'Adult'}
Interests: ${interestStr || 'General'}
Style: ${style || 'Informative and engaging'}

Provide:
1. A captivating introduction
2. Key historical facts (verified)
3. Architectural highlights relevant to their interests
4. A suggested short route
5. One unique interesting fact

Keep response concise, engaging, and accurate. Do not invent facts.

Story:`;

  try {
    const result = await callGranite(prompt, 600);
    return { text: result, source: 'IBM Granite LLM', demo: false };
  } catch (err) {
    console.error('[GraniteService] generateStory error:', err.message);
    return getDemoStory({ site, language, interests, duration, ageGroup });
  }
}

/**
 * Analyze structural health sensor data and generate recommendations
 */
async function analyzeStructuralRisk(sensorData) {
  if (!isGraniteConfigured()) {
    return getDemoStructuralAnalysis(sensorData);
  }

  const prompt = `You are an expert heritage conservation engineer.
Analyze the following simulated sensor data from a heritage structure and provide a risk assessment.

Structure: ${sensorData.structure}
Site: ${sensorData.site}
Sensor Readings (SIMULATED DATA):
- Temperature: ${sensorData.temperature}°C
- Humidity: ${sensorData.humidity}%
- Vibration: ${sensorData.vibration} mm/s
- Crack Width: ${sensorData.crackWidth} mm
- Moisture: ${sensorData.moisture}%
- Structural Displacement: ${sensorData.displacement} mm
- Deterioration Score: ${sensorData.deteriorationScore}/100

Provide:
1. Risk Level (LOW/MODERATE/HIGH/CRITICAL)
2. Primary concerns
3. Immediate recommended actions
4. Long-term conservation recommendations
5. Estimated urgency (days/weeks/months)

Analysis:`;

  try {
    const result = await callGranite(prompt, 400);
    return { analysis: result, source: 'IBM Granite LLM', demo: false };
  } catch (err) {
    console.error('[GraniteService] analyzeStructuralRisk error:', err.message);
    return getDemoStructuralAnalysis(sensorData);
  }
}

/**
 * Generate visitor flow recommendations
 */
async function generateVisitorRecommendation(visitorData) {
  if (!isGraniteConfigured()) {
    return getDemoVisitorRecommendation(visitorData);
  }

  const prompt = `You are a heritage visitor management expert.
Analyze the following visitor flow data and provide crowd management recommendations.

Site: ${visitorData.siteName}
Current Visitors: ${visitorData.currentVisitors}
Capacity: ${visitorData.capacity}
Occupancy: ${visitorData.occupancyPercent}%
Entry Rate: ${visitorData.entryRate} visitors/hour
Exit Rate: ${visitorData.exitRate} visitors/hour

Provide:
1. Current risk assessment
2. Immediate crowd management actions
3. Visitor redirection suggestions
4. Alternative time recommendations
5. Long-term capacity management suggestions

Recommendations:`;

  try {
    const result = await callGranite(prompt, 350);
    return { recommendations: result, source: 'IBM Granite LLM', demo: false };
  } catch (err) {
    console.error('[GraniteService] generateVisitorRecommendation error:', err.message);
    return getDemoVisitorRecommendation(visitorData);
  }
}

/**
 * Analyze potential encroachment from image analysis data
 */
async function analyzeEncroachment(encData) {
  if (!isGraniteConfigured()) {
    return getDemoEncroachmentAnalysis(encData);
  }

  const prompt = `You are a heritage conservation inspector with expertise in spatial analysis.
Review the following AI-detected change data near a heritage zone.
NOTE: This is a prototype AI screening tool and does not replace official inspection.

Site: ${encData.site}
Zone: ${encData.zone}
Change Type: ${encData.type}
Confidence Score: ${encData.confidenceScore}%
Description: ${encData.description}

Provide:
1. Risk assessment
2. Possible explanations for the detected change
3. Recommended verification steps
4. Regulatory considerations
5. Urgency of on-site inspection

Analysis (remember this is AI-assisted screening only):`;

  try {
    const result = await callGranite(prompt, 350);
    return { analysis: result, source: 'IBM Granite LLM', demo: false };
  } catch (err) {
    console.error('[GraniteService] analyzeEncroachment error:', err.message);
    return getDemoEncroachmentAnalysis(encData);
  }
}

/**
 * Generate a conservation report from aggregated agent data
 */
async function generateConservationReport(reportData) {
  if (!isGraniteConfigured()) {
    return getDemoConservationReport(reportData);
  }

  const prompt = `You are a senior heritage conservation officer.
Generate a professional conservation report summary based on the following data.

Period: ${reportData.period}
Overall Health Score: ${reportData.overallHealthScore}/100
Ahmedabad Walled City Health: ${reportData.ahmedabadHealth}/100
Modhera Sun Temple Health: ${reportData.modheraHealth}/100
Active Alerts: ${reportData.activeAlerts}
Encroachment Cases: ${reportData.encroachmentCases}

Key Issues:
${(reportData.issues || []).map((i, n) => `${n + 1}. ${i}`).join('\n')}

Generate:
1. Executive Summary
2. Priority Conservation Actions
3. Visitor Management Recommendations
4. Resource Allocation Suggestions
5. 30-day Action Plan

Report:`;

  try {
    const result = await callGranite(prompt, 700);
    return { report: result, source: 'IBM Granite LLM', demo: false };
  } catch (err) {
    console.error('[GraniteService] generateConservationReport error:', err.message);
    return getDemoConservationReport(reportData);
  }
}

/**
 * Answer a heritage question using the knowledge base context
 */
async function answerHeritageQuestion(question, context) {
  if (!isGraniteConfigured()) {
    return getDemoHeritageAnswer(question, context);
  }

  const prompt = `You are HeritageGuard AI, a knowledgeable and friendly guide for Gujarat's cultural heritage.
Answer the visitor's question using the provided context. Be accurate, helpful, and engaging.
Only provide information based on the context. If the answer is not in the context, say so politely.

Context:
${context}

Question: ${question}

Answer:`;

  try {
    const result = await callGranite(prompt, 500);
    return { answer: result, source: 'IBM Granite LLM', demo: false };
  } catch (err) {
    console.error('[GraniteService] answerHeritageQuestion error:', err.message);
    return getDemoHeritageAnswer(question, context);
  }
}

// ─── Demo Response Functions ─────────────────────────────────────────────────

function getDemoStory({ site, language, interests, duration, ageGroup }) {
  const stories = {
    'modhera-sun-temple': {
      English: `🌅 **The Jewel of Solanki Architecture — Modhera Sun Temple**\n\nNearly a thousand years ago, in 1026 CE, King Bhimdev I of the Solanki dynasty commissioned a temple so extraordinary that it aligned perfectly with the sun itself. This is the Modhera Sun Temple — a monument to celestial precision and artistic mastery.\n\n**Architectural Highlights:**\nThe temple complex unfolds in three breathtaking sections: the Surya Kund stepwell with its 108 miniature shrines, the ornate Sabha Mandap assembly hall, and the main sanctum. The dry-stone construction used not a single drop of mortar — every stone locked into place by gravity and precision.\n\n**The Celestial Alignment:**\nAt the spring and autumn equinoxes, the rising sun's first rays travel through the eastern gateway, across the Sabha Mandap, and illuminate the innermost sanctum — a solar feat of engineering that would impress any modern architect.\n\n**Suggested Route (${duration || 10} minutes):**\n1. Begin at Surya Kund — descend the steps and observe the 108 shrines\n2. Cross to the Sabha Mandap and study the apsara carvings\n3. Stand at the eastern gateway at dawn for the solar alignment\n\n**Did you know?** The temple has never been used for worship since Mahmud of Ghazni's invasion, yet it stands today as one of India's greatest architectural achievements.\n\n*Note: This story was generated in Demo AI Mode. IBM Granite LLM will provide enhanced personalized stories when connected.*`,
      Hindi: `🌅 **सोलंकी स्थापत्य का रत्न — मोधेरा सूर्य मंदिर**\n\nलगभग एक हजार वर्ष पहले, 1026 ईस्वी में, सोलंकी राजवंश के राजा भीमदेव प्रथम ने एक ऐसा मंदिर बनवाया जो सूर्य के साथ पूर्णतः संरेखित है। यह है मोधेरा सूर्य मंदिर — खगोलीय सटीकता और कलात्मक श्रेष्ठता का प्रतीक।\n\n*नोट: यह कहानी डेमो AI मोड में बनाई गई है। IBM Granite LLM से जुड़ने पर और बेहतर व्यक्तिगत कहानियाँ मिलेंगी।*`,
      Gujarati: `🌅 **સોલંકી સ્થાપત્યનો રત્ન — મોઢેરા સૂર્ય મંદિર**\n\nઆશરે એક હજાર વર્ષ પૂર્વે, 1026 ઈ.સ.માં, સોલંકી વંશના રાજા ભીમદેવ પ્રથમે એક એવું મંદિર બંધાવ્યું જે સૂર્ય સાથે ચોક્કસ સંરેખિત છે. આ છે મોઢેરા સૂર્ય મંદિર — ખગોળીય ચોકસાઈ અને કલાત્મક ઉત્કૃષ્ટતાનું પ્રતીક.\n\n**સ્થાપત્ય વૈશિષ્ટ્ય:**\nમંદિર સંકુલ ત્રણ ભવ્ય ભાગોમાં વિભાજિત છે: 108 નાના મંદિરો સહિત સૂર્ય કુંડ, અલંકૃત સભા મંડપ, અને મુખ્ય ગર્ભગૃહ.\n\n*નોંધ: આ વાર્તા ડેમો AI મોડમાં બનાવવામાં આવી છે।*`
    },
    'ahmedabad-walled-city': {
      English: `🏛️ **The Living Heritage — Ahmedabad Walled City**\n\nStep into over 600 years of history as you enter Ahmedabad's Walled City — India's first UNESCO World Heritage City, inscribed in 2017. Founded in 1411 CE by Sultan Ahmed Shah I, this ancient city breathes with the stories of Mughal sultans, Jain merchants, Hindu artisans, and a thousand years of cultural exchange.\n\n**The Pol System:**\nThe genius of Ahmedabad's urban design lies in its pols — self-contained residential clusters where communities governed themselves. Each pol has a massive wooden gate that would close at night, a community well, and houses with extraordinary carved wooden facades. These jharokha windows (oriel windows) allowed women to observe street life while maintaining privacy.\n\n**Architectural Treasures:**\n• **Sidi Saiyyed Mosque** (1573): Its stone lattice windows — particularly the "Tree of Life" — are considered among the finest carvings in India\n• **Jama Masjid** (1423): 260 columns and 15 domes in perfect proportion\n• **Bhadra Fort** (1411): The original palace from which the city expanded\n\n**Suggested ${duration || 10}-Minute Route:**\n1. Enter through Teen Darwaza\n2. Visit Jama Masjid\n3. Walk through the nearest pol neighbourhood\n4. End at Sidi Saiyyed Mosque\n\n*Note: Demo AI Mode active. IBM Granite LLM provides enhanced personalized stories when configured.*`
    }
  };

  const siteKey = site?.toLowerCase().includes('modhera') ? 'modhera-sun-temple' : 'ahmedabad-walled-city';
  const langKey = language === 'Gujarati' ? 'Gujarati' : language === 'Hindi' ? 'Hindi' : 'English';
  const storyObj = stories[siteKey] || stories['ahmedabad-walled-city'];
  const text = storyObj[langKey] || storyObj['English'];

  return { text, source: 'Demo Mode', demo: true, demoNotice: 'Demo AI Mode — IBM Granite connection not configured.' };
}

function getDemoStructuralAnalysis(sensorData) {
  const riskLevel = sensorData.crackWidth > 3 ? 'HIGH' : sensorData.crackWidth > 1.5 ? 'MODERATE' : 'LOW';
  return {
    analysis: `**Structural Risk Assessment — ${sensorData.structure}**\n\n**Risk Level: ${riskLevel}**\n\n**Primary Concerns:**\n• Crack width of ${sensorData.crackWidth}mm ${sensorData.crackWidth > 3 ? 'exceeds acceptable threshold' : 'within monitoring range'}\n• Humidity at ${sensorData.humidity}% — ${sensorData.humidity > 70 ? 'elevated, increasing biological growth risk' : 'within acceptable range'}\n• Vibration at ${sensorData.vibration} mm/s — ${sensorData.vibration > 0.3 ? 'monitor for traffic-induced damage' : 'acceptable'}\n\n**Immediate Actions:**\n${sensorData.crackWidth > 3 ? '• Deploy structural engineer for visual inspection within 48 hours\n• Apply temporary crack sealant to prevent moisture ingress\n' : '• Continue regular monitoring\n'}${sensorData.humidity > 70 ? '• Apply preventive biocide treatment\n• Improve ventilation\n' : ''}\n**Long-term Recommendations:**\n• Schedule quarterly structural assessment\n• Install improved drainage to reduce moisture\n• Document changes with photographic survey\n• Consider crack injection treatment if width increases\n\n*Demo AI Mode — IBM Granite LLM will provide enhanced analysis when configured.*`,
    source: 'Demo Mode',
    demo: true,
    demoNotice: 'Demo AI Mode — IBM Granite connection not configured.'
  };
}

function getDemoVisitorRecommendation(visitorData) {
  const occ = visitorData.occupancyPercent;
  const risk = occ >= 96 ? 'CRITICAL' : occ >= 81 ? 'HIGH' : occ >= 61 ? 'MODERATE' : 'LOW';
  return {
    recommendations: `**Visitor Flow Assessment — ${visitorData.siteName}**\n\n**Current Status: ${risk} (${occ}% capacity)**\n\n**Immediate Actions:**\n${occ > 85 ? '• Implement timed entry system — issue entry tokens for 30-minute time slots\n• Station additional guides at congested zones\n• Activate digital display boards showing real-time capacity\n' : '• Continue normal operations with standard monitoring\n'}\n**Visitor Redirection:**\n${visitorData.siteName.includes('Modhera') ? '• Direct visitors from Main Temple to Surya Kund and Museum\n• Open Sabha Mandap overflow area\n' : '• Direct visitors from Jama Masjid to Bhadra Fort area\n• Suggest Sidi Saiyyed Mosque as alternative starting point\n'}\n**Best Visiting Times:**\n• Early morning (7-9 AM) — lowest crowd density\n• Late afternoon (4-6 PM) — pleasant weather and reduced crowds\n• Avoid 10 AM - 2 PM peak hours on weekends\n\n*Demo AI Mode — IBM Granite LLM will provide enhanced recommendations when configured.*`,
    source: 'Demo Mode',
    demo: true,
    demoNotice: 'Demo AI Mode — IBM Granite connection not configured.'
  };
}

function getDemoEncroachmentAnalysis(encData) {
  return {
    analysis: `**Encroachment Analysis — ${encData.zone}**\n\nAI Confidence Score: ${encData.confidenceScore}%\nDetected Change Type: ${encData.type}\n\n**Risk Assessment:**\n${encData.confidenceScore > 70 ? 'The confidence score indicates a likely real change requiring immediate on-site verification.' : 'The confidence score is moderate. On-site verification is required before any conclusion.'}\n\n**Possible Explanations:**\n• Unauthorized new construction within buffer zone\n• Permitted renovation work without heritage clearance\n• Temporary structure (scaffolding, event setup)\n• Shadow or lighting artifact in imagery\n\n**Recommended Verification Steps:**\n1. Dispatch heritage inspector for on-site visit within 5 working days\n2. Cross-reference with municipal building permit records\n3. Consult Gujarat Heritage Conservation Committee database\n4. Photograph and document current state for legal record\n\n**Regulatory Note:**\nAny construction within the heritage buffer zone requires prior approval from the Archaeological Survey of India and local heritage authority.\n\n⚠️ This prototype provides AI-assisted screening and does not replace official heritage/legal inspection.\n\n*Demo AI Mode — IBM Granite LLM will provide enhanced analysis when configured.*`,
    source: 'Demo Mode',
    demo: true,
    demoNotice: 'Demo AI Mode — IBM Granite connection not configured.'
  };
}

function getDemoConservationReport(reportData) {
  return {
    report: `# Heritage Conservation Report\n**Period:** ${reportData.period || 'Current Period'}\n\n## Executive Summary\nOverall heritage health stands at ${reportData.overallHealthScore || 70}/100. Modhera Sun Temple requires priority attention with declining structural health scores, particularly at the Surya Kund stepwell. Ahmedabad Walled City is stable but requires visitor management improvements.\n\n## Priority Conservation Actions\n1. **URGENT:** Structural assessment and emergency treatment for Surya Kund (crack width 4.2mm)\n2. **HIGH:** Visitor capacity controls at Modhera Main Temple area\n3. **HIGH:** Heritage inspection of suspected encroachment in Ahmedabad eastern buffer zone\n4. **MODERATE:** Crack injection treatment for Jama Masjid northern wall\n5. **MODERATE:** Biocide and drainage treatment for Surya Kund moisture\n\n## Visitor Management Recommendations\n• Implement timed entry system at Modhera Main Temple\n• Deploy digital capacity monitoring at both sites\n• Launch awareness campaign for off-peak visiting times\n• Station dedicated crowd management personnel at identified bottlenecks\n\n## Resource Allocation\n• Conservation team: 60% Modhera, 40% Ahmedabad\n• Priority budget: Surya Kund structural treatment\n• Training: Visitor management protocol refresher for site staff\n\n## 30-Day Action Plan\n**Week 1:** Surya Kund structural assessment + emergency sealant\n**Week 2:** Visitor management system implementation\n**Week 3:** Jama Masjid crack treatment\n**Week 4:** Encroachment site inspection + report\n\n*Conservation Priority Score: ${reportData.conservationPriorityScore || 74}/100 — Action Required*\n\n*Demo AI Mode — IBM Granite LLM will provide enhanced reports when configured.*`,
    source: 'Demo Mode',
    demo: true,
    demoNotice: 'Demo AI Mode — IBM Granite connection not configured.'
  };
}

function getDemoHeritageAnswer(question, context) {
  const q = (question || '').toLowerCase();
  let answer = '';

  if (q.includes('modhera') && q.includes('30 min')) {
    answer = `For 30 minutes at Modhera Sun Temple, I recommend this quick but memorable route:\n\n1. **Surya Kund (10 min)** — Start at the magnificent stepwell. Descend a few tiers to appreciate the 108 miniature shrines and geometric precision.\n\n2. **Sabha Mandap (10 min)** — Walk through the ornate assembly hall and look closely at the apsara carvings — 108 celestial dancers, each in a different pose.\n\n3. **Main Sanctum View (10 min)** — Stand at the eastern gateway and observe how the sanctum is aligned for solar illumination. Imagine the first rays of the equinox sunrise illuminating the Sun God's image.\n\n💡 *Pro tip: Visit at sunrise if you can — the golden light on the sandstone is breathtaking!*`;
  } else if (q.includes('ahmedabad') && (q.includes('30 min') || q.includes('see'))) {
    answer = `For a quick but impactful Ahmedabad heritage experience:\n\n1. **Teen Darwaza** (5 min) — Start at this triple gateway, the historic entry to the royal square\n2. **Jama Masjid** (10 min) — Marvel at the 260 columns and 15 domes\n3. **Sidi Saiyyed Mosque** (10 min) — The stone lattice 'Tree of Life' window is unmissable\n4. **Nearby Pol Walk** (5 min) — Wander into any nearby pol to see the carved wooden architecture\n\n💡 *Best experienced during the morning Heritage Walk (departs 7:30 AM from Swaminarayan Temple, Kalupur)*`;
  } else if (q.includes('visitor pressure') || q.includes('crowd')) {
    answer = `Based on current simulated monitoring data:\n\n**Modhera Sun Temple** is experiencing higher visitor pressure today:\n- Current: 620/700 capacity (88.6% — HIGH risk)\n- Main Temple zone is at 97.5% capacity\n\n**Ahmedabad Walled City:**\n- Current: 840/1000 capacity (84% — HIGH risk)\n\n⚠️ Both sites are currently in HIGH occupancy range. For a more comfortable experience, I recommend visiting either site before 9 AM or after 4 PM.\n\n*Note: These are simulated demo figures for demonstration purposes.*`;
  } else if (q.includes('heritage building a') || q.includes('building a')) {
    answer = `Heritage Building A (Pol House — Khadia) is currently showing MODERATE risk based on simulated sensor data:\n\n**Current Sensor Readings (SIMULATED):**\n- Crack Width: 2.4mm (approaching HIGH threshold of 3.0mm)\n- Humidity: 68% (elevated)\n- Vibration: 0.31 mm/s (MODERATE)\n- Moisture: 55% (monitoring required)\n\nThe Structural Health Agent has flagged this building for inspection. The primary concern is the combination of crack width progression and elevated moisture, which can accelerate wood decay in the traditional carved facades.\n\n*Recommended Action: Quarterly inspection and preventive maintenance.*`;
  } else if (q.includes('15 min') || q.includes('tour')) {
    answer = `Here's a perfect 15-minute heritage tour of **Modhera Sun Temple**:\n\n⏰ **Minutes 1-5: Surya Kund**\n- Arrive at the stepwell and take in the panoramic view\n- Count the 108 miniature shrines on the terraced walls\n- Notice the geometric precision — each step aligns with the sun's path\n\n⏰ **Minutes 6-10: Sabha Mandap**\n- Enter the assembly hall and look up at the intricate ceiling\n- Find the apsara carvings — 108 celestial dancers in unique poses\n- Observe the ornate doorways carved from a single sandstone block\n\n⏰ **Minutes 11-15: Main Sanctum & Exit**\n- View the sanctum from the eastern approach\n- Photograph the torana (arched gateway) with its sculptural detail\n- Visit the small museum if time permits\n\n🌟 *For a longer visit, the sound and light show in the evening brings the temple's history to life.*`;
  } else {
    answer = `Thank you for your question about Gujarat's heritage! Based on our knowledge base:\n\n${context ? context.substring(0, 400) + '...' : 'I can help you with information about the Ahmedabad Walled City and Modhera Sun Temple, including their history, architecture, conservation status, visitor tips, and cultural significance.'}\n\nFeel free to ask more specific questions about:\n• Architecture and historical facts\n• Visiting tips and best times\n• Conservation challenges\n• Cultural significance\n• Specific structures or monuments\n\n*Demo AI Mode — IBM Granite LLM will provide more detailed answers when configured.*`;
  }

  return {
    answer,
    source: 'Demo Mode',
    demo: true,
    demoNotice: 'Demo AI Mode — IBM Granite connection not configured.'
  };
}

module.exports = {
  isGraniteConfigured,
  generateStory,
  analyzeStructuralRisk,
  generateVisitorRecommendation,
  analyzeEncroachment,
  generateConservationReport,
  answerHeritageQuestion,
};
