import { create } from 'zustand';
import { api } from '../services/api';
import { saveIncidentToFirebase } from '../services/incidentService';

export const useIncidentStore = create((set, get) => ({
  loading: false,
  error: null,

  summary: null,
  telemetry: [],
  graphData: { nodes: [], links: [] },
  hypotheses: [],
  riskRanking: [],
  rootCause: null,
  timeline: [],

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.fetchDashboardData();
      set({
        ...data,
        loading: false,
      });
      return data; // Return data for sequential processing
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      set({ error: "Failed to load dashboard data", loading: false });
    }
  },

  injectIncident: async (service, metrics) => {
    set({ loading: true, error: null });
    try {
      await api.injectIncident(service, metrics);
      // Automatically refresh dashboard after injection
      const freshData = await get().fetchAllData();
      
      // Save the result to Firestore history
      if (freshData) {
        await get().saveCurrentToHistory(service, freshData);
      }
    } catch (err) {
      console.error("Failed to inject incident", err);
      set({ error: "Failed to simulate incident", loading: false });
      throw err;
    }
  },

  saveCurrentToHistory: async (service, data) => {
    try {
      const { summary, rootCause, timeline, telemetry } = data;
      
      // Map telemetry to metrics snapshot for Firestore
      // Use the root cause service's metrics or the injected service's metrics
      const mainSuspect = telemetry.find(t => t.id === service) || telemetry[0] || {};
      
      const incidentData = {
        title: `AI Simulation: ${service.replace(/-/g, ' ').toUpperCase()}`,
        severity: summary.criticalAlerts > 0 ? 'CRITICAL' : 'WARNING',
        metricsSnapshot: {
          cpuUsage: parseFloat(mainSuspect.cpu) || 0,
          memoryUsage: 0, // Not directly in telemetry yet
          errorRate: parseFloat(mainSuspect.errorRate) || 0,
          requestLatency: parseFloat(mainSuspect.latency) || 0,
          activeUsers: 1000, 
        },
        timeline: timeline.map(e => ({
          time: e.time,
          event: e.event,
          type: e.type
        })),
        aiAnalysis: {
          rootCause: rootCause?.topPrediction || "Pending",
          impact: rootCause?.explanation || "Analyzing system impact...",
          recommendation: "Review service health and resource allocation.",
        }
      };

      await saveIncidentToFirebase(incidentData);
      console.log("Incident saved to Firebase history successfully");
    } catch (err) {
      console.error("Failed to save incident to Firebase history:", err);
    }
  },

  resetSystem: async () => {
    set({ loading: true, error: null });
    try {
      await api.resetSystem();
      await get().fetchAllData();
    } catch (err) {
      console.error("Failed to reset system", err);
      set({ error: "Failed to reset system", loading: false });
      throw err;
    }
  },
}));
