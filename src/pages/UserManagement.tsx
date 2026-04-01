import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { Shield, User, Trash2, Mail } from 'lucide-react';
import clsx from 'clsx';

export const UserManagement: React.FC = () => {
  const { users, deleteUser, user: currentUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to revoke access for this operator?')) {
      try {
        await deleteUser(id);
        setSuccess('Access revoked successfully.');
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold neon-text-cyan tracking-wider uppercase">Operator Management</h1>
        <p className="text-gray-400 font-mono text-sm mt-1">Admin access control panel - Active Personnel</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-mono text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500/50 text-[#39ff14] px-4 py-3 rounded-lg text-sm font-mono text-center">
          {success}
        </div>
      )}

      <div className="glass-panel rounded-xl overflow-hidden border-t-4 border-t-cyan-500">
        <div className="p-6 border-b border-[#1f1f1f] bg-[#121212]/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Shield className="w-5 h-5 text-cyan-400" />
            Active Personnel List
          </h2>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            {users.length} Operators Connected
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-[#333] text-xs font-mono text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Operator Identity</th>
                <th className="px-6 py-4 font-medium">Email Address</th>
                <th className="px-6 py-4 font-medium">Access Level</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center border border-[#333] shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-200 block">{u.username}</span>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">UID: {u.uid.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                      <Mail className="w-3 h-3 text-gray-600" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider border",
                      u.role === 'Admin' 
                        ? "bg-cyan-900/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(0,243,255,0.1)]" 
                        : u.role === 'User'
                        ? "bg-green-900/20 text-green-400 border-green-500/30"
                        : "bg-gray-800 text-gray-300 border-gray-600"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.uid !== currentUser?.uid && (
                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                        title="Revoke Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {u.uid === currentUser?.uid && (
                      <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest px-2 italic">Current Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-[#333] bg-[#121212]/30">
        <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Shield className="w-3 h-3" />
          Security Protocol
        </h3>
        <p className="text-xs text-gray-400 font-mono leading-relaxed">
          Access is managed via Google Authentication. New operators are automatically assigned the <span className="text-white">Viewer</span> role upon their first login. Administrators can upgrade or revoke access from this panel.
        </p>
      </div>
    </div>
  );
};
