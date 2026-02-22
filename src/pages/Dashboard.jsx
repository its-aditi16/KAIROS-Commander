import React, { useEffect } from 'react';
import { useIncidentStore } from '../store/incidentStore';

import IncidentOverview from '../components/dashboard/IncidentOverview';
import ServiceGraph from '../components/graph/ServiceGraph';
import TelemetryTable from '../components/dashboard/TelemetryTable';
import HypothesisBoard from '../components/hypothesis/HypothesisBoard';
import RiskRanking from '../components/dashboard/RiskRanking';
import RootCausePanel from '../components/explainability/RootCausePanel';
import IncidentTimeline from '../components/timeline/IncidentTimeline';
import InjectIncidentDrawer from '../components/dashboard/InjectIncidentDrawer';
import { Zap, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const {
    loading,
    error,
    summary,
    telemetry,
    graphData,
    hypotheses,
    riskRanking,
    rootCause,
    timeline,
    fetchAllData,
    injectIncident,
    resetSystem
  } = useIncidentStore();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [injecting, setInjecting] = React.useState(false);

  useEffect(() => {
    fetchAllData();
    // Optional polling could be added here
  }, [fetchAllData]);

  if (loading && !summary && !error) {
    return (
      <div className="flex items-center justify-center h-screen bg-kairos-bg text-kairos-blue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-kairos-bg text-white flex-col gap-4">
        <p className="text-kairos-red font-medium">{error}</p>
        <p className="text-kairos-muted text-sm">Ensure the backend is running: uvicorn main:app --port 8001</p>
        <button onClick={fetchAllData} className="px-4 py-2 bg-kairos-blue rounded-lg text-black font-medium">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-kairos-bg text-white overflow-hidden font-sans">
      {/* Sidebar removed */}

      <main className="flex-1 overflow-y-auto h-full p-0">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* Top Header with Action */}
          <section className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-kairos-blue">●</span> Incident Overview
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={resetSystem}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-kairos-muted font-medium hover:bg-white/10 hover:text-white transition-all group"
                title="Reset scenario and telemetry"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                <span>Reset System</span>
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-kairos-blue/10 border border-kairos-blue/30 rounded-lg text-kairos-blue font-medium hover:bg-kairos-blue/20 transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] group"
              >
                <Zap size={16} className="group-hover:animate-pulse" />
                <span>Inject Incident</span>
              </button>
            </div>
          </section>

          <section>
            <IncidentOverview data={summary} />
          </section>

          {/* Main Grid: Graph (Large) + hypotheses/Risk */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[500px] relative z-0 mb-6">
            <div className="lg:col-span-8 h-[500px] lg:h-full">
              <ServiceGraph data={graphData} />
            </div>
            <div className="lg:col-span-4 h-full flex flex-col gap-6">
              <div className="flex-1 overflow-hidden h-full">
                <RiskRanking ranking={riskRanking} />
              </div>
            </div>
          </section>

          {/* Secondary Grid: Telemetry, RCA, Timeline */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-20">
            <div className="lg:col-span-1 h-96">
              <IncidentTimeline events={timeline} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <HypothesisBoard hypotheses={hypotheses} />
              <RootCausePanel data={rootCause} />
              <TelemetryTable data={telemetry} />
            </div>
          </section>

        </div>
      </main>

      <InjectIncidentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        loading={injecting}
        currentTelemetry={telemetry}
        onInject={async (service, metrics) => {
          setInjecting(true);
          try {
            await injectIncident(service, metrics);
            setIsDrawerOpen(false);
          } catch (err) {
            // Error is handled by store
          } finally {
            setInjecting(false);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
