import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
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
  const { lang, t } = useLanguage();
  const [showAnimation, setShowAnimation] = useState(true);
  const [ecosystem, setEcosystem] = useState('windows'); // 'windows' or 'linux'
  const [speed, setSpeed] = useState(0.5); // Default 0.5x speed (Blue - Slowest)
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [packetProgress, setPacketProgress] = useState(0);

  // Enterprise Workflow Steps Metadata
  const workflowSteps = [
    {
      step: 0,
      title: 'Enterprise Infrastructure Ready',
      subtitle: 'Select an enterprise workflow step or click Play to watch multi-hop packet traversal across floor switches, distribution/edge routers, and data center server racks.',
      badge: 'ENTERPRISE SYSTEM READY',
      packetLabel: 'READY',
      color: 'bg-slate-900 border-slate-700 text-slate-300'
    },
    {
      step: 1,
      title: ecosystem === 'windows' ? '1. DHCP Lease: Windows DHCP Server' : '1. DHCP Lease: Linux Kea DHCP Server',
      subtitle: 'Laptop-A sends DHCPDISCOVER ➔ Floor-1 Switch ➔ Dist Router ➔ Edge Router ➔ DC Switch ➔ Leases 192.168.1.105 from DHCP Server.',
      badge: 'STAGE 1: DHCP LEASE',
      packetLabel: 'DHCP DISCOVER',
      color: 'bg-amber-950/80 border-amber-500 text-amber-300'
    },
    {
      step: 2,
      title: ecosystem === 'windows' ? '2. Identity Auth: Active Directory Kerberos' : '2. Identity Auth: FreeIPA / OpenLDAP',
      subtitle: 'Laptop-A authenticates ➔ Floor-1 Switch ➔ Dist Router ➔ Edge Router ➔ DC Switch ➔ KDC DC01 issues Kerberos TGT Ticket.',
      badge: 'STAGE 2: IDENTITY AUTH',
      packetLabel: 'KERBEROS AS-REQ',
      color: 'bg-purple-950/80 border-purple-500 text-purple-300'
    },
    {
      step: 3,
      title: ecosystem === 'windows' ? '3. Corporate DNS: Windows DNS Server' : '3. Corporate DNS: BIND9 DNS Resolver',
      subtitle: 'Laptop-A queries app.corp.com ➔ Floor Switch ➔ Routers ➔ DC Switch ➔ Corporate DNS returns A Record 192.168.1.25.',
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
      subtitle: 'Laptop-A transmits print job ➔ Floor-1 Switch ➔ Direct to Office Laser Printer over LPR Port 9100.',
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

    // Node Waypoint Definitions based on updated floor & dual-router layout
    const N = {
      LaptopA: { x: 10, y: 72 },
      PCB: { x: 24, y: 72 },
      Printer: { x: 10, y: 22 },
      FloorSwitch: { x: 26, y: 46 },
      DistRouter: { x: 48, y: 65 },
      EdgeRouter: { x: 48, y: 28 },
      DCSwitch: { x: 68, y: 46 },
      DHCP: { x: 85, y: 14 },
      AD: { x: 85, y: 25 },
      DNS: { x: 85, y: 36 },
      App: { x: 85, y: 47 },
      Mail: { x: 85, y: 58 },
      DB: { x: 85, y: 69 },
      SAN: { x: 85, y: 80 },
      Backup: { x: 85, y: 91 }
    };

    let path = [];
    let bg = 'bg-cyan-500 text-slate-950';

    if (activeStep === 1) {
      // Stage 1: DHCP (Laptop-A -> FloorSwitch -> DistRouter -> EdgeRouter -> DCSwitch -> DHCP Server)
      path = [N.LaptopA, N.FloorSwitch, N.DistRouter, N.EdgeRouter, N.DCSwitch, N.DHCP];
      bg = 'bg-amber-500 text-slate-950';
    } else if (activeStep === 2) {
      // Stage 2: Auth (Laptop-A -> FloorSwitch -> DistRouter -> EdgeRouter -> DCSwitch -> AD DC01)
      path = [N.LaptopA, N.FloorSwitch, N.DistRouter, N.EdgeRouter, N.DCSwitch, N.AD];
      bg = 'bg-purple-500 text-white';
    } else if (activeStep === 3) {
      // Stage 3: DNS (Laptop-A -> FloorSwitch -> DistRouter -> EdgeRouter -> DCSwitch -> DNS Server)
      path = [N.LaptopA, N.FloorSwitch, N.DistRouter, N.EdgeRouter, N.DCSwitch, N.DNS];
      bg = 'bg-cyan-400 text-slate-950';
    } else if (activeStep === 4) {
      // Stage 4: App & DB Query (Laptop-A -> FloorSwitch -> DistRouter -> EdgeRouter -> DCSwitch -> App Server -> SQL DB)
      path = [N.LaptopA, N.FloorSwitch, N.DistRouter, N.EdgeRouter, N.DCSwitch, N.App, N.DB];
      bg = 'bg-blue-500 text-white';
    } else if (activeStep === 5) {
      // Stage 5: Mail Sync (Laptop-A -> FloorSwitch -> DistRouter -> EdgeRouter -> DCSwitch -> Mail -> DCSwitch -> EdgeRouter -> DistRouter -> FloorSwitch -> PC-B)
      path = [N.LaptopA, N.FloorSwitch, N.DistRouter, N.EdgeRouter, N.DCSwitch, N.Mail, N.DCSwitch, N.EdgeRouter, N.DistRouter, N.FloorSwitch, N.PCB];
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

  const enterprisePacketPayloads = {
    1: {
      stepName: 'STAGE 1: DHCP LEASE (UDP 67/68)',
      l2Header: 'Src MAC: 00:1A:2B:3C:4D:01 (Laptop-A) ➔ Dst MAC: FF:FF:FF:FF:FF:FF (Broadcast)',
      l3Header: 'Src IP: 0.0.0.0 ➔ Dst IP: 255.255.255.255 (DHCPDISCOVER)',
      l4Header: 'UDP Port 68 (DHCP Client) ➔ UDP Port 67 (DHCP Server 192.168.1.10)',
      payload: 'BOOTP/DHCP Payload (Leased IP: 192.168.1.105, Subnet: 255.255.255.0, Gateway: 192.168.1.254)'
    },
    2: {
      stepName: `STAGE 2: KERBEROS AUTH (${ecosystem === 'windows' ? 'Port 88' : 'LDAP Port 389'})`,
      l2Header: 'Src MAC: 00:1A:2B:3C:4D:01 (Laptop-A) ➔ Dst MAC: 00:50:56:00:00:15 (AD DC01)',
      l3Header: 'Src IP: 192.168.1.105 ➔ Dst IP: 192.168.1.15 (DC01 KDC Domain Controller)',
      l4Header: ecosystem === 'windows' ? 'TCP Port 88 (Kerberos AS-REQ)' : 'TCP Port 389 (LDAP Bind)',
      payload: ecosystem === 'windows' ? 'KRB_AS_REQ (Principal: sales.user@corp.com, Encrypted Authenticator)' : 'LDAP Bind Request (DN: uid=sales.user,dc=corp,dc=com)'
    },
    3: {
      stepName: 'STAGE 3: CORPORATE DNS LOOKUP (UDP 53)',
      l2Header: 'Src MAC: 00:1A:2B:3C:4D:01 (Laptop-A) ➔ Dst MAC: 00:50:56:00:00:20 (DNS Server)',
      l3Header: 'Src IP: 192.168.1.105 ➔ Dst IP: 192.168.1.20 (Corporate DNS Resolver)',
      l4Header: 'UDP Port 54321 ➔ UDP Port 53 (DNS Service)',
      payload: 'DNS Query: A app.corp.com IN ➔ DNS Answer: A 192.168.1.25 (TTL=3600)'
    },
    4: {
      stepName: 'STAGE 4: APP & SQL DB QUERY (TCP 5432)',
      l2Header: 'Src MAC: 00:50:56:00:00:25 (App Web) ➔ Dst MAC: 00:50:56:00:00:30 (SQL DB Server)',
      l3Header: 'Src IP: 192.168.1.25 (App Web) ➔ Dst IP: 192.168.1.30 (SQL Database)',
      l4Header: 'TCP Port 41050 ➔ TCP Port 5432 (PostgreSQL / SQL Server)',
      payload: 'SELECT * FROM accounts WHERE id=10495; (TLS v1.3 Encrypted DB Session)'
    },
    5: {
      stepName: 'STAGE 5: ENTERPRISE MAIL SYNC (SMTP 587 / IMAP 993)',
      l2Header: 'Src MAC: 00:1A:2B:3C:4D:01 (Laptop-A) ➔ Dst MAC: 00:50:56:00:00:28 (Mail Server)',
      l3Header: 'Src IP: 192.168.1.105 ➔ Dst IP: 192.168.1.28 (Exchange / Postfix Mail)',
      l4Header: 'TCP Port 587 (SMTP Submissions) ➔ TCP Port 993 (IMAP4 TLS)',
      payload: 'SMTP RFC5322 Message (From: sales@corp.com ➔ To: hr@corp.com, Subject: Q3 Financials)'
    },
    6: {
      stepName: 'STAGE 6: SAN STORAGE & BACKUP VAULT SYNC (Port 3260)',
      l2Header: 'Src MAC: 00:50:56:00:00:30 (SQL DB) ➔ Dst MAC: 00:50:56:00:00:35 (SAN Storage)',
      l3Header: 'Src IP: 192.168.1.30 (SQL DB) ➔ Dst IP: 192.168.1.35 (SAN Storage Array)',
      l4Header: 'TCP Port 3260 (iSCSI Storage Target) / TCP Port 8443 (Backup Vault)',
      payload: 'iSCSI Block WRITE (LUN 0, Sector 0x8A4F) ➔ Automated Snapshot Sync to Backup Vault (192.168.1.40)'
    },
    7: {
      stepName: 'STAGE 7: LAN DIRECT PRINT JOB (LPR Port 9100)',
      l2Header: 'Src MAC: 00:1A:2B:3C:4D:01 (Laptop-A) ➔ Dst MAC: 00:11:22:33:44:55 (Printer)',
      l3Header: 'Src IP: 192.168.1.105 ➔ Dst IP: 192.168.1.50 (Laser Printer)',
      l4Header: 'TCP Port 51200 ➔ TCP Port 9100 (RAW / LPR Print Stream)',
      payload: '%PDF-1.7 Job: Invoice_Q3.pdf (PostScript Direct Print Stream)'
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP UNIFIED CONTROL & BASIC INFO WIDGET */}
      <CleanWidget
        title={lang === 'de' ? 'Enterprise-Infrastruktur & Multi-Hop-Workflow-Simulator' : 'Enterprise Infrastructure & Multi-Hop Workflow Simulator'}
        subtitle={lang === 'de' ? 'Beobachten Sie, wie Pakete echte Netzwerkpfade durchqueren: DHCP-Lease ➔ Domänenauthentifizierung ➔ DNS ➔ Web/SQL DB ➔ Mail ➔ SAN Backup ➔ LAN Print.' : 'Watch packets traverse real network wire paths: DHCP Lease ➔ Domain Auth ➔ DNS ➔ Web/SQL DB ➔ Mail ➔ SAN Backup ➔ LAN Print.'}
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
          <span className="text-slate-300 font-extrabold">{lang === 'de' ? 'Unternehmens-Stack-Ökosystem:' : 'Enterprise Stack Ecosystem:'}</span>
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
          {/* Office Floor 1 Device Direct Cables to Floor-1 Switch (26%, 46%) */}
          {/* Laptop-A (10%, 72%) -> Floor-1 Switch (26%, 46%) */}
          <line x1="10%" y1="72%" x2="26%" y2="46%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.8" />
          
          {/* PC-B (24%, 72%) -> Floor-1 Switch (26%, 46%) */}
          <line x1="24%" y1="72%" x2="26%" y2="46%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.8" />

          {/* Laser Printer (10%, 22%) -> Floor-1 Switch (26%, 46%) */}
          <line x1="10%" y1="22%" x2="26%" y2="46%" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.8" />

          {/* Floor-1 Switch (26%, 46%) -> Distribution Core Router (48%, 65%) */}
          <line x1="26%" y1="46%" x2="48%" y2="65%" stroke="#f59e0b" strokeWidth="5" opacity="0.9" />

          {/* Vertical Inter-Router Backbone: Distribution Router (48%, 65%) -> Core Edge Router & Firewall (48%, 28%) */}
          <line x1="48%" y1="65%" x2="48%" y2="28%" stroke="#f59e0b" strokeWidth="5" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.9" />

          {/* Edge Router (48%, 28%) -> Data Center Core Switch (68%, 46%) */}
          <line x1="48%" y1="28%" x2="68%" y2="46%" stroke="#f59e0b" strokeWidth="5" strokeDasharray="8 6" className="animate-wire-dash" opacity="0.9" />

          {/* DC Switch (68%, 46%) -> Server Rack Node Cables */}
          {/* 1. DHCP Server (85%, 14%) */}
          <line x1="68%" y1="46%" x2="85%" y2="14%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 2. AD DC01 (85%, 25%) */}
          <line x1="68%" y1="46%" x2="85%" y2="25%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 3. DNS Server (85%, 36%) */}
          <line x1="68%" y1="46%" x2="85%" y2="36%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 4. App/Web Server (85%, 47%) */}
          <line x1="68%" y1="46%" x2="85%" y2="47%" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 5. Mail Server (85%, 58%) */}
          <line x1="68%" y1="46%" x2="85%" y2="58%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 6. SQL Database Server (85%, 69%) */}
          <line x1="68%" y1="46%" x2="85%" y2="69%" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 7. SAN Storage Array (85%, 80%) */}
          <line x1="68%" y1="46%" x2="85%" y2="80%" stroke="#e11d48" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />
          {/* 8. Backup Vault Server (85%, 91%) */}
          <line x1="68%" y1="46%" x2="85%" y2="91%" stroke="#e11d48" strokeWidth="3" strokeDasharray="6 4" opacity="0.7" />

          {/* Inter-Server SAN Storage Bus Cable: SQL DB -> SAN Array -> Backup Vault */}
          <line x1="85%" y1="69%" x2="85%" y2="80%" stroke="#f43f5e" strokeWidth="4" strokeDasharray="4 4" className="animate-wire-dash" />
          <line x1="85%" y1="80%" x2="85%" y2="91%" stroke="#f43f5e" strokeWidth="4" strokeDasharray="4 4" className="animate-wire-dash" />
        </svg>

        {/* FAINT HIGHLIGHT NETWORK AREA CONTAINERS */}
        {/* Office Floor 1 Workstations & Access Switch Area */}
        <div className="absolute left-[2%] top-[4%] w-[33%] h-[92%] border-2 border-dashed border-cyan-800/30 bg-cyan-950/15 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 shadow">
            OFFICE FLOOR 1 WORKSTATIONS & SWITCH
          </span>
        </div>

        {/* Core Routing & Firewall Zone (Dual Vertical Router Architecture) */}
        <div className="absolute left-[37%] top-[4%] w-[22%] h-[92%] border-2 border-dashed border-amber-800/30 bg-amber-950/15 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow text-center whitespace-nowrap">
            DUAL CORE ROUTERS & FIREWALL
          </span>
        </div>

        {/* Data Center Server Racks Area (EXPANDED TO 38% WIDTH FOR MAXIMUM VISIBILITY) */}
        <div className="absolute right-[2%] top-[4%] w-[37%] h-[92%] border-2 border-dashed border-purple-800/30 bg-purple-950/15 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-800/80 shadow">
            DATA CENTER SERVER RACKS ZONE
          </span>
        </div>

        {/* TOPOLOGY NODES */}
        
        {/* OFFICE FLOOR 1 WORKSTATIONS & ACCESS SWITCH ZONE */}
        {/* 1. Laptop-A (Sales) */}
        <div className="absolute left-[10%] top-[72%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
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
        <div className="absolute left-[24%] top-[72%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
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
        <div className="absolute left-[10%] top-[22%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
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

        {/* 4. Floor-1 Access Switch (Inside Office Floor 1 Zone) */}
        <div className="absolute left-[26%] top-[46%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shadow">
            Floor-1 Switch (L2)
          </span>
          <div className="p-3.5 bg-slate-900 border-2 border-blue-500 rounded-2xl shadow-xl">
            <Layers className="w-8 h-8 text-blue-400" />
          </div>
          <p className="font-extrabold text-xs text-blue-300">Floor-1 Switch</p>
        </div>

        {/* DUAL CORE ROUTING ZONE (VERTICAL SPACE UTILIZATION) */}
        {/* 5. Core Edge Router & Firewall (Top Router) */}
        <div className="absolute left-[48%] top-[28%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-700 shadow">
            Edge: 192.168.1.1
          </span>
          <div className="p-3.5 bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl">
            <Router className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <p className="font-extrabold text-xs text-amber-300">Core Edge Router & Firewall</p>
        </div>

        {/* 6. Core Distribution Router (Bottom Router) */}
        <div className="absolute left-[48%] top-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-700 shadow">
            Dist: 192.168.1.254
          </span>
          <div className="p-3.5 bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl">
            <Router className="w-8 h-8 text-amber-400" />
          </div>
          <p className="font-extrabold text-xs text-amber-300">Distribution Core Router</p>
        </div>

        {/* DATA CENTER SERVER RACK ZONE (EXPANDED TO 38% WIDTH) */}
        {/* 7. Data Center Switch */}
        <div className="absolute left-[68%] top-[46%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-center z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800 shadow">
            DC Core Switch
          </span>
          <div className="p-3 bg-slate-900 border-2 border-blue-500 rounded-xl shadow-xl">
            <Layers className="w-7 h-7 text-blue-400" />
          </div>
          <p className="font-extrabold text-xs text-blue-300">DC Core Switch</p>
        </div>

        {/* 8. DHCP Server (85%, 14%) */}
        <div className="absolute left-[85%] top-[14%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 1 ? 'bg-amber-950 border-amber-400 scale-110 shadow-xl shadow-amber-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-purple-300">DHCP Server</p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.10</span>
          </div>
        </div>

        {/* 9. Active Directory / FreeIPA DC (85%, 25%) */}
        <div className="absolute left-[85%] top-[25%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 2 ? 'bg-purple-950 border-purple-400 scale-110 shadow-xl shadow-purple-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-purple-300">
              {ecosystem === 'windows' ? 'AD DC01 KDC' : 'FreeIPA LDAP'}
            </p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.15</span>
          </div>
        </div>

        {/* 10. Corporate DNS Server (85%, 36%) */}
        <div className="absolute left-[85%] top-[36%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 3 ? 'bg-cyan-950 border-cyan-400 scale-110 shadow-xl shadow-cyan-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-cyan-300">
              {ecosystem === 'windows' ? 'Windows DNS' : 'BIND9 DNS'}
            </p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.20</span>
          </div>
        </div>

        {/* 11. App / Web Server (85%, 47%) */}
        <div className="absolute left-[85%] top-[47%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 4 ? 'bg-blue-950 border-blue-400 scale-110 shadow-xl shadow-blue-500/40' : 'bg-slate-900 border-blue-500/60'
          }`}>
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-blue-300">App Web Server</p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.25</span>
          </div>
        </div>

        {/* 12. Enterprise Mail Server (85%, 58%) */}
        <div className="absolute left-[85%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 5 ? 'bg-indigo-950 border-indigo-400 scale-110 shadow-xl shadow-indigo-500/40' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Mail className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-indigo-300">
              {ecosystem === 'windows' ? 'Exchange Mail' : 'Postfix / Dovecot'}
            </p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.28</span>
          </div>
        </div>

        {/* 13. SQL Database Server (85%, 69%) */}
        <div className="absolute left-[85%] top-[69%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 4 || activeStep === 6 ? 'bg-blue-950 border-blue-400 scale-110 shadow-xl shadow-blue-500/40' : 'bg-slate-900 border-blue-500/60'
          }`}>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-blue-300">SQL Database</p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.30</span>
          </div>
        </div>

        {/* 14. SAN Storage Array (85%, 80%) */}
        <div className="absolute left-[85%] top-[80%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 6 ? 'bg-rose-950 border-rose-400 scale-110 shadow-xl shadow-rose-500/40' : 'bg-slate-900 border-rose-500/60'
          }`}>
            <HardDrive className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-rose-300">SAN Storage Array</p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.35</span>
          </div>
        </div>

        {/* 15. Backup Vault Server (85%, 91%) */}
        <div className="absolute left-[85%] top-[91%] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 z-10">
          <div className={`p-2 rounded-xl border-2 transition-all ${
            activeStep === 6 ? 'bg-rose-950 border-rose-400 scale-110 shadow-xl shadow-rose-500/40' : 'bg-slate-900 border-rose-500/60'
          }`}>
            <Archive className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[11px] text-rose-300">Backup Vault</p>
            <span className="text-[9px] text-slate-400 font-mono">192.168.1.40</span>
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

      {/* TECHNICAL PACKET INSPECTOR & TERMINAL EVENT LOGS */}
      <SlideOutInspector title="Technical Deep Dive & Enterprise Wire Protocol Logs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          
          {/* LEFT: ENTERPRISE LIVE PACKET CONTENT INSPECTOR */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Enterprise Packet Header & Frame Inspector</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-amber-400 border border-slate-800 font-bold">
                {currentMeta.badge}
              </span>
            </div>

            {activeStep > 0 && enterprisePacketPayloads[activeStep] ? (
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold border-b border-slate-800/80 pb-1">
                    <span>Protocol Stage:</span>
                    <span className="text-amber-400 font-extrabold">{enterprisePacketPayloads[activeStep].stepName}</span>
                  </div>

                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Layer 2 MACs:</span> <span className="text-cyan-300 font-bold">{enterprisePacketPayloads[activeStep].l2Header}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">IPv4 Layer 3:</span> <span className="text-emerald-300 font-bold">{enterprisePacketPayloads[activeStep].l3Header}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Transport L4 Ports:</span> <span className="text-purple-300 font-bold">{enterprisePacketPayloads[activeStep].l4Header}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Payload Data:</span> <span className="text-amber-300 font-bold">{enterprisePacketPayloads[activeStep].payload}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 text-center text-slate-500 text-xs">
                <p className="font-bold">Enterprise System Ready & Idle.</p>
                <p className="text-[10px]">Select a workflow stage above (1-7) or click Play to inspect packet headers in real time.</p>
              </div>
            )}
          </div>

          {/* RIGHT: TERMINAL EVENT LOGS */}
          <TerminalLog logs={logs} onClear={() => setLogs([])} />
        </div>
      </SlideOutInspector>
    </div>
  );
}
