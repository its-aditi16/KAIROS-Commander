import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

const StatusBadge = ({ status }) => {
  const styles = {
    healthy: "bg-kairos-green/20 text-kairos-green border-kairos-green/20",
    warning: "bg-kairos-orange/20 text-kairos-orange border-kairos-orange/20",
    critical: "bg-kairos-red/20 text-kairos-red border-kairos-red/20",
  };

  const icons = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
  };

  const Icon = icons[status] || Activity;

  return (
    <span className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider", styles[status])}>
      <Icon size={12} />
      {status}
    </span>
  );
};

const TelemetryTable = ({ data }) => {
  if (!data || data.length === 0) return <div className="glass-panel h-64 flex items-center justify-center text-kairos-muted">No Telemetry Data</div>;

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-white tracking-wide">Live Telemetry</h3>
        <span className="text-xs text-kairos-blue animate-pulse">● Live Updates</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
           <thead className="bg-white/5 text-kairos-muted font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Service Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Error Rate</th>
              <th className="px-6 py-3">Latency</th>
              <th className="px-6 py-3">CPU Usage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((service) => (
              <tr key={service.id} className="hover:bg-white/5 transition-colors duration-150 group">
                <td className="px-6 py-4 font-medium text-white group-hover:text-kairos-blue transition-colors">
                  {service.name}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={service.status} />
                </td>
                <td className={clsx("px-6 py-4 font-mono", service.errorRate > 1 ? "text-kairos-red" : "text-kairos-muted")}>
                  {service.errorRate}%
                </td>
                <td className="px-6 py-4 font-mono text-kairos-muted">
                  {service.latency}
                </td>
                <td className="px-6 py-4 font-mono text-kairos-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={clsx("h-full rounded-full", parseInt(service.cpu) > 80 ? "bg-kairos-red" : "bg-kairos-blue")} 
                        style={{ width: service.cpu }}
                      />
                    </div>
                    {service.cpu}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TelemetryTable;
