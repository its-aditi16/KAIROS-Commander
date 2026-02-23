import axios from "axios";

// API base - use proxy in dev so /api -> backend
const API_BASE = "/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Transform backend graph (nodes/edges) to frontend format (nodes/links with risk)
function transformGraphData(backendGraph) {
  if (!backendGraph?.nodes?.length) return { nodes: [], links: [] };

  const nodes = backendGraph.nodes.map((n) => ({
    id: n.id,
    risk: Math.min(1, (n.impact_score || 0) / 0.5), // normalize: 0.5 impact ≈ 100% risk
  }));

  const links = (backendGraph.edges || []).map((e) => ({
    source: e.source,
    target: e.target,
  }));

  return { nodes, links };
}

// Derive summary from graph nodes
function deriveSummary(nodes) {
  if (!nodes?.length) return { criticalAlerts: 0, highErrors: 0, affectedServices: 0, mttrEstimate: "—" };
  const critical = nodes.filter((n) => (n.impact_score || 0) > 0.2).length;
  const highErrors = nodes.filter((n) => (n.error_rate || 0) > 0.1).length;
  return {
    criticalAlerts: critical,
    highErrors: highErrors || nodes.length,
    affectedServices: nodes.length,
    mttrEstimate: critical > 2 ? "60m" : "45m",
  };
}

// Derive telemetry from graph nodes
function deriveTelemetry(nodes) {
  if (!nodes?.length) return [];
  return nodes.map((n, i) => {
    const impact = n.impact_score || 0;
    const latency = n.latency || 0;
    const errorRate = n.error_rate || 0;

    let status = "healthy";

    // AI Impact Score Hierarchy
    if (impact > 0.15) status = "critical";
    else if (impact > 0.05) status = "warning";

    // Direct Metric Overrides (Ensure UI reacts to even small anomalies)
    if (latency >= 1000 || errorRate >= 0.1) status = "critical";
    else if (latency >= 400 || errorRate >= 0.05) {
      // Don't downgrade if already critical
      if (status !== "critical") status = "warning";
    }

    return {
      id: n.id,
      name: n.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      errorRate: ((n.error_rate || 0) * 100).toFixed(1),
      latency: `${n.latency || 0}ms`,
      cpu: `${n.cpu_usage || 0}%`,
      downstream: n.downstream_failures || 0,
      status,
    };
  });
}

// Transform timeline backend format to frontend format
function transformTimeline(backendTimeline) {
  if (!Array.isArray(backendTimeline)) return [];
  const typeMap = { first_anomaly: "critical", cascade_failure: "critical", user_impact: "warning", normal: "info" };
  return backendTimeline.map((e, i) => ({
    id: i + 1,
    time: e.time,
    event: e.event,
    type: typeMap[e.type] || "info",
  }));
}

// Transform analyze response to hypotheses, riskRanking, rootCause
function transformAnalyzeResponse(analyze) {
  const hypotheses = (analyze.ai_hypotheses || []).map((h, i) => ({
    id: `H${i + 1}`,
    service: h.service,
    likelihood: h.confidence,
    reason: `AI predicts ${h.confidence}% probability that ${h.service} is the root cause based on anomaly propagation.`,
    confidence: h.confidence / 100,
  }));

  const riskRanking = (analyze.ai_hypotheses || []).map((h) => ({
    service: h.service,
    likelihood: h.confidence,
  }));

  const rca = analyze.root_cause_analysis || {};
  const rootCause = rca.top_suspect
    ? {
      topPrediction: rca.top_suspect,
      confidence: rca.confidence || 0,
      explanation: rca.summary || "Analysis pending.",
      shapValues: (rca.feature_importance || []).map((f) => ({
        feature: f.feature,
        value: (f.impact_percent || 0) / 100,
      })),
    }
    : null;

  return { hypotheses, riskRanking, rootCause, blastRadius: analyze.blast_radius || null };
}

