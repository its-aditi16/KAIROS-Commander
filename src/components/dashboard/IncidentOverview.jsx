import React from 'react';
import { AlertCircle, Activity, Server, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const StatCard = ({ icon: Icon, label, value, trend, color }) => {
  const colorStyles = {
    red: "text-kairos-red bg-kairos-red/10 border-kairos-red/20 shadow-[0_0_15px_rgba(255,42,109,0.15)]",
    orange: "text-kairos-orange bg-kairos-orange/10 border-kairos-orange/20 shadow-[0_0_15px_rgba(255,159,28,0.15)]",
    blue: "text-kairos-blue bg-kairos-blue/10 border-kairos-blue/20 shadow-[0_0_15px_rgba(0,240,255,0.15)]",
    green: "text-kairos-green bg-kairos-green/10 border-kairos-green/20 shadow-[0_0_15px_rgba(5,213,170,0.15)]",
  };

  return (
    <div className="glass-panel p-4 flex items-center justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500">
        <Icon size={80} />
      </div>
      
      <div>
        <h3 className="text-kairos-muted text-sm font-medium uppercase tracking-wide mb-1">{label}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white text-glow">{value}</span>
          {trend && <span className="text-xs text-kairos-muted">{trend}</span>}
        </div>
      </div>

      <div className={clsx("p-3 rounded-xl border backdrop-blur-sm", colorStyles[color])}>
        <Icon size={24} />
      </div>
    </div>
  );
};

const IncidentOverview = ({ data }) => {
  if (!data) return <div className="animate-pulse h-24 bg-white/5 rounded-xl"></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <StatCard 
        icon={AlertCircle} 
        label="Critical Alerts" 
        value={data.criticalAlerts} 
        color="red"
      />
      <StatCard 
        icon={Activity} 
        label="High Error Rate" 
        value={data.highErrors} 
        trend="+12% vs 1h ago"
        color="orange"
      />
      <StatCard 
        icon={Server} 
        label="Affected Services" 
        value={data.affectedServices} 
        color="blue"
      />
      <StatCard 
        icon={Clock} 
        label="MTTR Estimate" 
        value={data.mttrEstimate} 
        color="green"
      />
    </div>
  );
};

export default IncidentOverview;
