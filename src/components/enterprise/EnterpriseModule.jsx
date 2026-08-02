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
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Building2, 
  Terminal, 
  FileCode,
  Lock,
  Radio,
  ArrowRight
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

  const workflowSteps = [
    {
      step: 0,
      title: 'Ready: Standard Enterprise Infrastructure Workflow',
      subtitle: 'Click Play or step forward to simulate sequential enterprise network operations (DHCP ➔ Auth ➔ DNS ➔ Mail ➔ Print).',
      badge: 'IDLE / READY',
      packetLabel: 'Ready',
      color: 'bg-slate-900 border-slate-800 text-slate-300'
    },
    {
      step: 1,
      title: ecosystem === 'windows' ? '1. DHCP Lease: Windows DHCP Server' : '1. DHCP Lease: Linux Kea / ISC DHCP',
      subtitle: ecosystem === 'windows'
        ? 'Laptop-A broadcasts DHCPDISCOVER ➔ Windows DHCP Server leases 192.168.1.105 with Gateway 192.168.1.1 & DNS 192.168.1.20.'
        : 'Laptop-A sends dhclient DISCOVER ➔ Linux Kea DHCP Server leases 192.168.1.105 via UDP 67/68.',
      badge: 'STAGE 1: DHCP LEASE',
      packetLabel: 'DHCP DISCOVER',
      color: 'bg-amber-950/80 border-amber-500 text-amber-300'
    },
    {
      step: 2,
      title: ecosystem === 'windows' ? '2. Domain Auth: Active Directory Kerberos' : '2. Identity Auth: FreeIPA / OpenLDAP',
      subtitle: ecosystem === 'windows'
        ? 'Laptop-A authenticates to AD Domain Controller (DC01) ➔ KDC verifies credentials & issues Kerberos TGT Ticket.'
        : 'Laptop-A authenticates via FreeIPA / SSSD LDAP ➔ Ticket Granting Ticket (TGT) granted for user@CORP.LOCAL.',
      badge: 'STAGE 2: IDENTITY AUTH',
      packetLabel: 'KERBEROS AS-REQ',
      color: 'bg-purple-950/80 border-purple-500 text-purple-300'
    },
    {
      step: 3,
      title: ecosystem === 'windows' ? '3. Corporate DNS: Windows DNS Server' : '3. Corporate DNS: BIND9 DNS Resolver',
      subtitle: ecosystem === 'windows'
        ? 'User opens browser to mail.corp.com ➔ Laptop-A queries Windows DNS (192.168.1.20) ➔ Resolves A Record to 192.168.1.25.'
        : 'Laptop-A queries BIND9 DNS server for mail.corp.com ➔ Returns A Record 192.168.1.25.',
      badge: 'STAGE 3: DNS LOOKUP',
      packetLabel: 'DNS A-QUERY',
      color: 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
    },
    {
      step: 4,
      title: ecosystem === 'windows' ? '4. Mail Transmission: Exchange / SMTP' : '4. Mail Transmission: Postfix / Dovecot',
      subtitle: ecosystem === 'windows'
        ? 'Laptop-A sends email via Exchange SMTP (Port 587) ➔ Mail Server stores & delivers IMAP notification to HR PC-B.'
        : 'Laptop-A transmits email via Postfix SMTP ➔ Delivered to Dovecot IMAP mailbox for HR PC-B.',
      badge: 'STAGE 4: SMTP MAIL',
      packetLabel: 'SMTP MESSAGE',
      color: 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
    },
    {
      step: 5,
      title: ecosystem === 'windows' ? '5. Print Job: Windows Print Spooler' : '5. Print Job: CUPS LPR / IPP Printing',
      subtitle: ecosystem === 'windows'
        ? 'User prints contract document ➔ LPR print job routed over L2 Switch to Network Laser Printer (192.168.1.50).'
        : 'User sends print job via CUPS IPP ➔ Routed to Network Laser Printer (192.168.1.50) over local LAN.',
      badge: 'STAGE 5: LAN PRINT JOB',
      packetLabel: 'RAW PRINT JOB',
      color: 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
    }
  ];

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'ENTERPRISE', message: 'Enterprise Infrastructure Workflow Simulator initialized.' }
  ]);

  const currentMeta = workflowSteps[activeStep] || workflowSteps[0];

  // Animation Timer
  useEffect(() => {
    let animTimer;
    let stepTimer;
    if (isPlaying) {
      setPacketProgress(0);
      animTimer = setInterval(() => {
        setPacketProgress(prev => Math.min(100, prev + 3));
      }, 30 / speed);

      stepTimer = setTimeout(() => {
        if (activeStep < 5) {
          const next = activeStep + 1;
          setActiveStep(next);
          setLogs(prev => [
            ...prev,
            { time: new Date().toLocaleTimeString(), tag: `STAGE_${next}`, message: workflowSteps[next].title }
          ]);
        } else {
          setIsPlaying(false);
        }
      }, 3000 / speed);
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
    if (activeStep >= 5) setActiveStep(1);
    else if (activeStep === 0) setActiveStep(1);
    setIsSingleStep(false);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    if (activeStep >= 5) return;
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

  // Packet Traversal Position Calculation across Enterprise Topology Stage
  const getPacketPos = () => {
    if (!isPlaying && activeStep === 0) return null;
    const t = packetProgress / 100;
    
    // Stage 1: DHCP (Laptop-A [12%,65%] -> Switch [45%,65%] -> Router [45%,42%] -> DHCP Server [85%,25%])
    if (activeStep === 1) {
      if (t <= 0.3) {
        const sub = t / 0.3;
        return { left: `${12 + sub * 33}%`, top: '65%', label: 'DHCPDISCOVER', bg: 'bg-amber-500 text-slate-950' };
      } else if (t <= 0.6) {
        const sub = (t - 0.3) / 0.3;
        return { left: '45%', top: `${65 - sub * 23}%`, label: 'DHCP ROUTE', bg: 'bg-amber-500 text-slate-950' };
      } else {
        const sub = (t - 0.6) / 0.4;
        return { left: `${45 + sub * 40}%`, top: `${42 - sub * 17}%`, label: 'DHCP OFFER', bg: 'bg-amber-400 text-slate-950' };
      }
    }
    // Stage 2: Auth (Laptop-A -> Switch -> Router -> AD/Identity DC [85%,45%])
    if (activeStep === 2) {
      if (t <= 0.5) {
        const sub = t / 0.5;
        return { left: `${12 + sub * 33}%`, top: '65%', label: 'KERBEROS AS-REQ', bg: 'bg-purple-500 text-white' };
      } else {
        const sub = (t - 0.5) / 0.5;
        return { left: `${45 + sub * 40}%`, top: `${65 - sub * 20}%`, label: 'TGT TICKET ISSUED', bg: 'bg-purple-400 text-slate-950' };
      }
    }
    // Stage 3: DNS (Laptop-A -> Switch -> Router -> DNS Server [85%,65%])
    if (activeStep === 3) {
      if (t <= 0.5) {
        const sub = t / 0.5;
        return { left: `${12 + sub * 33}%`, top: '65%', label: 'DNS A-QUERY', bg: 'bg-cyan-500 text-slate-950' };
      } else {
        const sub = (t - 0.5) / 0.5;
        return { left: `${45 + sub * 40}%`, top: '65%', label: 'DNS ANSWER (192.168.1.25)', bg: 'bg-cyan-400 text-slate-950' };
      }
    }
    // Stage 4: Mail (Laptop-A -> Switch -> Mail Server [85%,85%] -> PC-B [28%,65%])
    if (activeStep === 4) {
      if (t <= 0.5) {
        const sub = t / 0.5;
        return { left: `${12 + sub * 73}%`, top: `${65 + sub * 20}%`, label: 'SMTP SEND', bg: 'bg-indigo-500 text-white' };
      } else {
        const sub = (t - 0.5) / 0.5;
        return { left: `${85 - sub * 57}%`, top: `${85 - sub * 20}%`, label: 'IMAP NOTIFY', bg: 'bg-indigo-400 text-slate-950' };
      }
    }
    // Stage 5: Print (Laptop-A -> Switch [45%,65%] -> Printer [20%,32%])
    if (activeStep === 5) {
      if (t <= 0.5) {
        const sub = t / 0.5;
        return { left: `${12 + sub * 33}%`, top: '65%', label: 'RAW PRINT DATA', bg: 'bg-emerald-500 text-slate-950' };
      } else {
        const sub = (t - 0.5) / 0.5;
        return { left: `${45 - sub * 25}%`, top: `${65 - sub * 33}%`, label: 'PRINT JOB EXECUTED', bg: 'bg-emerald-400 text-slate-950' };
      }
    }
    return null;
  };

  const animPos = getPacketPos();

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP UNIFIED CONTROL & BASIC INFO WIDGET */}
      <CleanWidget
        title="Enterprise Infrastructure & Live Workflow Simulator"
        subtitle="Watch full enterprise network operations: DHCP Lease ➔ Domain Auth ➔ DNS Lookup ➔ Mail Routing ➔ LAN Print Job."
        icon={Building2}
        ip="192.168.1.105 (Sales) → 192.168.1.0/24 Subnet"
        protocol={activeStep === 1 ? 'DHCP (UDP 67/68)' : activeStep === 2 ? (ecosystem === 'windows' ? 'Kerberos (Port 88)' : 'LDAP / FreeIPA') : activeStep === 3 ? 'DNS (UDP 53)' : activeStep === 4 ? 'SMTP (Port 587)' : activeStep === 5 ? 'LPR/RAW (Port 9100)' : 'Enterprise LAN'}
        port={activeStep === 1 ? 'UDP 67/68' : activeStep === 2 ? 'Port 88 / 389' : activeStep === 3 ? 'Port 53' : activeStep === 4 ? 'Port 587 / 993' : activeStep === 5 ? 'Port 9100' : 'Multi-Port'}
        status={currentMeta.badge}
        actionTitle={currentMeta.title}
        actionDesc={currentMeta.subtitle}
        stepNumber={activeStep}
        totalSteps={5}
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
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-black">Enterprise OS Ecosystem:</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setEcosystem('windows')}
            className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              ecosystem === 'windows'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🪟 Windows Ecosystem (AD / Kerberos)</span>
          </button>

          <button
            onClick={() => setEcosystem('linux')}
            className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              ecosystem === 'linux'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🐧 Linux Ecosystem (FreeIPA / BIND)</span>
          </button>
        </div>
      </div>

      {/* WORKFLOW STEP CARDS */}
      <div className="grid grid-cols-5 gap-2 font-mono text-xs">
        {[
          { step: 1, label: '1. DHCP Lease', desc: 'IP Assignment' },
          { step: 2, label: '2. Domain Auth', desc: ecosystem === 'windows' ? 'Kerberos AD' : 'FreeIPA LDAP' },
          { step: 3, label: '3. DNS Lookup', desc: 'mail.corp.com' },
          { step: 4, label: '4. Mail Transmit', desc: 'SMTP / IMAP' },
          { step: 5, label: '5. Print Job', desc: 'LPR / RAW Print' }
        ].map((item) => {
          const isDone = activeStep >= item.step;
          const isCurrent = activeStep === item.step;
          return (
            <button
              key={item.step}
              onClick={() => { setIsPlaying(false); setActiveStep(item.step); }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white border-cyan-300 font-extrabold shadow-lg scale-102'
                  : isDone
                  ? 'bg-slate-900/90 text-slate-200 border-slate-700 font-bold'
                  : 'bg-slate-950/60 text-slate-500 border-slate-800 opacity-60'
              }`}
            >
              <p className="font-extrabold truncate">{item.label}</p>
              <p className="text-[10px] opacity-80 truncate">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC ACTION STATUS BANNER */}
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

      {/* MAIN TOPOLOGY CANVAS STAGE */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden bg-slate-950/80 min-h-[540px]">
        
        {/* NETWORK CABLES SVG OVERLAY */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Laptop-A (12%,65%) -> Floor Switch (45%,65%) - Straight UTP Ethernet */}
          <line x1="12%" y1="65%" x2="45%" y2="65%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />
          
          {/* PC-B (28%,65%) -> Floor Switch (45%,65%) - Straight UTP Ethernet */}
          <line x1="28%" y1="65%" x2="45%" y2="65%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />

          {/* Printer (20%,32%) -> Floor Switch (45%,65%) - Peripheral Cable */}
          <line x1="20%" y1="32%" x2="45%" y2="65%" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />

          {/* Floor Switch (45%,65%) -> Core Router (45%,42%) - Router Trunk */}
          <line x1="45%" y1="65%" x2="45%" y2="42%" stroke="#f59e0b" strokeWidth="5" />

          {/* Core Router (45%,42%) -> Data Center Switch (72%,42%) - Router Trunk */}
          <line x1="45%" y1="42%" x2="72%" y2="42%" stroke="#f59e0b" strokeWidth="5" strokeDasharray="8 6" className="animate-wire-dash" />

          {/* DC Switch (72%,42%) -> DHCP Server (85%,25%) - Fiber Backbone */}
          <line x1="72%" y1="42%" x2="85%" y2="25%" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />

          {/* DC Switch (72%,42%) -> Domain DC (85%,45%) - Fiber Backbone */}
          <line x1="72%" y1="42%" x2="85%" y2="45%" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />

          {/* DC Switch (72%,42%) -> DNS Server (85%,65%) - Fiber Backbone */}
          <line x1="72%" y1="42%" x2="85%" y2="65%" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />

          {/* DC Switch (72%,42%) -> Mail Server (85%,85%) - Fiber Backbone */}
          <line x1="72%" y1="42%" x2="85%" y2="85%" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />
        </svg>

        {/* TOPOLOGY NODES */}
        
        {/* OFFICE FLOOR 1 WORKSTATIONS ZONE */}
        {/* 1. Laptop-A (Sales) */}
        <div className="absolute left-[12%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 font-mono text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shadow">
            192.168.1.105
          </span>
          <div className="p-4 bg-slate-900 border-2 border-cyan-500 rounded-2xl shadow-xl">
            <Laptop className="w-10 h-10 text-cyan-400" />
          </div>
          <p className="font-extrabold text-xs text-cyan-300">Laptop-A (Sales)</p>
          <p className="text-[10px] text-slate-400">MAC: 00:1A:2B:3C:4D:01</p>
        </div>

        {/* 2. PC-B (HR) */}
        <div className="absolute left-[28%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 font-mono text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shadow">
            192.168.1.106
          </span>
          <div className="p-4 bg-slate-900 border-2 border-cyan-500 rounded-2xl shadow-xl">
            <Laptop className="w-10 h-10 text-cyan-400" />
          </div>
          <p className="font-extrabold text-xs text-cyan-300">PC-B (HR Dept)</p>
          <p className="text-[10px] text-slate-400">MAC: 00:1A:2B:3C:4D:02</p>
        </div>

        {/* 3. Network Laser Printer */}
        <div className="absolute left-[20%] top-[32%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 font-mono text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shadow">
            192.168.1.50
          </span>
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            activeStep === 5 ? 'bg-emerald-950 border-emerald-400 scale-110 shadow-2xl shadow-emerald-500/40' : 'bg-slate-900 border-emerald-500/60'
          }`}>
            <Printer className="w-10 h-10 text-emerald-400" />
          </div>
          <p className="font-extrabold text-xs text-emerald-300">Office Printer</p>
          <p className="text-[10px] text-slate-400">LPR / RAW Print Server</p>
        </div>

        {/* 4. Floor-1 L2 Access Switch */}
        <div className="absolute left-[45%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 font-mono text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shadow">
            Floor-1 Switch (L2)
          </span>
          <div className="p-5 bg-slate-900 border-2 border-blue-500 rounded-3xl shadow-xl">
            <Layers className="w-12 h-12 text-blue-400" />
          </div>
          <p className="font-extrabold text-xs text-blue-300">Floor-1 Access Switch</p>
        </div>

        {/* CORE ROUTING ZONE */}
        {/* 5. Enterprise Core Router & Firewall */}
        <div className="absolute left-[45%] top-[42%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 font-mono text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-700 shadow">
            Gateway: 192.168.1.1
          </span>
          <div className="p-5 bg-slate-900 border-2 border-amber-500 rounded-3xl shadow-2xl">
            <Router className="w-12 h-12 text-amber-400 animate-pulse" />
          </div>
          <p className="font-extrabold text-xs text-amber-300">Core Router & Firewall</p>
        </div>

        {/* DATA CENTER SERVER RACK ZONE */}
        {/* 6. Data Center Switch */}
        <div className="absolute left-[72%] top-[42%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 font-mono text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shadow">
            Data Center Core Switch
          </span>
          <div className="p-4 bg-slate-900 border-2 border-blue-500 rounded-2xl shadow-xl">
            <Layers className="w-10 h-10 text-blue-400" />
          </div>
          <p className="font-extrabold text-xs text-blue-300">DC Core Switch</p>
        </div>

        {/* 7. DHCP Server */}
        <div className="absolute left-[85%] top-[25%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800 shadow">
            192.168.1.2
          </span>
          <div className={`p-3 rounded-2xl border-2 transition-all ${
            activeStep === 1 ? 'bg-purple-950 border-purple-400 scale-110 shadow-2xl shadow-purple-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-8 h-8 text-purple-400" />
          </div>
          <p className="font-extrabold text-[11px] text-purple-300">DHCP Server</p>
        </div>

        {/* 8. Active Directory / FreeIPA DC */}
        <div className="absolute left-[85%] top-[45%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800 shadow">
            192.168.1.10
          </span>
          <div className={`p-3 rounded-2xl border-2 transition-all ${
            activeStep === 2 ? 'bg-purple-950 border-purple-400 scale-110 shadow-2xl shadow-purple-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-8 h-8 text-purple-400" />
          </div>
          <p className="font-extrabold text-[11px] text-purple-300">
            {ecosystem === 'windows' ? 'AD DC01 (Kerberos)' : 'FreeIPA LDAP DC'}
          </p>
        </div>

        {/* 9. Corporate DNS Server */}
        <div className="absolute left-[85%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800 shadow">
            192.168.1.20
          </span>
          <div className={`p-3 rounded-2xl border-2 transition-all ${
            activeStep === 3 ? 'bg-purple-950 border-purple-400 scale-110 shadow-2xl shadow-purple-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-8 h-8 text-purple-400" />
          </div>
          <p className="font-extrabold text-[11px] text-purple-300">
            {ecosystem === 'windows' ? 'Windows DNS Server' : 'BIND9 DNS Resolver'}
          </p>
        </div>

        {/* 10. Corporate Mail Server */}
        <div className="absolute left-[85%] top-[85%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800 shadow">
            192.168.1.25
          </span>
          <div className={`p-3 rounded-2xl border-2 transition-all ${
            activeStep === 4 ? 'bg-purple-950 border-purple-400 scale-110 shadow-2xl shadow-purple-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-8 h-8 text-purple-400" />
          </div>
          <p className="font-extrabold text-[11px] text-purple-300">
            {ecosystem === 'windows' ? 'Exchange Mail Server' : 'Postfix / Dovecot Mail'}
          </p>
        </div>

        {/* ANIMATED PACKET OVERLAY */}
        {animPos && (
          <div
            style={{ left: animPos.left, top: animPos.top }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 px-3.5 py-1.5 rounded-full font-mono font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-white transition-all duration-75 ${animPos.bg}`}
          >
            <Cpu className="w-4 h-4 animate-spin" />
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
