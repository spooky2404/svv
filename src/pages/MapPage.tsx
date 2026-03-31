import React, { useEffect } from 'react';
import { useCameras } from '../context/CameraContext';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Video, AlertTriangle, MapPin } from 'lucide-react';
import { WILAYAS } from '../constants/wilayas';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for online/offline cameras
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const onlineIcon = createCustomIcon('#39ff14');
const offlineIcon = createCustomIcon('#ff003c');

const MapUpdater: React.FC<{ center: [number, number], wilayaId: string }> = ({ center, wilayaId }) => {
  const map = useMap();
  useEffect(() => {
    // Determine bounds size based on wilaya (southern wilayas are larger and need bigger bounds)
    const isSouth = ['1', '8', '11', '30', '32', '33', '37', '39', '47', '50', '52', '53', '54', '56'].includes(wilayaId);
    const offset = isSouth ? 3.0 : 0.8; 
    
    const bounds = L.latLngBounds(
      [center[0] - offset, center[1] - offset],
      [center[0] + offset, center[1] + offset]
    );
    
    map.setView(center, isSouth ? 7 : 11);
    map.setMaxBounds(bounds);
    map.setMinZoom(isSouth ? 6 : 10);
  }, [center, wilayaId, map]);
  return null;
};

export const MapPage: React.FC = () => {
  const { cameras, selectedWilaya, setSelectedWilaya } = useCameras();
  
  const wilaya = WILAYAS.find(w => w.id === selectedWilaya) || WILAYAS.find(w => w.id === '16') || WILAYAS[0];
  const center: [number, number] = [wilaya.lat, wilaya.lng];

  const filteredCameras = cameras.filter(cam => cam.wilaya === selectedWilaya);

  return (
    <div className="h-full min-h-[600px] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text-cyan tracking-wider uppercase">Geospatial View</h1>
          <p className="text-gray-400 font-mono text-sm mt-1">Live map of {wilaya.name} surveillance devices</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] p-2 rounded-lg">
          <MapPin className="w-4 h-4 text-cyan-500" />
          <select
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
            className="bg-transparent text-sm font-mono text-white focus:outline-none appearance-none cursor-pointer pr-4"
          >
            {WILAYAS.map(w => (
              <option key={w.id} value={w.id} className="bg-[#1a1a1a]">{w.id} - {w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_20px_rgba(0,243,255,0.1)] relative z-0">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%', background: '#0a0a0a' }}>
          <MapUpdater center={center} wilayaId={selectedWilaya} />
          
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Dark Theme (Default)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite View">
              <TileLayer
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Street Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {filteredCameras.map(cam => (
            <Marker 
              key={cam.id} 
              position={[cam.lat, cam.lng]}
              icon={cam.status === 'Online' ? onlineIcon : offlineIcon}
            >
              <Popup className="custom-popup">
                <div className="p-2 bg-[#121212] text-white rounded-lg min-w-[200px] border border-[#333]">
                  <h3 className="font-bold text-lg mb-1">{cam.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mb-1">{cam.id}</p>
                  <p className="text-[10px] text-cyan-500 font-mono mb-3">IP: {cam.ipAddress}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {cam.status === 'Online' ? (
                      <span className="flex items-center gap-1 text-[#39ff14] text-xs font-mono uppercase">
                        <Video className="w-3 h-3" /> Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#ff003c] text-xs font-mono uppercase">
                        <AlertTriangle className="w-3 h-3" /> Offline ({cam.offlineReason})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{cam.location}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Custom styles for leaflet popup to match dark theme */}
      <style>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #121212;
          color: #fff;
          border: 1px solid #333;
          box-shadow: 0 4px 20px rgba(0,0,0,0.8);
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #888;
          padding: 4px;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #fff;
        }
      `}</style>
    </div>
  );
};
