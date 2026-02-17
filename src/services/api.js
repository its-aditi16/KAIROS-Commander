import axios from "axios";

// Mock data
const MOCK_INCIDENT_SUMMARY = {
  criticalAlerts: 3,
  highErrors: 12,
  affectedServices: 5,
  mttrEstimate: "45m",
};

const MOCK_TELEMETRY = [
  {
    id: "svc-auth",
    name: "Auth Service",
    errorRate: 0.15,
    latency: "120ms",
    cpu: "45%",
    status: "healthy",
  },
  {
    id: "svc-payment",
    name: "Payment Gateway",
    errorRate: 2.5,
    latency: "850ms",
    cpu: "92%",
    status: "critical",
  },
  {
    id: "svc-order",
    name: "Order Service",
    errorRate: 0.8,
    latency: "210ms",
    cpu: "65%",
    status: "warning",
  },
  {
    id: "svc-inventory",
    name: "Inventory DB",
    errorRate: 0.05,
    latency: "45ms",
    cpu: "30%",
    status: "healthy",
  },
  {
    id: "svc-notif",
    name: "Notification Svc",
    errorRate: 1.2,
    latency: "320ms",
    cpu: "55%",
    status: "warning",
  },
];

const MOCK_GRAPH_DATA = {
  nodes: [
    { id: "svc-auth", group: 1, risk: 0.1 },
    { id: "svc-payment", group: 2, risk: 0.9 }, // High risk
    { id: "svc-order", group: 2, risk: 0.6 },
    { id: "svc-inventory", group: 3, risk: 0.2 },
    { id: "svc-notif", group: 4, risk: 0.4 },
  ],
  links: [
    { source: "svc-auth", target: "svc-order" },
    { source: "svc-order", target: "svc-payment" },
    { source: "svc-order", target: "svc-inventory" },
    { source: "svc-payment", target: "svc-notif" },
    { source: "svc-inventory", target: "svc-notif" },
  ],
};

const MOCK_HYPOTHESES = [
  {
    id: "H1",
    service: "Payment Gateway",
    likelihood: 92,
    reason: "High latency correlate with DB locks",
    confidence: 0.92,
  },
  {
    id: "H2",
    service: "Order Service",
    likelihood: 65,
    reason: "Retry storm detected",
    confidence: 0.65,
  },
  {
    id: "H3",
    service: "Auth Service",
    likelihood: 30,
    reason: "Token validation timeout",
    confidence: 0.3,
  },
];

const MOCK_RISK_RANKING = [
  { service: "Payment Gateway", likelihood: 92 },
  { service: "Order Service", likelihood: 65 },
  { service: "Notification Svc", likelihood: 45 },
  { service: "Auth Service", likelihood: 15 },
];

const MOCK_ROOT_CAUSE = {
  topPrediction: "Payment Gateway",
  confidence: 92,
  explanation:
    'The Payment Gateway is experiencing high latency (850ms) and error rates (2.5%) consistent with database lock contention. SHAP analysis indicates that "DB Connection Pool Saturation" is the primary contributing factor.',
  shapValues: [
    { feature: "DB Locks", value: 0.45 },
    { feature: "High Latency", value: 0.25 },
    { feature: "Error Rate", value: 0.15 },
    { feature: "CPU Usage", value: 0.1 },
    { feature: "Memory", value: 0.05 },
  ],
};

const MOCK_TIMELINE = [
  {
    id: 1,
    time: "10:45:00",
    event: "Alert Triggered: Payment Gateway Latency > 500ms",
    type: "critical",
  },
  {
    id: 2,
    time: "10:45:30",
    event: "Automated scaledown of non-critical jobs",
    type: "info",
  },
  {
    id: 3,
    time: "10:46:15",
    event: "Error rate spiked to 5% in Order Service",
    type: "warning",
  },
  { id: 4, time: "10:47:00", event: "AI Analysis Started", type: "info" },
  {
    id: 5,
    time: "10:47:45",
    event: "Hypothesis H1 Generated: DB Locks",
    type: "success",
  },
];

// Mock API Delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  getIncidentSummary: async () => {
    await delay(500);
    return MOCK_INCIDENT_SUMMARY;
  },
  getTelemetry: async () => {
    await delay(600);
    return MOCK_TELEMETRY;
  },
  getGraphData: async () => {
    await delay(700);
    return MOCK_GRAPH_DATA;
  },
  getHypotheses: async () => {
    await delay(500);
    return MOCK_HYPOTHESES;
  },
  getRiskRanking: async () => {
    await delay(400);
    return MOCK_RISK_RANKING;
  },
  getRootCause: async () => {
    await delay(800);
    return MOCK_ROOT_CAUSE;
  },
  getTimeline: async () => {
    await delay(300);
    return MOCK_TIMELINE;
  },
};
