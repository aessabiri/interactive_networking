import React, { useState, useEffect } from 'react';
import { Globe, Cloud, Router, Server, Laptop, Search, Play, Pause, RotateCcw, CheckCircle2, Gauge, Mail, ChevronDown, ChevronUp, HelpCircle, FileCode, Terminal, SkipForward, Radio, Layers, Cpu, ArrowRight, ShieldCheck, X } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function DNSModule() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5); // Default 0.5x speed
  const [targetDomain, setTargetDomain] = useState('google.com');
  const [packetProgress, setPacketProgress] = useState(0);
  const [modalPayloadStep, setModalPayloadStep] = useState(null);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'DNS', message: 'DNS & NAT Visualizer ready. Choose a domain to start lookup.' }
  ]);

  const isExternalDomain = !targetDomain.endsWith('.local');

  // Step Metadata for Local vs External Queries
  const stepMetaLocal = {
    0: {
      title: 'Ready for Local DNS Resolution',
      subtitle: 'Target is in local domain (.local). Query stays inside private LAN (192.168.1.0/24). NAT is not required.',
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      type: 'NONE'
    },
    1: {
      title: '📢 STEP 1: RECURSIVE LAN QUERY (PC ➔ LOCAL DNS)',
      subtitle: `PC-01 (192.168.1.105) sends packet to Local DNS Server DC01 (192.168.1.10): "What is the IP for ${targetDomain}?"`,
      badge: 'LAN QUERY (UDP 53)',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      sender: 'PC',
      target: 'DC01',
      payload: {
        stepName: '1. Internal LAN Query',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:0C:29:88:77:66 (DC01)',
        l3Header: 'Src IP: 192.168.1.105 (Private) → Dst IP: 192.168.1.10 (Private)',
        l4Header: 'UDP Src Port: 53102 → Dst Port: 53 (DNS Query)',
        natStatus: 'NAT NOT TRIGGERED (Traffic is local inside 192.168.1.0/24)',
        queryDetail: `Standard Query A ${targetDomain}`,
      }
    },
    2: {
      title: '⚡ STEP 2: ACTIVE DIRECTORY ZONE LOOKUP',
      subtitle: 'DC01 inspects its Forward Lookup Zone "corp.local" in Active Directory database...',
      badge: 'LOCAL AD ZONE LOOKUP',
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-500 animate-pulse',
      sender: 'DC01',
      target: 'DC01',
      payload: {
        stepName: '2. AD Zone Record Match',
        l2Header: 'Internal Memory Lookup (ntds.dit)',
        l3Header: 'Local Domain Match: corp.local',
        l4Header: 'Record Type: Host (A) Record',
        natStatus: 'NO NAT REQUIRED',
        queryDetail: `${targetDomain} matched -> IP 192.168.1.10 (Authoritative Answer)`,
      }
    },
    3: {
      title: '✅ STEP 3: AUTHORITATIVE ANSWER RETURNED (LOCAL DNS ➔ PC)',
      subtitle: `DC01 returns answer packet back to PC-01: "${targetDomain} is located at Private IP 192.168.1.10!"`,
      badge: 'RESOLVED (LOCAL)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'DC01',
      target: 'PC',
      payload: {
        stepName: '3. Internal DNS Response',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:50:56:A1:B2:C3',
        l3Header: 'Src IP: 192.168.1.10 → Dst IP: 192.168.1.105',
        l4Header: 'UDP Src Port: 53 → Dst Port: 53102',
        natStatus: 'LOCAL RETURN (No NAT)',
        queryDetail: `Answer: ${targetDomain} A 192.168.1.10 (TTL 86400s)`,
      }
    }
  };

  const stepMetaExternal = {
    0: {
      title: 'Ready for Internet DNS Lookup + NAT',
      subtitle: `Target "${targetDomain}" is a public domain. Watch the packet travel out to DNS and back to PC-01!`,
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      type: 'NONE'
    },
    1: {
      title: '📢 STEP 1: PC QUERIES ISP ROUTER GATEWAY (PC ➔ ROUTER)',
      subtitle: `PC-01 (192.168.1.105) sends DNS query for "${targetDomain}" across LAN cable to Gateway Router (192.168.1.1).`,
      badge: 'LAN QUERY (UDP 53)',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      sender: 'PC',
      target: 'ROUTER',
      payload: {
        stepName: '1. LAN DNS Query to Gateway',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:11:22:33:44:55 (Router)',
        l3Header: 'Src IP: 192.168.1.105 (Private) → Dst IP: 8.8.8.8 (Public DNS)',
        l4Header: 'UDP Src Port: 54321 → Dst Port: 53',
        natStatus: 'PRE-NAT (Private IP inside LAN)',
        queryDetail: `Standard Query A ${targetDomain}`,
      }
    },
    2: {
      title: '🔀 STEP 2: ISP ROUTER NAT & CLOUD FORWARDING (ROUTER ➔ CLOUD)',
      subtitle: 'ISP Router rewrites Private IP 192.168.1.105:54321 → Public IP 203.0.113.45:41001 and sends packet into Cloud!',
      badge: 'NAT TRANSLATION & WAN TRAVERSAL',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      sender: 'ROUTER',
      target: 'CLOUD',
      payload: {
        stepName: '2. Router NAT Translation (PAT)',
        l2Header: 'Src MAC: 00:11:22:33:44:55 → Gateway ISP MAC: 00:AA:BB:CC:DD:EE',
        l3Header: 'Src IP: 203.0.113.45 (PUBLIC WAN) → Dst IP: 8.8.8.8 (Public DNS)',
        l4Header: 'UDP Src Port: 41001 (Translated Port) → Dst Port: 53',
        natStatus: 'NAT TRANSLATED: 192.168.1.105:54321 ➔ 203.0.113.45:41001',
        queryDetail: `SNAT Applied. Packet forwarded into Internet Cloud ☁️`,
      }
    },
    3: {
      title: '☁️ STEP 3: INTERNET CLOUD ➔ PUBLIC DNS (8.8.8.8)',
      subtitle: 'Packet travels through Internet Cloud backbone to Google Public DNS (8.8.8.8) which resolves IP!',
      badge: 'INTERNET CLOUD RESOLUTION',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'CLOUD',
      target: 'PUBLIC_DNS',
      payload: {
        stepName: '3. Internet Cloud Resolution',
        l2Header: 'WAN Fiber Optic / Internet Backbone Routing',
        l3Header: 'Src IP: 203.0.113.45 → Dst IP: 8.8.8.8 (Google Public DNS)',
        l4Header: 'UDP Src Port: 41001 → Dst Port: 53',
        natStatus: 'TRANSITING PUBLIC INTERNET',
        queryDetail: `8.8.8.8 returns: ${targetDomain} A 142.250.180.206`,
      }
    },
    4: {
      title: '✅ STEP 4: DNS ANSWER RETURN TRIP (PUBLIC DNS ➔ ROUTER ➔ PC)',
      subtitle: 'Resolved IP answer packet returns back through NAT and delivers IP 142.250.180.206 to PC-01!',
      badge: 'RESOLVED & RETURNED TO PC (142.250.180.206)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'PUBLIC_DNS',
      target: 'PC',
      payload: {
        stepName: '4. Reverse NAT & Delivery',
        l2Header: 'Src MAC: 00:11:22:33:44:55 → Dst MAC: 00:50:56:A1:B2:C3',
        l3Header: 'Src IP: 8.8.8.8 → Dst IP: 192.168.1.105 (Restored Private IP)',
        l4Header: 'UDP Src Port: 53 → Dst Port: 54321',
        natStatus: 'REVERSE NAT SUCCESS: Restored Private IP 192.168.1.105',
        queryDetail: `Client PC-01 receives IP: ${targetDomain} = 142.250.180.206`,
      }
    }
  };

  const stepMeta = isExternalDomain ? stepMetaExternal : stepMetaLocal;
  const totalSteps = isExternalDomain ? 4 : 3;

  useEffect(() => {
    let animInterval;
    let timer;

    if (isPlaying) {
      setPacketProgress(0);
      animInterval = setInterval(() => {
        setPacketProgress(prev => Math.min(100, prev + 2));
      }, 35 / speed);

      if (isSingleStep) {
        timer = setTimeout(() => {
          setIsPlaying(false);
          setIsSingleStep(false);
        }, 2200 / speed);
      } else {
        timer = setTimeout(() => {
          if (activeStep < totalSteps) {
            const next = activeStep + 1;
            setActiveStep(next);
            const meta = stepMeta[next];
            setLogs(prev => [
              ...prev,
              { time: new Date().toLocaleTimeString(), tag: 'DNS', message: `${meta.title} - ${meta.subtitle}` }
            ]);
          } else {
            setIsPlaying(false);
          }
        }, 2500 / speed);
      }
    }

    return () => {
      clearInterval(animInterval);
      clearTimeout(timer);
    };
  }, [isPlaying, activeStep, speed, isSingleStep, isExternalDomain]);

  const handleStartPlay = () => {
    if (activeStep >= totalSteps) setActiveStep(1);
    else if (activeStep === 0) setActiveStep(1);
    setIsSingleStep(false);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    if (activeStep >= totalSteps) return;
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    setIsSingleStep(true);
    setIsPlaying(true);
    const meta = stepMeta[nextStep];
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: 'DNS', message: `STEP ${nextStep}: ${meta.title}` }
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsSingleStep(false);
    setActiveStep(0);
    setPacketProgress(0);
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'DNS', message: 'DNS cache & NAT state cleared.' }]);
  };

  const currentMeta = stepMeta[activeStep] || stepMeta[0];
  const isFinalStepComplete = activeStep === totalSteps;
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;

  // DYNAMIC PACKET ANIMATION TRAJECTORY CALCULATIONS FOR TO AND BACK TRAVERSAL:
  // Node coordinates:
  // PC-01: (15%, 55%)
  // DC01: (28%, 18%)
  // ISP Router: (45%, 55%)
  // Internet Cloud: (72%, 25%)
  // Public DNS: (88%, 55%)

  const getPacketPos = () => {
    if (!isPlaying && activeStep === 0) return null;
    const p = packetProgress / 100; // 0 to 1

    if (isExternalDomain) {
      if (activeStep === 1) {
        // Step 1: PC (15%, 55%) -> ISP Router (45%, 55%)
        return {
          left: `${15 + p * 30}%`,
          top: '55%',
          label: 'DNS Query (UDP 53)',
          bgColor: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/50'
        };
      } else if (activeStep === 2) {
        // Step 2: ISP Router (45%, 55%) -> Internet Cloud (72%, 25%)
        return {
          left: `${45 + p * 27}%`,
          top: `${55 - p * 30}%`,
          label: 'NAT Packet (203.0.113.45)',
          bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
        };
      } else if (activeStep === 3) {
        // Step 3: Internet Cloud (72%, 25%) -> Public DNS (88%, 55%)
        return {
          left: `${72 + p * 16}%`,
          top: `${25 + p * 30}%`,
          label: `Query A ${targetDomain}`,
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
        };
      } else if (activeStep === 4) {
        // Step 4: Public DNS (88%, 55%) -> RETURN ALL THE WAY BACK TO PC (15%, 55%)!
        return {
          left: `${88 - p * 73}%`,
          top: '55%',
          label: 'DNS Answer (142.250.180.206)',
          bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-emerald-500/50 animate-bounce'
        };
      }
    } else {
      // LOCAL QUERY TRAJECTORIES:
      if (activeStep === 1) {
        // Step 1: PC (15%, 55%) -> DC01 (28%, 18%)
        return {
          left: `${15 + p * 13}%`,
          top: `${55 - p * 37}%`,
          label: 'Local Query (UDP 53)',
          bgColor: 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 shadow-cyan-500/50'
        };
      } else if (activeStep === 2) {
        // Step 2: Inspection at DC01 (28%, 18%)
        return {
          left: '28%',
          top: '18%',
          label: 'AD Zone Lookup...',
          bgColor: 'bg-purple-500 text-white shadow-purple-500/50'
        };
      } else if (activeStep === 3) {
        // Step 3: DC01 (28%, 18%) -> RETURN BACK TO PC (15%, 55%)!
        return {
          left: `${28 - p * 13}%`,
          top: `${18 + p * 37}%`,
          label: 'DNS Answer (192.168.1.10)',
          bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-emerald-500/50 animate-bounce'
        };
      }
    }
    return null;
  };

  const animPos = getPacketPos();

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      
      {/* FLOATING MODAL POPUP FOR PACKET & NAT PAYLOAD INSPECTOR (BIG FONTS) */}
      {modalPayloadStep && activeModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-6 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <FileCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">{activeModalData.stepName} Payload</h3>
                  <p className="text-xs text-amber-400 font-mono font-bold">{activeModalData.queryDetail}</p>
                </div>
              </div>
              <button
                onClick={() => setModalPayloadStep(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with BIG READABLE FONTS */}
            <div className="space-y-4 font-mono">
              
              {/* NAT Status Banner */}
              <div className="p-4 bg-amber-950/60 rounded-2xl border border-amber-700/60 space-y-1">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Router NAT State (SNAT / PAT):</span>
                <p className="text-base font-black text-amber-300">{activeModalData.natStatus}</p>
              </div>

              {/* L2, L3, L4 Headers Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4" />
                  <span>Network Stack Packet Headers</span>
                </div>
                <div className="space-y-2 text-sm text-slate-200">
                  <p><span className="text-slate-500 font-bold">Layer 2 (Ethernet):</span> <span className="text-cyan-300 font-bold">{activeModalData.l2Header}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 3 (IPv4 Header):</span> <span className="text-amber-300 font-bold">{activeModalData.l3Header}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 4 (UDP Ports):</span> <span className="text-emerald-300 font-bold">{activeModalData.l4Header}</span></p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalPayloadStep(null)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN MASTER WORKSPACE STAGE FOR DNS & NAT */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* DOMAIN TARGET SELECTOR & MODE BADGE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Search className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Select Hostname to Resolve</span>
              <select
                value={targetDomain}
                onChange={(e) => { setTargetDomain(e.target.value); handleReset(); }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <optgroup label="🌐 Public Internet Domains (Triggers Router NAT & Internet Cloud)">
                  <option value="google.com">google.com (Public Web - NAT Needed)</option>
                  <option value="microsoft.com">microsoft.com (Public Cloud - NAT Needed)</option>
                  <option value="github.com">github.com (Public Code - NAT Needed)</option>
                </optgroup>
                <optgroup label="🏢 Internal Active Directory Domains (LAN Resolution)">
                  <option value="dc01.corp.local">dc01.corp.local (Local AD Domain Controller)</option>
                  <option value="_ldap._tcp.dc._msdcs.corp.local">_ldap._tcp.dc._msdcs.corp.local (AD SRV Record)</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border shadow ${
              isExternalDomain ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-purple-950 text-purple-300 border-purple-700'
            }`}>
              {isExternalDomain ? '🌐 PUBLIC INTERNET QUERY (NAT ACTIVE)' : '🏢 LOCAL AD LAN QUERY (NO NAT)'}
            </span>
          </div>
        </div>

        {/* WORKSPACE CONTROL TOOLBAR */}
        <div className="glass-panel p-2.5 rounded-2xl border border-slate-800/90 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Animation Speed:</span>
              {[0.25, 0.5, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    speed === s ? 'bg-cyan-500 text-slate-950 shadow-md' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2">
            {isFinalStepComplete ? (
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer transition-all animate-bounce"
              >
                <RotateCcw className="w-4 h-4" /> Reset & Restart DNS Query
              </button>
            ) : (
              <>
                <button
                  onClick={handleStepForward}
                  disabled={isPlaying}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-extrabold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  <SkipForward className="w-4 h-4 fill-current" /> Next Step ({activeStep + 1}/{totalSteps})
                </button>

                <button
                  onClick={handleStartPlay}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isPlaying
                      ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 hover:scale-105 text-slate-950 shadow-cyan-500/30'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isPlaying ? 'Pause' : 'Start DNS Lookup'}
                </button>

                <button onClick={handleReset} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer" title="Reset">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Action Status Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 ${currentMeta.badgeColor}`}>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-black uppercase bg-slate-950/80 border border-white/10 shadow flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
              {currentMeta.badge}
            </span>
            <h3 className="text-lg font-black text-slate-100">{currentMeta.title}</h3>
          </div>
          <p className="text-xs text-slate-200 font-medium text-center sm:text-right max-w-md">{currentMeta.subtitle}</p>
        </div>

        {/* ENLARGED TOPOLOGY STAGE (PRIVATE LAN ➔ ISP ROUTER WITH NAT ➔ INTERNET CLOUD ➔ PUBLIC DNS) */}
        <div className="py-6 px-4 relative min-h-[520px] bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden">
          
          {/* VISIBLE NETWORK CONNECTION LINES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Cable 1: PC-01 (15%, 55%) -> ISP Router (45%, 55%) */}
            <line x1="15%" y1="55%" x2="45%" y2="55%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />
            
            {/* Cable 2: ISP Router (45%, 55%) -> Internet Cloud (72%, 25%) */}
            <line x1="45%" y1="55%" x2="72%" y2="25%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />

            {/* Cable 3: Internet Cloud (72%, 25%) -> Public DNS (88%, 55%) */}
            <line x1="72%" y1="25%" x2="88%" y2="55%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />

            {/* Cable 4: PC-01 (15%, 55%) -> Local DC01 DNS (28%, 18%) */}
            <line x1="15%" y1="55%" x2="28%" y2="18%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.5" />
          </svg>

          {/* PRIVATE LAN BOUNDARY CONTAINER */}
          <div className="absolute left-[2%] top-[5%] w-[48%] h-[90%] border-2 border-dashed border-cyan-800/40 rounded-3xl pointer-events-none p-3">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              PRIVATE SUBNET (192.168.1.0/24)
            </span>
          </div>

          {/* PUBLIC INTERNET / WAN BOUNDARY CONTAINER */}
          <div className="absolute right-[2%] top-[5%] w-[48%] h-[90%] border-2 border-dashed border-amber-800/40 rounded-3xl pointer-events-none p-3 text-right">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
              PUBLIC INTERNET (WAN / 203.0.113.0/24)
            </span>
          </div>

          {/* 1. PC-01 CLIENT (LEFT: 15%, 55%) */}
          <div className="absolute left-[15%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              Private IP: 192.168.1.105
            </span>
            <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 4 || (!isExternalDomain && activeStep === 3)
                ? 'bg-emerald-950 border-emerald-400 shadow-2xl scale-110'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Laptop className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="text-center font-mono space-y-0.5">
              <p className="text-xs font-extrabold text-slate-100">WORKSTATION-01</p>
              <p className="text-[10px] text-slate-400">DNS Client</p>
            </div>
          </div>

          {/* 2. LOCAL DC01 DNS SERVER (TOP-LEFT: 28%, 18%) */}
          <div className="absolute left-[28%] top-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-700 shadow">
              192.168.1.10 (UDP Port 53)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all ${
              !isExternalDomain && activeStep === 2 ? 'bg-purple-900 border-purple-400 scale-110 shadow-xl' : 'bg-slate-900 border-slate-700'
            }`}>
              <Server className="w-10 h-10 text-purple-400" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-purple-300">DC01 (LOCAL AD DNS)</p>
              <p className="text-slate-500">Zone: corp.local</p>
            </div>
          </div>

          {/* 3. ISP ROUTER WITH NAT OPERATION (CENTER-LEFT: 45%, 55%) */}
          <div className="absolute left-[45%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-amber-950 text-amber-300 border border-amber-600 shadow-lg flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> ISP ROUTER (NAT GATEWAY)
            </span>
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              isExternalDomain && (activeStep === 2 || activeStep === 4)
                ? 'bg-amber-900/90 border-amber-400 shadow-2xl shadow-amber-500/40 scale-110 animate-pulse'
                : 'bg-amber-950/80 border-amber-700 text-amber-300'
            }`}>
              <Router className="w-14 h-14 text-amber-400" />
            </div>
            <div className="text-center font-mono">
              <p className="text-xs font-extrabold text-amber-300">LAN: 192.168.1.1</p>
              <p className="text-[10px] text-amber-400 font-bold">WAN: 203.0.113.45 (Public)</p>
            </div>
          </div>

          {/* 4. GLOWING INTERNET CLOUD (TOP-RIGHT: 72%, 25%) */}
          <div className="absolute left-[72%] top-[25%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-blue-950 text-blue-300 border border-blue-700 shadow flex items-center gap-1">
              <Cloud className="w-3 h-3 text-blue-400" /> PUBLIC WAN BACKBONE
            </span>
            <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
              isExternalDomain && activeStep === 3
                ? 'bg-blue-900/90 border-blue-400 shadow-2xl shadow-blue-500/50 scale-110 animate-bounce'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Globe className="w-12 h-12 text-blue-400" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-blue-300">INTERNET CLOUD ☁️</p>
              <p className="text-slate-400">Root & TLD Servers</p>
            </div>
          </div>

          {/* 5. PUBLIC DNS SERVER (RIGHT: 88%, 55%) */}
          <div className="absolute left-[88%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-blue-950 text-blue-300 border border-blue-700 shadow">
              Public IP: 8.8.8.8
            </span>
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              isExternalDomain && activeStep === 3
                ? 'bg-blue-950 border-blue-400 shadow-2xl scale-105'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Server className="w-14 h-14 text-blue-400" />
            </div>
            <div className="text-center font-mono space-y-0.5">
              <p className="text-xs font-extrabold text-blue-300">GOOGLE PUBLIC DNS</p>
              <p className="text-[10px] text-slate-400">Authoritative Resolver</p>
            </div>
          </div>

          {/* DYNAMIC ANIMATED PACKET OVERLAY (TRAVELING TO DNS AND RETURN TRIP TO PC) */}
          {animPos && (
            <div
              style={{ left: animPos.left, top: animPos.top }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-full font-mono font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-white transition-all duration-100 ${animPos.bgColor}`}
            >
              <Mail className="w-4 h-4 fill-current" />
              <span>{animPos.label}</span>
            </div>
          )}

          {/* NAT TRANSLATION LIVE TABLE OVERLAY (DISPLAYED INSIDE WORKSPACE WHEN NAT IS ACTIVE) */}
          {isExternalDomain && (
            <div className="absolute left-[45%] top-[82%] transform -translate-x-1/2 -translate-y-1/2 z-20 bg-slate-950/95 p-3 rounded-2xl border border-amber-500/40 shadow-xl font-mono text-[10px] space-y-1 text-left min-w-[320px]">
              <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ROUTER NAT TRANSLATION TABLE (PAT)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700">ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 pt-0.5">
                <div>
                  <span className="text-slate-500 block">Inside Private IP:</span>
                  <span className="text-cyan-300 font-bold">192.168.1.105:54321</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Translated Public WAN IP:</span>
                  <span className="text-amber-300 font-bold">203.0.113.45:41001</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP INSPECTION BUTTONS & DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {(isExternalDomain ? [1, 2, 3, 4] : [1, 2, 3]).map((stepNum) => {
            const meta = stepMeta[stepNum];
            return (
              <div key={stepNum} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                <div className="space-y-1 font-mono text-xs">
                  <span className="text-cyan-400 font-bold text-xs">{meta.title.split(':')[0]}</span>
                  <p className="text-slate-300 text-[11px] leading-tight">{meta.subtitle}</p>
                </div>

                <button
                  onClick={() => setModalPayloadStep(stepNum)}
                  className="w-full py-1.5 px-2 rounded-xl text-xs font-extrabold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Inspect Packet & NAT 🔍</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <TerminalLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
}
