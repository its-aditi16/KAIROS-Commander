import React, { useEffect } from 'react';
import { useIncidentStore } from '../store/incidentStore';

import IncidentOverview from '../components/dashboard/IncidentOverview';
import ServiceGraph from '../components/graph/ServiceGraph';
import TelemetryTable from '../components/dashboard/TelemetryTable';
import HypothesisBoard from '../components/hypothesis/HypothesisBoard';
import RiskRanking from '../components/dashboard/RiskRanking';
import RootCausePanel from '../components/explainability/RootCausePanel';
import IncidentTimeline from '../components/timeline/IncidentTimeline';

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
    fetchAllData 
  } = useIncidentStore();

  useEffect(() => {
    fetchAllData();
    // Optional polling could be added here
  }, [fetchAllData]);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-screen bg-kairos-bg text-kairos-blue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-kairos-bg text-white overflow-hidden font-sans">
      {/* Sidebar removed */}
      
      <main className="flex-1 overflow-y-auto h-full p-0">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* Top Stats */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-kairos-blue">●</span> Incident Overview
            </h2>
            <IncidentOverview data={summary} />
          </section>

          {/* Main Grid: Graph (Large) + hypotheses/Risk */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[500px] relative z-0 mb-6">
            <div className="lg:col-span-8 h-[500px] lg:h-full">
              <ServiceGraph data={graphData} />
            </div>
            <div className="lg:col-span-4 h-full flex flex-col gap-6">
              <div className="flex-1 overflow-hidden min-h-[200px]">
                <RiskRanking ranking={riskRanking} />
              </div>
              <div className="flex-1 overflow-hidden min-h-[200px]">
                 <HypothesisBoard hypotheses={hypotheses} />
              </div>
            </div>
          </section>

          {/* Secondary Grid: Telemetry, RCA, Timeline */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-20">
            <div className="lg:col-span-1 h-96">
              <IncidentTimeline events={timeline} />
            </div>
            <div className="lg:col-span-2 space-y-6">
               <RootCausePanel data={rootCause} />
               <TelemetryTable data={telemetry} />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
