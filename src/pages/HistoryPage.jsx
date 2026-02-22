import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, AlertCircle, AlertTriangle, Info, PlusCircle, Loader2, InboxIcon } from 'lucide-react';
import { subscribeToIncidents, createIncident } from '../services/incidentService';

// ─── Severity Badge ───────────────────────────────────────────────────────────
const SeverityBadge = ({ severity = '' }) => {
  const s = severity.toUpperCase();
  const styles = {
    CRITICAL: 'text-kairos-red bg-kairos-red/10 border-kairos-red/30',
    WARNING:  'text-kairos-orange bg-kairos-orange/10 border-kairos-orange/30',
    MINOR:    'text-kairos-blue bg-kairos-blue/10 border-kairos-blue/30',
  };
  const icons = {
    CRITICAL: <AlertCircle size={11} />,
    WARNING:  <AlertTriangle size={11} />,
    MINOR:    <Info size={11} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
        styles[s] || 'text-kairos-blue bg-kairos-blue/10 border-kairos-blue/30'
      }`}
    >
      {icons[s] || <Info size={11} />}
      {s}
    </span>
  );
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const isResolved = status === 'Resolved';
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${isResolved ? 'text-kairos-green' : 'text-kairos-orange'}`}>
      {isResolved
        ? <CheckCircle size={15} />
        : <span className="w-2 h-2 rounded-full bg-kairos-orange animate-pulse" />
      }
      {status}
    </div>
  );
};

// ─── Duration Helper ──────────────────────────────────────────────────────────
const formatDuration = (mins) => {
  if (!mins && mins !== 0) return '—';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

// ─── Date Helper ─────────────────────────────────────────────────────────────
const formatDate = (ts) => {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="glass-card p-6 animate-pulse flex flex-col md:flex-row gap-4">
    <div className="flex-1 space-y-3">
      <div className="flex gap-3">
        <div className="h-5 w-16 bg-white/10 rounded" />
        <div className="h-5 w-20 bg-white/10 rounded" />
      </div>
      <div className="h-5 w-64 bg-white/10 rounded" />
    </div>
    <div className="flex gap-6">
      <div className="h-5 w-24 bg-white/10 rounded" />
      <div className="h-5 w-16 bg-white/10 rounded" />
      <div className="h-5 w-20 bg-white/10 rounded" />
    </div>
  </div>
);

// ─── Demo Incident Templates ──────────────────────────────────────────────────
const DEMO_INCIDENTS = [
  {
    title: 'High Latency in Payment Service',
    severity: 'CRITICAL',
    metricsSnapshot: { cpuUsage: 78, memoryUsage: 64, errorRate: 12.5, requestLatency: 320, activeUsers: 1240 },
    timeline: [
      { time: '12:03', event: 'Payment latency spiked above threshold', type: 'critical' },
      { time: '12:07', event: 'Auth retries increased', type: 'warning' },
      { time: '12:12', event: 'AI Analysis started', type: 'info' },
      { time: '12:15', event: 'Root cause identified: DB pool exhaustion', type: 'success' },
    ],
    aiAnalysis: {
      rootCause: 'Database connection pool exhaustion',
      impact: 'Checkout delays for 35% of users',
      recommendation: 'Increase pool size to 50 and enable circuit breaker pattern',
    },
  },
  {
    title: 'Database Read Replica Lag',
    severity: 'WARNING',
    metricsSnapshot: { cpuUsage: 45, memoryUsage: 71, errorRate: 3.2, requestLatency: 180, activeUsers: 890 },
    timeline: [
      { time: '09:10', event: 'Replica lag exceeded 5 seconds', type: 'warning' },
      { time: '09:18', event: 'Read queries rerouted to primary', type: 'info' },
    ],
    aiAnalysis: {
      rootCause: 'Network partition between primary and replica',
      impact: 'Stale reads for ~12% of queries',
      recommendation: 'Verify network stability and increase replication timeout',
    },
  },
  {
    title: '3rd Party API Timeout',
    severity: 'MINOR',
    metricsSnapshot: { cpuUsage: 22, memoryUsage: 38, errorRate: 1.1, requestLatency: 95, activeUsers: 420 },
    timeline: [
      { time: '15:30', event: 'External API response time exceeded 3s', type: 'warning' },
      { time: '15:35', event: 'Fallback cache activated', type: 'success' },
    ],
    aiAnalysis: {
      rootCause: '3rd party vendor experiencing degraded performance',
      impact: 'Minor UX delay on checkout flow',
      recommendation: 'Enable retry with exponential backoff; evaluate alternative vendors',
    },
  },
];

let demoIndex = 0;

// ─── Main Component ───────────────────────────────────────────────────────────
const HistoryPage = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Real-time Firestore listener
  useEffect(() => {
    const unsubscribe = subscribeToIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Seed a demo incident into Firestore
  const handleCreateDemo = async () => {
    setSeeding(true);
    try {
      const template = DEMO_INCIDENTS[demoIndex % DEMO_INCIDENTS.length];
      demoIndex++;
      await createIncident(template);
    } catch (err) {
      console.error('Failed to create demo incident:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Navigate to dashboard with stored incident data
  const handleCardClick = (incident) => {
    navigate(`/dashboard?incidentId=${incident.id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Incident History</h2>
          <p className="text-kairos-muted text-sm mt-1">
            Real-time feed from Firebase · {incidents.length} incident{incidents.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        {/* Create Demo Incident Button */}
        <button
          onClick={handleCreateDemo}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kairos-blue/10 border border-kairos-blue/30 text-kairos-blue text-sm font-medium hover:bg-kairos-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {seeding
            ? <Loader2 size={15} className="animate-spin" />
            : <PlusCircle size={15} />
          }
          {seeding ? 'Creating...' : 'Create Test Incident'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : incidents.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 rounded-full bg-white/5 mb-4">
            <InboxIcon size={32} className="text-kairos-muted" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No incidents recorded yet</h3>
          <p className="text-kairos-muted text-sm max-w-sm">
            Incidents will appear here automatically when the AI detects anomalies.
            Use the button above to seed a test incident.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => handleCardClick(incident)}
              className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-kairos-blue/30 transition-all cursor-pointer group"
            >
              {/* Left: Badge + Title */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <SeverityBadge severity={incident.severity} />
                  <span className="text-kairos-muted text-sm font-mono">{incident.incidentId}</span>
                </div>
                <h3 className="text-lg font-medium text-white group-hover:text-kairos-blue transition-colors">
                  {incident.title}
                </h3>
                {incident.aiAnalysis?.rootCause && (
                  <p className="text-kairos-muted text-xs mt-1 truncate max-w-md">
                    Root cause: {incident.aiAnalysis.rootCause}
                  </p>
                )}
              </div>

              {/* Right: Meta */}
              <div className="flex flex-wrap items-center gap-5 text-kairos-muted text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={15} />
                  <span>{formatDate(incident.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} />
                  <span>{formatDuration(incident.durationMinutes)}</span>
                </div>
                <StatusPill status={incident.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
