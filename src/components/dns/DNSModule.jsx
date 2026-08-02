import React, { useState, useEffect } from 'react';
import { Globe, Building2, Router, Server, Laptop, Search, Play, Pause, RotateCcw, CheckCircle2, Gauge, Mail, ChevronDown, ChevronUp, HelpCircle, FileCode, Terminal, SkipForward, Radio, Layers, Cpu, ArrowRight, ShieldCheck, X, Activity, Zap, Sparkles, Cloud } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';

export default function DNSModule({ appMode = 'clean' }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5); // Default 0.5x speed
  const [targetDomain, setTargetDomain] = useState('google.com');
  const [packetProgress, setPacketProgress] = useState(0);
  const [modalPayloadStep, setModalPayloadStep] = useState(null);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'DNS', message: 'DNS & ISP Wire Traversal Visualizer ready. Choose a domain to start lookup.' }
  ]);

  const isExternalDomain = !targetDomain.endsWith('.local');

  // Domain Metadata Lookup Table
  const domainInfo = {
    'google.com': {
      dnsName: 'GOOGLE PUBLIC DNS',
      dnsIp: '8.8.8.8',
      resolvedIp: '142.250.180.206',
      owner: 'Google LLC WAN'
    },
    'microsoft.com': {
      dnsName: 'MICROSOFT AZURE DNS',
      dnsIp: '4.222.0.1',
      resolvedIp: '20.112.52.29',
      owner: 'Microsoft Corp WAN'
    },
    'github.com': {
      dnsName: 'CLOUDFLARE / GITHUB DNS',
      dnsIp: '1.1.1.1',
      resolvedIp: '140.82.121.4',
      owner: 'GitHub / Cloudflare WAN'
    },
    'dc01.corp.local': {
      dnsName: 'DC01 (LOCAL AD DNS)',
      dnsIp: '192.168.1.10',
      resolvedIp: '192.168.1.10',
      owner: 'Local Active Directory'
    },
    '_ldap._tcp.dc._msdcs.corp.local': {
      dnsName: 'DC01 (LOCAL AD SRV)',
      dnsIp: '192.168.1.10',
      resolvedIp: '192.168.1.10 (Port 389 LDAP)',
      owner: 'Local Active Directory SRV'
    }
  };

  const currDomain = domainInfo[targetDomain] || domainInfo['google.com'];

  // Step Metadata for Local vs External Queries
  const stepMetaLocal = {
    0: {
      title: 'Ready for Local DNS Resolution',
      subtitle: 'Target is in local domain (.local). Query stays inside private LAN (192.168.1.0/24) through Central L2 Switch. NAT is not required.',
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      type: 'NONE'
    },
    1: {
      title: '📢 STEP 1: RECURSIVE LAN QUERY (PC ➔ L2 SWITCH ➔ LOCAL DNS)',
      subtitle: `PC-01 (192.168.1.105) sends packet through L2 Switch to Local DNS Server DC01 (192.168.1.10): "What is the IP for ${targetDomain}?"`,
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
      title: '✅ STEP 3: AUTHORITATIVE ANSWER RETURNED (LOCAL DNS ➔ L2 SWITCH ➔ PC)',
      subtitle: `DC01 returns answer packet through L2 Switch back to PC-01: "${targetDomain} is located at Private IP 192.168.1.10!"`,
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
      title: 'Ready for Internet DNS Lookup + ISP Wire Traversal',
      subtitle: `Target "${targetDomain}" is a public domain. Watch packet travel from PC ➔ Switch ➔ Router Gateway (NAT) ➔ ISP ➔ ${currDomain.dnsName}, then return back!`,
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      type: 'NONE'
    },
    1: {
      title: '📢 STEP 1: PC ➔ L2 SWITCH ➔ ROUTER GATEWAY (LAN WIRE)',
      subtitle: `PC-01 (192.168.1.105) sends DNS query for "${targetDomain}" across L2 Switch to Router Gateway (192.168.1.1).`,
      badge: 'LAN WIRE QUERY (UDP 53)',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      sender: 'PC',
      target: 'ROUTER',
      payload: {
        stepName: '1. LAN DNS Query to Gateway',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:11:22:33:44:55 (Router)',
        l3Header: `Src IP: 192.168.1.105 (Private) → Dst IP: ${currDomain.dnsIp} (${currDomain.dnsName})`,
        l4Header: 'UDP Src Port: 54321 → Dst Port: 53',
        natStatus: 'PRE-NAT (Private IP inside LAN)',
        queryDetail: `Standard Query A ${targetDomain}`,
      }
    },
    2: {
      title: '🔀 STEP 2: ROUTER NAT ➔ ISP (WAN FIBER WIRE)',
      subtitle: 'ISP Router applies NAT (192.168.1.105:54321 ➔ 203.0.113.45:41001) and forwards packet over WAN wire to ISP!',
      badge: 'NAT TRANSLATION & ISP WIRE FORWARDING',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      sender: 'ROUTER',
      target: 'ISP',
      payload: {
        stepName: '2. Router NAT Translation (PAT)',
        l2Header: 'Src MAC: 00:11:22:33:44:55 → Gateway ISP MAC: 00:AA:BB:CC:DD:EE',
        l3Header: `Src IP: 203.0.113.45 (PUBLIC WAN) → Dst IP: ${currDomain.dnsIp} (${currDomain.dnsName})`,
        l4Header: 'UDP Src Port: 41001 (Translated Port) → Dst Port: 53',
        natStatus: 'NAT TRANSLATED: 192.168.1.105:54321 ➔ 203.0.113.45:41001',
        queryDetail: `SNAT Applied. Packet forwarded over WAN wire to ISP`,
      }
    },
    3: {
      title: `🏢 STEP 3: ISP ➔ ${currDomain.dnsName} (${currDomain.dnsIp})`,
      subtitle: `ISP routes query along backbone wire to ${currDomain.dnsName} (${currDomain.dnsIp}) which resolves IP address!`,
      badge: `ISP BACKBONE ➔ ${currDomain.dnsName}`,
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'ISP',
      target: 'PUBLIC_DNS',
      payload: {
        stepName: `3. ISP Backbone Query to ${currDomain.dnsIp}`,
        l2Header: 'ISP Core Backbone Fiber Optic Wire Routing',
        l3Header: `Src IP: 203.0.113.45 → Dst IP: ${currDomain.dnsIp} (${currDomain.dnsName})`,
        l4Header: 'UDP Src Port: 41001 → Dst Port: 53',
        natStatus: 'TRANSITING ISP BACKBONE WIRING',
        queryDetail: `${currDomain.dnsIp} returns: ${targetDomain} A ${currDomain.resolvedIp}`,
      }
    },
    4: {
      title: `✅ STEP 4: RETURN TRIP ALONG WIRES (${currDomain.dnsName} ➔ ISP ➔ ROUTER ➔ L2 SWITCH ➔ PC)`,
      subtitle: `Resolved IP answer packet (${currDomain.resolvedIp}) travels BACK: ${currDomain.dnsName} ➔ ISP ➔ Router (Reverse NAT) ➔ L2 Switch ➔ PC-01!`,
      badge: `ANSWER RETURNED (${currDomain.resolvedIp})`,
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'PUBLIC_DNS',
      target: 'PC',
      payload: {
        stepName: '4. Full Reverse Wire Return',
        l2Header: `${currDomain.dnsName} ➔ ISP Fiber Wire ➔ Router WAN ➔ L2 Switch ➔ PC-01`,
        l3Header: `Src IP: ${currDomain.dnsIp} → Dst IP: 192.168.1.105 (Restored Private IP)`,
        l4Header: 'UDP Src Port: 53 → Dst Port: 54321',
        natStatus: 'REVERSE NAT SUCCESS: Restored Private IP 192.168.1.105',
        queryDetail: `Client PC-01 receives IP: ${targetDomain} = ${currDomain.resolvedIp}`,
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
  }, [isPlaying, activeStep, speed, isSingleStep, isExternalDomain, targetDomain]);

  const handleStartPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
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
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'DNS', message: `DNS cache & NAT state cleared. Target set to ${targetDomain}.` }]);
  };

  const currentMeta = stepMeta[activeStep] || stepMeta[0];
  const isFinalStepComplete = activeStep === totalSteps;
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;
  const currentPayload = currentMeta.payload;

  // DYNAMIC PACKET ANIMATION TRAJECTORY CALCULATIONS WITH CENTRAL L2 SWITCH:
  // Node coordinates:
  // PC-01: (10%, 55%)
  // L2 Switch: (28%, 55%)
  // DC01 Local AD DNS: (28%, 18%)
  // ISP Router: (46%, 55%)
  // ISP POP: (72%, 20%)
  // Public DNS: (88%, 55%)

  const getPacketPos = () => {
    if (!isPlaying && activeStep === 0) return null;
    const p = packetProgress / 100; // 0 to 1

    if (isExternalDomain) {
      if (activeStep === 1) {
        // Step 1: PC (10%, 55%) -> L2 Switch (28%, 55%) -> ISP Router (46%, 55%)
        if (packetProgress <= 50) {
          const t = packetProgress / 50;
          return {
            left: `${10 + t * 18}%`,
            top: '55%',
            label: 'Query ➔ L2 Switch',
            bgColor: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/50'
          };
        } else {
          const t = (packetProgress - 50) / 50;
          return {
            left: `${28 + t * 18}%`,
            top: '55%',
            label: 'L2 Switch ➔ Router Gateway',
            bgColor: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/50'
          };
        }
      } else if (activeStep === 2) {
        // Step 2: ISP Router (46%, 55%) -> ISP POP (72%, 20%)
        return {
          left: `${46 + p * 26}%`,
          top: `${55 - p * 35}%`,
          label: 'NAT Packet (203.0.113.45)',
          bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
        };
      } else if (activeStep === 3) {
        // Step 3: ISP POP (72%, 20%) -> Public DNS (88%, 55%)
        return {
          left: `${72 + p * 16}%`,
          top: `${20 + p * 35}%`,
          label: `Query A ${targetDomain}`,
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
        };
      } else if (activeStep === 4) {
        // Step 4: FULL RETURN TRIP BACK ALONG THE WIRES (3 SUB-PHASES):
        if (packetProgress <= 33) {
          const t = packetProgress / 33;
          return {
            left: `${88 - t * 16}%`,
            top: `${55 - t * 35}%`,
            label: `1. Returning: DNS ➔ ISP`,
            bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-emerald-500/50'
          };
        } else if (packetProgress <= 66) {
          const t = (packetProgress - 33) / 33;
          return {
            left: `${72 - t * 26}%`,
            top: `${20 + t * 35}%`,
            label: '2. Returning: ISP ➔ Router (Reverse NAT)',
            bgColor: 'bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 shadow-emerald-500/50'
          };
        } else {
          const t = (packetProgress - 66) / 34;
          return {
            left: `${46 - t * 36}%`,
            top: '55%',
            label: `3. Delivered to PC-01 (${currDomain.resolvedIp})`,
            bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50 animate-bounce'
          };
        }
      }
    } else {
      // LOCAL QUERY TRAJECTORIES (PC 10%, 55% -> Switch 28%, 55% -> DC01 28%, 18%):
      if (activeStep === 1) {
        if (packetProgress <= 50) {
          const t = packetProgress / 50;
          return {
            left: `${10 + t * 18}%`,
            top: '55%',
            label: 'Local Query ➔ L2 Switch',
            bgColor: 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 shadow-cyan-500/50'
          };
        } else {
          const t = (packetProgress - 50) / 50;
          return {
            left: '28%',
            top: `${55 - t * 37}%`,
            label: 'L2 Switch ➔ DC01 DNS',
            bgColor: 'bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 shadow-cyan-500/50'
          };
        }
      } else if (activeStep === 2) {
        // Step 2: Inspection at DC01 (28%, 18%)
        return {
          left: '28%',
          top: '18%',
          label: 'AD Zone Lookup...',
          bgColor: 'bg-purple-500 text-white shadow-purple-500/50'
        };
      } else if (activeStep === 3) {
        // Step 3: DC01 (28%, 18%) -> Switch (28%, 55%) -> PC-01 (10%, 55%)
        if (packetProgress <= 50) {
          const t = packetProgress / 50;
          return {
            left: '28%',
            top: `${18 + t * 37}%`,
            label: 'DNS Answer ➔ L2 Switch',
            bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-emerald-500/50'
          };
        } else {
          const t = (packetProgress - 50) / 50;
          return {
            left: `${28 - t * 18}%`,
            top: '55%',
            label: 'Delivered to PC-01 (192.168.1.10)',
            bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-emerald-500/50 animate-bounce'
          };
        }
      }
    }
    return null;
  };

  const animPos = getPacketPos();

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP UNIFIED CONTROL & BASIC INFO WIDGET */}
      <CleanWidget
        title="DNS Hostname Lookup Made Simple"
        subtitle={`Translating website "${targetDomain}" into numerical IP address (${currDomain.resolvedIp})`}
        icon={Globe}
        ip={currDomain.resolvedIp}
        protocol="DNS (UDP)"
        port={53}
        status={isExternalDomain ? "Public Internet Query" : "Local AD Subnet"}
        actionTitle={currentMeta.title}
        actionDesc={currentMeta.subtitle}
        stepNumber={activeStep}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        onPlay={handleStartPlay}
        onStep={handleStepForward}
        onReset={handleReset}
        speed={speed}
        setSpeed={setSpeed}
        showAnimation={showAnimation}
        setShowAnimation={setShowAnimation}
      />

      {/* FLOATING MODAL POPUP FOR PACKET & NAT PAYLOAD INSPECTOR (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && modalPayloadStep && activeModalData && (
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

      {/* MAIN MASTER WORKSPACE STAGE FOR DNS & ISP */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* UNIFIED INTEGRATED WORKSPACE CONTROL TOOLBAR */}
        <div className="glass-panel p-3 rounded-2xl border border-slate-800/90 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shadow-xl font-mono text-xs">
          
          {/* Left Group: Target Domain Selector & Query Mode Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Search className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 font-bold hidden sm:inline">Resolve Domain:</span>
              <select
                value={targetDomain}
                onChange={(e) => { setTargetDomain(e.target.value); handleReset(); }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <optgroup label="🌐 Public Internet Domains (NAT & ISP Traversal)">
                  <option value="google.com">google.com (Public Web - 8.8.8.8)</option>
                  <option value="microsoft.com">microsoft.com (Public Cloud - 4.222.0.1)</option>
                  <option value="github.com">github.com (Cloudflare - 1.1.1.1)</option>
                </optgroup>
                <optgroup label="🏢 Internal Active Directory Domains (LAN)">
                  <option value="dc01.corp.local">dc01.corp.local (Local AD DC)</option>
                  <option value="_ldap._tcp.dc._msdcs.corp.local">_ldap._tcp.dc._msdcs.corp.local (AD SRV Record)</option>
                </optgroup>
              </select>
            </div>

            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border shadow ${
              isExternalDomain ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-purple-950 text-purple-300 border-purple-700'
            }`}>
              {isExternalDomain ? `🌐 PUBLIC ➔ ${currDomain.dnsName} (${currDomain.dnsIp})` : '🏢 LOCAL LAN QUERY'}
            </span>
          </div>
        </div>

        {/* Dynamic Action Status Banner (DETAILED MODE ONLY) */}
        {(appMode === 'detailed' || appMode === 'expert') && (
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
        )}

        {/* WORKSPACE STAGE CANVAS (TOGGLEABLE VIA ICON IN CLEAN MODE) */}
        {(showAnimation || appMode === 'detailed' || appMode === 'expert') && (
          <div className={`py-6 px-4 relative bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden ${appMode !== 'detailed' && appMode !== 'expert' ? 'min-h-[340px]' : 'min-h-[520px]'}`}>
          
          {/* VISIBLE NETWORK CONNECTION LINES (WIRES) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Cable 1: PC-01 (10%, 55%) -> Central L2 Switch (28%, 55%) */}
            <line x1="10%" y1="55%" x2="28%" y2="55%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

            {/* Cable 2: Central L2 Switch (28%, 55%) -> Local DC01 DNS (28%, 18%) */}
            <line x1="28%" y1="55%" x2="28%" y2="18%" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

            {/* Cable 3: Central L2 Switch (28%, 55%) -> ISP Router (46%, 55%) */}
            <line x1="28%" y1="55%" x2="46%" y2="55%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />
            
            {/* Cable 4: ISP Router (46%, 55%) -> ISP Node (72%, 20%) */}
            <line x1="46%" y1="55%" x2="72%" y2="20%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

            {/* Cable 5: ISP Node (72%, 20%) -> Public DNS (88%, 55%) */}
            <line x1="72%" y1="20%" x2="88%" y2="55%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />
          </svg>

          {/* PRIVATE LAN BOUNDARY CONTAINER */}
          <div className="absolute left-[2%] top-[5%] w-[48%] h-[90%] border-2 border-dashed border-cyan-800/40 rounded-3xl pointer-events-none p-3">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              PRIVATE SUBNET (192.168.1.0/24)
            </span>
          </div>

          {/* PUBLIC ISP / WAN BOUNDARY CONTAINER */}
          <div className="absolute right-[2%] top-[5%] w-[48%] h-[90%] border-2 border-dashed border-amber-800/40 rounded-3xl pointer-events-none p-3 text-right">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
              PUBLIC WAN & ISP INFRASTRUCTURE (203.0.113.0/24)
            </span>
          </div>

          {/* 1. PC-01 CLIENT (LEFT: 10%, 55%) */}
          <div className="absolute left-[10%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
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
              <p className="text-xs font-extrabold text-slate-100">LAPTOP-01</p>
              <p className="text-[10px] text-slate-400">DNS Client</p>
            </div>
          </div>

          {/* 2. CENTRAL L2 SWITCH (28%, 55%) */}
          <div className="absolute left-[28%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-blue-950 text-blue-300 border border-blue-600 shadow-lg">
              CENTRAL L2 SWITCH
            </span>
            <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
              isPlaying ? 'bg-blue-900/90 border-blue-400 shadow-2xl shadow-blue-500/40 scale-110' : 'bg-blue-950/90 border-blue-500 text-blue-300'
            }`}>
              <Layers className="w-12 h-12 text-blue-300" />
            </div>
            <div className="text-center font-mono">
              <p className="text-xs font-extrabold text-blue-300">SWITCH</p>
              <p className="text-[10px] text-slate-400">Forwards LAN Frames</p>
            </div>
          </div>

          {/* 3. LOCAL DC01 DNS SERVER (TOP-LEFT: 28%, 18%) */}
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

          {/* 4. ISP ROUTER WITH NAT OPERATION (CENTER-LEFT: 46%, 55%) */}
          <div className="absolute left-[46%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
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

          {/* 5. ISP (INTERNET SERVICE PROVIDER) NODE (TOP-RIGHT 72%, 20%) */}
          <div className="absolute left-[72%] top-[20%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-sky-950 text-sky-300 border border-sky-700 shadow flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-sky-400" /> ISP WAN CLOUD
            </span>
            <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
              isExternalDomain && (activeStep === 2 || activeStep === 3 || (activeStep === 4 && packetProgress > 30 && packetProgress < 70))
                ? 'bg-sky-900/90 border-sky-400 shadow-2xl shadow-sky-500/50 scale-110 animate-bounce'
                : 'bg-slate-900 border-sky-500/60'
            }`}>
              <Cloud className="w-12 h-12 text-sky-400" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-sky-300">ISP TELECOM POP</p>
              <p className="text-slate-400">WAN Gateway & DNS Forwarder</p>
            </div>
          </div>

          {/* 6. DYNAMIC PUBLIC DNS SERVER (RIGHT: 88%, 55%) */}
          <div className="absolute left-[88%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-purple-950 text-purple-300 border border-purple-700 shadow">
              {currDomain ? currDomain.dnsIp : '8.8.8.8'}
            </span>
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              isExternalDomain && activeStep === 3
                ? 'bg-purple-950/90 border-purple-400 shadow-2xl shadow-purple-500/30 scale-105 animate-bounce'
                : 'bg-slate-900/90 border-purple-500/60'
            }`}>
              <Server className="w-14 h-14 text-purple-400" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-purple-300">{currDomain ? currDomain.dnsName : 'PUBLIC DNS'}</p>
              <p className="text-xs text-slate-400">Resolves: {currDomain ? currDomain.resolvedIp : 'Target IP'}</p>
            </div>
          </div>

          {/* DYNAMIC ANIMATED PACKET OVERLAY */}
          {animPos && (
            <div
              style={{ left: animPos.left, top: animPos.top }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-full font-mono font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-white transition-all duration-100 ${animPos.bgColor}`}
            >
              <Mail className="w-4 h-4 fill-current" />
              <span>{animPos.label}</span>
            </div>
          )}

          {/* NAT TRANSLATION LIVE TABLE OVERLAY */}
          {isExternalDomain && (
            <div className="absolute left-[46%] top-[82%] transform -translate-x-1/2 -translate-y-1/2 z-20 bg-slate-950/95 p-3 rounded-2xl border border-amber-500/40 shadow-xl font-mono text-[10px] space-y-1 text-left min-w-[320px]">
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
        )}

        {/* STEP INSPECTION BUTTONS & DETAILS (DETAILED MODE ONLY) */}
        {(appMode === 'detailed' || appMode === 'expert') && (
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
        )}
      </div>

      {/* TECHNICAL PACKET INSPECTOR & EVENT LOGS (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && (
        <SlideOutInspector title="Slide Out Technical Deep Dive & Wire Logs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            
            {/* LEFT COLUMN: LIVE REAL-TIME PACKET CONTENT INSPECTOR */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Live Packet Content Inspector</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800 font-bold">
                  Step {activeStep}/{totalSteps} Active
                </span>
              </div>

              {currentPayload ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                      <span>Packet Type / Operation:</span>
                      <span className="text-amber-400">{currentPayload.stepName}</span>
                    </div>

                    <p className="text-slate-200 text-[11px]">
                      <span className="text-slate-500 font-bold">Ethernet (L2):</span> {currentPayload.l2Header}
                    </p>
                    <p className="text-slate-200 text-[11px]">
                      <span className="text-slate-500 font-bold">IPv4 (L3):</span> <span className="text-cyan-300 font-bold">{currentPayload.l3Header}</span>
                    </p>
                    <p className="text-slate-200 text-[11px]">
                      <span className="text-slate-500 font-bold">UDP (L4):</span> <span className="text-emerald-300 font-bold">{currentPayload.l4Header}</span>
                    </p>
                  </div>

                  {/* HIGHLIGHTED NAT MODIFICATION / ADDRESS REWRITING LINE (DIFFERENT COLOR) */}
                  {isExternalDomain && (activeStep === 2 || activeStep === 4) && (
                    <div className="p-3 rounded-2xl border bg-amber-950/90 border-amber-500 text-amber-200 space-y-1 shadow-lg animate-pulse">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider">
                        <Zap className="w-4 h-4 fill-current text-amber-400" />
                        <span>ROUTER NAT ADDRESS REWRITING DETECTED!</span>
                      </div>
                      <p className="text-[11px] font-extrabold text-amber-100 leading-relaxed">
                        {activeStep === 2
                          ? `⚡ INBOUND SNAT: Router modified Source Private IP 192.168.1.105:54321 ➔ Public WAN IP 203.0.113.45:41001 (Targeting ${currDomain.dnsIp})`
                          : `⚡ OUTBOUND REVERSE NAT: Router restored Destination Public WAN IP 203.0.113.45:41001 ➔ Private IP 192.168.1.105:54321`}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                  <p className="font-bold">No active packet frame in flight.</p>
                  <p className="text-[10px]">Select hostname above and click "Start DNS Lookup" to inspect packet headers in real time.</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: REAL-TIME NETWORK EVENT LOGS */}
            <TerminalLog logs={logs} onClear={() => setLogs([])} />
          </div>
        </SlideOutInspector>
      )}
    </div>
  );
}
