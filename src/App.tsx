/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CameraProvider } from './context/CameraContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CameraGrid } from './pages/CameraGrid';
import { MapPage } from './pages/MapPage';
import { UserManagement } from './pages/UserManagement';
import { MobileApp } from './pages/MobileApp';

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Local Network...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cameras" element={<CameraGrid />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/mobile" element={<MobileApp />} />
            
            {/* Admin Only Route */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CameraProvider>
        <AppContent />
      </CameraProvider>
    </AuthProvider>
  );
}
