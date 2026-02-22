import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useIncidentStore } from '../store/incidentStore';
import { getIncidentById } from '../services/incidentService';

import IncidentOverview from '../components/dashboard/IncidentOverview';
import ServiceGraph from '../components/graph/ServiceGraph';
import TelemetryTable from '../components/dashboard/TelemetryTable';
import HypothesisBoard from '../components/hypothesis/HypothesisBoard';
import RootCausePanel from '../components/explainability/RootCausePanel';
import IncidentTimeline from '../components/timeline/IncidentTimeline';
import InjectIncidentDrawer from '../components/dashboard/InjectIncidentDrawer';
import { Zap, RefreshCw } from 'lucide-react';

// ─── Map Firestore incident → dashboard component props ───────────────────────

const mapMetricsToSummary = (metrics = {}) => ({
  criticalAlerts: metrics.errorRate > 5 ? 1 : 0,
  highErrors: metrics.errorRate ?? 0,
  affectedServices: metrics.cpuUsage > 70 ? 3 : 1,
  mttrEstimate: '—',
});

const mapAiAnalysisToRootCause = (aiAnalysis = {}) => ({
  topPrediction: aiAnalysis.rootCause || 'Unknown',
  confidence: 85,
  explanation: `${aiAnalysis.rootCause || ''}. Impact: ${aiAnalysis.impact || ''}. Recommendation: ${aiAnalysis.recommendation || ''}`,
  shapValues: [
    { feature: 'Root Cause', value: 0.6 },
    { feature: 'Impact Scope', value: 0.25 },
    { feature: 'System Metrics', value: 0.15 },
  ],
});

const mapAiAnalysisToHypotheses = (aiAnalysis = {}) => [
  {
    id: 'H1',
    service: 'Detected Root Cause',
    likelihood: 90,
    reason: aiAnalysis.rootCause || 'No root cause identified',
    confidence: 0.9,
  },
  {
    id: 'H2',
    service: 'Recommended Action',
    likelihood: 75,
    reason: aiAnalysis.recommendation || 'No recommendation available',
    confidence: 0.75,
  },
];

const mapMetricsToRiskRanking = (metrics = {}) => [
  { service: 'CPU', likelihood: metrics.cpuUsage ?? 0 },
  { service: 'Memory', likelihood: metrics.memoryUsage ?? 0 },
  { service: 'Error Rate', likelihood: Math.min((metrics.errorRate ?? 0) * 8, 100) },
  { service: 'Latency', likelihood: Math.min((metrics.requestLatency ?? 0) / 5, 100) },
];

const mapTimelineEvents = (timeline = []) =>
  timeline.map((item, idx) => ({
    id: idx + 1,
    time: item.time,
    event: item.event,
    type: item.type || 'info',
  }));

const mapMetricsToTelemetry = (inc = {}) => {
  const m = inc.metricsSnapshot || {};
  return [
    { id: 'cpu', name: 'CPU Usage', errorRate: 0, latency: '—', cpu: `${m.cpuUsage ?? 0}%`, status: m.cpuUsage > 80 ? 'critical' : m.cpuUsage > 60 ? 'warning' : 'healthy' },
    { id: 'mem', name: 'Memory Usage', errorRate: 0, latency: '—', cpu: `${m.memoryUsage ?? 0}%`, status: m.memoryUsage > 85 ? 'critical' : m.memoryUsage > 70 ? 'warning' : 'healthy' },
    { id: 'err', name: 'Error Rate', errorRate: m.errorRate ?? 0, latency: '—', cpu: '—', status: m.errorRate > 5 ? 'critical' : m.errorRate > 2 ? 'warning' : 'healthy' },
    { id: 'latency', name: 'Request Latency', errorRate: 0, latency: `${m.requestLatency ?? 0}ms`, cpu: '—', status: m.requestLatency > 500 ? 'critical' : m.requestLatency > 200 ? 'warning' : 'healthy' },
  ];
};

