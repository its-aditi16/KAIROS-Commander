import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Menu, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'How it Works', path: '/how-it-works' },
    { label: 'Our Team', path: '#our-team' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const handleNavigation = (path) => {
    setMobileMenuOpen(false);
    if (path.startsWith('#')) {
      if (location.pathname === '/') {
        const element = document.getElementById(path.substring(1));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(path.substring(1));
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="h-16 bg-kairos-surface/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Logo Area */}
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/')}
      >
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-kairos-blue to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-kairos-blue/20">
          <ShieldAlert size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-wide">
          COMMANDER
        </h1>
      </div>

      {/* Center Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            className={twMerge(
              "px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
              isActive(item.path)
                ? "bg-kairos-blue/10 text-kairos-blue shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                : "text-kairos-muted hover:bg-white/5 hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right Action Button & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-kairos-muted hover:text-white transition-colors text-sm font-medium"
          >
            Sign In
          </button>
          <div className="w-px h-4 bg-white/20"></div>
        </div>
        <button
          onClick={() => navigate('/login?mode=signup')}
          className="px-4 py-2 bg-kairos-blue text-kairos-bg font-bold rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] text-sm"
        >
          Sign Up
        </button>

        <button
          className="md:hidden text-kairos-muted hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-kairos-surface border-b border-white/10 p-4 md:hidden flex flex-col gap-2 animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={twMerge(
                "w-full text-left px-4 py-3 rounded-lg transition-colors",
                isActive(item.path)
                  ? "bg-kairos-blue/10 text-kairos-blue"
                  : "text-kairos-muted hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
