import { create } from 'zustand';
import { api } from '../services/api';
import { saveIncidentToFirebase, saveServiceLogsToFirebase, getServiceLogsFromFirebase } from '../services/incidentService';

// All known services
const ALL_SERVICES = ['frontend', 'auth-service', 'payment-service', 'database'];

// Generate realistic simulated logs for a service.
// errorRate: 0–1 float. If high, inject realistic error logs.
// defectiveFile: optional filename to embed in frontend error messages.
const generateServiceLogs = (serviceId, errorRate = 0, latency = 100, cpuUsage = 30, defectiveFile = null) => {
  const logs = [];
  const now = new Date();
  const isErrorProne = errorRate > 0.1;
  const isFrontend = serviceId === 'frontend' && defectiveFile;

  for (let i = 0; i < 22; i++) {
    const ts = new Date(now.getTime() - i * 2500);
    const timestamp = ts.toTimeString().slice(0, 8) + '.' + String(ts.getMilliseconds()).padStart(3, '0');

    const rand = Math.random();
    const makeError = isErrorProne && rand < errorRate;

    if (makeError) {
      let errors;
      if (isFrontend) {
        // File-specific frontend errors
        errors = [
          `ERROR: Unhandled exception in ${defectiveFile} — TypeError: Cannot read properties of undefined`,
          `ERROR: ${defectiveFile} threw an uncaught promise rejection — fetch failed with status 503`,
          `CRITICAL: React render error in ${defectiveFile} — component tree unmounted`,
          `ERROR: ${defectiveFile} — state mutation detected, re-render loop at line ~${Math.floor(Math.random()*300+10)}`,
          `FATAL: ${defectiveFile} module failed to load — import resolution error (latency=${latency}ms)`,
          `ERROR: ${defectiveFile} — API call timed out after ${latency}ms, error_rate=${(errorRate*100).toFixed(1)}%`,
        ];
      } else {
        errors = [
          `CRITICAL: Upstream connection pool exhausted — ${serviceId} unable to reach dependencies`,
          `ERROR: Request timeout after ${latency + Math.floor(Math.random() * 500)}ms — circuit breaker triggered`,
          `ERROR: Downstream failure in ${serviceId} — retry attempt 3/3 failed`,
          `FATAL: Health check failed — service reported unhealthy (error_rate=${(errorRate * 100).toFixed(1)}%)`,
          `ERROR: Database query rejected — CPU saturation at ${cpuUsage}%, queue full`,
        ];
      }
      logs.push({
        timestamp,
        level: 'ERROR',
        message: errors[Math.floor(Math.random() * errors.length)],
        isError: true,
        ...(isFrontend ? { file: defectiveFile } : {}),
      });
    } else {
      const infos = [
        `INFO: Request processed in ${Math.round(latency * (0.85 + Math.random() * 0.3))}ms — status 200`,
        `INFO: Health check passed — CPU ${cpuUsage}%, memory nominal`,
        `INFO: Cache hit ratio 94% — serving from L1`,
        `DEBUG: Connection pool healthy — ${Math.floor(Math.random() * 20 + 10)}/50 active`,
        `INFO: Metrics flushed to collector — 128 data points`,
      ];
      logs.push({
        timestamp,
        level: 'INFO',
        message: infos[Math.floor(Math.random() * infos.length)],
        isError: false,
      });
    }
  }

  // Guarantee at least one visible error at top for error-prone services
  if (isErrorProne && !logs.slice(0, 5).some(l => l.isError)) {
    const topMsg = isFrontend
      ? `CRITICAL: ${defectiveFile} — fatal error detected, error_rate=${(errorRate * 100).toFixed(1)}%, latency=${latency}ms`
      : `CRITICAL: ${serviceId} anomaly detected — error_rate=${(errorRate * 100).toFixed(1)}%, latency=${latency}ms exceeds threshold`;
    logs[0] = {
      timestamp: logs[0].timestamp,
      level: 'ERROR',
      message: topMsg,
      isError: true,
      ...(isFrontend ? { file: defectiveFile } : {}),
    };
  }

  return logs;
};

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
  serviceLogs: [],

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

  fetchServiceLogs: async (serviceId) => {
    set({ loading: true });
    try {
      const logs = await getServiceLogsFromFirebase(serviceId);
      set({ serviceLogs: logs, loading: false });
    } catch (err) {
      console.error("Failed to fetch service logs", err);
      set({ error: "Failed to load service logs", loading: false });
    }
  },

  injectIncident: async (service, metrics) => {
    set({ loading: true, error: null });
    try {
      await api.injectIncident(service, metrics);
      // Automatically refresh dashboard after injection
      const freshData = await get().fetchAllData();

      const errorRate    = metrics.error_rate    || 0;
      const latency      = metrics.latency       || 0;
      const cpuUsage     = metrics.cpu           || 0;
      const defectiveFile = metrics.defective_file || null;

      await Promise.all(
        ALL_SERVICES.map((svc) => {
          if (svc === service) {
            // Injected service gets faulty logs (with defective file name if frontend)
            return saveServiceLogsToFirebase(svc, generateServiceLogs(svc, errorRate, latency, cpuUsage, defectiveFile));
          } else {
            // All other services get healthy baseline logs
            return saveServiceLogsToFirebase(svc, generateServiceLogs(svc, 0.01, 80, 25));
          }
        })
      );
      console.log('Service logs saved to Firebase for all services.');

      // Save the result to Firestore incident history
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
