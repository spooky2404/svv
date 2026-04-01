import React, { createContext, useContext, useState, useEffect } from 'react';

export type CameraStatus = 'Online' | 'Offline';
export type OfflineReason = 'ERSV' | 'ERMA' | 'AT' | null;

export interface Camera {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  wilaya: string;
  lat: number;
  lng: number;
  status: CameraStatus;
  offlineReason: OfflineReason;
  lastUpdated: string;
}

interface CameraContextType {
  cameras: Camera[];
  selectedWilaya: string;
  setSelectedWilaya: (wilayaId: string) => void;
  updateCameraStatus: (id: string, status: CameraStatus, reason?: OfflineReason) => Promise<void>;
  addCamera: (camera: Omit<Camera, 'id' | 'lastUpdated'>) => Promise<void>;
  removeCamera: (id: string) => Promise<void>;
  loading: boolean;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWilaya, setSelectedWilaya] = useState<string>('16');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await fetch('/api/cameras');
        if (res.ok) {
          const data = await res.json();
          setCameras(data);
        }
      } catch (err) {
        console.error("Failed to fetch cameras", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCameras();
  }, []);

  const addCamera = async (cameraData: Omit<Camera, 'id' | 'lastUpdated'>) => {
    const newId = `CAM-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newCamera: Camera = {
      ...cameraData,
      id: newId,
      lastUpdated: new Date().toISOString()
    };
    
    const res = await fetch('/api/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCamera),
    });

    if (res.ok) {
      setCameras(prev => [...prev, newCamera]);
    }
  };

  const removeCamera = async (id: string) => {
    const res = await fetch(`/api/cameras/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setCameras(prev => prev.filter(cam => cam.id !== id));
    }
  };

  const updateCameraStatus = async (id: string, status: CameraStatus, reason: OfflineReason = null) => {
    const update = {
      id,
      status,
      offlineReason: status === 'Offline' ? reason : null,
      lastUpdated: new Date().toISOString()
    };

    const res = await fetch('/api/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    if (res.ok) {
      setCameras(prev => prev.map(cam => {
        if (cam.id === id) {
          return { ...cam, ...update };
        }
        return cam;
      }));
    }
  };

  return (
    <CameraContext.Provider value={{ cameras, selectedWilaya, setSelectedWilaya, updateCameraStatus, addCamera, removeCamera, loading }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCameras = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCameras must be used within a CameraProvider');
  }
  return context;
};
