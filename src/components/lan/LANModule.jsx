import React, { useState, useEffect } from 'react';
import { Layers, Network, Router, Play, Pause, RotateCcw, CheckCircle2, Gauge, Mail, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function LANModule() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);

  const [logs, setLogs] = useState([
    { time: '19:55:00', tag: 'ARP', message: 'L2 Switch powered on. CAM Table empty.' }
  ]);

  const stepMeta = {
    0: {
      title: 'Ready for ARP Broadcast',
      subtitle: 'Click "Start ARP Animation" to see how switches learn MAC addresses and route frames!',
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    1: {
      title: '📢 BROADCASTING ARP REQUEST...',
      subtitle: 'PC-A shouts to all ports: "Who has IP 192.168.1.60? Tell 192.168.1.50!"',
      badge: 'STEP 1: BROADCAST',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'PCA',
    },
    2: {
      title: '🧠 LEARNING MAC & FLOODING...',
      subtitle: 'Switch records PC-A MAC on Port 1 in CAM table and floods frame to Port 2...',
      badge: 'STEP 2: CAM LEARNING',
      badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-500 animate-pulse',
      sender: 'SWITCH',
    },
    3: {
      title: '✉️ UNICAST ARP REPLY...',
      subtitle: 'PC-B replies with MAC 00:66:77:88:99:AA. Both hosts update ARP cache!',
      badge: 'STEP 3: ARP REPLY',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'PCB',
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
            { time: new Date().toLocaleTimeString(), tag: 'ARP', message: `${meta.title} - ${meta.subtitle}` }
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
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'ARP', message: 'ARP cache & Switch CAM table cleared.' }]);
  };

  const currentMeta = stepMeta[activeStep];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">LAN Infrastructure & ARP Broadcast</h2>
            <p className="text-xs text-slate-400">Observe Ethernet frames, switch MAC tables, and ARP resolution</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Speed:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  speed === s ? 'bg-blue-500 text-slate-950 shadow-md' : 'hover:bg-slate-800 text-slate-400'
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
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pause' : 'Start ARP Animation'}
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
              activeStep === 1 ? 'bg-blue-950 border-blue-400 scale-110 shadow-2xl shadow-blue-500/30' : 'bg-slate-900 border-slate-700'
            }`}>
              <Network className="w-16 h-16 text-blue-400" />
            </div>
            <div className="text-center font-mono">
              <p className="text-sm font-extrabold text-slate-100">PC-A</p>
              <p className="text-xs text-slate-400">192.168.1.50</p>
              <p className="text-[10px] text-slate-500">MAC: 00:11:22:33:44:55</p>
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto h-12 relative flex items-center justify-center">
            <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative shadow-inner">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 opacity-30"></div>
            </div>
            {isPlaying && (
              <div
                style={{ left: currentMeta.sender === 'PCA' ? `${packetProgress}%` : `${100 - packetProgress}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 px-3 py-1.5 rounded-full bg-blue-400 text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5 border-2 border-white"
              >
                <Mail className="w-4 h-4 fill-current" />
                <span>ARP FRAME</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 z-10">
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 3 ? 'bg-emerald-950 border-emerald-400 scale-110 shadow-2xl shadow-emerald-500/30' : 'bg-slate-900 border-slate-700'
            }`}>
              <Network className="w-16 h-16 text-emerald-400" />
            </div>
            <div className="text-center font-mono">
              <p className="text-sm font-extrabold text-slate-100">PC-B</p>
              <p className="text-xs text-slate-400">192.168.1.60</p>
              <p className="text-[10px] text-slate-500">MAC: 00:66:77:88:99:AA</p>
            </div>
          </div>
        </div>

        {/* Switch CAM Table */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-blue-400 font-bold">
            <span>🧠 Switch CAM / MAC Address Table</span>
            <span className="text-slate-500 text-[10px]">VLAN 1</span>
          </div>
          <div className="grid grid-cols-3 text-slate-400 font-bold text-[11px]">
            <div>Port</div>
            <div>Learned MAC</div>
            <div>Device</div>
          </div>
          <div className={`grid grid-cols-3 p-2 rounded-xl border ${activeStep >= 2 ? 'bg-blue-950/60 border-blue-500 text-blue-200 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-600'}`}>
            <div>Port 1</div>
            <div>{activeStep >= 2 ? '00:11:22:33:44:55' : 'EMPTY'}</div>
            <div>PC-A</div>
          </div>
          <div className={`grid grid-cols-3 p-2 rounded-xl border ${activeStep >= 3 ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-600'}`}>
            <div>Port 2</div>
            <div>{activeStep >= 3 ? '00:66:77:88:99:AA' : 'EMPTY'}</div>
            <div>PC-B</div>
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
            <HelpCircle className="w-4 h-4 text-blue-400" />
            Technical Details (OSI 7-Layer Stack & Subnet Calculator)
          </span>
          {showTechDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechDetails && (
          <div className="p-5 space-y-3 font-mono text-xs bg-slate-950 border-t border-slate-800">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-blue-400 font-bold block mb-1">Ethernet Frame & ARP Protocol</span>
              <p className="text-slate-300">EtherType: 0x0806 (ARP)</p>
              <p className="text-slate-300">Broadcast Destination MAC: FF:FF:FF:FF:FF:FF</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
