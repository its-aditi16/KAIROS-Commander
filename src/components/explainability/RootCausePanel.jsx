import React from 'react';
import { Microscope, BrainCircuit } from 'lucide-react';
import ShapChart from './ShapChart';

const RootCausePanel = ({ data }) => {
  if (!data) return <div className="glass-panel h-64 animate-pulse"></div>;

  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-kairos-blue/5 rounded-full blur-3xl" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-kairos-blue to-purple-600 rounded-lg text-white shadow-lg shadow-kairos-blue/20">
          <BrainCircuit size={20} />
        </div>
        <h3 className="font-semibold text-white tracking-wide">Root Cause Analysis</h3>
      </div>

      <div className="mb-6">
         <div className="flex flex-wrap items-end gap-3 mb-2">
            <span className="text-kairos-muted text-sm">Top Suspect:</span>
            <span className="text-xl font-bold text-white text-glow">{data.topPrediction}</span>
            <span className="px-2 py-0.5 rounded bg-kairos-red/20 text-kairos-red text-xs font-bold border border-kairos-red/20">
              {data.confidence}% Confidence
            </span>
         </div>
         <p className="text-sm text-kairos-muted leading-relaxed bg-white/5 p-4 rounded-lg border-l-2 border-kairos-blue">
           {data.explanation}
         </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-kairos-muted uppercase tracking-wider mb-2">Feature Importance (SHAP)</h4>
        <ShapChart data={data.shapValues} />
      </div>
    </div>
  );
};

export default RootCausePanel;
