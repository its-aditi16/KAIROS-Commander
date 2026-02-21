import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import DependencyGraphPage from './pages/DependencyGraphPage';
import Layout from './components/layout/Layout';
import PublicLayout from './components/layout/PublicLayout';
import HypothesisPage from './pages/HypothesisPage';
import HistoryPage from './pages/HistoryPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        {/* Wrap dashboard and other internal pages with Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dependency-graph" element={<DependencyGraphPage />} />
          <Route path="/hypotheses" element={<HypothesisPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
