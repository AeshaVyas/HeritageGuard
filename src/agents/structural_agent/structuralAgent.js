/**
 * Structural Health Monitoring Agent
 * Analyzes simulated sensor data and assesses structural risk for heritage structures
 */

const { v4: uuidv4 } = require('uuid');
const graniteService = require('../../../ai/granite/graniteService');
const sensorData = require('../../data/structural_sensor_data.json');

let currentSensorData = JSON.parse(JSON.stringify(sensorData));

/**
 * Calculate structural health score from sensor readings
 */
function calculateHealthScore(readings, thresholds) {
  let score = 100;
  const { temperature, humidity, vibration, crackWidth, moisture } = readings;
  const t = thresholds;

  // Crack width has highest impact
  if (crackWidth >= t.crackWidth.critical) score -= 35;
  else if (crackWidth >= t.crackWidth.high) score -= 25;
  else if (crackWidth >= t.crackWidth.moderate) score -= 15;
  else score -= 5;

  // Moisture
  if (moisture >= t.moisture.critical) score -= 20;
  else if (moisture >= t.moisture.high) score -= 14;
  else if (moisture >= t.moisture.moderate) score -= 8;
  else score -= 2;

  // Humidity
  if (humidity >= t.humidity.critical) score -= 15;
  else if (humidity >= t.humidity.high) score -= 10;
  else if (humidity >= t.humidity.moderate) score -= 5;
  else score -= 1;

  // Vibration
  if (vibration >= t.vibration.critical) score -= 20;
  else if (vibration >= t.vibration.high) score -= 12;
  else if (vibration >= t.vibration.moderate) score -= 6;
  else score -= 1;

  // Temperature
  if (temperature >= t.temperature.critical) score -= 10;
  else if (temperature >= t.temperature.high) score -= 6;
  else if (temperature >= t.temperature.moderate) score -= 3;
  else score -= 1;

  return Math.max(0, Math.min(100, score));
}

/**
 * Classify risk level from health score
 */
function classifyRisk(healthScore) {
  if (healthScore >= 75) return 'LOW';
  if (healthScore >= 55) return 'MODERATE';
  if (healthScore >= 35) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Detect anomalies in sensor readings
 */
function detectAnomalies(readings, thresholds) {
  const anomalies = [];
  const params = ['crackWidth', 'moisture', 'humidity', 'vibration', 'temperature'];

  for (const param of params) {
    const val = readings[param];
    const t = thresholds[param];
    if (val >= t.critical) {
      anomalies.push({ parameter: param, value: val, threshold: t.critical, severity: 'CRITICAL' });
    } else if (val >= t.high) {
      anomalies.push({ parameter: param, value: val, threshold: t.high, severity: 'HIGH' });
    }
  }

  return anomalies;
}

/**
 * Get current sensor readings (with optional simulation drift)
 */
function getSensorReadings() {
  return currentSensorData.sensors.map(sensor => {
    const healthScore = calculateHealthScore(sensor.readings, sensor.thresholds);
    const riskLevel = classifyRisk(healthScore);
    const anomalies = detectAnomalies(sensor.readings, sensor.thresholds);

    return {
      ...sensor,
      healthScore,
      riskLevel,
      anomalies,
      lastUpdated: new Date().toISOString(),
    };
  });
}

/**
 * Apply simulation drift to sensor data
 */
function applySimulationDrift() {
  currentSensorData.sensors = currentSensorData.sensors.map(sensor => {
    const r = sensor.readings;
    return {
      ...sensor,
      readings: {
        temperature: clamp(r.temperature + (Math.random() - 0.45) * 0.8, 20, 48),
        humidity: clamp(r.humidity + (Math.random() - 0.45) * 1.2, 30, 95),
        vibration: clamp(r.vibration + (Math.random() - 0.48) * 0.03, 0.05, 0.7),
        crackWidth: clamp(r.crackWidth + (Math.random() - 0.46) * 0.1, 0.1, 6.0),
        moisture: clamp(r.moisture + (Math.random() - 0.45) * 1.5, 20, 95),
        displacement: clamp(r.displacement + (Math.random() - 0.48) * 0.05, 0.1, 5.0),
        deteriorationScore: clamp(r.deteriorationScore + (Math.random() - 0.45) * 1.0, 5, 100),
      },
    };
  });
}

function clamp(val, min, max) {
  return Math.round(Math.min(max, Math.max(min, val)) * 100) / 100;
}

/**
 * Analyze a specific sensor reading with Granite AI
 */
async function analyzeSensorReading(sensorId) {
  const sensor = currentSensorData.sensors.find(s => s.id === sensorId);
  if (!sensor) return null;

  const healthScore = calculateHealthScore(sensor.readings, sensor.thresholds);
  const riskLevel = classifyRisk(healthScore);
  const anomalies = detectAnomalies(sensor.readings, sensor.thresholds);

  const aiAnalysis = await graniteService.analyzeStructuralRisk({
    ...sensor.readings,
    site: sensor.site,
    structure: sensor.structure,
  });

  return {
    sensor: {
      ...sensor,
      healthScore,
      riskLevel,
      anomalies,
    },
    aiAnalysis,
    alerts: anomalies.map(a => ({
      id: uuidv4(),
      severity: a.severity,
      category: 'structural',
      site: sensor.site,
      structure: sensor.structure,
      description: `${a.parameter} reading of ${a.value} exceeds ${a.severity} threshold (${a.threshold})`,
      agent: 'Structural Health Agent',
      time: new Date().toISOString(),
      status: 'NEW',
    })),
    timestamp: new Date().toISOString(),
    simulated: true,
  };
}

/**
 * Get aggregate health summary per site
 */
function getSiteHealthSummary() {
  const sensors = getSensorReadings();
  const sites = {};

  for (const s of sensors) {
    if (!sites[s.site]) {
      sites[s.site] = { scores: [], anomalies: 0, highRisk: 0 };
    }
    sites[s.site].scores.push(s.healthScore);
    sites[s.site].anomalies += s.anomalies.length;
    if (s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL') sites[s.site].highRisk += 1;
  }

  return Object.entries(sites).map(([name, data]) => ({
    site: name,
    avgHealthScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    riskLevel: classifyRisk(Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)),
    totalAnomalies: data.anomalies,
    highRiskSensors: data.highRisk,
  }));
}

/**
 * Agent status for orchestrator
 */
function getAgentStatus() {
  const sensors = getSensorReadings();
  const criticalCount = sensors.filter(s => s.riskLevel === 'CRITICAL').length;
  const highCount = sensors.filter(s => s.riskLevel === 'HIGH').length;

  return {
    name: 'Structural Health Agent',
    id: 'structural-agent',
    status: 'ACTIVE',
    lastAction: `Analyzed ${sensors.length} sensor readings`,
    currentTask: 'Continuous structural monitoring',
    riskDetected: criticalCount > 0 ? 'CRITICAL' : highCount > 0 ? 'HIGH' : 'MODERATE',
    recommendation: highCount > 0
      ? `Inspect ${sensors.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').map(s => s.structure).join(', ')}`
      : 'All structures within acceptable parameters',
    metrics: {
      sensorsMonitored: sensors.length,
      anomaliesDetected: sensors.reduce((a, s) => a + s.anomalies.length, 0),
      criticalAlerts: criticalCount,
    },
  };
}

module.exports = {
  getSensorReadings,
  analyzeSensorReading,
  getSiteHealthSummary,
  applySimulationDrift,
  getAgentStatus,
  calculateHealthScore,
  classifyRisk,
};
