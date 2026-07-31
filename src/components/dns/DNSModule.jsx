import React, { useState, useEffect } from 'react';
import { Globe, Search, Play, Pause, RotateCcw, Server, Laptop, Database, CheckCircle2, Gauge, Mail, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function DNSModule() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [targetDomain, setTargetDomain] = useState('dc01.corp.local');
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);

  const [logs, setLogs] = useState([
    { time: '19:55:00', tag: 'DNS', message: 'DNS Resolver initialized. Configured DNS: 192.168.1.10.' }
  ]);

  const stepMeta = {
    0: {
      title: 'Ready for DNS Resolution',
      subtitle: 'Type or select a domain name and click "Start DNS Lookup" to see how hostnames turn into IP addresses!',
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    1: {
      title: '🔍 ASKING LOCAL DNS SERVER...',
      subtitle: `The PC asks Local DNS (192.168.1.10): "What is the IP address for ${targetDomain}?"`,
      badge: 'STEP 1: RECURSIVE QUERY',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      sender: 'PC',
    },
    2: {
      title: '⚡ SEARCHING AD DATABASE ZONE...',
      subtitle: 'DC01 inspects its Active Directory Forward Lookup Zone to find matching A / SRV records...',
      badge: 'STEP 2: ZONE LOOKUP',
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-500 animate-pulse',
      sender: 'SERVER',
    },
    3: {
      title: '✅ RESOLVED! IP RETURNED!',
      subtitle: `DNS Server replies: "${targetDomain} is located at IP address 192.168.1.10!"`,
      badge: 'STEP 3: RESOLVED',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'SERVER',
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      if (activeStep < 3) {
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
            { time: new Date().toLocaleTimeString(), tag: 'DNS', message: `${meta.title} - ${meta.subtitle}` }
          ]);
          if (next === 3) setIsPlaying(false);
        }, 2200 / speed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStep, speed]);

  const handleStartPlay = () => {
    if (activeStep === 3) setActiveStep(1);
    else if (activeStep === 0) setActiveStep(1);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
    setPacketProgress(0);
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'DNS', message: 'DNS cache cleared.' }]);
  };

  const currentMeta = stepMeta[activeStep];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">DNS Resolver Visualizer</h2>
            <p className="text-xs text-slate-400">See how computer hostnames are converted into IP addresses</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Speed:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  speed === s ? 'bg-cyan-500 text-slate-950 shadow-md' : 'hover:bg-slate-800 text-slate-400'
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
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pause' : 'Start DNS Lookup'}
          </button>
        </div>
      </div>

      {/* Domain Target Selector */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-5 h-5 text-cyan-400" />
        <div className="flex-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Hostname Query</label>
          <select
            value={targetDomain}
            onChange={(e) => { setTargetDomain(e.target.value); handleReset(); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="dc01.corp.local">dc01.corp.local (Domain Controller Host A Record)</option>
            <option value="_ldap._tcp.dc._msdcs.corp.local">_ldap._tcp.dc._msdcs.corp.local (Active Directory SRV Record)</option>
            <option value="filesvr.corp.local">filesvr.corp.local (File Share Server)</option>
            <option value="www.corp.local">www.corp.local (Web Server CNAME Alias)</option>
          </select>
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

        {/* Large Nodes & Cables */}
        <div className="py-12 px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative min-h-[300px]">
          <div className="flex flex-col items-center gap-3 z-10">
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 3 ? 'bg-emerald-950 border-emerald-400 scale-110 shadow-2xl shadow-emerald-500/30' : 'bg-slate-900 border-slate-700'
            }`}>
              <Laptop className="w-16 h-16 text-cyan-400" />
            </div>
            <div className="text-center font-mono">
              <p className="text-sm font-extrabold text-slate-100">DNS CLIENT PC</p>
              <p className="text-xs text-slate-400">192.168.1.105</p>
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto h-12 relative flex items-center justify-center">
            <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative shadow-inner">
              <div className="w-full h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 opacity-30"></div>
            </div>
            {isPlaying && (
              <div
                style={{ left: currentMeta.sender === 'PC' ? `${packetProgress}%` : `${100 - packetProgress}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 px-3 py-1.5 rounded-full bg-cyan-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-white"
              >
                <Mail className="w-4 h-4 fill-current" />
                <span>DNS QUERY</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 z-10">
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 2 ? 'bg-purple-950 border-purple-400 scale-110 shadow-2xl shadow-purple-500/30' : 'bg-slate-900 border-slate-700'
            }`}>
              <Server className="w-16 h-16 text-cyan-400" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-cyan-300">DC01 (LOCAL DNS)</p>
              <p className="text-xs text-slate-400">IP: 192.168.1.10</p>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                UDP Port 53 Listening
              </span>
            </div>
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
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Technical DNS Zone Records & Header Details
          </span>
          {showTechDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechDetails && (
          <div className="p-5 space-y-3 font-mono text-xs bg-slate-950 border-t border-slate-800">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Authoritative Forward Zone: corp.local</span>
              <p className="text-slate-300">A Record: dc01.corp.local → 192.168.1.10</p>
              <p className="text-slate-300">SRV Record: _ldap._tcp.dc._msdcs.corp.local → Port 389 → dc01.corp.local</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
