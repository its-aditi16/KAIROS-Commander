import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldAlert, Activity, GitGraph, Zap, Terminal,
    BookOpen, Code2, Cpu, ArrowRight, ExternalLink
} from 'lucide-react';

const DocumentationPage = () => {
    const navigate = useNavigate();

    const sections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: BookOpen,
            description: 'Learn the basics of KAIROS Commander and get up and running in minutes.',
            items: [
                { title: 'Installation', desc: 'Set up the Commander platform in your environment with our quick-start guide.' },
                { title: 'Configuration', desc: 'Configure data sources, alerting thresholds, and team access controls.' },
                { title: 'First Incident', desc: 'Walk through your first automated root cause analysis workflow.' },
            ]
        },
        {
            id: 'core-features',
            title: 'Core Features',
            icon: Cpu,
            description: 'Deep dive into the powerful capabilities that drive incident resolution.',
            items: [
                { title: 'Real-time Telemetry', desc: 'Live ingestion of metrics, logs, and traces with sub-second latency across all services.' },
                { title: 'Dependency Mapping', desc: 'Auto-discovery of service relationships and interactive bottleneck visualization.' },
                { title: 'AI Root Cause Analysis', desc: 'Probabilistic models that pinpoint exact failure sources with confidence scoring.' },
                { title: 'Hypothesis Engine', desc: 'AI-generated hypotheses ranked by probability to accelerate incident triage.' },
            ]
        },
        {
            id: 'api-reference',
            title: 'API Reference',
            icon: Code2,
            description: 'Integrate Commander into your existing toolchain with our comprehensive API.',
            items: [
                { title: 'REST API', desc: 'Full CRUD operations for incidents, services, and dependency graphs.' },
                { title: 'Webhooks', desc: 'Real-time event notifications for incident creation, updates, and resolution.' },
                { title: 'GraphQL', desc: 'Flexible queries for complex dependency and telemetry data retrieval.' },
            ]
        },
        {
            id: 'cli',
            title: 'CLI Tools',
            icon: Terminal,
            description: 'Power-user tools for managing Commander from the command line.',
            items: [
                { title: 'kairos init', desc: 'Initialize a new Commander project with sensible defaults.' },
                { title: 'kairos deploy', desc: 'Deploy configuration changes and agent updates to your cluster.' },
                { title: 'kairos status', desc: 'Check the health and status of all monitored services in real-time.' },
            ]
        },
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-kairos-bg text-white relative overflow-hidden selection:bg-kairos-blue/30">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-kairos-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="glass-panel px-4 py-1 mb-6 rounded-full border border-kairos-blue/20 inline-flex items-center gap-2">
                        <BookOpen size={14} className="text-kairos-blue" />
                        <span className="text-xs font-mono text-kairos-blue tracking-wider">DOCUMENTATION // V2.4.0</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Commander{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-kairos-blue to-purple-500">
                            Docs
                        </span>
                    </h1>
                    <p className="text-lg text-kairos-muted max-w-2xl mx-auto leading-relaxed">
                        Everything you need to deploy, configure, and master the KAIROS Commander platform
                        for autonomous incident resolution.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 animate-fade-in-up">
                    {sections.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="glass-panel p-4 text-center hover:border-kairos-blue/30 transition-all group"
                        >
                            <section.icon size={24} className="text-kairos-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-white">{section.title}</span>
                        </a>
                    ))}
                </div>

                {/* Documentation Sections */}
                <div className="space-y-16">
                    {sections.map((section, idx) => (
                        <section key={section.id} id={section.id} className="animate-fade-in-up">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                    <section.icon className="text-kairos-blue" size={20} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold">{section.title}</h2>
                            </div>
                            <p className="text-kairos-muted mb-8 ml-[52px]">{section.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-[52px]">
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="glass-panel p-5 hover:border-kairos-blue/30 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-white group-hover:text-kairos-blue transition-colors">
                                                {item.title}
                                            </h3>
                                            <ArrowRight size={16} className="text-kairos-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
                                        </div>
                                        <p className="text-sm text-kairos-muted leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center glass-panel p-12 rounded-3xl border border-white/10 animate-fade-in-up">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-kairos-blue to-purple-500">
                            Get Started
                        </span>?
                    </h2>
                    <p className="text-kairos-muted text-lg mb-8 max-w-xl mx-auto">
                        Jump into the Commander dashboard and experience AI-powered incident resolution firsthand.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="group px-8 py-4 bg-kairos-blue text-kairos-bg font-bold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all duration-300 inline-flex items-center gap-3 active:scale-95"
                    >
                        Launch Commander
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentationPage;
