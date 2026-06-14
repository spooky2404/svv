import React, { useState, useEffect } from 'react';
import { useCameras } from '../context/CameraContext';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, Download, Video, UserPlus, Upload, Database } from 'lucide-react';
import { format } from 'date-fns';
import { WILAYAS } from '../constants/wilayas';
import * as XLSX from 'xlsx';
import { Camera } from '../context/CameraContext';

import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { cameras, selectedWilaya, importCameras } = useCameras();
  const { user, addUser } = useAuth();
  
  const [viewerUsername, setViewerUsername] = useState('');
  const [viewerPassword, setViewerPassword] = useState('');
  const [viewerMsg, setViewerMsg] = useState({ type: '', text: '' });
  const [importStatus, setImportStatus] = useState({ type: '', text: '' });
  
  const canCreateViewer = user?.role === 'Admin' || user?.role === 'User';
  const canImportExport = user?.role === 'Admin';

  const wilaya = WILAYAS.find(w => w.id === selectedWilaya) || WILAYAS.find(w => w.id === '35') || WILAYAS[0];
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

  const exportFullDB = () => {
    if (cameras.length === 0) {
      alert('Database is empty.');
      return;
    }

    const data = cameras.map(c => ({
      'ID': c.id,
      'Name': c.name,
      'IP Address': c.ipAddress,
      'Location': c.location,
      'Wilaya ID': c.wilaya,
      'Latitude': c.lat,
      'Longitude': c.lng,
      'Status': c.status,
      'Offline Reason': c.offlineReason || '',
      'Last Updated': c.lastUpdated
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cameras Database");
    
    const filename = `camera_db_full_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'info', text: 'Processing file...' });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const formattedCameras: Camera[] = data.map(item => ({
          id: String(item['ID'] || `CAM-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`),
          name: String(item['Name'] || 'Unknown Camera'),
          ipAddress: String(item['IP Address'] || '0.0.0.0'),
          location: String(item['Location'] || ''),
          wilaya: String(item['Wilaya ID'] || '35'),
          lat: Number(item['Latitude'] || 0),
          lng: Number(item['Longitude'] || 0),
          status: (item['Status'] as any) === 'Online' ? 'Online' : 'Offline',
          offlineReason: (item['Offline Reason'] as any) || null,
          lastUpdated: item['Last Updated'] || new Date().toISOString()
        }));

        await importCameras(formattedCameras);
        setImportStatus({ type: 'success', text: `Successfully imported ${formattedCameras.length} cameras.` });
        
        // Reset input
        e.target.value = '';
      } catch (err) {
        console.error(err);
        setImportStatus({ type: 'error', text: 'Failed to parse Excel file. Ensure it matches the export format.' });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text-cyan tracking-wider uppercase">DRPSV/1RM</h1>
          <p className="text-gray-400 font-mono text-sm mt-1">Real-time surveillance overview - {wilaya.name}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {canImportExport && (
            <>
              <label className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-900/30 transition-colors font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,243,255,0.1)] cursor-pointer">
                <Upload className="w-4 h-4" />
                Import DB
                <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="hidden" />
              </label>
              
              <button
                onClick={exportFullDB}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-900/30 transition-colors font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,243,255,0.1)]"
              >
                <Database className="w-4 h-4" />
                Export DB
              </button>
            </>
          )}

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-red-500/50 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors font-mono text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(255,0,60,0.2)]"
          >
            <Download className="w-4 h-4" />
            Export Offline
          </button>
        </div>
      </div>

      {importStatus.text && (
        <div className={`px-4 py-3 rounded-lg border font-mono text-sm ${
          importStatus.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-[#39ff14]' :
          importStatus.type === 'error' ? 'bg-red-900/20 border-red-500/50 text-red-400' :
          'bg-cyan-900/20 border-cyan-500/50 text-cyan-400'
        }`}>
          {importStatus.text}
        </div>
      )}

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
