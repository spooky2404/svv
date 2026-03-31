/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CameraProvider } from './context/CameraContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CameraGrid } from './pages/CameraGrid';
import { MapPage } from './pages/MapPage';
import { UserManagement } from './pages/UserManagement';

export default function App() {
  return (
    <AuthProvider>
      <CameraProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cameras" element={<CameraGrid />} />
                <Route path="/map" element={<MapPage />} />
                
                {/* Admin Only Route */}
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route path="/users" element={<UserManagement />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CameraProvider>
    </AuthProvider>
  );
}
