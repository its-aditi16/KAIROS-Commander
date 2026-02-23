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

      <div className="mb-6">
        <h4 className="text-xs font-semibold text-kairos-muted uppercase tracking-wider mb-2">Feature Importance (SHAP)</h4>
        <ShapChart data={data.shapValues} />
      </div>

      {data.blastRadius && (
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-semibold text-kairos-muted uppercase tracking-wider">Blast Radius Estimation</h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${data.blastRadius.severity_level === 'Critical' ? 'bg-kairos-red/20 text-kairos-red border-kairos-red/20' :
                data.blastRadius.severity_level === 'High' ? 'bg-kairos-orange/20 text-kairos-orange border-kairos-orange/20' :
                  data.blastRadius.severity_level === 'Medium' ? 'bg-kairos-yellow/20 text-kairos-yellow border-kairos-yellow/20' :
                    'bg-kairos-green/20 text-kairos-green border-kairos-green/20'
              }`}>
              {data.blastRadius.severity_level} Severity
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-kairos-muted uppercase">Blast Score</span>
              <span className="text-lg font-bold text-white">{data.blastRadius.blast_radius_score}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-kairos-muted uppercase">Impacted Services</span>
              <span className="text-lg font-bold text-white">{data.blastRadius.total_services_impacted}</span>
            </div>
          </div>

          <p className="text-[11px] text-kairos-text leading-relaxed italic opacity-80">
            "{data.blastRadius.explanation}"
          </p>
        </div>
      )}

      {data.similarMatches && data.similarMatches.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-kairos-muted uppercase tracking-wider mb-3">Historical Similarity</h4>
          <div className="space-y-3">
            {data.similarMatches.map((match) => (
              <div key={match.incident_id} className="flex items-center justify-between group bg-white/[0.02] hover:bg-white/[0.05] p-2 rounded-lg transition-all border border-white/5 hover:border-kairos-blue/20">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-kairos-blue">{match.similarity}%</span>
                    <div className="w-8 h-1 bg-kairos-blue/20 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-kairos-blue" style={{ width: `${match.similarity}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-white/70 group-hover:text-white transition-colors">
                    similar to: <span className="text-white font-medium">{match.name}</span>
                  </span>
                </div>
                <span className="text-[10px] text-kairos-muted font-mono">{match.incident_id}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RootCausePanel;
