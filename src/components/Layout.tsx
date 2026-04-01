import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCameras } from '../context/CameraContext';
import { LayoutDashboard, Camera, Users, LogOut, Map as MapIcon, MapPin, Smartphone } from 'lucide-react';
import { WILAYAS } from '../constants/wilayas';
import clsx from 'clsx';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedWilaya, setSelectedWilaya } = useCameras();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/cameras', icon: Camera, label: 'Camera Grid' },
    { to: '/map', icon: MapIcon, label: 'Live Map' },
    { to: '/mobile', icon: Smartphone, label: 'Mobile App' },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ to: '/users', icon: Users, label: 'User Management' });
  }

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] animate-fade-out" style={{ animationDelay: '3.5s', animationFillMode: 'forwards' }}>
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold neon-text-cyan tracking-widest uppercase animate-pulse">
              Welcome
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-mono tracking-widest overflow-hidden whitespace-nowrap border-r-2 border-cyan-500 animate-typing">
              Developed by "NASREDDINE HADDAD"
            </p>
          </div>
        </div>
      )}
      <div className="flex h-screen bg-[#0a0a0a] text-gray-300 overflow-hidden">
        {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-[#1f1f1f] bg-[#121212]/80 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-[#1f1f1f]">
          <h1 className="text-xl font-bold neon-text-cyan flex items-center gap-2">
            <Camera className="w-6 h-6" />
            <span>ERSV MAP</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-mono">SYS_CTRL_V2.0</p>
          
          <div className="mt-4">
            <label className="block text-[10px] font-mono text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Select Region (1RM)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WILAYAS.map(w => (
                <button
                  key={w.id}
                  onClick={() => {
                    setSelectedWilaya(w.id);
                    navigate('/map');
                  }}
                  className={clsx(
                    "flex flex-col items-center justify-center p-2 rounded border transition-all duration-200 group",
                    selectedWilaya === w.id
                      ? "bg-cyan-900/40 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                      : "bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-cyan-500/50 hover:text-gray-300"
                  )}
                  title={w.name}
                >
                  <span className="text-xs font-bold font-mono">{w.id}</span>
                  <span className="text-[8px] font-mono uppercase truncate w-full text-center opacity-70 group-hover:opacity-100">{w.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-cyan-900/20 text-cyan-400 neon-border-cyan'
                    : 'hover:bg-[#1f1f1f] text-gray-400 hover:text-gray-200'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1f1f1f]">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">{user?.username}</span>
              <span className="text-xs text-cyan-500 font-mono">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent"></div>
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
    </>
  );
};
