/**
 * Visitor Flow Management Agent
 * Monitors visitor density and recommends crowd management actions
 */

const { v4: uuidv4 } = require('uuid');
const graniteService = require('../../../ai/granite/graniteService');
const visitorData = require('../../data/visitor_data.json');

let currentVisitorData = JSON.parse(JSON.stringify(visitorData));

/**
 * Classify visitor occupancy risk
 */
function classifyOccupancyRisk(occupancyPercent) {
  if (occupancyPercent >= 96) return 'CRITICAL';
  if (occupancyPercent >= 81) return 'HIGH';
  if (occupancyPercent >= 61) return 'MODERATE';
  return 'LOW';
}

/**
 * Get current visitor data for all sites
 */
function getCurrentVisitorData() {
  return currentVisitorData.sites.map(site => ({
    ...site,
    riskLevel: classifyOccupancyRisk(site.occupancyPercent),
    timestamp: new Date().toISOString(),
    simulated: true,
  }));
}

/**
 * Apply simulation drift to visitor data
 */
function applySimulationDrift() {
  const hour = new Date().getHours();
  // Simulate time-of-day patterns
  const hourFactor = getHourFactor(hour);

  currentVisitorData.sites = currentVisitorData.sites.map(site => {
    const baseVisitors = Math.round(site.capacity * 0.5 * hourFactor);
    const variance = Math.round((Math.random() - 0.45) * 30);
    const newVisitors = Math.max(0, Math.min(site.capacity, baseVisitors + variance));
    const newOccupancy = Math.round((newVisitors / site.capacity) * 100 * 10) / 10;

    // Update area visitors proportionally
    const areas = site.areas.map(area => {
      const areaVariance = Math.round((Math.random() - 0.45) * 10);
      const newAreaVisitors = Math.max(0, Math.min(area.capacity, Math.round(area.current + areaVariance)));
      return {
        ...area,
        current: newAreaVisitors,
        occupancy: Math.round((newAreaVisitors / area.capacity) * 100 * 10) / 10,
      };
    });

    return {
      ...site,
      currentVisitors: newVisitors,
      occupancyPercent: newOccupancy,
      entryRate: Math.max(0, site.entryRate + Math.round((Math.random() - 0.45) * 8)),
      exitRate: Math.max(0, site.exitRate + Math.round((Math.random() - 0.45) * 6)),
      areas,
    };
  });
}

function getHourFactor(hour) {
  const factors = {
    6: 0.3, 7: 0.45, 8: 0.6, 9: 0.75, 10: 0.85, 11: 0.92,
    12: 0.95, 13: 0.9, 14: 0.85, 15: 0.78, 16: 0.7, 17: 0.55, 18: 0.35,
  };
  return factors[hour] || 0.5;
}

/**
 * Analyze visitor data for a specific site and generate AI recommendations
 */
async function analyzeVisitorFlow(siteId) {
  const site = currentVisitorData.sites.find(s => s.siteId === siteId);
  if (!site) return null;

  const riskLevel = classifyOccupancyRisk(site.occupancyPercent);
  const criticalAreas = site.areas.filter(a => a.occupancy >= 90);

  const aiResult = await graniteService.generateVisitorRecommendation({
    siteName: site.siteName,
    currentVisitors: site.currentVisitors,
    capacity: site.capacity,
    occupancyPercent: site.occupancyPercent,
    entryRate: site.entryRate,
    exitRate: site.exitRate,
  });

  const alerts = [];
  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
    alerts.push({
      id: uuidv4(),
      severity: riskLevel,
      category: 'visitor',
      site: site.siteName,
      description: `${site.siteName} at ${site.occupancyPercent}% capacity (${site.currentVisitors}/${site.capacity} visitors)`,
      agent: 'Visitor Flow Agent',
      time: new Date().toISOString(),
      status: 'NEW',
      aiRecommendation: aiResult.recommendations,
    });
  }

  return {
    site: { ...site, riskLevel, timestamp: new Date().toISOString(), simulated: true },
    criticalAreas,
    aiRecommendations: aiResult,
    alerts,
  };
}

/**
 * Get hourly visitor pattern data
 */
function getHourlyPattern() {
  return currentVisitorData.hourlyPattern;
}

/**
 * Get weekly trend data
 */
function getWeeklyTrend() {
  return currentVisitorData.weeklyTrend;
}

/**
 * Agent status for orchestrator
 */
function getAgentStatus() {
  const sites = getCurrentVisitorData();
  const highOccupancy = sites.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL');
  const totalVisitors = sites.reduce((sum, s) => sum + s.currentVisitors, 0);

  return {
    name: 'Visitor Flow Agent',
    id: 'visitor-agent',
    status: 'ACTIVE',
    lastAction: `Monitored ${totalVisitors} visitors across ${sites.length} sites`,
    currentTask: 'Real-time visitor density monitoring',
    riskDetected: highOccupancy.length > 0 ? 'HIGH' : 'MODERATE',
    recommendation: highOccupancy.length > 0
      ? `High occupancy at ${highOccupancy.map(s => s.siteName).join(', ')} — visitor controls recommended`
      : 'Visitor flow within normal parameters',
    metrics: {
      totalVisitors,
      sitesMonitored: sites.length,
      highOccupancySites: highOccupancy.length,
    },
  };
}

module.exports = {
  getCurrentVisitorData,
  analyzeVisitorFlow,
  getHourlyPattern,
  getWeeklyTrend,
  applySimulationDrift,
  getAgentStatus,
  classifyOccupancyRisk,
};
