import React, { useState } from 'react';
import { Clock, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const TimelineItem = ({ item, isLast }) => {
  const [expanded, setExpanded] = useState(false);

  const icons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
  };

  const colors = {
    critical: "text-kairos-red border-kairos-red bg-kairos-red/10",
    warning: "text-kairos-orange border-kairos-orange bg-kairos-orange/10",
    info: "text-kairos-blue border-kairos-blue bg-kairos-blue/10",
    success: "text-kairos-green border-kairos-green bg-kairos-green/10",
  };

  const Icon = icons[item.type] || Info;

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-white/10" />
      )}

      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 bg-kairos-bg flex items-center justify-center z-10 ${colors[item.type].split(' ')[0]} ${colors[item.type].split(' ')[1]}`}>
        <Icon size={12} />
      </div>

      <div
        className="glass-card p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-mono text-kairos-muted">{item.time}</span>
        </div>
        <p className="text-sm font-medium text-white mt-1">{item.event}</p>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-kairos-muted leading-relaxed">
            Detailed logs and stack traces would appear here for deeper investigation.
          </div>
        )}
      </div>
    </div>
  );
};

const IncidentTimeline = ({ events }) => {
  return (
    <div className="glass-panel p-6 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-2 bg-white/10 rounded-lg text-white">
          <Clock size={20} />
        </div>
        <h3 className="font-semibold text-white tracking-wide">Incident Timeline</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        {events && events.map((event, index) => (
          <TimelineItem
            key={event.id}
            item={event}
            isLast={index === events.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default IncidentTimeline;
