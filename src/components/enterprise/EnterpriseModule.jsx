import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Zap, 
  Mail, 
  Printer, 
  Laptop, 
  Server, 
  Router, 
  Layers, 
  Cpu, 
  Building2, 
  Terminal, 
  Lock,
  Radio,
  Database,
  HardDrive,
  Archive,
  Activity
} from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, SlideOutInspector } from '../common/EasyCard';

export default function EnterpriseModule({ appMode = 'clean' }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [ecosystem, setEcosystem] = useState('windows'); // 'windows' or 'linux'
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [packetProgress, setPacketProgress] = useState(0);

  // Enterprise Workflow Steps Metadata
  const workflowSteps = [
    {
      step: 0,
      title: 'Enterprise Infrastructure Ready',
      subtitle: 'Select an enterprise workflow step or click Play to watch multi-hop packet traversal across switches, core routers, and data center server racks.',
      badge: 'ENTERPRISE SYSTEM READY',
      packetLabel: 'READY',
      color: 'bg-slate-900 border-slate-700 text-slate-300'
    },
    {
      step: 1,
      title: ecosystem === 'windows' ? '1. DHCP Lease: Windows DHCP Server' : '1. DHCP Lease: Linux Kea DHCP Server',
      subtitle: 'Laptop-A sends DHCPDISCOVER ➔ Floor-1 Switch ➔ Core Router ➔ DC Switch ➔ Leases 192.168.1.105 from DHCP Server.',
      badge: 'STAGE 1: DHCP LEASE',
      packetLabel: 'DHCP DISCOVER',
      color: 'bg-amber-950/80 border-amber-500 text-amber-300'
    },
    {
      step: 2,
      title: ecosystem === 'windows' ? '2. Identity Auth: Active Directory Kerberos' : '2. Identity Auth: FreeIPA / OpenLDAP',
      subtitle: 'Laptop-A authenticates ➔ Floor Switch ➔ Core Router ➔ DC Switch ➔ KDC DC01 issues Kerberos TGT Ticket.',
      badge: 'STAGE 2: IDENTITY AUTH',
      packetLabel: 'KERBEROS AS-REQ',
      color: 'bg-purple-950/80 border-purple-500 text-purple-300'
    },
    {
      step: 3,
      title: ecosystem === 'windows' ? '3. Corporate DNS: Windows DNS Server' : '3. Corporate DNS: BIND9 DNS Resolver',
      subtitle: 'Laptop-A queries app.corp.com ➔ Floor Switch ➔ Core Router ➔ DC Switch ➔ DNS Server returns A Record 192.168.1.25.',
      badge: 'STAGE 3: DNS LOOKUP',
      packetLabel: 'DNS A-QUERY',
      color: 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
    },
    {
      step: 4,
      title: '4. Web App & SQL Database Query',
      subtitle: 'Laptop-A connects to App Server ➔ App Server queries SQL Database Server for customer record over Port 5432.',
      badge: 'STAGE 4: DB QUERY',
      packetLabel: 'SQL QUERY (PORT 5432)',
      color: 'bg-blue-950/80 border-blue-500 text-blue-300'
    },
    {
      step: 5,
      title: ecosystem === 'windows' ? '5. Enterprise Mail: Exchange Server' : '5. Enterprise Mail: Postfix / Dovecot',
      subtitle: 'Laptop-A sends email via SMTP ➔ DC Mail Server processes mail ➔ Delivers notification to PC-B via IMAP4.',
      badge: 'STAGE 5: MAIL SYNC',
      packetLabel: 'SMTP/IMAP MSG',
      color: 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
    },
    {
      step: 6,
      title: '6. SAN Storage Array & Backup Vault Sync',
      subtitle: 'SQL DB Server writes transaction logs to SAN Storage Array ➔ Backup Vault Server executes automated snapshot backup.',
      badge: 'STAGE 6: SAN BACKUP',
      packetLabel: 'SAN ISCSI / SNAPSHOT',
      color: 'bg-rose-950/80 border-rose-500 text-rose-300'
    },
    {
      step: 7,
      title: '7. LAN Print Job: Network Laser Printer',
      subtitle: 'Laptop-A transmits print job ➔ Floor-1 Switch ➔ Network Laser Printer prints document over LPR Port 9100.',
      badge: 'STAGE 7: LAN PRINT JOB',
      packetLabel: 'RAW PRINT DATA',
      color: 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
    }
  ];

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'ENTERPRISE', message: 'Enterprise Infrastructure Workflow Simulator initialized. Multi-hop wire paths active.' }
  ]);

  const currentMeta = workflowSteps[activeStep] || workflowSteps[0];

  // Animation Timer for Smooth Workflow Progression
  useEffect(() => {
    let animTimer;
    let stepTimer;
    if (isPlaying) {
      setPacketProgress(0);
      animTimer = setInterval(() => {
        setPacketProgress(prev => Math.min(100, prev + 2.5));
      }, 30 / speed);

      stepTimer = setTimeout(() => {
        if (activeStep < 7) {
          const next = activeStep + 1;
          setActiveStep(next);
          setLogs(prev => [
            ...prev,
            { time: new Date().toLocaleTimeString(), tag: `STAGE_${next}`, message: workflowSteps[next].title }
          ]);
        } else {
          setIsPlaying(false);
        }
      }, 3200 / speed);
    }

    return () => {
      clearInterval(animTimer);
      clearTimeout(stepTimer);
    };
  }, [isPlaying, activeStep, speed]);

  const handlePlayFull = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (activeStep >= 7 || activeStep === 0) setActiveStep(1);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    if (activeStep >= 7) return;
    const next = activeStep + 1;
    setActiveStep(next);
    setIsPlaying(true);
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: `STEP_${next}`, message: workflowSteps[next].title }
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
    setPacketProgress(0);
  };

  // MULTI-HOP WAYPOINT INTERPOLATION: Packet strictly follows SVG wire paths
  const interpolateWaypoints = (waypoints, progress) => {
    if (!waypoints || waypoints.length === 0) return null;
    if (waypoints.length === 1) return { left: `${waypoints[0].x}%`, top: `${waypoints[0].y}%` };
    if (progress <= 0) return { left: `${waypoints[0].x}%`, top: `${waypoints[0].y}%` };
    if (progress >= 1) return { left: `${waypoints[waypoints.length - 1].x}%`, top: `${waypoints[waypoints.length - 1].y}%` };

    let totalDist = 0;
    const segments = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = waypoints[i + 1].x - waypoints[i].x;
      const dy = waypoints[i + 1].y - waypoints[i].y;
      const dist = Math.hypot(dx, dy);
      segments.push({ from: waypoints[i], to: waypoints[i + 1], dist });
      totalDist += dist;
    }

    const targetDist = progress * totalDist;
    let accumulated = 0;

    for (const seg of segments) {
      if (accumulated + seg.dist >= targetDist || seg.dist === 0) {
        const segT = seg.dist === 0 ? 0 : (targetDist - accumulated) / seg.dist;
        const x = seg.from.x + segT * (seg.to.x - seg.from.x);
        const y = seg.from.y + segT * (seg.to.y - seg.from.y);
        return { left: `${x}%`, top: `${y}%` };
      }
      accumulated += seg.dist;
    }

    const last = waypoints[waypoints.length - 1];
    return { left: `${last.x}%`, top: `${last.y}%` };
  };

  // Calculate Exact Packet Traversal Position along Cable Wires
  const getPacketPos = () => {
    if (!isPlaying && activeStep === 0) return null;
    const t = packetProgress / 100;

    // Node Waypoint Definitions
    const N = {
      LaptopA: { x: 12, y: 65 },
      PCB: { x: 28, y: 65 },
      Printer: { x: 20, y: 32 },
      FloorSwitch: { x: 45, y: 65 },
      CoreRouter: { x: 45, y: 42 },
      DCSwitch: { x: 72, y: 42 },
      DHCP: { x: 86, y: 14 },
      AD: { x: 86, y: 25 },
      DNS: { x: 86, y: 36 },
      App: { x: 86, y: 47 },
      Mail: { x: 86, y: 58 },
      DB: { x: 86, y: 69 },
      SAN: { x: 86, y: 80 },
      Backup: { x: 86, y: 91 }
    };

    let path = [];
    let bg = 'bg-cyan-500 text-slate-950';

    if (activeStep === 1) {
      // Stage 1: DHCP (Laptop-A -> FloorSwitch -> CoreRouter -> DCSwitch -> DHCP Server)
      path = [N.LaptopA, N.FloorSwitch, N.CoreRouter, N.DCSwitch, N.DHCP];
      bg = 'bg-amber-500 text-slate-950';
    } else if (activeStep === 2) {
      // Stage 2: Auth (Laptop-A -> FloorSwitch -> CoreRouter -> DCSwitch -> AD DC01)
      path = [N.LaptopA, N.FloorSwitch, N.CoreRouter, N.DCSwitch, N.AD];
      bg = 'bg-purple-500 text-white';
    } else if (activeStep === 3) {
      // Stage 3: DNS (Laptop-A -> FloorSwitch -> CoreRouter -> DCSwitch -> DNS Server)
      path = [N.LaptopA, N.FloorSwitch, N.CoreRouter, N.DCSwitch, N.DNS];
      bg = 'bg-cyan-400 text-slate-950';
    } else if (activeStep === 4) {
      // Stage 4: App & DB Query (Laptop-A -> FloorSwitch -> CoreRouter -> DCSwitch -> App Server -> SQL DB)
      path = [N.LaptopA, N.FloorSwitch, N.CoreRouter, N.DCSwitch, N.App, N.DB];
      bg = 'bg-blue-500 text-white';
    } else if (activeStep === 5) {
      // Stage 5: Mail Sync (Laptop-A -> FloorSwitch -> CoreRouter -> DCSwitch -> Mail Server -> DCSwitch -> CoreRouter -> FloorSwitch -> PC-B)
      path = [N.LaptopA, N.FloorSwitch, N.CoreRouter, N.DCSwitch, N.Mail, N.DCSwitch, N.CoreRouter, N.FloorSwitch, N.PCB];
      bg = 'bg-indigo-500 text-white';
    } else if (activeStep === 6) {
      // Stage 6: SAN Storage & Backup (SQL DB -> SAN Array -> Backup Vault)
      path = [N.DB, N.SAN, N.Backup];
      bg = 'bg-rose-500 text-white';
    } else if (activeStep === 7) {
      // Stage 7: Print (Laptop-A -> FloorSwitch -> Printer)
      path = [N.LaptopA, N.FloorSwitch, N.Printer];
      bg = 'bg-emerald-400 text-slate-950';
    }

    const pos = interpolateWaypoints(path, t);
    if (!pos) return null;
    return { ...pos, label: currentMeta.packetLabel, bg };
  };

  const animPos = getPacketPos();

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP UNIFIED CONTROL & BASIC INFO WIDGET */}
      <CleanWidget
        title="Enterprise Infrastructure & Multi-Hop Workflow Simulator"
        subtitle="Watch packets traverse real network wire paths: DHCP Lease ➔ Domain Auth ➔ DNS ➔ Web/SQL DB ➔ Mail ➔ SAN Backup ➔ LAN Print."
        icon={Building2}
        ip="192.168.1.105 (Sales) → 192.168.1.0/24 Subnet"
        protocol={activeStep === 1 ? 'DHCP (UDP 67/68)' : activeStep === 2 ? (ecosystem === 'windows' ? 'Kerberos (Port 88)' : 'LDAP / FreeIPA') : activeStep === 3 ? 'DNS (UDP 53)' : activeStep === 4 ? 'SQL Query (Port 5432)' : activeStep === 5 ? 'SMTP/IMAP' : activeStep === 6 ? 'iSCSI SAN / Snapshot' : activeStep === 7 ? 'LPR/RAW (Port 9100)' : 'Enterprise LAN'}
        port={activeStep === 1 ? 'UDP 67/68' : activeStep === 2 ? 'Port 88 / 389' : activeStep === 3 ? 'Port 53' : activeStep === 4 ? 'Port 5432' : activeStep === 5 ? 'Port 587 / 993' : activeStep === 6 ? 'Port 3260' : activeStep === 7 ? 'Port 9100' : 'Multi-Port'}
        status={currentMeta.badge}
        actionTitle={currentMeta.title}
        actionDesc={currentMeta.subtitle}
        stepNumber={activeStep}
        totalSteps={7}
        isPlaying={isPlaying}
        onPlay={handlePlayFull}
        onStep={handleStepForward}
        onReset={handleReset}
        speed={speed}
        setSpeed={setSpeed}
        showAnimation={showAnimation}
        setShowAnimation={setShowAnimation}
      />

      {/* ECOSYSTEM TOGGLE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 font-mono text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-extrabold">Enterprise Stack Ecosystem:</span>
        </div>
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setEcosystem('windows')}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer text-xs ${
              ecosystem === 'windows'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🪟 Windows Ecosystem (Active Directory & Exchange)
          </button>
          <button
            onClick={() => setEcosystem('linux')}
            className={`px-3 py-1 rounded-lg font-extrabold transition-all cursor-pointer text-xs ${
              ecosystem === 'linux'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🐧 Linux Ecosystem (FreeIPA, BIND9 & Postfix)
          </button>
        </div>
      </div>

      {/* 7 ENTERPRISE WORKFLOW STEP CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-xs">
        {workflowSteps.slice(1).map((item) => {
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.step}
              onClick={() => {
                setActiveStep(item.step);
                setIsPlaying(true);
              }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? `${item.color} shadow-lg scale-[1.02] ring-2 ring-white/20`
                  : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <p className="font-extrabold text-[11px] truncate">{item.step}. {item.packetLabel}</p>
              <p className="text-[9px] opacity-80 truncate">{item.badge}</p>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC ACTION STATUS BANNER (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 font-mono text-xs ${currentMeta.color}`}>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-slate-950/80 border border-white/10 shadow flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
              {currentMeta.badge}
            </span>
            <h3 className="text-base font-black text-slate-100">{currentMeta.title}</h3>
          </div>
          <p className="text-xs text-slate-200 max-w-md text-center sm:text-right">{currentMeta.subtitle}</p>
        </div>
      )}

      {/* MAIN TOPOLOGY CANVAS STAGE WITH EXACT CABLE PATHS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden bg-slate-950/80 min-h-[680px] font-mono select-none">
        
        {/* NETWORK CABLES SVG OVERLAY */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Laptop-A (12%,65%) -> Floor Switch (45%,65%) */}
          <line x1="12%" y1="65%" x2="45%" y2="65%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.8" />
          
          {/* PC-B (28%,65%) -> Floor Switch (45%,65%) */}
          <line x1="28%" y1="65%" x2="45%" y2="65%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.8" />

          {/* Printer (20%,32%) -> Floor Switch (45%,65%) */}
          <line x1="20%" y1="32%" x2="45%" y2="65%" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.8" />

          {/* Floor Switch (45%,65%) -> Core Router (45%,42%) - Router Trunk */}
          <line x1="45%" y1="65%" x2="45%" y2="42%" stroke="#f59e0b" strokeWidth="5" opacity="0.9" />

          {/* Core Router (45%,42%) -> Data Center Switch (72%,42%) - Router Trunk */}
          <line x1="45%" y1="42%" x2="72%" y2="42%" stroke="#f59e0b" strokeWidth="5" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.9" />

          {/* DC Switch (72%,42%) -> Server Rack Node Cables */}
          {/* 1. DHCP Server (86%, 14%) */}
          <line x1="72%" y1="42%" x2="86%" y2="14%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 2. AD DC01 (86%, 25%) */}
          <line x1="72%" y1="42%" x2="86%" y2="25%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 3. DNS Server (86%, 36%) */}
          <line x1="72%" y1="42%" x2="86%" y2="36%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 4. App/Web Server (86%, 47%) */}
          <line x1="72%" y1="42%" x2="86%" y2="47%" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 5. Mail Server (86%, 58%) */}
          <line x1="72%" y1="42%" x2="86%" y2="58%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 6. SQL Database Server (86%, 69%) */}
          <line x1="72%" y1="42%" x2="86%" y2="69%" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 7. SAN Storage Array (86%, 80%) */}
          <line x1="72%" y1="42%" x2="86%" y2="80%" stroke="#e11d48" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 8. Backup Vault Server (86%, 91%) */}
          <line x1="72%" y1="42%" x2="86%" y2="91%" stroke="#e11d48" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />

          {/* Inter-Server SAN Storage Bus Cable: SQL DB -> SAN Array -> Backup Vault */}
          <line x1="86%" y1="69%" x2="86%" y2="80%" stroke="#f43f5e" strokeWidth="4" strokeDasharray="4 4" className="animate-wire-dash" />
          <line x1="86%" y1="80%" x2="86%" y2="91%" stroke="#f43f5e" strokeWidth="4" strokeDasharray="4 4" className="animate-wire-dash" />
        </svg>

        {/* FAINT HIGHLIGHT NETWORK AREA CONTAINERS */}
        {/* Office Floor Workstations Area */}
        <div className="absolute left-[2%] top-[4%] w-[33%] h-[92%] border-2 border-dashed border-cyan-800/30 bg-cyan-950/15 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 shadow">
            OFFICE FLOOR 1 WORKSTATION ZONE
          </span>
        </div>

        {/* Core Routing & Switching Zone */}
        <div className="absolute left-[37%] top-[4%] w-[26%] h-[92%] border-2 border-dashed border-amber-800/30 bg-amber-950/15 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow">
            CORE ROUTING & FIREWALL ZONE
          </span>
        </div>

        {/* Data Center Server Racks Area */}
        <div className="absolute right-[2%] top-[4%] w-[33%] h-[92%] border-2 border-dashed border-purple-800/30 bg-purple-950/15 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-800/80 shadow">
            DATA CENTER SERVER RACKS ZONE
          </span>
        </div>

        {/* TOPOLOGY NODES */}
        
        {/* OFFICE FLOOR 1 WORKSTATIONS ZONE */}
        {/* 1. Laptop-A (Sales) */}
        <div className="absolute left-[12%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shadow">
            192.168.1.105
          </span>
          <div className="p-3 bg-slate-900 border-2 border-cyan-500 rounded-xl shadow-xl">
            <Laptop className="w-7 h-7 text-cyan-400" />
          </div>
          <p className="font-extrabold text-xs text-cyan-300">Laptop-A (Sales)</p>
          <p className="text-[9px] text-slate-400">MAC: 00:1A:2B:3C:4D:01</p>
        </div>

        {/* 2. PC-B (HR) */}
        <div className="absolute left-[28%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shadow">
            192.168.1.106
          </span>
          <div className="p-3 bg-slate-900 border-2 border-cyan-500 rounded-xl shadow-xl">
            <Laptop className="w-7 h-7 text-cyan-400" />
          </div>
          <p className="font-extrabold text-xs text-cyan-300">PC-B (HR Dept)</p>
          <p className="text-[9px] text-slate-400">MAC: 00:1A:2B:3C:4D:02</p>
        </div>

        {/* 3. Network Laser Printer */}
        <div className="absolute left-[20%] top-[32%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shadow">
            192.168.1.50
          </span>
          <div className={`p-3 rounded-xl border-2 transition-all ${
            activeStep === 7 ? 'bg-emerald-950 border-emerald-400 scale-110 shadow-2xl shadow-emerald-500/40' : 'bg-slate-900 border-emerald-500/60'
          }`}>
            <Printer className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="font-extrabold text-xs text-emerald-300">Office Printer</p>
          <p className="text-[9px] text-slate-400">LPR / RAW Port 9100</p>
        </div>

        {/* 4. Floor-1 L2 Access Switch */}
        <div className="absolute left-[45%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shadow">
            Floor-1 Switch (L2)
          </span>
          <div className="p-3.5 bg-slate-900 border-2 border-blue-500 rounded-2xl shadow-xl">
            <Layers className="w-7 h-7 text-blue-400" />
          </div>
          <p className="font-extrabold text-xs text-blue-300">Floor Access Switch</p>
        </div>

        {/* CORE ROUTING ZONE */}
        {/* 5. Enterprise Core Router & Firewall */}
        <div className="absolute left-[45%] top-[42%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-700 shadow">
            Gateway: 192.168.1.1
          </span>
          <div className="p-3.5 bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl">
            <Router className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <p className="font-extrabold text-xs text-amber-300">Core Router & Firewall</p>
        </div>

        {/* DATA CENTER SERVER RACK ZONE (8 EXPANDED NODES) */}
        {/* 6. Data Center Switch */}
        <div className="absolute left-[72%] top-[42%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shadow">
            DC Core Switch
          </span>
          <div className="p-3 bg-slate-900 border-2 border-blue-500 rounded-xl shadow-xl">
            <Layers className="w-7 h-7 text-blue-400" />
          </div>
          <p className="font-extrabold text-xs text-blue-300">DC Core Switch</p>
        </div>

        {/* 7. DHCP Server (86%, 14%) */}
        <div className="absolute left-[86%] top-[14%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 1 ? 'bg-amber-950 border-amber-400 scale-110 shadow-xl shadow-amber-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-purple-300">DHCP Server</p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.10</span>
          </div>
        </div>

        {/* 8. Active Directory / FreeIPA DC (86%, 25%) */}
        <div className="absolute left-[86%] top-[25%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 2 ? 'bg-purple-950 border-purple-400 scale-110 shadow-xl shadow-purple-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-purple-300">
              {ecosystem === 'windows' ? 'AD DC01 KDC' : 'FreeIPA LDAP'}
            </p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.15</span>
          </div>
        </div>

        {/* 9. Corporate DNS Server (86%, 36%) */}
        <div className="absolute left-[86%] top-[36%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 3 ? 'bg-cyan-950 border-cyan-400 scale-110 shadow-xl shadow-cyan-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-cyan-300">
              {ecosystem === 'windows' ? 'Windows DNS' : 'BIND9 DNS'}
            </p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.20</span>
          </div>
        </div>

        {/* 10. App / Web Server (86%, 47%) */}
        <div className="absolute left-[86%] top-[47%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 4 ? 'bg-blue-950 border-blue-400 scale-110 shadow-xl shadow-blue-500/40' : 'bg-slate-900 border-blue-500/60'
          }`}>
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-blue-300">App Web Server</p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.25</span>
          </div>
        </div>

        {/* 11. Enterprise Mail Server (86%, 58%) */}
        <div className="absolute left-[86%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 5 ? 'bg-indigo-950 border-indigo-400 scale-110 shadow-xl shadow-indigo-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Mail className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-indigo-300">
              {ecosystem === 'windows' ? 'Exchange Mail' : 'Postfix / Dovecot'}
            </p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.28</span>
          </div>
        </div>

        {/* 12. SQL Database Server (86%, 69%) */}
        <div className="absolute left-[86%] top-[69%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 4 || activeStep === 6 ? 'bg-blue-950 border-blue-400 scale-110 shadow-xl shadow-blue-500/40' : 'bg-slate-900 border-blue-500/60'
          }`}>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-blue-300">SQL Database</p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.30</span>
          </div>
        </div>

        {/* 13. SAN Storage Array (86%, 80%) */}
        <div className="absolute left-[86%] top-[80%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 6 ? 'bg-rose-950 border-rose-400 scale-110 shadow-xl shadow-rose-500/40' : 'bg-slate-900 border-rose-500/60'
          }`}>
            <HardDrive className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-rose-300">SAN Storage Array</p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.35</span>
          </div>
        </div>

        {/* 14. Backup Vault Server (86%, 91%) */}
        <div className="absolute left-[86%] top-[91%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 6 ? 'bg-rose-950 border-rose-400 scale-110 shadow-xl shadow-rose-500/40' : 'bg-slate-900 border-rose-500/60'
          }`}>
            <Archive className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[10px] text-rose-300">Backup Vault</p>
            <span className="text-[8px] text-slate-400 font-mono">192.168.1.40</span>
          </div>
        </div>

        {/* ANIMATED PACKET OVERLAY (WAYPOINT WIRE TRAVERSAL) */}
        {animPos && (
          <div
            style={{ left: animPos.left, top: animPos.top }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1 rounded-full font-mono font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-white transition-all duration-75 ${animPos.bg}`}
          >
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>{animPos.label}</span>
          </div>
        )}
      </div>

      {/* TERMINAL EVENT LOGS (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && (
        <SlideOutInspector title="Slide Out Technical Deep Dive & Enterprise Wire Logs">
          <TerminalLog logs={logs} onClear={() => setLogs([])} />
        </SlideOutInspector>
      )}
    </div>
  );
}
