import React from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const HistoryPage = () => {
  // Mock data for history/past occurrences
  const historyData = [
    {
      id: 'INC-491',
      title: 'High Latency in Payment Service',
      date: '2023-10-25',
      duration: '45m',
      status: 'Resolved',
      severity: 'Critical'
    },
    {
      id: 'INC-490',
      title: 'Database Read Replica Lag',
      date: '2023-10-22',
      duration: '1h 20m',
      status: 'Resolved',
      severity: 'Warning'
    },
    {
      id: 'INC-489',
      title: '3rd Party API Timeout',
      date: '2023-10-18',
      duration: '15m',
      status: 'Resolved',
      severity: 'Minor'
    },
     {
      id: 'INC-488',
      title: 'Auth Service 500 Errors',
      date: '2023-10-15',
      duration: '30m',
      status: 'Resolved',
      severity: 'Critical'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-kairos-red bg-kairos-red/10 border-kairos-red/20';
      case 'warning': return 'text-kairos-orange bg-kairos-orange/10 border-kairos-orange/20';
      default: return 'text-kairos-blue bg-kairos-blue/10 border-kairos-blue/20';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white tracking-wide">Incident History</h2>
      
      <div className="grid gap-4">
        {historyData.map((incident) => (
          <div 
            key={incident.id} 
            className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-kairos-blue/30 transition-all cursor-pointer group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-kairos-muted text-sm font-mono">{incident.id}</span>
              </div>
              <h3 className="text-lg font-medium text-white group-hover:text-kairos-blue transition-colors">
                {incident.title}
              </h3>
            </div>

            <div className="flex items-center gap-6 text-kairos-muted text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{incident.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{incident.duration}</span>
              </div>
               <div className="flex items-center gap-2 text-kairos-green">
                <CheckCircle size={16} />
                <span>{incident.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
