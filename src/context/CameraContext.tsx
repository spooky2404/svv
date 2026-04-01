import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { WILAYAS } from '../constants/wilayas';

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

// Mock data for Alger Center cameras (initial bootstrap)
const initialCameras: Camera[] = [
  { id: 'CAM-001', name: 'Grande Poste', ipAddress: '192.168.1.101', location: "Grande Poste d'Alger", wilaya: '16', lat: 36.7725, lng: 3.0560, status: 'Online', offlineReason: null, lastUpdated: new Date().toISOString() },
  { id: 'CAM-002', name: 'Place Audin', ipAddress: '192.168.1.102', location: 'Place Maurice Audin', wilaya: '16', lat: 36.7711, lng: 3.0544, status: 'Online', offlineReason: null, lastUpdated: new Date().toISOString() },
  { id: 'CAM-003', name: 'Rue Didouche', ipAddress: '192.168.1.103', location: 'Rue Didouche Mourad', wilaya: '16', lat: 36.7688, lng: 3.0522, status: 'Offline', offlineReason: 'ERSV', lastUpdated: new Date().toISOString() },
  { id: 'CAM-004', name: 'Gare Agha', ipAddress: '192.168.1.104', location: "Gare de l'Agha", wilaya: '16', lat: 36.7661, lng: 3.0569, status: 'Online', offlineReason: null, lastUpdated: new Date().toISOString() },
  { id: 'CAM-005', name: 'Place Emir', ipAddress: '192.168.1.105', location: "Place de l'Émir Abdelkader", wilaya: '16', lat: 36.7758, lng: 3.0583, status: 'Offline', offlineReason: 'ERMA', lastUpdated: new Date().toISOString() },
  { id: 'CAM-006', name: "Port d'Alger", ipAddress: '192.168.1.106', location: "Port d'Alger", wilaya: '16', lat: 36.7780, lng: 3.0640, status: 'Online', offlineReason: null, lastUpdated: new Date().toISOString() },
  { id: 'CAM-007', name: 'Rue Hassiba', ipAddress: '192.168.1.107', location: 'Rue Hassiba Ben Bouali', wilaya: '16', lat: 36.7630, lng: 3.0590, status: 'Online', offlineReason: null, lastUpdated: new Date().toISOString() },
  { id: 'CAM-008', name: 'Place 1er Mai', ipAddress: '192.168.1.108', location: 'Place du 1er Mai', wilaya: '16', lat: 36.7580, lng: 3.0600, status: 'Offline', offlineReason: 'AT', lastUpdated: new Date().toISOString() },
  { id: 'CAM-009', name: 'Boulevard Zighoud', ipAddress: '192.168.1.109', location: 'Boulevard Zighoud Youcef', wilaya: '16', lat: 36.7795, lng: 3.0610, status: 'Online', offlineReason: null, lastUpdated: new Date().toISOString() },
  { id: 'CAM-010', name: 'Square Port Said', ipAddress: '192.168.1.110', location: 'Square Port Saïd', wilaya: '16', lat: 36.7810, lng: 3.0605, status: 'Online', offlineReason: null, lastUpdated: new Date().toISOString() },
];

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWilaya, setSelectedWilaya] = useState<string>('16');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'cameras');
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Bootstrap initial data if collection is empty
        const batch = writeBatch(db);
        initialCameras.forEach(cam => {
          const docRef = doc(db, 'cameras', cam.id);
          batch.set(docRef, cam);
        });
        await batch.commit();
      } else {
        const camerasList = snapshot.docs.map(doc => doc.data() as Camera);
        setCameras(camerasList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCamera = async (cameraData: Omit<Camera, 'id' | 'lastUpdated'>) => {
    const newId = `CAM-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newCamera: Camera = {
      ...cameraData,
      id: newId,
      lastUpdated: new Date().toISOString()
    };
    await setDoc(doc(db, 'cameras', newId), newCamera);
  };

  const removeCamera = async (id: string) => {
    await deleteDoc(doc(db, 'cameras', id));
  };

  const updateCameraStatus = async (id: string, status: CameraStatus, reason: OfflineReason = null) => {
    await updateDoc(doc(db, 'cameras', id), {
      status,
      offlineReason: status === 'Offline' ? reason : null,
      lastUpdated: new Date().toISOString()
    });
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
