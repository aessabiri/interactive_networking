import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Lock, UserCheck, Server, Play, Pause, RotateCcw, FolderTree, Gauge, Mail, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function ADModule() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [username, setUsername] = useState('dts.student');
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);

  const [logs, setLogs] = useState([
    { time: '19:55:00', tag: 'DC', message: 'Active Directory KDC Service listening on Port 88.' }
  ]);

  const stepMeta = {
    0: {
      title: 'Ready for Active Directory Login',
      subtitle: 'Click "Start Kerberos Login" to see how Windows authenticates users securely without sending passwords over the network!',
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    1: {
      title: '🔐 AUTHENTICATING (AS-REQ)...',
      subtitle: `User ${username} enters password. Client hashes password and sends authentication request to KDC Port 88...`,
      badge: 'STEP 1: AS-REQ',
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-500 animate-pulse',
      sender: 'CLIENT',
    },
    2: {
      title: '🎫 TGT TICKET ISSUED (AS-REP)...',
      subtitle: 'DC KDC verifies user password hash and returns a TGT (Ticket Granting Ticket)!',
      badge: 'STEP 2: TGT GRANTED',
      badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-500 animate-pulse',
      sender: 'DC',
    },
    3: {
      title: '📩 REQUESTING SERVICE ACCESS (TGS-REQ)...',
      subtitle: 'Client presents TGT to KDC requesting access to File Server \\\\FILESVR01...',
      badge: 'STEP 3: TGS-REQ',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'CLIENT',
    },
    4: {
      title: '🎟️ SERVICE TICKET ISSUED (TGS-REP)...',
      subtitle: 'KDC issues a Service Ticket specifically for \\\\FILESVR01...',
      badge: 'STEP 4: SERVICE TICKET',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      sender: 'DC',
    },
    5: {
      title: '✅ ACCESS GRANTED TO FILE SHARE!',
      subtitle: 'Client presents Service Ticket directly to File Server over SMB (Port 445). Login complete!',
      badge: 'STEP 5: ACCESS GRANTED',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'CLIENT',
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      if (activeStep < 5) {
        setPacketProgress(0);
        const animInterval = setInterval(() => {
          setPacketProgress(prev => Math.min(100, prev + 5));
        }, 30 / speed);

        timer = setTimeout(() => {
          const next = activeStep + 1;
          setActiveStep(next);
          const meta = stepMeta[next];
          setLogs(prev => [
            ...prev,
            { time: new Date().toLocaleTimeString(), tag: 'KERBEROS', message: `${meta.title} - ${meta.subtitle}` }
          ]);
          if (next === 5) setIsPlaying(false);
        }, 2200 / speed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStep, speed]);

  const handleStartPlay = () => {
    if (activeStep === 5) setActiveStep(1);
    else if (activeStep === 0) setActiveStep(1);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
    setPacketProgress(0);
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'DC', message: 'Kerberos tickets purged (klist purge).' }]);
  };

  const currentMeta = stepMeta[activeStep];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">Active Directory Kerberos Login</h2>
            <p className="text-xs text-slate-400">Watch user authentication & Kerberos ticket generation</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span>Speed:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  speed === s ? 'bg-purple-500 text-slate-950 shadow-md' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button onClick={handleReset} className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer">
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStartPlay}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pause' : 'Start Kerberos Login'}
          </button>
        </div>
      </div>

      {/* BIG VISUAL STAGE */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 ${currentMeta.badgeColor}`}>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-black uppercase bg-slate-950/80 border border-white/10 shadow">
              {currentMeta.badge}
            </span>
            <h3 className="text-lg font-black text-slate-100">{currentMeta.title}</h3>
          </div>
          <p className="text-xs text-slate-200 font-medium text-center sm:text-right max-w-md">{currentMeta.subtitle}</p>
        </div>

        {/* Nodes */}
        <div className="py-12 px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative min-h-[300px]">
          <div className="flex flex-col items-center gap-3 z-10">
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 5 ? 'bg-emerald-950 border-emerald-400 scale-110 shadow-2xl shadow-emerald-500/30' : 'bg-slate-900 border-slate-700'
            }`}>
              <UserCheck className="w-16 h-16 text-purple-400" />
            </div>
            <div className="text-center font-mono">
              <p className="text-sm font-extrabold text-slate-100">{username}</p>
              <p className="text-xs text-slate-400">Client PC (192.168.1.105)</p>
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto h-12 relative flex items-center justify-center">
            <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative shadow-inner">
              <div className="w-full h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 opacity-30"></div>
            </div>
            {isPlaying && (
              <div
                style={{ left: currentMeta.sender === 'CLIENT' ? `${packetProgress}%` : `${100 - packetProgress}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 px-3 py-1.5 rounded-full bg-purple-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-white"
              >
                <Lock className="w-4 h-4 fill-current" />
                <span>KERBEROS</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 z-10">
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 2 || activeStep === 4 ? 'bg-purple-950 border-purple-400 scale-110 shadow-2xl shadow-purple-500/30' : 'bg-slate-900 border-slate-700'
            }`}>
              <Server className="w-16 h-16 text-purple-400" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-purple-300">DC01 (KDC SERVER)</p>
              <p className="text-xs text-slate-400">IP: 192.168.1.10</p>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Port 88 (AS & TGS)
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Cache Status */}
        <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-4 border-t border-slate-800">
          <div className={`p-3 rounded-2xl border ${activeStep >= 2 ? 'bg-purple-950/60 border-purple-500 text-purple-200' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
            <span className="font-bold block text-sm">🎫 TGT Ticket</span>
            <span className="text-[11px]">{activeStep >= 2 ? 'ISSUED (krbtgt/CORP.LOCAL)' : 'NOT ISSUED'}</span>
          </div>
          <div className={`p-3 rounded-2xl border ${activeStep >= 4 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
            <span className="font-bold block text-sm">🎟️ Service Ticket</span>
            <span className="text-[11px]">{activeStep >= 4 ? 'ISSUED (cifs/FILESVR01)' : 'NOT ISSUED'}</span>
          </div>
        </div>
      </div>

      <TerminalLog logs={logs} onClear={() => setLogs([])} />

      {/* Technical Details Collapsible Drawer */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="w-full p-4 bg-slate-900/90 hover:bg-slate-900 flex items-center justify-between text-xs font-bold text-slate-300 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Technical Details (LDAP Structure & FSMO Roles)
          </span>
          {showTechDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechDetails && (
          <div className="p-5 space-y-4 font-mono text-xs bg-slate-950 border-t border-slate-800">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">LDAP Directory Path</span>
              <p className="text-slate-300">CN={username},OU=Herford,OU=Germany,DC=corp,DC=local</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
