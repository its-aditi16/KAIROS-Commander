import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  History,
  User,
  LogOut,
  Settings,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch (_) {}
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const subtitle = userProfile?.position || userProfile?.organisation || currentUser?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Hypotheses', icon: Lightbulb, path: '/hypotheses' },
    { label: 'History', icon: History, path: '/history' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setUserMenuOpen(false);
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

      {/* Center Navigation Links */}
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavigation(item.path)}
            className={twMerge(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
              isActive(item.path)
                ? "bg-kairos-blue/10 text-kairos-blue shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                : "text-kairos-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right User/Settings Area */}
      <div className="flex items-center gap-4">
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kairos-blue to-purple-500 p-[1px]">
              <div className="w-full h-full rounded-full bg-kairos-bg flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-kairos-muted">{subtitle}</p>
            </div>
            <ChevronDown size={14} className="text-kairos-muted" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-kairos-surface border border-white/10 rounded-lg shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => { console.log("Profile clicked"); setUserMenuOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-kairos-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <User size={16} />
                My Profile
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                    setUserMenuOpen(false);
                    navigate('/');
                  } catch (error) {
                    console.error("Logout failed:", error);
                  }
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
