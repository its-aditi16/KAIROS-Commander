import React, { useEffect } from 'react';
import { useIncidentStore } from '../store/incidentStore';
import ServiceGraph from '../components/graph/ServiceGraph';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

const SERVICES = [
  { id: 'frontend',        label: 'Frontend' },
  { id: 'auth-service',    label: 'Auth Service' },
  { id: 'payment-service', label: 'Payment Service' },
  { id: 'database',        label: 'Database' },
];

const DependencyGraphPage = () => {
  const navigate = useNavigate();
  const { loading, graphData, fetchAllData } = useIncidentStore();

  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) {
      fetchAllData();
    }
  }, [fetchAllData, graphData]);

  const riskMap = {};
  if (graphData?.nodes) {
    graphData.nodes.forEach(n => { riskMap[n.id] = n.risk ?? 0; });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>

      {/* Title */}
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#00f0ff' }}>●</span> Dependency Graph
      </h2>

      {/* Graph */}
      <div style={{ height: '480px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
        {loading && (!graphData || graphData.nodes.length === 0) ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00f0ff' }}>
            Loading...
          </div>
        ) : (
          <ServiceGraph data={graphData} onNodeClick={(id) => navigate(`/logs/${id}`)} />
        )}
      </div>

      {/* Service Log Buttons */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={16} color="#00f0ff" />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Click a service below to view its full metric logs
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {SERVICES.map(({ id, label }) => {
            const risk = riskMap[id] ?? 0;
            const isError = risk > 0.5;
            return (
              <button
                key={id}
                onClick={() => navigate(`/logs/${id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: isError ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.12)',
                  background: isError ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  color: isError ? '#fca5a5' : 'rgba(255,255,255,0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.15s',
                  boxShadow: isError ? '0 0 14px rgba(239,68,68,0.2)' : 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isError
                    ? <ShieldAlert size={16} color="#f87171" />
                    : <CheckCircle2 size={16} color="#34d399" />}
                  {label}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: isError ? 'rgba(239,68,68,0.25)' : 'rgba(52,211,153,0.15)',
                  color: isError ? '#ef4444' : '#34d399',
                  letterSpacing: '0.05em',
                }}>
                  {isError ? 'ERROR' : 'OK'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default DependencyGraphPage;
