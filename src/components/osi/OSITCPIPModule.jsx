import React, { useState } from 'react';
import { Layers, Crosshair, Grid, Play, Zap, Mail, Globe, Server, Radio, Key, Activity, RotateCcw } from 'lucide-react';

export default function OSITCPIPModule({ appMode = 'clean' }) {
  const [selectedAction, setSelectedAction] = useState('mail'); // Default 'mail'
  const [encapsulationStep, setEncapsulationStep] = useState(7); // Starts at 7 (L7 App) down to 1 (L1 Physical)
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTargetLayer, setAnimationTargetLayer] = useState(null);
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0, pctX: 0, pctY: 0 });

  // Mouse move grid tracker
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    const pctX = Math.round((x / rect.width) * 100);
    const pctY = Math.round((y / rect.height) * 100);
    setCursorCoords({ x, y, pctX, pctY });
  };

  // Available Application Services
  const appActions = [
    { id: 'mail', name: 'Email Request (SMTP)', icon: Mail },
    { id: 'dns', name: 'DNS Request (Domain Query)', icon: Globe },
    { id: 'dhcp', name: 'DHCP Request (IP Lease DORA)', icon: Radio },
    { id: 'http', name: 'HTTP Web Request (GET)', icon: Server },
    { id: 'ssh', name: 'SSH Terminal Tunnel', icon: Key },
    { id: 'ping', name: 'Ping ICMP Echo Request', icon: Activity }
  ];

  // 7 OSI Layers Data with Permanent Distinct Vibrant Colors
  const osiLayers = [
    { level: 7, name: 'Application', pdu: 'Application Data', topPct: 3, bgColor: 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/30' },
    { level: 6, name: 'Presentation', pdu: 'Formatted / Encrypted', topPct: 12.5, bgColor: 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30' },
    { level: 5, name: 'Session', pdu: 'Session Socket Data', topPct: 22, bgColor: 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30' },
    { level: 4, name: 'Transport', pdu: 'TCP Segment', topPct: 31.5, bgColor: 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/30' },
    { level: 3, name: 'Network', pdu: 'IP Packet', topPct: 41, bgColor: 'bg-teal-500 text-slate-950 border-teal-300 shadow-teal-500/30' },
    { level: 2, name: 'Data Link', pdu: 'Ethernet Frame', topPct: 50.5, bgColor: 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30' },
    { level: 1, name: 'Physical', pdu: 'Bits / Symbols', topPct: 60, bgColor: 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30' }
  ];

  // Precise Layer-by-Layer Payload Lifecycle States
  const payloadLifecycle = {
    mail: {
      layers: {
        7: {
          chunkView: false,
          payloadState: 'MAIL FROM:<alice@example.com>\\r\\n\nRCPT TO:<bob@example.com>\\r\\n\nDATA\\r\\n\nSubject: Hi\\r\\n\\r\\n\nHello World\\r\\n.'
        },
        6: {
          chunkView: false,
          payloadState: 'Unreadable TLS Application Data record stream:\n0x17 0x03 0x03 0x00 0x28 0xA3 0x7E 0xF9 0x12 0xB4 0x8C 0x9D 0x3F 0x01 0xE7 0x55 0xD2 0x44 0x88 0x99...'
        },
        5: {
          chunkView: false,
          payloadState: 'Written to kernel OS TCP socket send buffer [Socket Handle #4 | State: ESTABLISHED | PID: 4102].'
        },
        4: {
          chunkView: true,
          blocks: ['[ TCP Header ]', '[ Encrypted TLS Data Chunk ]']
        },
        3: {
          chunkView: true,
          blocks: ['[ IP Header ]', '[ TCP Header ]', '[ Encrypted TLS Data ]']
        },
        2: {
          chunkView: true,
          blocks: ['[ Eth Header ]', '[ IP Header ]', '[ TCP Header ]', '[ Encrypted TLS Data ]', '[ FCS Trailer ]']
        },
        1: {
          chunkView: false,
          payloadState: 'Continuous Bitstream (Preamble + Payload):\n1010101010101011 00001000 00000000 01000101 00000000 00111100 10100011 11111000 00010010 11001001...'
        }
      }
    }
  };

  const currentActionSpec = payloadLifecycle[selectedAction] || payloadLifecycle.mail;
  const currentLayerSpec = currentActionSpec.layers[encapsulationStep];

  // Grid steps (10% increments)
  const gridSteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // SEQUENTIAL STEP-BY-STEP ENCAPSULATION ACTION ("Start Next Action")
  const handleStartNextAction = () => {
    if (isAnimating) return;

    // Target layer for this step
    const targetL = encapsulationStep;
    setAnimationTargetLayer(targetL);
    setIsAnimating(true);

    // 1. Shrink and translate into the Layer rectangle on the left
    setTimeout(() => {
      // 2. Advance step and expand back out into center with updated layer info
      setEncapsulationStep((prev) => (prev > 1 ? prev - 1 : 7));
      setIsAnimating(false);
      setAnimationTargetLayer(null);
    }, 800);
  };

  const handleResetFlow = () => {
    setEncapsulationStep(7);
    setIsAnimating(false);
    setAnimationTargetLayer(null);
  };

  // Current target top position for shrink animation
  const currentTargetObj = osiLayers.find(l => l.level === (animationTargetLayer || encapsulationStep)) || osiLayers[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto relative font-sans text-slate-100">
      
      {/* HEADER */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/20">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                <Grid className="w-3 h-3 text-cyan-400" /> COORDINATE GRID ACTIVE
              </span>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">OSI Layer-by-Layer Encapsulation Engine</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Click "Start Next Action" to watch payload encapsulate step-by-step down through the OSI stack.
            </p>
          </div>
        </div>

        {/* LIVE MOUSE COORDINATE BADGE */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-cyan-500/60 text-cyan-300 font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-500/10">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>X: <strong className="text-white">{cursorCoords.x}px ({cursorCoords.pctX}%)</strong></span>
            <span className="text-slate-600">|</span>
            <span>Y: <strong className="text-white">{cursorCoords.y}px ({cursorCoords.pctY}%)</strong></span>
          </div>
        </div>
      </div>

      {/* 🛠️ TOOLBAR ON TOP OF THE CANVAS */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/95 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        
        {/* SELECT ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Select Service:
          </span>
          {appActions.map((action) => {
            const IconComp = action.icon;
            const isSelected = selectedAction === action.id;

            return (
              <button
                key={action.id}
                onClick={() => {
                  setSelectedAction(action.id);
                  handleResetFlow();
                }}
                className={`px-3 py-1.5 rounded-xl border font-extrabold transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-md ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black scale-102 ring-2 ring-cyan-400/40'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{action.name}</span>
              </button>
            );
          })}
        </div>

        {/* 🔘 "START NEXT ACTION" BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNextAction}
            disabled={isAnimating}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xl tracking-wider uppercase ${
              isAnimating
                ? 'bg-amber-500 text-slate-950 border border-amber-300 animate-pulse'
                : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 hover:scale-105 hover:shadow-cyan-500/30 border border-emerald-300'
            }`}
          >
            {isAnimating ? <Zap className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isAnimating ? 'Encapsulating...' : 'Start Next Action'}</span>
          </button>

          <button
            onClick={handleResetFlow}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* CANVAS STAGE */}
      <div 
        onMouseMove={handleMouseMove}
        className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950 relative overflow-hidden font-mono text-xs min-h-[640px] select-none cursor-crosshair"
      >
        <div className="relative w-full h-[600px] bg-slate-950/90 rounded-2xl border-2 border-slate-800 overflow-hidden">
          
          {/* SVG COORDINATE GRID LINES OVERLAY */}
          <svg className="w-full h-full absolute inset-0 z-0 pointer-events-none">
            {gridSteps.map((pct) => (
              <g key={`v-${pct}`}>
                <line
                  x1={`${pct}%`} y1="0%" x2={`${pct}%`} y2="100%"
                  stroke={pct === 50 ? '#06b6d4' : '#1e293b'}
                  strokeWidth={pct === 50 ? '2' : '1'}
                  strokeDasharray={pct === 50 ? 'none' : '4,4'}
                />
                <text x={`${pct}%`} y="16" fill={pct === 50 ? '#06b6d4' : '#64748b'} fontSize="10" fontWeight="bold" textAnchor="middle">
                  X:{pct}%
                </text>
              </g>
            ))}

            {gridSteps.map((pct) => (
              <g key={`h-${pct}`}>
                <line
                  x1="0%" y1={`${pct}%`} x2="100%" y2={`${pct}%`}
                  stroke={pct === 50 ? '#06b6d4' : '#1e293b'}
                  strokeWidth={pct === 50 ? '2' : '1'}
                  strokeDasharray={pct === 50 ? 'none' : '4,4'}
                />
                <text x="32" y={`${pct}%`} fill={pct === 50 ? '#06b6d4' : '#64748b'} fontSize="10" fontWeight="bold" dominantBaseline="middle">
                  Y:{pct}%
                </text>
              </g>
            ))}
          </svg>

          {/* 📍 OSI 7-LAYER STACK VERTICALLY AT X:1%, Y:3% TO X:15%, Y:70% WITH PERMANENT DISTINCT COLORS */}
          <div 
            style={{
              left: '1%',
              top: '3%',
              width: '14%',
              height: '67%'
            }}
            className="absolute z-20 flex flex-col justify-between"
          >
            {osiLayers.map((layer) => {
              const isTargeting = (animationTargetLayer || encapsulationStep) === layer.level;

              return (
                <div
                  key={layer.level}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all duration-300 flex flex-col justify-center shadow-xl relative overflow-hidden font-black ${layer.bgColor} ${
                    isTargeting ? 'ring-4 ring-white border-2 scale-105 shadow-2xl animate-pulse' : 'opacity-95'
                  }`}
                  style={{ height: '12.5%' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.2 rounded font-mono font-black text-[10px] bg-slate-950 text-white border border-white/20">
                      L{layer.level}
                    </span>
                    <span className="text-[9px] font-mono font-bold opacity-90">
                      {layer.pdu.split(' ')[0]}
                    </span>
                  </div>
                  <p className="font-black text-xs leading-tight mt-0.5 truncate tracking-tight">
                    {layer.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ✉️ FLOATING WINDOW CONTAINING ONLY CLEAN PAYLOAD STATE (NO TITLES, NO ACTIVE LAYER SIGNS, NO UNNECESSARY CLUTTER AS REQUESTED) */}
          <div 
            style={
              isAnimating
                ? {
                    left: '1%',
                    top: `${currentTargetObj.topPct}%`,
                    width: '14%',
                    height: '8%',
                    transform: 'scale(0.35)',
                    opacity: 0.5
                  }
                : {
                    left: '22%',
                    top: '15%',
                    width: '74%',
                    height: '55%',
                    transform: 'scale(1)',
                    opacity: 1
                  }
            }
            className="absolute z-20 glass-panel p-6 rounded-3xl border-2 border-slate-700 bg-slate-900/95 shadow-2xl flex flex-col justify-center font-mono text-xs backdrop-blur-md transition-all duration-700 ease-in-out"
          >
            {/* ONLY CLEAN PAYLOAD STATE CONTENT */}
            {currentLayerSpec.chunkView ? (
              /* STRUCTURED CHUNK RECTANGLE BLOCKS FOR L4, L3, L2 */
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-cyan-500/80 flex flex-wrap items-center justify-center gap-3 font-mono font-black text-sm text-white shadow-2xl animate-in fade-in my-auto">
                {currentLayerSpec.blocks.map((b, idx) => (
                  <span
                    key={idx}
                    className={`px-4 py-2.5 rounded-xl border-2 shadow-xl ${
                      b.includes('Eth') ? 'bg-purple-950 border-purple-500 text-purple-200' :
                      b.includes('IP') ? 'bg-teal-950 border-teal-500 text-teal-200' :
                      b.includes('TCP') ? 'bg-cyan-950 border-cyan-500 text-cyan-200' :
                      b.includes('FCS') ? 'bg-amber-950 border-amber-500 text-amber-200' :
                      'bg-indigo-950 border-indigo-500 text-indigo-200'
                    }`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            ) : (
              /* TEXTUAL / STREAM PAYLOAD STATE FOR L7, L6, L5, L1 */
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-mono whitespace-pre-wrap leading-relaxed text-cyan-300 shadow-2xl my-auto">
                {currentLayerSpec.payloadState}
              </div>
            )}

          </div>

          {/* DYNAMIC CURSOR CROSSHAIR FOLLOWER OVERLAY */}
          {cursorCoords.x > 0 && (
            <div
              style={{ left: `${cursorCoords.x}px`, top: `${cursorCoords.y}px` }}
              className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-cyan-400 rounded-full flex items-center justify-center animate-ping opacity-75"></div>
              <div className="absolute w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-400"></div>
              <span className="absolute left-4 top-4 px-2 py-1 rounded-lg bg-slate-900 border border-cyan-500 text-cyan-300 text-[10px] font-black whitespace-nowrap shadow-xl">
                X:{cursorCoords.pctX}% | Y:{cursorCoords.pctY}%
              </span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
