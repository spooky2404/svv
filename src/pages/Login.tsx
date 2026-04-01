import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await login();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]"></div>

      <div className="glass-panel p-10 rounded-2xl w-full max-w-md relative z-10 neon-border-cyan">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-cyan-500/50 mb-4 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-white">ERSV MAP</h1>
          <p className="text-cyan-500 font-mono text-sm mt-1">SECURE_LOGIN_GATEWAY</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm font-mono text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <p className="text-gray-400 text-center text-xs font-mono uppercase tracking-widest leading-relaxed">
            Authorized Personnel Only.<br/>
            Please authenticate using your Google Account to access the surveillance network.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold font-mono text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            {isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-[#333] text-center">
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">
            System Version: 2.4.0-STABLE
          </p>
        </div>
      </div>
    </div>
  );
};
