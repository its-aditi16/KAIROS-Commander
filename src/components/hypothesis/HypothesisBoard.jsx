import React from 'react';
import { Target, Zap } from 'lucide-react';

const HypothesisCard = ({ hypothesis }) => {
  return (
    <div className="glass-card p-1.5 min-h-[120px] border-l-4 border-l-transparent hover:border-l-kairos-blue group">
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-bold text-kairos-muted uppercase tracking-wider bg-white/5 px-2 py-1 rounded">
          {hypothesis.id}
        </span>
        <span className="text-kairos-blue font-bold text-lg">{hypothesis.likelihood}%</span>
      </div>
      
      <h4 className="text-white font-medium mb-0.5 group-hover:text-kairos-blue transition-colors">
        {hypothesis.service}
      </h4>
      
      <p className="text-sm text-kairos-muted mb-0.5">
        {hypothesis.reason}
      </p>

      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-kairos-blue to-purple-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${hypothesis.likelihood}%` }}
        />
      </div>
    </div>
  );
};

const HypothesisBoard = ({ hypotheses }) => {
  return (
    <div className="glass-panel p-2 ">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-kairos-blue/10 rounded-lg text-kairos-blue">
          <Zap size={20} />
        </div>
        <h3 className="font-semibold text-white tracking-wide">AI Hypotheses</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {hypotheses && hypotheses.length > 0 ? (
          hypotheses.map(h => <HypothesisCard key={h.id} hypothesis={h} />)
        ) : (
           <div className="text-center py-8 text-kairos-muted">Waiting for analysis...</div>
        )}
      </div>
    </div>
  );
};

export default HypothesisBoard;
