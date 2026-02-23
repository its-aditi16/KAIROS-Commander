import { create } from 'zustand';
import { api } from '../services/api';

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
  similarMatches: [],
  blastRadius: null,

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.fetchDashboardData();
      set({
        ...data,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      set({ error: "Failed to load dashboard data", loading: false });
    }
  },

  // Actions to update state individually if needed
  setSummary: (summary) => set({ summary }),

  injectIncident: async (service, metrics) => {
    set({ loading: true, error: null });
    try {
      await api.injectIncident(service, metrics);

      // Fetch fresh data and similarity score in parallel
      const [dashData, similarityMatches] = await Promise.all([
        api.fetchDashboardData(),
        api.getSimilarityMatches({
          service,
          error_rate: metrics.error_rate || 0,
          latency: metrics.latency || 0,
          cpu: metrics.cpu || 0,
          downstream: metrics.downstream || 0
        })
      ]);

      set({
        ...dashData,
        similarMatches: similarityMatches,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to inject incident", err);
      set({ error: "Failed to simulate incident", loading: false });
      throw err;
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
