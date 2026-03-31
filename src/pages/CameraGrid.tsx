import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCameras, CameraStatus, OfflineReason } from '../context/CameraContext';
import { useAuth } from '../context/AuthContext';
import { Video, VideoOff, MapPin, Clock, Search, Filter, Plus, X, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { WILAYAS } from '../constants/wilayas';
import clsx from 'clsx';

export const CameraGrid: React.FC = () => {
  const { cameras, selectedWilaya, setSelectedWilaya, updateCameraStatus, addCamera, removeCamera } = useCameras();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Online' | 'Offline'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCam, setNewCam] = useState({ name: '', ipAddress: '', location: '', wilaya: selectedWilaya, lat: 36.77, lng: 3.05, status: 'Online' as CameraStatus });

  const wilaya = WILAYAS.find(w => w.id === selectedWilaya) || WILAYAS.find(w => w.id === '16') || WILAYAS[0];

  useEffect(() => {
    if (showAddModal) {
      const wilaya = WILAYAS.find(w => w.id === selectedWilaya);
      if (wilaya) {
        setNewCam(prev => ({ ...prev, wilaya: selectedWilaya, lat: wilaya.lat, lng: wilaya.lng }));
      }
    }
  }, [showAddModal, selectedWilaya]);

  const isViewer = user?.role === 'Viewer';
  const canEdit = user?.role === 'Admin' || user?.role === 'User';

  const filteredCameras = cameras.filter(cam => {
    const matchesWilaya = cam.wilaya === selectedWilaya;
    const matchesSearch = cam.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cam.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || cam.status === filterStatus;
    return matchesWilaya && matchesSearch && matchesStatus;
  });

  const handleStatusToggle = (id: string, currentStatus: CameraStatus) => {
    if (currentStatus === 'Online') {
      // Default to ERSV when switching to offline, user can change it via dropdown
      updateCameraStatus(id, 'Offline', 'ERSV');
    } else {
      updateCameraStatus(id, 'Online');
    }
  };

  const handleReasonChange = (id: string, reason: OfflineReason) => {
    updateCameraStatus(id, 'Offline', reason);
  };

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    addCamera({
      name: newCam.name,
      ipAddress: newCam.ipAddress,
      location: newCam.location,
      wilaya: newCam.wilaya,
      lat: Number(newCam.lat),
      lng: Number(newCam.lng),
      status: newCam.status,
      offlineReason: newCam.status === 'Offline' ? 'ERSV' : null
    });
    setShowAddModal(false);
    setSelectedWilaya(newCam.wilaya);
    navigate('/map');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text-cyan tracking-wider uppercase">Surveillance Grid</h1>
          <p className="text-gray-400 font-mono text-sm mt-1">Live feed monitoring & control - {wilaya.name}</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-900/50 transition-colors font-mono text-sm uppercase tracking-wider shadow-[0_0_10px_rgba(0,243,255,0.1)]"
            >
              <Plus className="w-4 h-4" />
              Add Device
            </button>
          )}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search ID or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-9 pr-8 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="All">All Devices</option>
              <option value="Online">Online Only</option>
              <option value="Offline">Offline Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-8 pr-2">
        {filteredCameras.map((cam) => (
          <div 
            key={cam.id} 
            className={clsx(
              "glass-panel rounded-xl overflow-hidden transition-all duration-300 border-l-4",
              cam.status === 'Online' ? 'border-l-[#39ff14] hover:shadow-[0_0_15px_rgba(57,255,20,0.1)]' : 'border-l-[#ff003c] hover:shadow-[0_0_15px_rgba(255,0,60,0.1)]'
            )}
          >
            {/* Camera Feed Placeholder */}
            <div className="h-40 bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden border-b border-[#1f1f1f]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
              
              {cam.status === 'Online' ? (
                <div className="relative z-10 flex flex-col items-center">
                  <Video className="w-10 h-10 text-[#39ff14] opacity-50 mb-2" />
                  <span className="text-xs font-mono text-[#39ff14] tracking-widest uppercase animate-pulse">Live Stream</span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center">
                  <VideoOff className="w-10 h-10 text-[#ff003c] opacity-50 mb-2" />
                  <span className="text-xs font-mono text-[#ff003c] tracking-widest uppercase">Signal Lost</span>
                  {cam.offlineReason && (
                    <span className="mt-2 px-2 py-1 bg-red-900/40 border border-red-500/30 rounded text-[10px] font-mono text-red-400">
                      ERR_CODE: {cam.offlineReason}
                    </span>
                  )}
                </div>
              )}

              {/* Overlay Info */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-gray-300 border border-white/10">
                {cam.id}
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                <div className={clsx("w-2 h-2 rounded-full", cam.status === 'Online' ? 'bg-[#39ff14] shadow-[0_0_5px_#39ff14]' : 'bg-[#ff003c] shadow-[0_0_5px_#ff003c]')}></div>
                <span className={clsx("text-[10px] font-mono uppercase", cam.status === 'Online' ? 'text-[#39ff14]' : 'text-[#ff003c]')}>
                  {cam.status}
                </span>
              </div>
            </div>

            {/* Controls & Info */}
            <div className="p-4 bg-[#121212]">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-white">{cam.name}</h3>
                {canEdit && (
                  <button 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${cam.name}?`)) {
                        removeCamera(cam.id);
                      }
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-900/20"
                    title="Remove Camera"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="truncate">{cam.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 bg-[#1a1a1a] rounded border border-[#333]">IP: {cam.ipAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDistanceToNow(new Date(cam.lastUpdated), { addSuffix: true })}</span>
                </div>
              </div>

              {isViewer ? (
                <div className="pt-3 border-t border-[#1f1f1f] text-center">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Read Only Access</span>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-3 border-t border-[#1f1f1f]">
                  <button
                    onClick={() => handleStatusToggle(cam.id, cam.status)}
                    className={clsx(
                      "px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all border",
                      cam.status === 'Online' 
                        ? "bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40" 
                        : "bg-green-900/20 text-[#39ff14] border-green-500/30 hover:bg-green-900/40"
                    )}
                  >
                    {cam.status === 'Online' ? 'Force Offline' : 'Restore Online'}
                  </button>

                  {cam.status === 'Offline' && (
                    <select
                      value={cam.offlineReason || ''}
                      onChange={(e) => handleReasonChange(cam.id, e.target.value as OfflineReason)}
                      className="bg-[#1a1a1a] border border-red-500/30 text-red-400 text-xs font-mono rounded px-2 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="ERSV">ERSV</option>
                      <option value="ERMA">ERMA</option>
                      <option value="AT">AT</option>
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-xl border border-cyan-500/50 shadow-[0_0_30px_rgba(0,243,255,0.15)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold neon-text-cyan uppercase tracking-wider flex items-center gap-2">
                <Video className="w-5 h-5" /> Add New Device
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCamera} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Camera Name</label>
                <input
                  type="text"
                  required
                  value={newCam.name}
                  onChange={e => setNewCam({...newCam, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g., Place des Martyrs"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">IP Address</label>
                <input
                  type="text"
                  required
                  value={newCam.ipAddress}
                  onChange={e => setNewCam({...newCam, ipAddress: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g., 192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Location Description</label>
                <input
                  type="text"
                  required
                  value={newCam.location}
                  onChange={e => setNewCam({...newCam, location: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g., Intersection Rue X"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Wilaya</label>
                <select
                  value={newCam.wilaya}
                  onChange={e => {
                    const wilaya = WILAYAS.find(w => w.id === e.target.value);
                    setNewCam({
                      ...newCam, 
                      wilaya: e.target.value,
                      lat: wilaya ? wilaya.lat : newCam.lat,
                      lng: wilaya ? wilaya.lng : newCam.lng
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  {WILAYAS.map(w => (
                    <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newCam.lat}
                    onChange={e => setNewCam({...newCam, lat: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newCam.lng}
                    onChange={e => setNewCam({...newCam, lng: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Initial Status</label>
                <select
                  value={newCam.status}
                  onChange={e => setNewCam({...newCam, status: e.target.value as CameraStatus})}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white font-mono text-sm uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 font-mono text-sm uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                >
                  Deploy Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
