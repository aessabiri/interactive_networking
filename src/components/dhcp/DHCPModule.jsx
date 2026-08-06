import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Server, Laptop, Router, CheckCircle2, Zap, Gauge, Mail, HelpCircle, Radio, Database, Terminal, SkipForward, Globe, XCircle, Info, FileCode, X, Layers, Cpu, Hash, Activity, Sparkles, Settings, Sliders, ShieldCheck } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import PacketInspector from '../common/PacketInspector';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';

export default function DHCPModule({ appMode = 'clean' }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Discover, 2: Offer, 3: Request, 4: Ack
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5); // Default speed 0.5x
  const [isRelayMode, setIsRelayMode] = useState(false); // L2 Switch Mode vs L3 Router Relay Agent Mode (ip helper-address)
  const [activeOsTab, setActiveOsTab] = useState('windows');
  const [packetProgress, setPacketProgress] = useState(0); // 0 to 100%
  const [modalPayloadStep, setModalPayloadStep] = useState(null); // 1, 2, 3, 4 or null for floating modal
  const [showConfigDrawer, setShowConfigDrawer] = useState(false); // Scope Config Drawer

  // Realistic Enterprise DHCP Server Scope Configuration State
  const [scopeConfig, setScopeConfig] = useState({
    scopeName: 'Corporate-HQ-VLAN10',
    subnet: '192.168.1.0/24',
    startIp: '192.168.1.100',
    endIp: '192.168.1.200',
    exclusion: '192.168.1.1 - 192.168.1.20',
    gateway: '192.168.1.1',
    dnsPrimary: '8.8.8.8',
    dnsSecondary: '1.1.1.1',
    domainName: 'corp.dts.de',
    leaseTime: '8 Days (691200s)',
    assignedIp: '192.168.1.105'
  });

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'DHCP', message: `DHCP Daemon initialized for scope ${scopeConfig.scopeName}. Listening on UDP Port 67 (Server) / Port 68 (Client).` }
  ]);

  // Enhanced DORA Steps Metadata & Dynamic Scope Payloads
  const stepMeta = {
    0: {
      title: 'Ready to Start DORA Handshake',
      subtitle: isRelayMode 
        ? 'Mode: Multi-Subnet L3 Router DHCP Relay Agent (ip helper-address 10.20.1.50) with Option 82'
        : 'Mode: Single-Subnet L2 Switch Broadcast (VLAN 1)',
      badge: 'STATE: UNCONFIGURED (0.0.0.0)',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      transmissionType: 'NONE',
      serverPoolState: `AVAILABLE (${scopeConfig.assignedIp})`,
      srcIp: '0.0.0.0',
      dstIp: '0.0.0.0',
    },
    1: {
      title: isRelayMode ? '📢 STEP 1: DHCP DISCOVER & L3 RELAY (OPTION 82)' : '📢 STEP 1: DHCP DISCOVER (BROADCAST FLOODING)',
      subtitle: isRelayMode
        ? 'PC-01 broadcasts locally. L3 Router intercepts, appends Option 82 (Circuit ID), and UNICASTS to DHCP Server (10.20.1.50) across WAN!'
        : 'PC-01 broadcasts. The central L2 Switch FLOODS the packet to ALL ports in VLAN 1!',
      badge: isRelayMode ? 'L3 ROUTER RELAY: OPTION 82 INJECTED' : 'L2 TRANSMISSION: BROADCAST FLOODING',
      badgeColor: isRelayMode ? 'bg-purple-950 text-purple-300 border-purple-500 animate-pulse' : 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      transmissionType: isRelayMode ? 'RELAY' : 'BROADCAST',
      sender: 'CLIENT',
      receiver: 'SERVER',
      serverPoolState: 'INSPECTING POOL...',
      srcIp: '0.0.0.0',
      dstIp: isRelayMode ? '10.20.1.50 (Relayed Unicast)' : '255.255.255.255 (Broadcast)',
      explanation: isRelayMode
        ? 'L3 Gateway Router intercepts local broadcast, inserts DHCP Option 82 (Circuit ID: Gi0/1, Remote ID: ROUTER-GW-01), and routes it to Central DHCP Server on Subnet 10.20.1.0/24.'
        : 'PC-01 sends a BROADCAST frame to the central L2 Switch. The Switch FLOODS it to all connected devices on the same subnet.',
      whyBroadcast: isRelayMode ? 'L3 Relay: Converts Layer 2 Broadcast into Layer 3 Routed Unicast across subnets.' : 'Broadcast: Flooded to all ports on same L2 VLAN.',
      payload: {
        stepName: '1. DHCP DISCOVER',
        messageType: 'DHCPDISCOVER (Option 53 = 1)',
        xid: '0x39A1F4',
        clientMac: '00:50:56:A1:B2:C3',
        ciaddr: '0.0.0.0',
        yiaddr: '0.0.0.0',
        siaddr: '0.0.0.0',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: FF:FF:FF:FF:FF:FF (Broadcast)',
        l3Header: isRelayMode ? 'Src IP: 192.168.1.1 (Gateway) → Dst IP: 10.20.1.50 (DHCP Server)' : 'Src IP: 0.0.0.0 → Dst IP: 255.255.255.255',
        l4Header: 'UDP Src Port: 68 → Dst Port: 67',
        options: [
          'Option 53: Message Type = DHCPDISCOVER',
          'Option 55: Parameter Request List = [Subnet Mask, Router, DNS, Domain Name]',
          'Option 61: Client Identifier = MAC 00:50:56:A1:B2:C3',
          ...(isRelayMode ? ['Option 82: Relay Agent Info = Circuit ID Gi0/1 | Remote ID ROUTER-GW-01'] : [])
        ]
      }
    },
    2: {
      title: '🎁 STEP 2: DHCP OFFER (CONFIGURED SCOPE PARAMS)',
      subtitle: `DHCP Server replies with offered IP ${scopeConfig.assignedIp}, Gateway ${scopeConfig.gateway}, DNS ${scopeConfig.dnsPrimary}.`,
      badge: 'TRANSMISSION: DIRECT UNICAST (TARGETED)',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      transmissionType: 'UNICAST',
      sender: 'SERVER',
      receiver: 'CLIENT',
      serverPoolState: 'TEMPORARILY RESERVED (Offer Active)',
      srcIp: '192.168.1.10 (DHCP Server)',
      dstIp: scopeConfig.assignedIp,
      explanation: `The DHCP Server matches the requested scope (${scopeConfig.scopeName}) and proposes IP ${scopeConfig.assignedIp} with Gateway ${scopeConfig.gateway} and DNS ${scopeConfig.dnsPrimary}.`,
      whyBroadcast: 'Unicast: Direct targeted reply to client MAC address.',
      payload: {
        stepName: '2. DHCP OFFER',
        messageType: 'DHCPOFFER (Option 53 = 2)',
        xid: '0x39A1F4',
        clientMac: '00:50:56:A1:B2:C3',
        ciaddr: '0.0.0.0',
        yiaddr: scopeConfig.assignedIp,
        siaddr: '192.168.1.10',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:50:56:A1:B2:C3 (Unicast)',
        l3Header: `Src IP: 192.168.1.10 → Dst IP: ${scopeConfig.assignedIp}`,
        l4Header: 'UDP Src Port: 67 → Dst Port: 68',
        options: [
          'Option 53: Message Type = DHCPOFFER',
          'Option 1: Subnet Mask = 255.255.255.0',
          `Option 3: Default Gateway = ${scopeConfig.gateway}`,
          `Option 6: DNS Server = ${scopeConfig.dnsPrimary}, ${scopeConfig.dnsSecondary}`,
          `Option 15: Domain Name = ${scopeConfig.domainName}`,
          `Option 51: Lease Time = ${scopeConfig.leaseTime}`,
          'Option 54: Server Identifier = 192.168.1.10'
        ]
      }
    },
    3: {
      title: '✉️ STEP 3: DHCP REQUEST (ACCEPTANCE CONFIRMATION)',
      subtitle: `PC-01 confirms acceptance of IP ${scopeConfig.assignedIp} from server 192.168.1.10.`,
      badge: 'TRANSMISSION: BROADCAST (FLOOD ALL PORTS)',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      transmissionType: 'BROADCAST',
      sender: 'CLIENT',
      receiver: 'SERVER',
      serverPoolState: 'CONFIRMING SELECTION...',
      srcIp: '0.0.0.0',
      dstIp: '255.255.255.255 (Broadcast)',
      explanation: `PC-01 broadcasts its selection of IP ${scopeConfig.assignedIp} so all network DHCP servers know which offer was accepted.`,
      whyBroadcast: 'Broadcast: Ensures all listening DHCP servers release unchosen offers.',
      payload: {
        stepName: '3. DHCP REQUEST',
        messageType: 'DHCPREQUEST (Option 53 = 3)',
        xid: '0x39A1F4',
        clientMac: '00:50:56:A1:B2:C3',
        ciaddr: '0.0.0.0',
        yiaddr: '0.0.0.0',
        siaddr: '0.0.0.0',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: FF:FF:FF:FF:FF:FF (Broadcast)',
        l3Header: 'Src IP: 0.0.0.0 → Dst IP: 255.255.255.255',
        l4Header: 'UDP Src Port: 68 → Dst Port: 67',
        options: [
          'Option 53: Message Type = DHCPREQUEST',
          `Option 50: Requested IP Address = ${scopeConfig.assignedIp}`,
          'Option 54: Server Identifier Chosen = 192.168.1.10'
        ]
      }
    },
    4: {
      title: '✅ STEP 4: DHCP ACK (COMMITTED LEASE)',
      subtitle: `DHCP Server commits lease for IP ${scopeConfig.assignedIp} in database. Lease active!`,
      badge: 'TRANSMISSION: DIRECT UNICAST (LEASE COMMITTED)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      transmissionType: 'UNICAST',
      sender: 'SERVER',
      receiver: 'CLIENT',
      serverPoolState: `ACTIVE LEASE (${scopeConfig.leaseTime})`,
      srcIp: '192.168.1.10',
      dstIp: scopeConfig.assignedIp,
      explanation: `DHCP Server commits ${scopeConfig.assignedIp} lease in its database and sends final ACK. Client configures IP, Gateway ${scopeConfig.gateway}, DNS ${scopeConfig.dnsPrimary}, and Domain ${scopeConfig.domainName}!`,
      whyBroadcast: 'Final State: Client is fully online and configured.',
      payload: {
        stepName: '4. DHCP ACK',
        messageType: 'DHCPACK (Option 53 = 5)',
        xid: '0x39A1F4',
        clientMac: '00:50:56:A1:B2:C3',
        ciaddr: '0.0.0.0',
        yiaddr: scopeConfig.assignedIp,
        siaddr: '192.168.1.10',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:50:56:A1:B2:C3 (Unicast)',
        l3Header: `Src IP: 192.168.1.10 → Dst IP: ${scopeConfig.assignedIp}`,
        l4Header: 'UDP Src Port: 67 → Dst Port: 68',
        options: [
          'Option 53: Message Type = DHCPACK',
          'Option 1: Subnet Mask = 255.255.255.0',
          `Option 3: Default Gateway = ${scopeConfig.gateway}`,
          `Option 6: DNS Server = ${scopeConfig.dnsPrimary}, ${scopeConfig.dnsSecondary}`,
          `Option 15: Domain Name = ${scopeConfig.domainName}`,
          `Option 51: Lease Time = ${scopeConfig.leaseTime}`,
          'Option 58: Renewal (T1) Time = 50% Expiry (4 Days)',
          'Option 59: Rebinding (T2) Time = 87.5% Expiry (7 Days)'
        ]
      }
    }
  };

  // Animation Sequence Logic
  useEffect(() => {
    let animInterval;
    let timer;

    if (isPlaying) {
      setPacketProgress(0);
      animInterval = setInterval(() => {
        setPacketProgress(prev => {
          if (prev >= 100) {
            clearInterval(animInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 35 / speed);

      if (isSingleStep) {
        timer = setTimeout(() => {
          setIsPlaying(false);
          setIsSingleStep(false);
        }, 2200 / speed);
      } else {
        timer = setTimeout(() => {
          if (activeStep < 4) {
            setActiveStep(prev => prev + 1);
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
  }, [isPlaying, activeStep, speed, isSingleStep]);

  useEffect(() => {
    if (activeStep > 0) {
      const stepInfo = stepMeta[activeStep];
      if (stepInfo) {
        setLogs(prev => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            tag: `DORA_${activeStep}`,
            message: `${stepInfo.title} — ${stepInfo.explanation}`
          }
        ]);
      }
    }
  }, [activeStep]);

  const handlePlayFull = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (activeStep === 4) setActiveStep(1);
    else if (activeStep === 0) setActiveStep(1);
    setIsSingleStep(false);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    if (activeStep >= 4) return;
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    setIsSingleStep(true);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsSingleStep(false);
    setActiveStep(0);
    setPacketProgress(0);
  };

  const handleUpdateScope = (field, val) => {
    setScopeConfig({ ...scopeConfig, [field]: val });
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'DHCP_SCOPE', message: `Updated DHCP Scope ${field}: ${val}` }]);
  };

  const currentMeta = stepMeta[activeStep];
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;
  const currentPayload = currentMeta.payload;

  const currentPacketData = activeStep > 0 && currentPayload ? {
    etherType: '0x0800 (IPv4)',
    srcMac: currentPayload.clientMac || '00:50:56:A1:B2:C3',
    dstMac: currentMeta.transmissionType === 'BROADCAST' ? 'FF:FF:FF:FF:FF:FF (Broadcast)' : '00:50:56:A1:B2:C3 (Unicast)',
    srcIp: currentMeta.srcIp,
    dstIp: currentMeta.dstIp,
    protocol: 'UDP',
    srcPort: currentMeta.sender === 'CLIENT' ? 68 : 67,
    dstPort: currentMeta.sender === 'CLIENT' ? 67 : 68,
    type: currentPayload.messageType,
    payload: {
      xid: currentPayload.xid,
      ciaddr: currentPayload.ciaddr,
      yiaddr: currentPayload.yiaddr,
      siaddr: currentPayload.siaddr,
      options: currentPayload.options
    }
  } : null;

  const getPacketPosition = () => {
    if (!currentMeta.sender) return { left: '12%', top: '58%', currentPort: '' };

    if (currentMeta.sender === 'CLIENT') {
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        const posX = 12 + t * 38;
        const posY = 58 - t * 8;
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? (isRelayMode ? 'Entering L3 Router Gateway (ip helper)' : 'Entering L2 Switch (Port 1)') : 'Exiting PC-01 → Moving to Switch/Router'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        const posX = 50 + t * 38;
        const posY = 50 + t * 8;
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? 'Entering DHCP Server (UDP 67)' : 'Relaying to DHCP Server'
        };
      }
    } else {
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        const posX = 88 - t * 38;
        const posY = 58 - t * 8;
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? 'Entering Switch/Router' : 'Exiting DHCP Server'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        const posX = 50 - t * 38;
        const posY = 50 + t * 8;
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? 'Entering PC-01 (UDP 68)' : 'Delivering to PC-01'
        };
      }
    }
  };

  const getFloodedPacketPositions = () => {
    if (!isPlaying || currentMeta.transmissionType !== 'BROADCAST' || packetProgress <= 50) {
      return null;
    }
    const t = (packetProgress - 50) / 50;
    
    const dummyPcPos = {
      left: `${50 - t * 28}%`,
      top: `${50 - t * 35}%`
    };

    const dummyDnsPos = {
      left: `${50 + t * 28}%`,
      top: `${50 - t * 35}%`
    };

    return { dummyPcPos, dummyDnsPos };
  };

  const packetPos = getPacketPosition();
  const floodedPos = getFloodedPacketPositions();

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">

      {/* TOP UNIFIED CONTROL & BASIC INFO WIDGET */}
      <CleanWidget
        title="DHCP Scope Configurator & DORA Analyzer"
        subtitle="Configure realistic DHCP scope options (Gateway, DNS, Lease) and simulate L2 Switch vs L3 Router Relay Agent (ip helper-address) traffic."
        icon={Zap}
        ip={`${scopeConfig.assignedIp} (Leased)`}
        protocol="DHCP (UDP)"
        port="UDP 67 / 68"
        status={isRelayMode ? "L3 Relay (Option 82 Active)" : "Local L2 Switch Broadcast"}
        actionTitle={currentMeta.title}
        actionDesc={currentMeta.subtitle}
        stepNumber={activeStep}
        totalSteps={4}
        isPlaying={isPlaying}
        onPlay={handlePlayFull}
        onStep={handleStepForward}
        onReset={handleReset}
        speed={speed}
        setSpeed={setSpeed}
        showAnimation={showAnimation}
        setShowAnimation={setShowAnimation}
      />

      {/* TOOLBAR CONTROLS: 1. MODE SWITCH (L2 SWITCH VS L3 ROUTER RELAY), 2. OPEN SCOPE CONFIG DRAWER */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 font-mono text-xs shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold text-[11px] uppercase">Architecture Mode:</span>
          
          <button
            onClick={() => { setIsRelayMode(false); setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'DHCP_MODE', message: 'Switched to Single-Subnet L2 Switch Broadcast Mode.' }]); }}
            className={`px-3 py-1.5 rounded-xl border font-black transition-all cursor-pointer ${
              !isRelayMode
                ? 'bg-blue-950 text-blue-300 border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            🏢 Single-Subnet L2 Switch
          </button>

          <button
            onClick={() => { setIsRelayMode(true); setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'DHCP_MODE', message: 'Switched to Multi-Subnet L3 Router Relay Agent (ip helper-address 10.20.1.50 with Option 82).' }]); }}
            className={`px-3 py-1.5 rounded-xl border font-black transition-all cursor-pointer ${
              isRelayMode
                ? 'bg-purple-950 text-purple-300 border-purple-500 shadow-md shadow-purple-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            🛰️ Multi-Subnet L3 Relay Agent (Option 82)
          </button>
        </div>

        <button
          onClick={() => setShowConfigDrawer(!showConfigDrawer)}
          className={`px-4 py-1.5 rounded-xl border font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            showConfigDrawer
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30'
              : 'bg-slate-950 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{showConfigDrawer ? 'Close Scope Config ⚙️' : 'Configure DHCP Scope ⚙️'}</span>
        </button>
      </div>

      {/* REALISTIC DHCP SERVER SCOPE CONFIGURATOR DRAWER */}
      {showConfigDrawer && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-700 bg-slate-950/95 font-mono text-xs text-slate-100 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <Settings className="w-5 h-5" />
              <span>Enterprise DHCP Server Scope Properties ({scopeConfig.scopeName})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">Options 3 (GW), 6 (DNS), 15 (Domain), 51 (Lease)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Scope Name</label>
              <input
                type="text"
                value={scopeConfig.scopeName}
                onChange={(e) => handleUpdateScope('scopeName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Subnet & Mask</label>
              <input
                type="text"
                value={scopeConfig.subnet}
                onChange={(e) => handleUpdateScope('subnet', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Offered Target IP (yiaddr)</label>
              <input
                type="text"
                value={scopeConfig.assignedIp}
                onChange={(e) => handleUpdateScope('assignedIp', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Option 3: Default Gateway</label>
              <input
                type="text"
                value={scopeConfig.gateway}
                onChange={(e) => handleUpdateScope('gateway', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-purple-300 font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Option 6: Primary DNS Server</label>
              <input
                type="text"
                value={scopeConfig.dnsPrimary}
                onChange={(e) => handleUpdateScope('dnsPrimary', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Option 15: DNS Domain Name</label>
              <input
                type="text"
                value={scopeConfig.domainName}
                onChange={(e) => handleUpdateScope('domainName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-bold focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MODAL POPUP FOR PACKET PAYLOAD INSPECTOR */}
      {(appMode === 'detailed' || appMode === 'expert') && modalPayloadStep && activeModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-6 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <FileCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">{activeModalData.stepName} Payload Inspector</h3>
                  <p className="text-xs text-amber-400 font-mono font-bold">{activeModalData.messageType}</p>
                </div>
              </div>
              <button
                onClick={() => setModalPayloadStep(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4" />
                  <span>Network Stack Headers (Layers 2, 3 & 4)</span>
                </div>
                <div className="space-y-2 text-sm text-slate-200">
                  <p><span className="text-slate-500 font-bold">Layer 2 (Ethernet):</span> <span className="text-cyan-300 font-bold">{activeModalData.l2Header}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 3 (IPv4):</span> <span className="text-amber-300 font-bold">{activeModalData.l3Header}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 4 (UDP Ports):</span> <span className="text-emerald-300 font-bold">{activeModalData.l4Header}</span></p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-amber-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    <span>BOOTP / DHCP Fixed Payload Fields</span>
                  </span>
                  <span className="text-xs text-slate-400">Transaction ID: {activeModalData.xid}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-bold">Client MAC (chaddr):</span>
                    <span className="text-cyan-300 font-bold text-base">{activeModalData.clientMac}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-bold">Your Offered IP (yiaddr):</span>
                    <span className="text-amber-300 font-bold text-base">{activeModalData.yiaddr}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <Hash className="w-4 h-4" />
                  <span>DHCP Options Sent in Packet Payload</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-200">
                  {activeModalData.options.map((opt, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-cyan-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalPayloadStep(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN MASTER WORKSPACE STAGE */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* DETAILED MODE: EXTENDED SCOPE PARAMETERS & INFRASTRUCTURE CARD */}
        {(appMode === 'detailed' || appMode === 'expert') && (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Database className="w-4 h-4" />
                <span>Enterprise DHCP Scope Parameters ({scopeConfig.scopeName})</span>
              </div>
              <button
                onClick={() => setShowConfigDrawer(true)}
                className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure Scope</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Subnet & Pool Range</span>
                <span className="text-cyan-300 font-bold">{scopeConfig.subnet}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{scopeConfig.startIp} - {scopeConfig.endIp}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Default Gateway</span>
                <span className="text-amber-300 font-bold">{scopeConfig.gateway}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Option 3</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">DNS Servers</span>
                <span className="text-purple-300 font-bold">{scopeConfig.dnsPrimary}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Option 6 ({scopeConfig.dnsSecondary})</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Lease Time & Domain</span>
                <span className="text-emerald-300 font-bold">{scopeConfig.leaseTime.split(' ')[0]} {scopeConfig.leaseTime.split(' ')[1]}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{scopeConfig.domainName}</span>
              </div>
            </div>
          </div>
        )}

        {/* COMPACT DORA STEP CARDS */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-800/80 pb-3">
          {[
            { num: 1, name: '1. DISCOVER', desc: isRelayMode ? 'L3 Relay' : 'Broadcast', icon: '📢' },
            { num: 2, name: '2. OFFER', desc: 'Unicast', icon: '🎁' },
            { num: 3, name: '3. REQUEST', desc: 'Broadcast', icon: '✉️' },
            { num: 4, name: '4. ACK', desc: 'Unicast', icon: '✅' },
          ].map((card) => {
            const isDone = activeStep >= card.num;
            const isCurrent = activeStep === card.num;
            return (
              <div
                key={card.num}
                onClick={() => { setIsPlaying(false); setActiveStep(card.num); }}
                className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 font-extrabold shadow-md scale-102'
                    : isDone
                    ? 'bg-slate-900 text-slate-200 border-slate-700 font-bold'
                    : 'bg-slate-950/60 text-slate-500 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span>{card.icon}</span>
                  <span className="font-bold">{card.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isCurrent ? 'bg-slate-950 text-amber-300 font-bold' : 'text-slate-400'}`}>
                  {card.desc}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Action Banner */}
        {(appMode === 'detailed' || appMode === 'expert') && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 ${currentMeta.badgeColor}`}>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-black uppercase bg-slate-950/80 border border-white/10 shadow flex items-center gap-1.5">
                {currentMeta.transmissionType === 'BROADCAST' && <Radio className="w-3.5 h-3.5 text-amber-400 animate-ping" />}
                {currentMeta.badge}
              </span>
              <h3 className="text-lg font-black text-slate-100">{currentMeta.title}</h3>
            </div>
            <p className="text-xs text-slate-200 font-medium text-center sm:text-right max-w-md">{currentMeta.subtitle}</p>
          </div>
        )}

        {/* WORKSPACE STAGE CANVAS */}
        {(showAnimation || appMode === 'detailed' || appMode === 'expert') && (
          <div className={`py-6 px-4 relative bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden ${appMode !== 'detailed' && appMode !== 'expert' ? 'min-h-[520px]' : 'min-h-[660px]'}`}>
          
          {/* FAINT HIGHLIGHT SUBNET BOUNDARY CONTAINERS */}
          {!isRelayMode ? (
            <div className="absolute left-[3%] top-[4%] w-[94%] h-[92%] border-2 border-dashed border-cyan-800/30 bg-cyan-950/10 rounded-3xl pointer-events-none">
              <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 shadow">
                SINGLE LOCAL SUBNET & BROADCAST DOMAIN (192.168.1.0/24)
              </span>
            </div>
          ) : (
            <>
              <div className="absolute left-[3%] top-[4%] w-[42%] h-[92%] border-2 border-dashed border-cyan-800/40 bg-cyan-950/20 rounded-3xl pointer-events-none">
                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 shadow">
                  SUBNET A: CLIENT ZONE (10.10.1.0/24)
                </span>
              </div>
              <div className="absolute right-[3%] top-[4%] w-[42%] h-[92%] border-2 border-dashed border-purple-800/40 bg-purple-950/20 rounded-3xl pointer-events-none">
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-800/80 shadow">
                  SUBNET B: DATACENTER (10.20.1.0/24)
                </span>
              </div>
            </>
          )}

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line x1="12%" y1="58%" x2="50%" y2="50%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />
            <line x1="50%" y1="50%" x2="88%" y2="58%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />
            <line x1="50%" y1="50%" x2="22%" y2="18%" stroke="#64748b" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.5" />
            <line x1="50%" y1="50%" x2="78%" y2="18%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.5" />
          </svg>

          {/* 1. TOP LEFT: DUMMY PC-02 (22%, 18%) */}
          <div className="absolute left-[22%] top-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-700 shadow">
              UDP Port 68 (Client 2)
            </span>
            <div className={`p-3 rounded-xl border transition-all ${
              isPlaying && currentMeta.transmissionType === 'BROADCAST' && packetProgress > 80
                ? 'bg-rose-950/90 border-rose-500 shadow-xl shadow-rose-500/30 animate-bounce'
                : 'bg-slate-900/90 border-slate-700'
            }`}>
              <Laptop className="w-7 h-7 text-slate-400" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-slate-300">LAPTOP-02 (DUMMY)</p>
              <p className="text-slate-500">IP: 192.168.1.106</p>
              {isPlaying && currentMeta.transmissionType === 'BROADCAST' && packetProgress > 80 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-0.5 justify-center mt-1 font-bold">
                  <XCircle className="w-3 h-3" /> Dropped (Not DHCP Server)
                </span>
              )}
            </div>
          </div>

          {/* 2. TOP RIGHT: DUMMY DNS SERVER (78%, 18%) */}
          <div className="absolute left-[78%] top-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              UDP Port 53 (DNS Server)
            </span>
            <div className={`p-3 rounded-xl border transition-all ${
              isPlaying && currentMeta.transmissionType === 'BROADCAST' && packetProgress > 80
                ? 'bg-rose-950/90 border-rose-500 shadow-xl shadow-rose-500/30 animate-bounce'
                : 'bg-slate-900/90 border-slate-700'
            }`}>
              <Globe className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-cyan-300">DNS-SERVER-02 (DUMMY)</p>
              <p className="text-slate-500">IP: 192.168.1.20</p>
              {isPlaying && currentMeta.transmissionType === 'BROADCAST' && packetProgress > 80 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-0.5 justify-center mt-1 font-bold">
                  <XCircle className="w-3 h-3" /> Dropped (Not DHCP Server)
                </span>
              )}
            </div>
          </div>

          {/* 3. DEAD CENTER: CENTRAL SWITCH / ROUTER (50%, 50%) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black border shadow-lg ${
              isRelayMode ? 'bg-purple-950 text-purple-300 border-purple-500 shadow-purple-500/30 animate-pulse' : 'bg-blue-950 text-blue-300 border-blue-600 shadow-blue-500/20'
            }`}>
              {isRelayMode ? 'L3 ROUTER RELAY AGENT (IP HELPER 10.20.1.50)' : 'CENTRAL L2 SWITCH'}
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              isPlaying ? 'bg-blue-900/90 border-blue-400 shadow-2xl scale-110' : isRelayMode ? 'bg-purple-950/90 border-purple-500 text-purple-300' : 'bg-blue-950/90 border-blue-500 text-blue-300'
            }`}>
              {isRelayMode ? <Router className="w-9 h-9 text-purple-400" /> : <Layers className="w-9 h-9 text-blue-400" />}
            </div>
            <div className="text-center font-mono">
              <p className="text-xs font-extrabold text-blue-300">{isRelayMode ? 'L3 ROUTER' : 'L2 SWITCH'}</p>
              <p className="text-[10px] text-slate-400">{isRelayMode ? 'Injects Option 82 & Routes to 10.20.1.50' : 'Floods Broadcasts / Unicasts Targets'}</p>
            </div>
          </div>

          {/* 4. LEFT DOWN: WORKSTATION PC-01 (12%, 58%) */}
          <div className="absolute left-[12%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              UDP Port 68 (Client 1)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              activeStep === 4
                ? 'bg-emerald-950/90 border-emerald-400 shadow-2xl shadow-emerald-500/30 scale-110'
                : 'bg-slate-900/90 border-cyan-500/60'
            }`}>
              <Laptop className={`w-9 h-9 ${activeStep === 4 ? 'text-emerald-400' : 'text-cyan-400'}`} />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-cyan-300">LAPTOP-01</p>
              <p className="text-xs text-slate-400">MAC: 00:50:56:A1:B2:C3</p>
              <div className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-all ${
                activeStep === 4 ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {activeStep === 4 ? `IP: ${scopeConfig.assignedIp} (Leased!)` : 'IP: 0.0.0.0 (Unconfigured)'}
              </div>
            </div>
          </div>

          {/* 5. RIGHT DOWN: DHCP SERVER (88%, 58%) */}
          <div className="absolute left-[88%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-purple-950 text-purple-300 border border-purple-700 shadow">
              UDP Port 67 (DHCP Server)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              activeStep === 2 || activeStep === 4
                ? 'bg-purple-950/90 border-purple-400 shadow-2xl shadow-purple-500/30 scale-105'
                : 'bg-slate-900/90 border-purple-500/60'
            }`}>
              <Server className="w-9 h-9 text-purple-400" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-purple-300">DHCP SERVER</p>
              <p className="text-xs text-slate-400">{isRelayMode ? 'IP: 10.20.1.50' : 'IP: 192.168.1.10'}</p>
              <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                activeStep === 4 ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-purple-950 text-purple-300 border-purple-800'
              }`}>
                Scope {scopeConfig.assignedIp}: {currentMeta.serverPoolState}
              </div>
            </div>
          </div>

          {/* MAIN TARGET PACKET OVERLAY */}
          {isPlaying && currentMeta.sender && (
            <div
              style={{ left: packetPos.left, top: packetPos.top }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-full font-mono font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-white transition-all duration-100 ${
                currentMeta.transmissionType === 'BROADCAST'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/50'
              }`}
            >
              <Mail className="w-4 h-4 fill-current" />
              <span>{currentMeta.badge.split(':')[1] || 'PACKET'}</span>
            </div>
          )}
        </div>
        )}
      </div>

      <SlideOutInspector title="Technical Deep Dive & DHCP Protocol Logs">
        <div className="space-y-4">
          
          {/* LIVE PACKET INSPECTOR */}
          <PacketInspector
            activeStep={activeStep}
            packetData={currentPacketData}
            stepTitle={currentMeta.title}
            stepDescription={currentMeta.explanation}
          />

          {/* OS CLI COMMANDS & PACKET PAYLOAD INSPECTOR */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">CLI Commands & Request Info Inspector</h3>
              </div>

              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveOsTab('windows')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeOsTab === 'windows' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🪟 Windows OS
                </button>
                <button
                  onClick={() => setActiveOsTab('linux')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeOsTab === 'linux' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🐧 Linux OS
                </button>
              </div>
            </div>

            {/* 4 COMMAND CARDS GRID FOR DORA STEPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {[
                {
                  step: 1,
                  title: '1. DISCOVER',
                  color: 'text-amber-400 border-amber-500/40',
                  btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20',
                  winCmd: 'ipconfig /renew',
                  winDesc: 'Triggers Windows DHCP client to send DISCOVER broadcast on UDP 68.',
                  linCmd: 'sudo dhclient -v eth0',
                  linDesc: 'Sends DHCPDISCOVER broadcast message on interface eth0.'
                },
                {
                  step: 2,
                  title: '2. OFFER',
                  color: 'text-cyan-400 border-cyan-500/40',
                  btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20',
                  winCmd: 'Get-DhcpServerv4Scope',
                  winDesc: `Inspects configured scope range (${scopeConfig.startIp}-${scopeConfig.endIp}) and offered IP ${scopeConfig.assignedIp}.`,
                  linCmd: 'cat /etc/dhcp/dhcpd.conf',
                  linDesc: 'Server matches client subnet and prepares DHCPOFFER packet.'
                },
                {
                  step: 3,
                  title: '3. REQUEST',
                  color: 'text-blue-400 border-blue-500/40',
                  btnBg: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-black shadow-lg shadow-blue-500/20',
                  winCmd: 'ipconfig /renew',
                  winDesc: `Client broadcasts acceptance of offered IP ${scopeConfig.assignedIp} to all servers on LAN.`,
                  linCmd: 'sudo dhclient eth0',
                  linDesc: 'Sends DHCPREQUEST broadcast confirming server choice.'
                },
                {
                  step: 4,
                  title: '4. ACK',
                  color: 'text-emerald-400 border-emerald-500/40',
                  btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20',
                  winCmd: 'Get-DhcpServerv4Lease & ipconfig /all',
                  winDesc: `Server commits lease in dhcp.mdb; Client displays assigned IP ${scopeConfig.assignedIp} & Gateway ${scopeConfig.gateway}.`,
                  linCmd: 'cat /var/lib/dhcp/dhcpd.leases & ip addr',
                  linDesc: 'Server logs active lease in dhcpd.leases; Client binds IP address.'
                }
              ].map((item) => (
                <div key={item.step} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${item.color.split(' ')[0]}`}>{item.title} Command</span>
                      <button
                        onClick={() => setModalPayloadStep(item.step)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${item.btnBg}`}
                      >
                        <FileCode className="w-4 h-4" />
                        <span>Show Info Sent 🔍</span>
                      </button>
                    </div>

                    <p className="text-slate-200 font-extrabold font-mono text-sm bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      {activeOsTab === 'windows' ? item.winCmd : item.linCmd}
                    </p>

                    <p className="text-slate-400 text-[11px] font-sans">
                      {activeOsTab === 'windows' ? item.winDesc : item.linDesc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TerminalLog logs={logs} onClear={() => setLogs([])} />
        </div>
      </SlideOutInspector>
    </div>
  );
}
