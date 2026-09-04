/**
 * Conservation Reporting Agent
 * Aggregates data from all agents and generates comprehensive conservation reports
 */

const graniteService = require('../../../ai/granite/graniteService');
const conservationHistory = require('../../data/conservation_history.json');

let reports = JSON.parse(JSON.stringify(conservationHistory));

/**
 * Generate a conservation report from all agent data
 */
async function generateReport(type = 'DAILY', agentData = {}) {
  const {
    structuralData,
    visitorData,
    encroachmentData,
    alertsData,
  } = agentData;

  // Compute aggregate metrics
  const ahmedabadHealth = structuralData
    ? Math.round(structuralData.filter(s => s.site?.includes('Ahmedabad')).reduce((sum, s) => sum + s.healthScore, 0) / Math.max(1, structuralData.filter(s => s.site?.includes('Ahmedabad')).length))
    : 72;

  const modheraHealth = structuralData
    ? Math.round(structuralData.filter(s => s.site?.includes('Modhera')).reduce((sum, s) => sum + s.healthScore, 0) / Math.max(1, structuralData.filter(s => s.site?.includes('Modhera')).length))
    : 63;

  const overallHealth = Math.round((ahmedabadHealth + modheraHealth) / 2);
  const activeAlerts = alertsData ? alertsData.filter(a => a.status !== 'RESOLVED').length : 4;
  const encroachmentCases = encroachmentData ? encroachmentData.filter(e => e.status === 'UNDER_INVESTIGATION').length : 2;
  const conservationPriorityScore = Math.round(100 - (overallHealth * 0.6) + (activeAlerts * 3) + (encroachmentCases * 5));

  const period = type === 'DAILY'
    ? new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : `Week of ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const issues = [
    ahmedabadHealth < 70 ? 'Ahmedabad structural health requires attention' : null,
    modheraHealth < 65 ? 'Modhera Sun Temple structural health declining — priority intervention needed' : null,
    activeAlerts > 3 ? `${activeAlerts} active alerts across both sites` : null,
    encroachmentCases > 0 ? `${encroachmentCases} encroachment cases under investigation` : null,
    'Visitor density at Modhera frequently exceeding 85% capacity',
    'Surya Kund moisture levels elevated — biological growth risk',
  ].filter(Boolean);

  // Generate AI report
  const aiResult = await graniteService.generateConservationReport({
    period,
    overallHealthScore: overallHealth,
    ahmedabadHealth,
    modheraHealth,
    activeAlerts,
    encroachmentCases,
    conservationPriorityScore,
    issues,
  });

  const report = {
    id: `report-${Date.now()}`,
    type,
    generatedDate: new Date().toISOString().split('T')[0],
    period,
    overallHealthScore: overallHealth,
    conservationPriorityScore: Math.min(100, conservationPriorityScore),
    sites: {
      ahmedabad: {
        healthScore: ahmedabadHealth,
        trend: ahmedabadHealth < 70 ? 'DECLINING' : 'STABLE',
        criticalIssues: activeAlerts,
      },
      modhera: {
        healthScore: modheraHealth,
        trend: modheraHealth < 65 ? 'DECLINING' : 'STABLE',
        criticalIssues: encroachmentCases,
      },
    },
    keyFindings: issues,
    priorityActions: [
      'Immediate structural assessment of Surya Kund stepwell',
      'Implement visitor capacity controls at Modhera Main Temple',
      'Heritage inspection of suspected encroachment in Ahmedabad',
      'Apply preventive moisture treatment at Surya Kund',
    ],
    aiGeneratedReport: aiResult.report,
    aiSource: aiResult.source,
    aiDemo: aiResult.demo,
    demoNotice: aiResult.demoNotice,
    generatedBy: `Conservation Reporting Agent + ${aiResult.source}`,
    timestamp: new Date().toISOString(),
  };

  reports.unshift(report);
  return { success: true, report };
}

/**
 * Get all reports
 */
function getAllReports(type) {
  if (type) {
    return reports.filter(r => r.type === type);
  }
  return reports;
}

/**
 * Get latest report
 */
function getLatestReport() {
  return reports[0] || null;
}

/**
 * Agent status
 */
function getAgentStatus() {
  const latestReport = getLatestReport();
  return {
    name: 'Conservation Reporting Agent',
    id: 'conservation-agent',
    status: 'ACTIVE',
    lastAction: `Generated ${latestReport?.type || 'DAILY'} conservation report`,
    currentTask: 'Aggregating data from all agents for conservation report',
    riskDetected: latestReport?.sites?.modhera?.healthScore < 65 ? 'HIGH' : 'MODERATE',
    recommendation: 'Priority intervention required at Modhera Sun Temple — Surya Kund structural assessment',
    metrics: {
      totalReports: reports.length,
      latestHealthScore: latestReport?.overallHealthScore || 70,
      priorityActions: latestReport?.priorityActions?.length || 4,
    },
  };
}

module.exports = {
  generateReport,
  getAllReports,
  getLatestReport,
  getAgentStatus,
};
