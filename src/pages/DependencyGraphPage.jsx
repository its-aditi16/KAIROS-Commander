import React, { useEffect } from 'react';
import { useIncidentStore } from '../store/incidentStore';
import ServiceGraph from '../components/graph/ServiceGraph';

const DependencyGraphPage = () => {
  const { 
    loading, 
    graphData, 
    fetchAllData 
  } = useIncidentStore();

  useEffect(() => {
    if (!graphData) {
        fetchAllData();
    }
  }, [fetchAllData, graphData]);

  if (loading && !graphData) {
    return (
      <div className="flex items-center justify-center h-screen bg-kairos-bg text-kairos-blue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <span className="text-kairos-blue">●</span> Dependency Graph
        </h2>
        <div className="flex-1 min-h-[600px] bg-kairos-surface/30 rounded-xl border border-white/10 overflow-hidden relative">
              <ServiceGraph data={graphData} />
        </div>
    </div>
  );
};

export default DependencyGraphPage;