export const api = {
  injectIncident: async (service, metrics) => {
    const payload = {
      service,
      error_rate: metrics.error_rate || 0,
      latency: metrics.latency || 0,
      cpu: metrics.cpu || 0,
      downstream: metrics.downstream || 0,
      reset_scenario: metrics.reset_scenario || false,
    };
    return await client.post("/incident/inject", payload);
  },

  getIncidentSummary: async () => {
    const { data } = await client.get("/incident/graph");
    return deriveSummary(data?.nodes || []);
  },

  getTelemetry: async () => {
    const { data } = await client.get("/incident/graph");
    return deriveTelemetry(data?.nodes || []);
  },

  getGraphData: async () => {
    const { data } = await client.get("/incident/graph");
    return transformGraphData(data);
  },

  getHypotheses: async () => {
    const graphRes = await client.get("/incident/graph");
    const nodes = graphRes.data?.nodes || [];
    const services = {};
    nodes.forEach((n) => {
      services[n.id] = {
        error_rate: n.error_rate ?? 0.1,
        latency: n.latency ?? 100,
        cpu_usage: n.cpu_usage ?? 50,
        downstream_failures: n.downstream_failures ?? 0,
      };
    });
    if (Object.keys(services).length === 0) return [];
    try {
      const { data } = await client.post("/incident/analyze", { services });
      return transformAnalyzeResponse(data).hypotheses;
    } catch {
      return [];
    }
  },

  getRiskRanking: async () => {
    const graphRes = await client.get("/incident/graph");
    const nodes = graphRes.data?.nodes || [];
    const services = {};
    nodes.forEach((n) => {
      services[n.id] = {
        error_rate: n.error_rate ?? 0.1,
        latency: n.latency ?? 100,
        cpu_usage: n.cpu_usage ?? 50,
        downstream_failures: n.downstream_failures ?? 0,
      };
    });
    if (Object.keys(services).length === 0) return [];
    try {
      const { data } = await client.post("/incident/analyze", { services });
      return transformAnalyzeResponse(data).riskRanking;
    } catch {
      return nodes
        .map((n) => ({ service: n.id, likelihood: Math.round((n.impact_score || 0) * 100) }))
        .sort((a, b) => b.likelihood - a.likelihood);
    }
  },

  getRootCause: async () => {
    const graphRes = await client.get("/incident/graph");
    const nodes = graphRes.data?.nodes || [];
    const services = {};
    nodes.forEach((n) => {
      services[n.id] = {
        error_rate: n.error_rate ?? 0.1,
        latency: n.latency ?? 100,
        cpu_usage: n.cpu_usage ?? 50,
        downstream_failures: n.downstream_failures ?? 0,
      };
    });
    if (Object.keys(services).length === 0) return null;
    try {
      const { data } = await client.post("/incident/analyze", { services });
      return transformAnalyzeResponse(data).rootCause;
    } catch {
      const top = nodes.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))[0];
      return top
        ? {
          topPrediction: top.id,
          confidence: Math.round((top.impact_score || 0) * 100),
          explanation: `High impact score (${(top.impact_score || 0).toFixed(2)}) from graph analysis.`,
          shapValues: [
            { feature: "Error Rate", value: 0.35 },
            { feature: "Latency", value: 0.25 },
            { feature: "CPU Usage", value: 0.2 },
            { feature: "Downstream Failures", value: 0.2 },
          ],
        }
        : null;
    }
  },

  getTimeline: async () => {
    try {
      const { data } = await client.get("/incident/timeline");
      return transformTimeline(data?.timeline || []);
    } catch {
      return [];
    }
  },

  getSimilarityMatches: async (incidentData) => {
    try {
      const { data } = await client.post("/incident/similarity", incidentData);
      return data.similar_matches || [];
    } catch (err) {
      console.error("Similarity lookup failed", err);
      return [];
    }
  },

  resetSystem: async () => {
    return await client.post("/incident/reset");
  },

  // Single optimized fetch for dashboard - one graph, one analyze, one timeline
  fetchDashboardData: async () => {
    const [graphRes, timelineRes] = await Promise.all([
      client.get("/incident/graph"),
      client.get("/incident/timeline").catch(() => ({ data: { timeline: [] } })),
    ]);

    const nodes = graphRes.data?.nodes || [];
    const summary = deriveSummary(nodes);
    const telemetry = deriveTelemetry(nodes);
    const graphData = transformGraphData(graphRes.data);
    const timeline = transformTimeline(timelineRes.data?.timeline || []);

    const services = {};
    nodes.forEach((n) => {
      services[n.id] = {
        error_rate: n.error_rate ?? 0.1,
        latency: n.latency ?? 100,
        cpu_usage: n.cpu_usage ?? 50,
        downstream_failures: n.downstream_failures ?? 0,
      };
    });

    let hypotheses = [];
    let riskRanking = [];
    let rootCause = null;
    let transformed = null;
    if (Object.keys(services).length > 0) {
      try {
        const { data } = await client.post("/incident/analyze", { services });
        transformed = transformAnalyzeResponse(data);
        hypotheses = transformed.hypotheses;
        riskRanking = transformed.riskRanking;
        rootCause = transformed.rootCause;
      } catch {
        riskRanking = nodes
          .map((n) => ({ service: n.id, likelihood: Math.round((n.impact_score || 0) * 100) }))
          .sort((a, b) => b.likelihood - a.likelihood);
        const top = nodes.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))[0];
        rootCause = top
          ? {
            topPrediction: top.id,
            confidence: Math.round((top.impact_score || 0) * 100),
            explanation: `High impact score from graph analysis.`,
            shapValues: [
              { feature: "Error Rate", value: 0.35 },
              { feature: "Latency", value: 0.25 },
              { feature: "CPU Usage", value: 0.2 },
              { feature: "Downstream Failures", value: 0.2 },
            ],
          }
          : null;
      }
    }

    return {
      summary,
      telemetry,
      graphData,
      hypotheses,
      riskRanking,
      rootCause,
      blastRadius: transformed?.blastRadius || null,
      timeline,
    };
  },
};
