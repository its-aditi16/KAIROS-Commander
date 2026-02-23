import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import DependencyGraphPage from './pages/DependencyGraphPage';
import Layout from './components/layout/Layout';
import PublicLayout from './components/layout/PublicLayout';
import HistoryPage from './pages/HistoryPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import DocumentationPage from './pages/DocumentationPage';
import ServiceLogsPage from './pages/ServiceLogsPage';

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
          <Route path="/docs" element={<DocumentationPage />} />
        </Route>
        {/* Wrap dashboard and other internal pages with Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dependency-graph" element={<DependencyGraphPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        {/* Full-screen log viewer — no Layout wrapper */}
        <Route path="/logs/:serviceId" element={<ServiceLogsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
