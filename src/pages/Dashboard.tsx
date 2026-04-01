import React, { useState, useEffect } from 'react';
import { useCameras } from '../context/CameraContext';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Download, Video, UserPlus, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { WILAYAS } from '../constants/wilayas';
import * as XLSX from 'xlsx';

export const Dashboard: React.FC = () => {
  const { cameras, selectedWilaya } = useCameras();
  const { user, addUser } = useAuth();
  
  const [viewerUsername, setViewerUsername] = useState('');
  const [viewerPassword, setViewerPassword] = useState('');
  const [viewerMsg, setViewerMsg] = useState({ type: '', text: '' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const simulateGeneration = (type: 'android' | 'ios') => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setViewerMsg({ type: '', text: '' });
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            if (type === 'android' && deferredPrompt) {
              handleInstall();
            } else {
              setViewerMsg({ 
                type: 'success', 
                text: type === 'android' 
                  ? "APP READY: To install, open your Chrome menu (three dots ⋮) and select 'Install App'." 
                  : "APP READY: To install, tap the 'Share' icon in Safari and select 'Add to Home Screen'."
              });
            }
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const canCreateViewer = user?.role === 'Admin' || user?.role === 'User';

  const wilaya = WILAYAS.find(w => w.id === selectedWilaya) || WILAYAS.find(w => w.id === '16') || WILAYAS[0];
  const filteredCameras = cameras.filter(c => c.wilaya === selectedWilaya);

  const total = filteredCameras.length;
  const online = filteredCameras.filter(c => c.status === 'Online').length;
  const offline = filteredCameras.filter(c => c.status === 'Offline').length;

  const reasonsCount = filteredCameras.reduce((acc, curr) => {
    if (curr.status === 'Offline' && curr.offlineReason) {
      acc[curr.offlineReason] = (acc[curr.offlineReason] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Online', value: online, color: '#39ff14' },
    { name: 'Offline', value: offline, color: '#ff003c' },
  ];

  const barData = [
    { name: 'ERSV', count: reasonsCount['ERSV'] || 0, fill: '#ff003c' },
    { name: 'ERMA', count: reasonsCount['ERMA'] || 0, fill: '#ff8c00' },
    { name: 'AT', count: reasonsCount['AT'] || 0, fill: '#ffeb3b' },
  ];

  const handleCreateViewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerUsername.trim() || !viewerPassword.trim()) return;
    try {
      addUser(viewerUsername.trim(), 'Viewer', viewerPassword.trim());
      setViewerMsg({ type: 'success', text: `Viewer '${viewerUsername}' created successfully.` });
      setViewerUsername('');
      setViewerPassword('');
    } catch (err: any) {
      setViewerMsg({ type: 'error', text: err.message });
    }
  };

  const exportData = () => {
    const offlineCameras = filteredCameras.filter(c => c.status === 'Offline');
    
    if (offlineCameras.length === 0) {
      alert('No offline cameras to export.');
      return;
    }

    const data = offlineCameras.map(c => ({
      'ID': c.id,
      'Name': c.name,
      'IP Address': c.ipAddress,
      'Location': c.location,
      'Status': c.status,
      'Offline Reason': c.offlineReason || 'N/A',
      'Last Updated': format(new Date(c.lastUpdated), 'yyyy-MM-dd HH:mm:ss')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Offline Devices");
    
    // Generate filename
    const filename = `offline_devices_${wilaya.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
    
    // Export file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold neon-text-cyan tracking-wider uppercase">DRPSV/1RM</h1>
          <p className="text-gray-400 font-mono text-sm mt-1">Real-time surveillance overview - {wilaya.name}</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-red-500/50 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors font-mono text-sm uppercase tracking-wider shadow-[0_0_10px_rgba(255,0,60,0.2)]"
        >
          <Download className="w-4 h-4" />
          Export Offline (Excel)
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-cyan-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-1">Total Devices</p>
              <h3 className="text-4xl font-bold font-mono text-white">{total}</h3>
            </div>
            <div className="p-3 bg-cyan-900/20 rounded-lg">
              <Video className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#39ff14]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-1">Active Streams</p>
              <h3 className="text-4xl font-bold font-mono text-[#39ff14]">{online}</h3>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-[#39ff14]" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#ff003c]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-1">Critical Failures</p>
              <h3 className="text-4xl font-bold font-mono text-[#ff003c]">{offline}</h3>
            </div>
            <div className="p-3 bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-[#ff003c]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Activity className="w-5 h-5 text-cyan-400" />
            Network Status
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Failure Diagnostics
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontFamily: 'JetBrains Mono', fontSize: 10 }} />
                <YAxis stroke="#888" tick={{ fill: '#888', fontFamily: 'JetBrains Mono', fontSize: 10 }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#1f1f1f' }}
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mobile App Section */}
      <div className="glass-panel p-6 rounded-xl border-t-4 border-t-green-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-900/20 rounded-2xl">
              <Smartphone className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-mono">Mobile Access (App)</h3>
              <p className="text-gray-400 text-sm font-mono mt-1 max-w-md">
                This system is a <span className="text-cyan-400">Progressive Web App (PWA)</span>. It installs directly to your home screen without needing a separate APK file.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            {isGenerating ? (
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  <span>Preparing App...</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-[#333]">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-100"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="px-8 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 font-mono text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Install App Now
              </button>
            ) : (
              <div className="text-center">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">How to Install</p>
                <div className="flex gap-4">
                  <div className="px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono text-gray-400 text-left">
                    <span className="text-cyan-400 block mb-1">ANDROID</span>
                    1. Open Chrome Menu (⋮)<br/>
                    2. Tap <span className="text-white">"Install App"</span>
                  </div>
                  <div className="px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono text-gray-400 text-left">
                    <span className="text-cyan-400 block mb-1">IOS / SAFARI</span>
                    1. Tap Share (□ with ↑)<br/>
                    2. Tap <span className="text-white">"Add to Home Screen"</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Provisioning */}
      {canCreateViewer && (
        <div className="glass-panel p-6 rounded-xl border-t-4 border-t-cyan-500">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            Quick Provision: Viewer Operator
          </h3>
          
          {viewerMsg.text && (
            <div className={`px-3 py-2 rounded mb-4 text-xs font-mono border ${
              viewerMsg.type === 'success' 
                ? 'bg-green-900/30 border-green-500/50 text-[#39ff14]' 
                : 'bg-red-900/30 border-red-500/50 text-red-400'
            }`}>
              {viewerMsg.text}
            </div>
          )}

          <form onSubmit={handleCreateViewer} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={viewerUsername}
                onChange={(e) => setViewerUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Viewer Username"
                required
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={viewerPassword}
                onChange={(e) => setViewerPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto py-2 px-6 bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-900/50 transition-colors font-mono text-sm uppercase tracking-wider shadow-[0_0_10px_rgba(0,243,255,0.1)] h-[38px]"
            >
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
