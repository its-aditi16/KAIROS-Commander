import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Lightbulb, 
  FileSearch, 
  Activity, 
  Menu, 
  ChevronLeft,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const NavItem = ({ icon: Icon, label, active, collapsed }) => (
  <button
    className={twMerge(
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group w-full",
      active 
        ? "bg-kairos-blue/10 text-kairos-blue shadow-[0_0_10px_rgba(0,240,255,0.2)]" 
        : "text-kairos-muted hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={20} className={active ? "text-kairos-blue" : "group-hover:text-white transition-colors"} />
    {!collapsed && (
      <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
        {label}
      </span>
    )}
    {active && !collapsed && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-kairos-blue shadow-[0_0_8px_currentColor]" />
    )}
  </button>
);

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Dependency Graph', icon: Network },
    { label: 'Hypotheses', icon: Lightbulb },
    { label: 'Root Cause', icon: FileSearch },
    { label: 'Timeline', icon: Activity },
  ];

  return (
    <aside 
      className={clsx(
        "h-screen sticky top-0 bg-kairos-surface/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-kairos-blue to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-kairos-blue/20">
            <ShieldAlert size={18} className="text-white" />
          </div>
          {!collapsed && (
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-wide whitespace-nowrap">
              COMMANDER
            </h1>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-white/5 text-kairos-muted hover:text-white transition-colors absolute right-[-12px] top-5 bg-kairos-surface border border-white/10 shadow-lg md:relative md:right-auto md:top-auto md:bg-transparent md:border-none md:shadow-none"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <p className={clsx("px-3 text-xs font-semibold text-kairos-muted/50 uppercase tracking-wider mb-2", collapsed && "text-center")}>
            {collapsed ? 'Inc' : 'Incident #492'}
          </p>
          {navItems.map((item) => (
            <div key={item.label} onClick={() => setActiveTab(item.label)}>
              <NavItem 
                {...item} 
                active={activeTab === item.label} 
                collapsed={collapsed} 
              />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5">
           <NavItem icon={Settings} label="Settings" collapsed={collapsed} />
        </div>
      </nav>

      {/* Footer User Profile */}
      <div className="p-3 border-t border-white/5">
        <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kairos-blue to-purple-500 p-[1px]">
            <div className="w-full h-full rounded-full bg-kairos-bg flex items-center justify-center">
              <span className="text-xs font-bold text-white">JD</span>
            </div>
          </div>
          {!collapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium text-white group-hover:text-kairos-blue transition-colors">Jane Doe</p>
              <p className="text-xs text-kairos-muted truncate">Lead SRE</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
