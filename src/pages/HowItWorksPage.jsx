import React from 'react';
import { ArrowLeft, Database, Search, ShieldCheck, Cpu, Code2 } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-kairos-bg text-white overflow-hidden relative selection:bg-kairos-blue/30">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-kairos-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-12 pt-32 relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-kairos-muted hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          The <span className="text-kairos-blue">Commander</span> Architecture
        </h1>
        <p className="text-xl text-kairos-muted max-w-3xl mb-16 leading-relaxed">
          KAIROS Commander is an autonomous SRE agent that ingests telemetry, reasons about failure modes, and explains its findings transparently.
        </p>

        <section className="space-y-24">
          {[
            {
              step: "01",
              title: "Data Ingestion",
              icon: Database,
              desc: "The system connects to your observability stack (Prometheus, Jaeger, ELK) via secure read-only APIs. It ingests metrics, logs, and distributed traces in real-time.",
              details: [
                "Supports OpenTelemetry standards",
                "Sub-second ingestion latency",
                "Zero-impact on production performance"
              ]
            },
            {
              step: "02",
              title: "Anomaly Detection & Dependency Mapping",
              icon: Search,
              desc: "Using unsupervised learning, the Commander detects statistical anomalies. Simultaneously, it constructs a live dependency graph of your microservices.",
              details: [
                "Dynamic topology discovery",
                "Traffic-based relationship mapping",
                "Noise-reduction filters"
              ]
            },
            {
              step: "03",
              title: "Causal Reasoning (AI Core)",
              icon: Cpu,
              desc: "The reasoning engine formulates hypotheses about the root cause. It uses probabilistic graphical models and LLMs to rank potential culprits.",
              details: [
                "Hypothesis-driven investigation",
                "Multi-modal reasoning (logs + metrics)",
                "Confidence scoring for each finding"
              ]
            },
            {
              step: "04",
              title: "Explainable Output (XAI)",
              icon: ShieldCheck,
              desc: "Crucially, the Commander explains WHY it blamed a service. It uses SHAP values to quantify the contribution of each signal to the final verdict.",
              details: [
                "Feature importance visualization",
                "Natural language summary",
                "Evidence-backed reports"
              ]
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-start relative group">
              {/* Connector Line */}
              {i !== 3 && (
                <div className="hidden md:block absolute left-[27px] top-16 bottom-[-96px] w-[2px] bg-gradient-to-b from-kairos-blue/50 to-transparent z-0" />
              )}
              
              <div className="shrink-0 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-kairos-surface to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:border-kairos-blue/50 transition-colors">
                  <item.icon className="text-kairos-blue" size={28} />
                </div>
              </div>

              <div className="glass-panel p-8 flex-1 border-l-4 border-l-transparent hover:border-l-kairos-blue transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-bold text-kairos-muted uppercase tracking-widest px-2 py-1 bg-white/5 rounded">Step {item.step}</span>
                  <h2 className="text-2xl font-bold text-white">{item.title}</h2>
                </div>
                <p className="text-kairos-muted text-lg mb-6 leading-relaxed">
                  {item.desc}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-2 rounded">
                      <Code2 size={14} className="text-kairos-blue" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-6">See it in Action</h2>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-kairos-blue text-kairos-bg font-bold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300"
            >
              Launch Dashboard Demo
            </button>
        </section>

      </main>
    </div>
  );
};

export default HowItWorksPage;