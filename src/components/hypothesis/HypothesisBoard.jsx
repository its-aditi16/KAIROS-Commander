import React from 'react';
import { Target, Zap } from 'lucide-react';

const HypothesisCard = ({ hypothesis }) => {
  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between hover:border-kairos-blue/30 transition-all group">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold text-kairos-muted uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {hypothesis.id}
          </span>
          <span className="text-kairos-blue font-mono font-bold text-xl">{hypothesis.likelihood}%</span>
        </div>

        <h4 className="text-white font-semibold mb-1 group-hover:text-kairos-blue transition-colors">
          {hypothesis.service}
        </h4>

        <p className="text-xs text-kairos-muted mb-4 leading-relaxed">
          {hypothesis.reason}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] text-kairos-muted uppercase tracking-tighter">
          <span>Confidence</span>
          <span>{(hypothesis.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-kairos-blue to-purple-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${hypothesis.likelihood}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const HypothesisBoard = ({ hypotheses }) => {
  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-2 bg-kairos-blue/10 rounded-lg text-kairos-blue">
          <Zap size={20} fill="currentColor" className="opacity-80" />
        </div>
        <h3 className="font-semibold text-white tracking-wide uppercase text-sm">AI Hypotheses</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hypotheses && hypotheses.length > 0 ? (
          hypotheses.map(h => (
            <div key={h.id} className="h-full">
              <HypothesisCard hypothesis={h} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-kairos-muted border border-dashed border-white/5 rounded-xl">
            Waiting for AI analysis engine to detect patterns...
          </div>
        )}
      </div>
    </div>
  );
};

export default HypothesisBoard;
