import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

const PublicLayout = () => {
  return (
    <div className="bg-kairos-bg min-h-screen text-white relative font-sans">
      <PublicNavbar />
      <main className="flex-1">
         <Outlet />
      </main>
       <footer className="py-8 text-center text-kairos-muted text-sm border-t border-white/5 bg-kairos-bg relative z-10">
        &copy; {new Date().getFullYear()} KAIROS.AI. All systems operational.
      </footer>
    </div>
  );
};

export default PublicLayout;