// ─── Historical Incident Banner ───────────────────────────────────────────────
const HistoricalBanner = ({ incident, onBackToLive }) => (
  <div className="mb-4 flex items-center justify-between px-4 py-3 rounded-xl bg-kairos-blue/10 border border-kairos-blue/25 text-kairos-blue text-sm">
    <div className="flex items-center gap-2">
      <span className="text-base">📂</span>
      <span className="font-semibold">Viewing Historical Incident:</span>
      <span className="font-mono">{incident.incidentId}</span>
      <span className="text-kairos-muted">— {incident.title}</span>
    </div>
    <button
      onClick={onBackToLive}
      className="px-3 py-1 text-xs font-medium rounded-lg bg-kairos-blue/20 hover:bg-kairos-blue/30 border border-kairos-blue/30 transition-all ml-4 whitespace-nowrap"
    >
      ← Back to Live
    </button>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const incidentId = searchParams.get('incidentId');

  // Historical incident mode state
  const [historicalIncident, setHistoricalIncident] = useState(null);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [historicalError, setHistoricalError] = useState(null);

  // Live mode state (existing store)
  const {
    loading,
    error,
    summary,
    telemetry,
    graphData,
    hypotheses,
    riskRanking,
    rootCause,
    timeline,
    fetchAllData,
    injectIncident,
    resetSystem
  } = useIncidentStore();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [injecting, setInjecting] = React.useState(false);

  // ── Historical mode: fetch from Firestore ──────────────────────────────────
  useEffect(() => {
    if (!incidentId) {
      setHistoricalIncident(null);
      return;
    }
    setHistoricalLoading(true);
    setHistoricalError(null);

    getIncidentById(incidentId)
      .then((data) => {
        if (!data) {
          setHistoricalError(`Incident "${incidentId}" not found in Firebase.`);
        } else {
          setHistoricalIncident(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load historical incident:', err);
        setHistoricalError('Failed to load incident data from Firebase.');
      })
      .finally(() => setHistoricalLoading(false));
  }, [incidentId]);

  // ── Live mode: fetch from existing mock/backend API ────────────────────────
  useEffect(() => {
    if (!incidentId) {
      fetchAllData();
    }
  }, [incidentId, fetchAllData]);

  // ── Loading states ─────────────────────────────────────────────────────────
  if (incidentId && historicalLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-kairos-bg text-kairos-blue gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current" />
        <p className="text-sm text-kairos-muted">Loading historical incident from Firebase…</p>
      </div>
    );
  }

  if (!incidentId && loading && !summary && !error) {
    return (
      <div className="flex items-center justify-center h-screen bg-kairos-bg text-kairos-blue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current" />
      </div>
    );
  }

  if (error && !incidentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-kairos-bg text-white flex-col gap-4">
        <p className="text-kairos-red font-medium">{error}</p>
        <p className="text-kairos-muted text-sm">Ensure the backend is running: uvicorn main:app --port 8001</p>
        <button onClick={fetchAllData} className="px-4 py-2 bg-kairos-blue rounded-lg text-black font-medium">Retry</button>
      </div>
    );
  }

  if (historicalError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-kairos-bg text-kairos-red gap-4">
        <p className="text-lg font-semibold">{historicalError}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-lg bg-kairos-blue/10 border border-kairos-blue/30 text-kairos-blue text-sm hover:bg-kairos-blue/20 transition-all"
        >
          ← Return to Live Dashboard
        </button>
      </div>
    );
  }

  // ── Resolve props (historical vs. live) ────────────────────────────────────
  const isHistorical = !!historicalIncident;
  const displaySummary = isHistorical
    ? mapMetricsToSummary(historicalIncident.metricsSnapshot)
    : summary;
  const displayTelemetry = isHistorical
    ? mapMetricsToTelemetry(historicalIncident)
    : telemetry;
  const displayGraphData = isHistorical
    ? { nodes: [], links: [] }
    : graphData;
  const displayHypotheses = isHistorical
    ? mapAiAnalysisToHypotheses(historicalIncident.aiAnalysis)
    : hypotheses;
  const displayRootCause = isHistorical
    ? mapAiAnalysisToRootCause(historicalIncident.aiAnalysis)
    : rootCause;
  const displayTimeline = isHistorical
    ? mapTimelineEvents(historicalIncident.timeline)
    : timeline;

  return (
    <div className="flex min-h-screen bg-kairos-bg text-white overflow-hidden font-sans">
      <main className="flex-1 overflow-y-auto h-full p-0 py-6">
        <div className="max-w-[1600px] mx-auto space-y-6 px-6">

          {/* Historical Banner */}
          {isHistorical && (
            <HistoricalBanner
              incident={historicalIncident}
              onBackToLive={() => navigate('/dashboard')}
            />
          )}

          {/* Top Header with Action */}
          <section className="flex items-center justify-between gap-4 border-b border-white/5 pb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-kairos-blue">●</span>
              {isHistorical ? 'Historical Snapshot' : 'Live Incident Overview'}
            </h2>
            {!isHistorical && (
              <div className="flex items-center gap-3">
                <button
                  onClick={resetSystem}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-kairos-muted font-medium hover:bg-white/10 hover:text-white transition-all group"
                  title="Reset scenario and telemetry"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                  <span>Reset System</span>
                </button>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-kairos-blue/10 border border-kairos-blue/30 rounded-lg text-kairos-blue font-medium hover:bg-kairos-blue/20 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] group"
                >
                  <Zap size={16} className="group-hover:animate-pulse" />
                  <span>Inject Incident</span>
                </button>
              </div>
            )}
          </section>

          {/* Top Stats Overview */}
          <section>
            <IncidentOverview data={displaySummary} />
          </section>

          {/* Main Grid: Graph (Large) + Timeline */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[500px] relative z-0 mb-6">
            <div className="lg:col-span-8 h-[500px] lg:h-full">
              <ServiceGraph data={displayGraphData} />
            </div>
            <div className="lg:col-span-4 h-full flex flex-col overflow-hidden">
              <IncidentTimeline events={displayTimeline} />
            </div>
          </section>

          {/* Secondary Grid: Hypotheses, RCA, Telemetry */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-20 pb-12">
            <HypothesisBoard hypotheses={displayHypotheses} />
            <RootCausePanel data={displayRootCause} />
            <div className="lg:col-span-2">
              <TelemetryTable data={displayTelemetry} />
            </div>
          </section>
        </div>
      </main>

      <InjectIncidentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        loading={injecting}
        currentTelemetry={telemetry}
        onInject={async (service, metrics) => {
          setInjecting(true);
          try {
            await injectIncident(service, metrics);
            setIsDrawerOpen(false);
          } catch (err) {
            // Error is handled by store
          } finally {
            setInjecting(false);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
