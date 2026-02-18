import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Activity, GitGraph, Zap } from 'lucide-react';


const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-kairos-bg text-white overflow-hidden relative selection:bg-kairos-blue/30">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-kairos-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 mt-12">
          <div className="glass-panel px-4 py-1 mb-6 rounded-full border border-kairos-blue/20 inline-flex items-center gap-2 animate-fade-in-up">
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

          <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-fade-in-up delay-200">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group relative px-8 py-4 bg-kairos-blue text-kairos-bg font-bold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-300 flex items-center gap-3 active:scale-95"
            >
              Launch Commander
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
            </button>
            
            <button className="px-8 py-4 glass-card text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95">
               View Documentation
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="flex justify-center px-4 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full animate-fade-in-up delay-300">
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
        </div>
      </main>

      {/* Our Team Section */}
      <section id="our-team" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Meet the <span className="text-purple-500">Builders</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="group text-center">
                <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-b from-gray-700 to-gray-900 mb-6 overflow-hidden relative border-2 border-transparent group-hover:border-kairos-blue transition-all">
                  <div className="absolute inset-0 bg-kairos-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Placeholder for team member image */}
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                    TM
                  </div>
                </div>
                <h3 className="text-xl font-bold">Team Member {member}</h3>
                <p className="text-kairos-muted text-sm">Role / Title</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us / Community Section */}
      <section id="community" className="py-24 px-6 relative bg-gradient-to-t from-black/40 to-transparent">
        <div className="max-w-3xl mx-auto text-center glass-panel p-12 rounded-3xl border border-white/10">
          <h2 className="text-4xl font-bold mb-6">Ready to <span className="text-kairos-blue">Upgrade</span>?</h2>
          <p className="text-kairos-muted text-lg mb-8">
            Join the waitlist or contact our sales team for a personalized demo of the Commander platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-white text-kairos-bg font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Contact Sales
            </button>
            <button className="px-8 py-3 glass-card text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              Join Community
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
