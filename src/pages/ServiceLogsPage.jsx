import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Terminal, ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { getServiceLogsFromFirebase } from '../services/incidentService';

const getLevelIcon = (level) => {
  switch (level) {
    case 'ERROR': return <ShieldAlert size={14} className="text-red-400 shrink-0" />;
    case 'WARN':  return <AlertTriangle size={14} className="text-yellow-400 shrink-0" />;
    default:      return <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />;
  }
};

const LogRow = ({ log, isFirstError, rowRef }) => (
  <motion.div
    ref={rowRef}
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-all font-mono text-sm relative ${
      log.isError
        ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
        : 'bg-white/3 border-transparent hover:bg-white/5'
    }`}
  >
    {/* Timestamp */}
    <span className="text-white/25 shrink-0 pt-0.5 select-none text-xs tabular-nums">
      {log.timestamp}
    </span>

    {/* Level badge */}
    <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
      log.isError ? 'bg-red-500/20 text-red-400' :
      log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-emerald-500/15 text-emerald-400'
    }`}>
      {getLevelIcon(log.level)}
      {log.level}
    </span>

    {/* Message */}
    <p className={`flex-1 leading-relaxed break-all ${log.isError ? 'text-red-300' : 'text-white/70'}`}>
      {log.message}
    </p>

    {/* File badge — shown for frontend file-specific errors */}
    {log.isError && log.file && (
      <span className="shrink-0 flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400 whitespace-nowrap">
        📄 {log.file}
      </span>
    )}

    {/* Root Cause badge — only on first error */}
    {isFirstError && (
      <span className="shrink-0 flex items-center gap-1 text-[10px] bg-red-500 text-white font-extrabold px-2 py-0.5 rounded-md animate-pulse uppercase tracking-widest">
        ⚠ Root Cause
      </span>
    )}
  </motion.div>
);

const ServiceLogsPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstErrorRef = useRef(null);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    setError(null);
    getServiceLogsFromFirebase(serviceId)
      .then((data) => {
        if (data.length === 0) {
          setError('No logs found for this service yet. Try injecting an incident first.');
        } else {
          setLogs(data);
        }
      })
      .catch(() => setError('Failed to fetch logs from Firebase.'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  // Auto-scroll to first error after logs load
  useEffect(() => {
    if (!loading && firstErrorRef.current) {
      setTimeout(() => {
        firstErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }, [loading]);

  const hasErrors = logs.some((l) => l.isError);
  let firstErrorSeen = false;

  const displayName = serviceId?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '';

  return (
    <div className="min-h-screen bg-kairos-bg text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-kairos-bg/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-kairos-blue" />
            <h1 className="text-lg font-bold">{displayName}</h1>
            <span className="text-white/40 text-sm font-normal">— Metric Logs</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full">
              <ShieldAlert size={13} />
              {logs.filter(l => l.isError).length} Error{logs.filter(l => l.isError).length !== 1 ? 's' : ''} Detected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={13} />
              All Systems Healthy
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 space-y-2">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/40">
            <Loader2 size={28} className="animate-spin text-kairos-blue" />
            <p className="text-sm">Fetching logs from Firebase...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/40">
            <Terminal size={28} />
            <p className="text-sm text-center max-w-sm">{error}</p>
            <button
              onClick={() => navigate('/dependency-graph')}
              className="text-xs text-kairos-blue hover:underline"
            >
              Go to Dependency Graph
            </button>
          </div>
        )}

        {!loading && !error && logs.map((log, idx) => {
          const isFirstError = log.isError && !firstErrorSeen;
          if (isFirstError) firstErrorSeen = true;
          return (
            <LogRow
              key={idx}
              log={log}
              isFirstError={isFirstError}
              rowRef={isFirstError ? firstErrorRef : null}
            />
          );
        })}

        {!loading && !error && (
          <div className="pt-6 pb-4 text-center">
            <span className="text-[10px] text-white/20 uppercase tracking-widest">
              — End of log stream — {logs.length} entries
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLogsPage;
