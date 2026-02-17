import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Activity, GitGraph, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-kairos-bg text-white overflow-hidden relative selection:bg-kairos-blue/30">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-kairos-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar (Simple) */}
      <nav className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-tr from-kairos-blue to-purple-600 flex items-center justify-center shadow-lg shadow-kairos-blue/20">
            <ShieldAlert size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide">KAIROS<span className="text-kairos-blue">.AI</span></span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 text-sm font-medium text-white hover:text-kairos-blue transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="glass-panel px-4 py-1 mb-8 rounded-full border border-kairos-blue/20 inline-flex items-center gap-2 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-kairos-red animate-pulse"></span>
          <span className="text-xs font-mono text-kairos-blue tracking-wider">SYSTEM ONLINE // V2.4.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-tight">
          Resolve Incidents <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-kairos-blue to-purple-500">
            Before They Escalate
          </span>
        </h1>

        <p className="text-lg md:text-xl text-kairos-muted max-w-2xl mb-10 leading-relaxed">
          The AI-powered command center for modern microservices. 
          Automated root cause analysis, predictive risk scoring, and 
          interactive dependency mapping in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 bg-kairos-blue text-kairos-bg font-bold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-300 flex items-center gap-3"
          >
            Launch Commander
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
          </button>
          
          <button className="px-8 py-4 glass-card text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center gap-3">
             View Documentation
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {[
            { icon: Activity, title: "Real-time Telemetry", desc: "Live ingestion of metrics, logs, and traces with sub-second latency." },
            { icon: GitGraph, title: "Dependency Mapping", desc: "Auto-discovery of service relationships and bottleneck visualization." },
            { icon: Zap, title: "AI Root Cause", desc: "Probabilistic models to pinpoint the exact source of failure instantly." }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-6 text-left hover:border-kairos-blue/30 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="text-kairos-blue" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-kairos-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
