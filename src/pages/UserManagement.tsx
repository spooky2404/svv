import React, { useState } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { UserPlus, Shield, User, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export const UserManagement: React.FC = () => {
  const { users, addUser, deleteUser, user: currentUser } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('User');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username and Password are required');
      return;
    }

    try {
      addUser(newUsername.trim(), newRole, newPassword.trim());
      setSuccess(`User ${newUsername} created successfully.`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('User');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold neon-text-cyan tracking-wider uppercase">Operator Provisioning</h1>
        <p className="text-gray-400 font-mono text-sm mt-1">Admin access control panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add User Form */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 rounded-xl border-t-4 border-t-cyan-500">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              New Operator
            </h2>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-3 py-2 rounded mb-4 text-xs font-mono">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/30 border border-green-500/50 text-[#39ff14] px-3 py-2 rounded mb-4 text-xs font-mono">
                {success}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="e.g., op_alpha"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="••••••••"
                />
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
        <div className="md:col-span-2">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#1f1f1f] bg-[#121212]/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Shield className="w-5 h-5 text-cyan-400" />
                Active Personnel
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-[#333] text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Username</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">{u.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center border border-[#333]">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-200">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider border",
                          u.role === 'Admin' 
                            ? "bg-cyan-900/20 text-cyan-400 border-cyan-500/30" 
                            : "bg-gray-800 text-gray-300 border-gray-600"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
