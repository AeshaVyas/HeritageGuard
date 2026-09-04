import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { agentsAPI, alertsAPI } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [simulationActive, setSimulationActive] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [aiMode, setAiMode] = useState('Demo Mode');
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const res = await agentsAPI.getSystemHealth();
      if (res.success) setSystemHealth(res.data);
    } catch {}
  }, []);

  const fetchAgentStatuses = useCallback(async () => {
    try {
      const res = await agentsAPI.getStatuses();
      if (res.success) setAgentStatuses(res.data);
    } catch {}
  }, []);

  const fetchAlertCount = useCallback(async () => {
    try {
      const res = await alertsAPI.getStats();
      if (res.success) setActiveAlerts(res.data.active || 0);
    } catch {}
  }, []);

  const fetchSimStatus = useCallback(async () => {
    try {
      const res = await agentsAPI.getSimulationStatus();
      if (res.success) setSimulationActive(res.data.active);
    } catch {}
  }, []);

  const startSimulation = useCallback(async () => {
    try {
      await agentsAPI.startSimulation();
      setSimulationActive(true);
    } catch (err) {
      console.error('Failed to start simulation:', err.message);
    }
  }, []);

  const stopSimulation = useCallback(async () => {
    try {
      await agentsAPI.stopSimulation();
      setSimulationActive(false);
    } catch (err) {
      console.error('Failed to stop simulation:', err.message);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.allSettled([
        fetchSystemHealth(),
        fetchAgentStatuses(),
        fetchAlertCount(),
        fetchSimStatus(),
      ]);
      setLoading(false);
    })();
  }, [fetchSystemHealth, fetchAgentStatuses, fetchAlertCount, fetchSimStatus]);

  // Poll when simulation is active
  useEffect(() => {
    if (simulationActive) {
      pollRef.current = setInterval(() => {
        fetchSystemHealth();
        fetchAlertCount();
      }, 6000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [simulationActive, fetchSystemHealth, fetchAlertCount]);

  const value = {
    simulationActive,
    systemHealth,
    agentStatuses,
    activeAlerts,
    aiMode,
    loading,
    startSimulation,
    stopSimulation,
    refreshHealth: fetchSystemHealth,
    refreshAgents: fetchAgentStatuses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
