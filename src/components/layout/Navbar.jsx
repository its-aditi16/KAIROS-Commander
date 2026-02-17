import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-kairos-bg/80 backdrop-blur-md border-b border-kairos-blue/10 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 rounded bg-gradient-to-tr from-kairos-blue to-purple-600 flex items-center justify-center shadow-lg shadow-kairos-blue/20 group-hover:shadow-kairos-blue/40 transition-all duration-300">
            <ShieldAlert size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            KAIROS<span className="text-kairos-blue">.AI</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {['How it Works', 'Our Team', 'Contact Us'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
              className="text-sm font-medium text-kairos-muted hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-kairos-blue group-hover:w-full transition-all duration-300" />
            </button>
          ))}
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 text-sm font-bold text-kairos-bg bg-white hover:bg-kairos-blue transition-all duration-300 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white hover:text-kairos-blue transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-kairos-bg/95 backdrop-blur-xl border-b border-kairos-blue/20 p-6 flex flex-col gap-4 animate-fade-in-down">
          {['How it Works', 'Our Team', 'Contact Us'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
              className="text-left text-lg font-medium text-kairos-muted hover:text-white transition-colors py-2 border-b border-white/5"
            >
              {item}
            </button>
          ))}
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 w-full py-3 text-center font-bold text-kairos-bg bg-kairos-blue rounded-lg hover:bg-white transition-colors"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
