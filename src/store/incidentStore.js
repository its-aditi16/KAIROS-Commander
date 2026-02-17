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

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [summary, telemetry, graphData, hypotheses, riskRanking, rootCause, timeline] = await Promise.all([
        api.getIncidentSummary(),
        api.getTelemetry(),
        api.getGraphData(),
        api.getHypotheses(),
        api.getRiskRanking(),
        api.getRootCause(),
        api.getTimeline()
      ]);

      set({
        summary,
        telemetry,
        graphData,
        hypotheses,
        riskRanking,
        rootCause,
        timeline,
        loading: false
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      set({ error: "Failed to load dashboard data", loading: false });
    }
  },

  // Actions to update state individually if needed
  setSummary: (summary) => set({ summary }),
}));
