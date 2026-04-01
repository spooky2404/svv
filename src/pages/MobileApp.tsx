import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, Info, ArrowRight, SmartphoneIcon as Android, Apple } from 'lucide-react';
import { motion } from 'motion/react';

export const MobileApp: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-900/20 border border-cyan-500/30 mb-4"
        >
          <Smartphone className="w-10 h-10 text-cyan-400" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white tracking-tight uppercase font-mono">Mobile App Deployment</h1>
        <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto">
          Transform this surveillance terminal into a native mobile application. 
          No APK or App Store required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Installation Card */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Download className="w-24 h-24 text-cyan-500" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Direct Installation
          </h2>

          <div className="space-y-6 relative z-10">
            <p className="text-gray-400 text-sm leading-relaxed font-mono">
              The system uses <span className="text-cyan-400">PWA Technology</span>. 
              This allows the app to run in a dedicated window, offline, and with a home screen icon.
            </p>

            {isInstalled ? (
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-mono text-sm uppercase tracking-widest">App Already Installed</span>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="w-full py-4 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                <Download className="w-5 h-5" />
                Install Now
              </button>
            ) : (
              <div className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-cyan-400/70 font-mono text-xs leading-relaxed uppercase">
                  To install manually, use the "Add to Home Screen" option in your browser menu.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Network Access Card */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-wider">
            <Info className="w-5 h-5 text-cyan-400" />
            Network Access
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-400 text-sm font-mono leading-relaxed">
              To access this terminal from your phone, ensure both devices are on the same local network.
            </p>
            
            <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded-xl space-y-2">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Local Access URL</p>
              <div className="flex items-center justify-between">
                <code className="text-cyan-400 font-mono text-sm">http://{window.location.hostname}:3000</code>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>

            <div className="pt-4">
              <div className="p-6 bg-cyan-900/10 border border-cyan-500/30 rounded-2xl text-center space-y-4">
                <p className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Direct Access Link</p>
                <a 
                  href={`http://${window.location.hostname}:3000`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-all font-mono text-xs uppercase tracking-widest"
                >
                  Open in New Tab
                </a>
                <p className="text-[10px] font-mono text-gray-500 uppercase leading-relaxed">
                  Copy this link and send it to your phone via email or messaging app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OS Specific Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Android className="w-6 h-6 text-green-500" />
            <h3 className="text-white font-bold font-mono uppercase tracking-widest">Android / Chrome</h3>
          </div>
          <ol className="space-y-3 text-xs font-mono text-gray-400">
            <li className="flex gap-2">
              <span className="text-cyan-500">01.</span>
              Open Chrome and navigate to the Access URL.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">02.</span>
              Tap the three dots menu (⋮) in the top right.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">03.</span>
              Select <span className="text-white">"Install App"</span> or <span className="text-white">"Add to Home Screen"</span>.
            </li>
          </ol>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Apple className="w-6 h-6 text-gray-200" />
            <h3 className="text-white font-bold font-mono uppercase tracking-widest">iOS / Safari</h3>
          </div>
          <ol className="space-y-3 text-xs font-mono text-gray-400">
            <li className="flex gap-2">
              <span className="text-cyan-500">01.</span>
              Open Safari and navigate to the Access URL.
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">02.</span>
              Tap the Share icon (square with arrow up).
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">03.</span>
              Scroll down and select <span className="text-white">"Add to Home Screen"</span>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
