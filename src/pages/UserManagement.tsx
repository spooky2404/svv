import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { Shield, User, Trash2, UserPlus, Lock } from 'lucide-react';
import clsx from 'clsx';

export const UserManagement: React.FC = () => {
  const { users, addUser, deleteUser, user: currentUser } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('User');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username and Password are required');
      return;
    }

    try {
      await addUser(newUsername.trim(), newRole, newPassword.trim());
      setSuccess(`User ${newUsername} created successfully.`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('User');
    } catch (err: any) {
      setError(err.message);
    }
  };

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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold neon-text-cyan tracking-wider uppercase">Operator Management</h1>
        <p className="text-gray-400 font-mono text-sm mt-1">Local access control panel - Personnel Registry</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add User Form */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-xl border-t-4 border-t-cyan-500">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              New Operator
            </h2>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all"
                    placeholder="OPERATOR_ID"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Access Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-600" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all"
                    placeholder="PASSWORD"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Access Level</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="User">Operator (User)</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-900/50 transition-colors font-mono text-sm uppercase tracking-wider shadow-[0_0_10px_rgba(0,243,255,0.1)]"
              >
                Provision Access
              </button>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#1f1f1f] bg-[#121212]/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Shield className="w-5 h-5 text-cyan-400" />
                Active Personnel
              </h2>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                {users.length} Registered
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-[#333] text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Operator</th>
                    <th className="px-6 py-4 font-medium">Access Level</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center border border-[#333]">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-200 block">{u.username}</span>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">ID: {u.id}</span>
                          </div>
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
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest px-2 italic">Current Session</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
