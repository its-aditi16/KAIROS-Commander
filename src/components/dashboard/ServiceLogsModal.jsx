import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const ServiceLogsModal = ({ isOpen, onClose, serviceId, logs, loading }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-kairos-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-kairos-blue/10 text-kairos-blue">
                <Terminal size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white capitalize">
                  {serviceId?.replace(/-/g, ' ')}
                </h3>
                <p className="text-sm text-white/50">Service Metric Logs & Events</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0a0a0f] font-mono text-sm custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kairos-blue"></div>
                <p className="text-kairos-blue animate-pulse">Fetching logs from system...</p>
              </div>
            ) : logs && logs.length > 0 ? (
              logs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`p-3 rounded-lg flex items-start gap-4 border ${
                    log.isError 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-white/5 border-transparent text-white/70'
                  }`}
                >
                  <span className="text-white/30 shrink-0 select-none">[{log.timestamp}]</span>
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                        log.level === 'ERROR' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.level}
                      </span>
                      {log.isError && (
                        <span className="flex items-center gap-1 text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded animate-pulse">
                          <ShieldAlert size={12} />
                          ROOT CAUSE
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">{log.message}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 text-white/30">
                No logs generated for this service.
              </div>
            )}
            <div className="pt-4 text-center">
              <span className="text-[10px] text-white/20 uppercase tracking-widest">End of stream</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/5 text-[10px] text-white/30 flex justify-between">
            <span>KAIROS OBSERVE v1.0.4</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Real-time monitoring active
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceLogsModal;
