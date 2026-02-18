import React, { useEffect } from 'react';
import { useIncidentStore } from '../store/incidentStore';
import HypothesisBoard from '../components/hypothesis/HypothesisBoard';

const HypothesisPage = () => {
  const { hypotheses, fetchAllData, loading } = useIncidentStore();

  useEffect(() => {
    // Ensure we have data
    if (hypotheses.length === 0 && !loading) {
      fetchAllData();
    }
  }, [fetchAllData, hypotheses.length, loading]);

  if (loading && hypotheses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kairos-blue"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)]">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-wide">Hypothesis Analysis</h2>
      <HypothesisBoard hypotheses={hypotheses} />
    </div>
  );
};

export default HypothesisPage;
