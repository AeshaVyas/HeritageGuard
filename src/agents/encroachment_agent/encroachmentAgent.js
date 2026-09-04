/**
 * Encroachment Detection Agent
 * Identifies potential unauthorized construction or changes near heritage zones
 */

const { v4: uuidv4 } = require('uuid');
const graniteService = require('../../../ai/granite/graniteService');
const encroachmentData = require('../../data/encroachment_cases.json');

let cases = JSON.parse(JSON.stringify(encroachmentData));

/**
 * Simulate image analysis (computer vision prototype)
 * Returns simulated change detection result
 */
function simulateImageAnalysis(imageInfo) {
  const scenarios = [
    {
      type: 'Unauthorized Construction',
      confidenceScore: Math.round(65 + Math.random() * 20),
      riskLevel: 'MODERATE',
      description: 'AI detected new structural elements in heritage buffer zone',
      changeDetected: 'New built area approximately 80-150 sq ft',
      changeType: 'CONSTRUCTION',
    },
    {
      type: 'Vegetation Encroachment',
      confidenceScore: Math.round(75 + Math.random() * 15),
      riskLevel: 'LOW',
      description: 'Significant vegetation growth near heritage boundary wall',
      changeDetected: 'Vegetation coverage increase of 200-400%',
      changeType: 'VEGETATION',
    },
    {
      type: 'Surface Modification',
      confidenceScore: Math.round(60 + Math.random() * 25),
      riskLevel: 'MODERATE',
      description: 'Possible modification to listed heritage building facade',
      changeDetected: 'Material change detected on 30-50% of facade surface',
      changeType: 'MODIFICATION',
    },
    {
      type: 'Debris Accumulation',
      confidenceScore: Math.round(80 + Math.random() * 15),
      riskLevel: 'LOW',
      description: 'Construction debris accumulation near heritage wall',
      changeDetected: 'Debris volume estimated 5-15 cubic meters',
      changeType: 'DEBRIS',
    },
  ];

  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

/**
 * Analyze an image for potential encroachment
 */
async function analyzeImage(imageData) {
  const { site, zone, imageType } = imageData;

  // Simulate CV analysis
  const cvResult = simulateImageAnalysis(imageData);

  const encCase = {
    id: `enc-${uuidv4().substring(0, 8)}`,
    site: site || 'Unknown Site',
    zone: zone || 'Unknown Zone',
    detectedDate: new Date().toISOString().split('T')[0],
    type: cvResult.type,
    confidenceScore: cvResult.confidenceScore,
    riskLevel: cvResult.riskLevel,
    status: 'UNDER_INVESTIGATION',
    description: cvResult.description,
    changeDetected: cvResult.changeDetected,
    location: { lat: site?.includes('Modhera') ? 23.5858 : 23.0225, lng: site?.includes('Modhera') ? 72.1322 : 72.5714 },
    imageType: imageType || 'UPLOADED',
    disclaimer: 'This prototype provides AI-assisted screening and does not replace official heritage/legal inspection.',
    simulated: true,
  };

  // Get AI analysis from Granite
  const aiResult = await graniteService.analyzeEncroachment({
    site: encCase.site,
    zone: encCase.zone,
    type: encCase.type,
    confidenceScore: encCase.confidenceScore,
    description: encCase.description,
  });

  encCase.aiExplanation = aiResult.analysis;
  encCase.aiSource = aiResult.source;
  encCase.aiDemo = aiResult.demo;

  // Add to cases
  cases.push(encCase);

  return {
    success: true,
    case: encCase,
    aiAnalysis: aiResult,
    alert: {
      id: uuidv4(),
      severity: cvResult.riskLevel,
      category: 'encroachment',
      site: encCase.site,
      description: `${cvResult.type} detected near ${zone || 'heritage zone'} (Confidence: ${cvResult.confidenceScore}%)`,
      agent: 'Encroachment Detection Agent',
      time: new Date().toISOString(),
      status: 'NEW',
    },
  };
}

/**
 * Get all encroachment cases
 */
function getAllCases(filters = {}) {
  let result = [...cases];

  if (filters.site) {
    result = result.filter(c => c.site.toLowerCase().includes(filters.site.toLowerCase()));
  }
  if (filters.status) {
    result = result.filter(c => c.status === filters.status);
  }
  if (filters.riskLevel) {
    result = result.filter(c => c.riskLevel === filters.riskLevel);
  }

  return result;
}

/**
 * Update case status
 */
function updateCaseStatus(caseId, status) {
  const caseIndex = cases.findIndex(c => c.id === caseId);
  if (caseIndex === -1) return null;

  cases[caseIndex].status = status;
  cases[caseIndex].updatedAt = new Date().toISOString();
  return cases[caseIndex];
}

/**
 * Get sample comparison data for demo
 */
function getSampleComparisonData() {
  return {
    before: {
      label: 'Baseline Image (6 months ago)',
      description: 'Normal state of heritage buffer zone',
      changeScore: 0,
      note: 'Reference image — SIMULATED',
    },
    after: {
      label: 'Current Image (Today)',
      description: 'AI detected potential changes',
      changeScore: 72,
      note: 'Current state — SIMULATED AI analysis',
    },
    changesSummary: {
      totalChanges: 3,
      significantChanges: 1,
      vegetationChange: '+18%',
      buildingFootprintChange: '+120 sq ft (suspected)',
      analysisMethod: 'Simulated computer vision change detection',
    },
    disclaimer: 'This prototype provides AI-assisted screening and does not replace official heritage/legal inspection.',
  };
}

/**
 * Agent status
 */
function getAgentStatus() {
  const activeCases = cases.filter(c => c.status === 'UNDER_INVESTIGATION').length;
  const criticalCases = cases.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;

  return {
    name: 'Encroachment Detection Agent',
    id: 'encroachment-agent',
    status: 'ACTIVE',
    lastAction: `Analyzed ${cases.length} encroachment cases`,
    currentTask: 'Monitoring heritage buffer zones for unauthorized changes',
    riskDetected: criticalCases > 0 ? 'HIGH' : activeCases > 0 ? 'MODERATE' : 'LOW',
    recommendation: activeCases > 0
      ? `${activeCases} cases under investigation — on-site inspection required`
      : 'No active encroachment alerts',
    metrics: {
      totalCases: cases.length,
      activeCases,
      criticalCases,
    },
  };
}

module.exports = {
  analyzeImage,
  getAllCases,
  updateCaseStatus,
  getSampleComparisonData,
  getAgentStatus,
};
