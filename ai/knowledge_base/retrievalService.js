/**
 * Knowledge Base Retrieval Layer
 * Retrieves relevant context from structured JSON knowledge base
 * to ground IBM Granite prompts (RAG pattern)
 */

const fs = require('fs');
const path = require('path');

let knowledgeBase = null;

function loadKnowledgeBase() {
  if (knowledgeBase) return knowledgeBase;
  try {
    const kbPath = path.join(__dirname, 'heritage_knowledge.json');
    knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
    return knowledgeBase;
  } catch (err) {
    console.error('[KnowledgeBase] Failed to load:', err.message);
    return {};
  }
}

/**
 * Retrieve relevant context for a query
 * Simple keyword-based retrieval for demo purposes
 */
function retrieveContext(query) {
  const kb = loadKnowledgeBase();
  const q = (query || '').toLowerCase();
  const contextParts = [];

  // Determine which sites are relevant
  const includeAhmedabad = q.includes('ahmedabad') || q.includes('walled city') || q.includes('pol') || q.includes('jama masjid') || q.includes('bhadra');
  const includeModhera = q.includes('modhera') || q.includes('sun temple') || q.includes('surya kund') || q.includes('sabha mandap') || q.includes('solanki');
  const includeConservation = q.includes('conservation') || q.includes('risk') || q.includes('damage') || q.includes('deteriorat');
  const includeVisitor = q.includes('visit') || q.includes('tour') || q.includes('crowd') || q.includes('time') || q.includes('tip');

  if (!includeAhmedabad && !includeModhera) {
    // General query — include overview of both
    if (kb.ahmedabad_walled_city) {
      contextParts.push(`AHMEDABAD WALLED CITY: ${kb.ahmedabad_walled_city.significance}`);
      contextParts.push(`Key Facts: ${kb.ahmedabad_walled_city.keyFacts.slice(0, 3).join('; ')}`);
    }
    if (kb.modhera_sun_temple) {
      contextParts.push(`MODHERA SUN TEMPLE: ${kb.modhera_sun_temple.significance}`);
      contextParts.push(`Key Facts: ${kb.modhera_sun_temple.keyFacts.slice(0, 3).join('; ')}`);
    }
  }

  if (includeAhmedabad && kb.ahmedabad_walled_city) {
    const ahm = kb.ahmedabad_walled_city;
    contextParts.push(`AHMEDABAD WALLED CITY: ${ahm.significance}`);
    contextParts.push(`Founded: ${ahm.founded}`);
    contextParts.push(`Key Facts: ${ahm.keyFacts.join('; ')}`);
    if (ahm.architecture) {
      contextParts.push(`Architecture: ${ahm.architecture.polSystem}`);
      const buildings = Object.entries(ahm.architecture.keyBuildings || {}).map(([k, v]) => `${k}: ${v}`).join('; ');
      contextParts.push(`Key Buildings: ${buildings}`);
    }
    if (includeVisitor && ahm.visitingTips) {
      contextParts.push(`Visiting Tips: Best time: ${ahm.visitingTips.bestTime}. ${ahm.visitingTips.heritageWalk}. Must see: ${ahm.visitingTips.mustSee.join(', ')}`);
    }
    if (includeConservation) {
      contextParts.push(`Conservation Challenges: ${ahm.conservationChallenges.join('; ')}`);
    }
  }

  if (includeModhera && kb.modhera_sun_temple) {
    const mod = kb.modhera_sun_temple;
    contextParts.push(`MODHERA SUN TEMPLE: ${mod.significance}`);
    contextParts.push(`Built: ${mod.built}`);
    contextParts.push(`Key Facts: ${mod.keyFacts.join('; ')}`);
    if (mod.architecture) {
      const parts = Object.entries(mod.architecture.threeParts || {}).map(([k, v]) => `${k}: ${v}`).join('; ');
      contextParts.push(`Temple Parts: ${parts}`);
      contextParts.push(`Astronomical Alignment: ${mod.architecture.astronomicalAlignment}`);
    }
    if (mod.sculptures) {
      contextParts.push(`Sculptures: ${mod.sculptures.description}. Subjects: ${mod.sculptures.subjects.join(', ')}`);
    }
    if (includeVisitor && mod.visitingTips) {
      contextParts.push(`Visiting Tips: Best time: ${mod.visitingTips.bestTime}. Must see: ${mod.visitingTips.mustSee.join(', ')}`);
    }
    if (includeConservation) {
      contextParts.push(`Conservation Challenges: ${mod.conservationChallenges.join('; ')}`);
    }
  }

  if (includeVisitor && kb.visitor_guidelines) {
    const vg = kb.visitor_guidelines;
    contextParts.push(`General Guidelines: ${vg.general.slice(0, 4).join('; ')}`);
  }

  return contextParts.join('\n');
}

module.exports = { retrieveContext, loadKnowledgeBase };
