/**
 * HeritageGuard AI — Frontend API Service
 * All backend API calls go through this module
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// ─── Sites ────────────────────────────────────────────
export const sitesAPI = {
  getAll: () => api.get('/sites'),
  getById: id => api.get(`/sites/${id}`),
};

// ─── Structural Health ────────────────────────────────
export const structuralAPI = {
  getAll: () => api.get('/structural-health'),
  getSummary: () => api.get('/structural-health/summary'),
  analyze: sensorId => api.post('/structural-health/analyze', { sensorId }),
};

// ─── Visitors ─────────────────────────────────────────
export const visitorsAPI = {
  getAll: () => api.get('/visitors'),
  getHourly: () => api.get('/visitors/hourly'),
  getWeekly: () => api.get('/visitors/weekly'),
  analyze: siteId => api.post('/visitors/analyze', { siteId }),
};

// ─── Storytelling ─────────────────────────────────────
export const storytellingAPI = {
  generate: params => api.post('/storytelling/generate', params),
  getMetadata: () => api.get('/storytelling/metadata'),
};

// ─── Encroachment ─────────────────────────────────────
export const encroachmentAPI = {
  getAll: (filters = {}) => api.get('/encroachment', { params: filters }),
  getSample: () => api.get('/encroachment/sample'),
  analyze: formData => axios.post('/api/encroachment/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/encroachment/${id}/status`, { status }),
};

// ─── Alerts ───────────────────────────────────────────
export const alertsAPI = {
  getAll: (filters = {}) => api.get('/alerts', { params: filters }),
  create: data => api.post('/alerts', data),
  updateStatus: (id, status) => api.patch(`/alerts/${id}/status`, { status }),
  getStats: () => api.get('/alerts/stats'),
};

// ─── Conservation ─────────────────────────────────────
export const conservationAPI = {
  getReports: type => api.get('/conservation/report', { params: type ? { type } : {} }),
  getLatest: () => api.get('/conservation/report/latest'),
  generate: type => api.post('/conservation/report', { type }),
};

// ─── AI Chat ──────────────────────────────────────────
export const aiAPI = {
  chat: message => api.post('/ai/chat', { message }),
  getStatus: () => api.get('/ai/status'),
};

// ─── Agents ───────────────────────────────────────────
export const agentsAPI = {
  getStatuses: () => api.get('/agents/status'),
  getSystemHealth: () => api.get('/agents/system-health'),
  getEvents: limit => api.get('/agents/events', { params: { limit } }),
  startSimulation: () => api.post('/agents/simulation/start'),
  stopSimulation: () => api.post('/agents/simulation/stop'),
  getSimulationStatus: () => api.get('/agents/simulation/status'),
  analyze: () => api.post('/agents/analyze'),
};
