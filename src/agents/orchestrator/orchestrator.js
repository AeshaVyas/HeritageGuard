/**
 * AI Agent Orchestrator
 * Central coordinator for all HeritageGuard AI agents
 * Manages agent communication, event routing, and simulation
 */

const structuralAgent = require('../structural_agent/structuralAgent');
const visitorAgent    = require('../visitor_agent/visitorAgent');
const storytellingAgent = require('../storytelling_agent/storytellingAgent');
const encroachmentAgent = require('../encroachment_agent/encroachmentAgent');
const conservationAgent = require('../conservation_agent/conservationAgent');

let simulationActive = false;
let simulationInterval = null;
let orchestratorEvents = [];

/**
 * Get status of all agents
 */
function getAllAgentStatuses() {
  return [
    structuralAgent.getAgentStatus(),
    visitorAgent.getAgentStatus(),
    storytellingAgent.getAgentStatus(),
    encroachmentAgent.getAgentStatus(),
    conservationAgent.getAgentStatus(),
  ];
}

/**
 * Get overall system health from all agents
 */
function getSystemHealth() {
  const structuralSummary = structuralAgent.getSiteHealthSummary();
  const visitorSummary = visitorAgent.getCurrentVisitorData();

  const ahmedabadStructural = structuralSummary.find(s => s.site?.includes('Ahmedabad'));
  const modheraStructural = structuralSummary.find(s => s.site?.includes('Modhera'));
  const ahmedabadVisitor = visitorSummary.find(s => s.siteId?.includes('ahmedabad'));
  const modheraVisitor = visitorSummary.find(s => s.siteId?.includes('modhera'));

  const ahmedabadHealth = ahmedabadStructural?.avgHealthScore || 72;
  const modheraHealth = modheraStructural?.avgHealthScore || 63;
  const overallHealth = Math.round((ahmedabadHealth + modheraHealth) / 2);

  return {
    overall: overallHealth,
    ahmedabad: {
      healthScore: ahmedabadHealth,
      riskLevel: ahmedabadStructural?.riskLevel || 'MODERATE',
      visitors: ahmedabadVisitor?.currentVisitors || 840,
      capacity: ahmedabadVisitor?.capacity || 1000,
      occupancy: ahmedabadVisitor?.occupancyPercent || 84,
    },
    modhera: {
      healthScore: modheraHealth,
      riskLevel: modheraStructural?.riskLevel || 'HIGH',
      visitors: modheraVisitor?.currentVisitors || 620,
      capacity: modheraVisitor?.capacity || 700,
      occupancy: modheraVisitor?.occupancyPercent || 88.6,
    },
    timestamp: new Date().toISOString(),
    simulationActive,
  };
}

/**
 * Start simulation — all agents begin generating dynamic data
 */
function startSimulation() {
  if (simulationActive) return { success: false, message: 'Simulation already running' };

  simulationActive = true;
  logEvent('ORCHESTRATOR', 'Simulation started — all agents now generating dynamic data');

  simulationInterval = setInterval(() => {
    try {
      structuralAgent.applySimulationDrift();
      visitorAgent.applySimulationDrift();
      logEvent('SIMULATION', 'Sensor and visitor data updated');
    } catch (err) {
      console.error('[Orchestrator] Simulation tick error:', err.message);
    }
  }, 5000); // Update every 5 seconds

  return { success: true, message: 'Simulation started', timestamp: new Date().toISOString() };
}

/**
 * Stop simulation
 */
function stopSimulation() {
  if (!simulationActive) return { success: false, message: 'Simulation not running' };

  simulationActive = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  logEvent('ORCHESTRATOR', 'Simulation paused');

  return { success: true, message: 'Simulation paused', timestamp: new Date().toISOString() };
}

/**
 * Log an orchestrator event
 */
function logEvent(source, message, data = null) {
  const event = {
    id: orchestratorEvents.length + 1,
    source,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  orchestratorEvents.unshift(event);
  // Keep last 100 events
  if (orchestratorEvents.length > 100) orchestratorEvents.pop();
  return event;
}

/**
 * Get orchestrator event log
 */
function getEventLog(limit = 20) {
  return orchestratorEvents.slice(0, limit);
}

/**
 * Orchestrate a full analysis — collect data from all agents and generate a combined assessment
 */
async function runFullAnalysis() {
  logEvent('ORCHESTRATOR', 'Running full multi-agent analysis');

  const structural = structuralAgent.getSensorReadings();
  const visitor = visitorAgent.getCurrentVisitorData();
  const encroachment = encroachmentAgent.getAllCases({ status: 'UNDER_INVESTIGATION' });

  // Generate high-level alerts from combined data
  const combinedAlerts = [];

  structural.forEach(s => {
    if (s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL') {
      combinedAlerts.push({
        type: 'structural',
        site: s.site,
        message: `${s.structure}: ${s.riskLevel} structural risk (health score ${s.healthScore})`,
        severity: s.riskLevel,
      });
    }
  });

  visitor.forEach(v => {
    if (v.occupancyPercent >= 81) {
      combinedAlerts.push({
        type: 'visitor',
        site: v.siteName,
        message: `${v.siteName}: ${v.occupancyPercent}% occupancy — crowd management needed`,
        severity: v.occupancyPercent >= 96 ? 'CRITICAL' : 'HIGH',
      });
    }
  });

  encroachment.forEach(e => {
    combinedAlerts.push({
      type: 'encroachment',
      site: e.site,
      message: `${e.zone}: ${e.type} detected (confidence ${e.confidenceScore}%)`,
      severity: e.riskLevel,
    });
  });

  logEvent('ORCHESTRATOR', `Full analysis complete — ${combinedAlerts.length} alerts generated`);

  return {
    structural,
    visitor,
    encroachment,
    combinedAlerts,
    systemHealth: getSystemHealth(),
    agentStatuses: getAllAgentStatuses(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get simulation status
 */
function getSimulationStatus() {
  return { active: simulationActive };
}

module.exports = {
  getAllAgentStatuses,
  getSystemHealth,
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  getEventLog,
  logEvent,
  runFullAnalysis,
  // Export sub-agents for route handlers
  structuralAgent,
  visitorAgent,
  storytellingAgent,
  encroachmentAgent,
  conservationAgent,
};
