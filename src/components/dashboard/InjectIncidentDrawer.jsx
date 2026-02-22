import React, { useState } from 'react';
import { X, Zap, Rocket, Activity, Clock, Cpu, Server, Edit2, RefreshCw } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const InjectIncidentDrawer = ({ isOpen, onClose, onInject, loading, currentTelemetry }) => {
    const [service, setService] = useState('frontend');
    const [metrics, setMetrics] = useState({
        error_rate: 0.1,
        latency: 500,
        cpu: 20,
        downstream: 0,
        reset_scenario: true
    });

    const services = [
        { id: 'frontend', label: 'Frontend' },
        { id: 'auth-service', label: 'Auth Service' },
        { id: 'payment-service', label: 'Payment Service' },
        { id: 'database', label: 'Database' }
    ];

    // Sync metrics with current system state when service changes
    React.useEffect(() => {
        const current = currentTelemetry?.find(t => t.id === service);
        if (current) {
            setMetrics({
                error_rate: parseFloat(current.errorRate) / 100,
                latency: parseInt(current.latency.replace('ms', '')),
                cpu: parseInt(current.cpu.replace('%', '')),
                downstream: current.downstream || 0
            });
        }
    }, [service, currentTelemetry, isOpen]);

    const handleSliderChange = (key, value) => {
        setMetrics(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onInject(service, metrics);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
            {/* Backdrop */}
            <div
                className={twMerge(
                    "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className={twMerge(
                "absolute right-0 top-0 bottom-0 w-full max-w-md bg-kairos-bg border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out pointer-events-auto",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-kairos-surface to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-kairos-blue/20 flex items-center justify-center text-kairos-blue">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Inject Incident</h2>
                                <p className="text-sm text-kairos-muted">Simulate system anomalies</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-kairos-muted hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Service Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-kairos-muted flex items-center gap-2">
                                <Server size={14} /> SELECT SERVICE
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {services.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setService(s.id)}
                                        className={twMerge(
                                            "px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left",
                                            service === s.id
                                                ? "bg-kairos-blue/10 border-kairos-blue text-kairos-blue shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                                                : "bg-white/5 border-white/10 text-kairos-muted hover:border-white/20 hover:bg-white/10"
                                        )}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sliders Area */}
                        <div className="space-y-8 pt-4">
                            {/* Error Rate */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-white flex items-center gap-2">
                                        <Activity size={14} className="text-kairos-red" /> Error Rate
                                    </label>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-lg hover:border-kairos-red/50 transition-colors group cursor-text">
                                        <Edit2 size={10} className="text-kairos-muted group-hover:text-kairos-red transition-colors" />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={(metrics.error_rate * 100).toFixed(0)}
                                                onChange={(e) => {
                                                    const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                                                    handleSliderChange('error_rate', val / 100);
                                                }}
                                                className="w-12 bg-transparent text-kairos-red font-mono text-sm focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-kairos-red text-xs font-mono font-bold">%</span>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={metrics.error_rate}
                                    onChange={(e) => handleSliderChange('error_rate', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-kairos-red hover:accent-red-400 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                />
                            </div>

                            {/* Latency */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-white flex items-center gap-2">
                                        <Clock size={14} className="text-kairos-blue" /> Latency
                                    </label>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-lg hover:border-kairos-blue/50 transition-colors group cursor-text">
                                        <Edit2 size={10} className="text-kairos-muted group-hover:text-kairos-blue transition-colors" />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="5000"
                                                step="50"
                                                value={metrics.latency}
                                                onChange={(e) => {
                                                    const val = Math.max(0, Math.min(5000, parseInt(e.target.value) || 0));
                                                    handleSliderChange('latency', val);
                                                }}
                                                className="w-16 bg-transparent text-kairos-blue font-mono text-sm focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-kairos-blue text-xs font-mono font-bold">ms</span>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="50"
                                    value={metrics.latency}
                                    onChange={(e) => handleSliderChange('latency', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-kairos-blue hover:accent-cyan-400 transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                                />
                            </div>

                            {/* CPU Usage */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-white flex items-center gap-2">
                                        <Cpu size={14} className="text-purple-400" /> CPU Usage
                                    </label>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-lg hover:border-purple-400/50 transition-colors group cursor-text">
                                        <Edit2 size={10} className="text-kairos-muted group-hover:text-purple-400 transition-colors" />
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={metrics.cpu}
                                                onChange={(e) => {
                                                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                                    handleSliderChange('cpu', val);
                                                }}
                                                className="w-12 bg-transparent text-purple-400 font-mono text-sm focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-purple-400 text-xs font-mono font-bold">%</span>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={metrics.cpu}
                                    onChange={(e) => handleSliderChange('cpu', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                                />
                            </div>

                            {/* Downstream Failures */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-white flex items-center gap-2">
                                        <Server size={14} className="text-amber-400" /> Downstream Failures
                                    </label>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-lg hover:border-amber-400/50 transition-colors group cursor-text">
                                        <Edit2 size={10} className="text-kairos-muted group-hover:text-amber-400 transition-colors" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="1"
                                            value={metrics.downstream}
                                            onChange={(e) => {
                                                const val = Math.max(0, Math.min(5, parseInt(e.target.value) || 0));
                                                handleSliderChange('downstream', val);
                                            }}
                                            className="w-8 bg-transparent text-amber-400 font-mono text-sm focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value={metrics.downstream}
                                    onChange={(e) => handleSliderChange('downstream', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                                />
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-kairos-surface/30">
                        {/* Reset Scenario Toggle */}
                        <div className="mb-4 p-4 bg-kairos-blue/5 border border-kairos-blue/20 rounded-xl flex items-center justify-between group hover:border-kairos-blue/40 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-kairos-blue/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <RefreshCw size={18} className="text-kairos-blue" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">Reset Scenario</div>
                                    <div className="text-[10px] text-kairos-muted">Clear timeline & restore healthy state</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMetrics(prev => ({ ...prev, reset_scenario: !prev.reset_scenario }))}
                                className={`w-12 h-6 rounded-full transition-all duration-500 relative ${metrics.reset_scenario ? 'bg-kairos-blue' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.3)] ${metrics.reset_scenario ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={twMerge(
                                "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-kairos-blue/20",
                                loading
                                    ? "bg-white/10 text-kairos-muted cursor-not-allowed"
                                    : "bg-gradient-to-r from-kairos-blue to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] hover:shadow-kairos-blue/40"
                            )}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Rocket size={18} />
                                    🚀 Simulate Incident
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InjectIncidentDrawer;
