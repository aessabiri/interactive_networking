import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Server, Laptop, Router, CheckCircle2, Zap, Gauge, Mail, HelpCircle, Radio, Database, Terminal, SkipForward, Globe, XCircle, Info, FileCode, X, Layers, Cpu, Hash, Activity, Sparkles } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, SlideOutInspector } from '../common/EasyCard';

export default function DHCPModule({ appMode = 'clean' }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Discover, 2: Offer, 3: Request, 4: Ack
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5); // Default speed 0.5x
  const [isRelayMode, setIsRelayMode] = useState(false);
  const [activeOsTab, setActiveOsTab] = useState('windows');
  const [packetProgress, setPacketProgress] = useState(0); // 0 to 100%
  const [modalPayloadStep, setModalPayloadStep] = useState(null); // 1, 2, 3, 4 or null for floating modal

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'DHCP', message: 'DHCP Daemon initialized. Listening on UDP Port 67 (Server) / Port 68 (Client).' }
  ]);

  // Enhanced DORA Steps Metadata & Packet Payloads
  const stepMeta = {
    0: {
      title: 'Ready to Start DORA Handshake',
      subtitle: 'Click "Next DORA Step" or "Play Full" to watch how Broadcast vs Unicast works across a Star Network Topology!',
      badge: 'STATE: UNCONFIGURED (0.0.0.0)',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      transmissionType: 'NONE',
      serverPoolState: 'AVAILABLE (192.168.1.105)',
      srcIp: '0.0.0.0',
      dstIp: '0.0.0.0',
    },
    1: {
      title: '📢 STEP 1: DHCP DISCOVER (BROADCAST FLOODING)',
      subtitle: 'PC-01 broadcasts. The central Switch FLOODS the packet to ALL ports (DHCP Server on right, Dummy PC-02, DNS Server)!',
      badge: 'TRANSMISSION: BROADCAST (FLOOD ALL PORTS)',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      transmissionType: 'BROADCAST',
      sender: 'CLIENT',
      receiver: 'SERVER',
      serverPoolState: 'INSPECTING POOL...',
      srcIp: '0.0.0.0',
      dstIp: '255.255.255.255 (Broadcast)',
      explanation: 'PC-01 sends a BROADCAST frame to the central Switch. The Switch FLOODS it to all connected devices. Dummy PC-02 and DNS Server drop the frame because they are not DHCP Servers.',
      whyBroadcast: 'Broadcast Demonstration: Every connected device receives the packet, but only the DHCP Server processes it!',
      payload: {
        stepName: '1. DHCP DISCOVER',
        messageType: 'DHCPDISCOVER (Option 53 = 1)',
        xid: '0x39A1F4',
        clientMac: '00:50:56:A1:B2:C3',
        ciaddr: '0.0.0.0 (Client IP)',
        yiaddr: '0.0.0.0 (Your Offered IP)',
        siaddr: '0.0.0.0 (Server IP)',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: FF:FF:FF:FF:FF:FF (Broadcast)',
        l3Header: 'Src IP: 0.0.0.0 → Dst IP: 255.255.255.255 (Global Broadcast)',
        l4Header: 'UDP Src Port: 68 (BootP Client) → Dst Port: 67 (BootP Server)',
        options: [
          'Option 53: Message Type = DHCPDISCOVER',
          'Option 55: Parameter Request List = [Subnet Mask, Router, DNS, Domain Name]',
          'Option 61: Client Identifier = MAC 00:50:56:A1:B2:C3'
        ]
      }
    },
    2: {
      title: '🎁 STEP 2: DHCP OFFER (DIRECT UNICAST)',
      subtitle: 'DHCP Server (on right) replies via UNICAST. The Switch forwards it ONLY to Workstation PC-01!',
      badge: 'TRANSMISSION: DIRECT UNICAST (TARGETED)',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      transmissionType: 'UNICAST',
      sender: 'SERVER',
      receiver: 'CLIENT',
      serverPoolState: 'TEMPORARILY RESERVED (Offer Active)',
      srcIp: '192.168.1.10 (DHCP Server)',
      dstIp: '192.168.1.105 (Offered IP)',
      explanation: 'The DHCP Server sends an OFFER frame to the central Switch. The Switch checks its MAC table and forwards it DIRECTLY to PC-01. Dummy PC-02 and DNS Server receive 0 packets!',
      whyBroadcast: 'Unicast Demonstration: Unicast traffic is not flooded to other devices.',
      payload: {
        stepName: '2. DHCP OFFER',
        messageType: 'DHCPOFFER (Option 53 = 2)',
        xid: '0x39A1F4',
        clientMac: '00:50:56:A1:B2:C3',
        ciaddr: '0.0.0.0',
        yiaddr: '192.168.1.105 (Offered Lease IP)',
        siaddr: '192.168.1.10 (DHCP Server IP)',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:50:56:A1:B2:C3 (Targeted Unicast)',
        l3Header: 'Src IP: 192.168.1.10 → Dst IP: 192.168.1.105',
        l4Header: 'UDP Src Port: 67 (BootP Server) → Dst Port: 68 (BootP Client)',
        options: [
          'Option 53: Message Type = DHCPOFFER',
          'Option 1: Subnet Mask = 255.255.255.0',
          'Option 3: Default Gateway = 192.168.1.1',
          'Option 6: Domain Name Server (DNS) = 192.168.1.10',
          'Option 51: IP Address Lease Time = 691200 seconds (8 Days)',
          'Option 54: Server Identifier = 192.168.1.10'
        ]
      }
    },
    3: {
      title: '✉️ STEP 3: DHCP REQUEST (BROADCAST ACCEPTANCE)',
      subtitle: 'PC-01 broadcasts acceptance. Switch FLOODS to all devices again to confirm selection.',
      badge: 'TRANSMISSION: BROADCAST (FLOOD ALL PORTS)',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      transmissionType: 'BROADCAST',
      sender: 'CLIENT',
      receiver: 'SERVER',
      serverPoolState: 'CONFIRMING SELECTION...',
      srcIp: '0.0.0.0',
      dstIp: '255.255.255.255 (Broadcast)',
      explanation: 'PC-01 broadcasts its choice. The central Switch floods the frame to all devices. If another DHCP server existed, it would see this broadcast and release its reserved offer.',
      whyBroadcast: 'Broadcast Demonstration: Broadcasting guarantees all DHCP servers know which server was chosen!',
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
        l4Header: 'UDP Src Port: 68 (BootP Client) → Dst Port: 67 (BootP Server)',
        options: [
          'Option 53: Message Type = DHCPREQUEST',
          'Option 50: Requested IP Address = 192.168.1.105',
          'Option 54: Server Identifier Chosen = 192.168.1.10'
        ]
      }
    },
    4: {
      title: '✅ STEP 4: DHCP ACK (DIRECT UNICAST LEASE)',
      subtitle: 'DHCP Server sends final ACK via UNICAST directly to PC-01. Lease is active!',
      badge: 'TRANSMISSION: DIRECT UNICAST (LEASE COMMITTED)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      transmissionType: 'UNICAST',
      sender: 'SERVER',
      receiver: 'CLIENT',
      serverPoolState: 'ACTIVE LEASE (8 Days)',
      srcIp: '192.168.1.10',
      dstIp: '192.168.1.105',
      explanation: 'The DHCP Server sends the ACK directly to PC-01 through the Switch. PC-01 configures IP 192.168.1.105, Subnet Mask 255.255.255.0, Gateway 192.168.1.1, and DNS 192.168.1.10!',
      whyBroadcast: 'Final State: Client PC-01 is online and fully configured.',
      payload: {
        stepName: '4. DHCP ACK',
        messageType: 'DHCPACK (Option 53 = 5)',
        xid: '0x39A1F4',
        clientMac: '00:50:56:A1:B2:C3',
        ciaddr: '0.0.0.0',
        yiaddr: '192.168.1.105 (Committed Active IP)',
        siaddr: '192.168.1.10 (DHCP Server IP)',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:50:56:A1:B2:C3 (Unicast)',
        l3Header: 'Src IP: 192.168.1.10 → Dst IP: 192.168.1.105',
        l4Header: 'UDP Src Port: 67 (BootP Server) → Dst Port: 68 (BootP Client)',
        options: [
          'Option 53: Message Type = DHCPACK',
          'Option 1: Subnet Mask = 255.255.255.0',
          'Option 3: Default Gateway = 192.168.1.1',
          'Option 6: Domain Name Server (DNS) = 192.168.1.10',
          'Option 51: IP Address Lease Time = 691200s (8 Days)',
          'Option 58: Renewal (T1) Time = 345600s (4 Days)',
          'Option 59: Rebinding (T2) Time = 604800s (7 Days)'
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

  const currentMeta = stepMeta[activeStep];
  const isFinalStepComplete = activeStep === 4;

  // STAR TOPOLOGY EXACT COORDINATES (% of stage width/height):
  // Central L2 Switch: (50%, 50%) -> DEAD CENTER
  // Workstation PC-01 (Left-Down): (12%, 58%)
  // DHCP Server (Right-Down): (88%, 58%)
  // Dummy PC-02 (Top-Left): (22%, 15%)
  // Dummy DNS Server (Top-Right): (78%, 15%)

  const getPacketPosition = () => {
    if (!currentMeta.sender) return { left: '12%', top: '58%', currentPort: '' };

    if (currentMeta.sender === 'CLIENT') {
      // PC-01 (12%, 58%) -> Switch (50%, 50%) -> DHCP Server (88%, 58%)
      if (packetProgress <= 50) {
        const t = packetProgress / 50; // 0 to 1
        const posX = 12 + t * 38; // 12% -> 50%
        const posY = 58 - t * 8;  // 58% -> 50%
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? 'Entering L2 Switch (Port 1)' : 'Exiting PC-01 → Moving to Switch'
        };
      } else {
        const t = (packetProgress - 50) / 50; // 0 to 1
        const posX = 50 + t * 38; // 50% -> 88%
        const posY = 50 + t * 8;  // 50% -> 58%
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? 'Entering DHCP Server (UDP 67)' : 'Exiting Switch → Moving to DHCP Server'
        };
      }
    } else {
      // DHCP Server (88%, 58%) -> Switch (50%, 50%) -> PC-01 (12%, 58%)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        const posX = 88 - t * 38; // 88% -> 50%
        const posY = 58 - t * 8;  // 58% -> 50%
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? 'Entering L2 Switch (Port 2)' : 'Exiting DHCP Server → Moving to Switch'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        const posX = 50 - t * 38; // 50% -> 12%
        const posY = 50 + t * 8;  // 50% -> 58%
        return {
          left: `${posX}%`,
          top: `${posY}%`,
          currentPort: t > 0.8 ? 'Entering PC-01 (UDP 68)' : 'Exiting Switch → Moving to PC-01'
        };
      }
    }
  };

  // Flooded Packet Traversal Positions for Broadcast (Switch 50%,50% -> Dummy PC-02 22%,15% & Dummy DNS Server 78%,15%)
  const getFloodedPacketPositions = () => {
    if (!isPlaying || currentMeta.transmissionType !== 'BROADCAST' || packetProgress <= 50) {
      return null;
    }
    const t = (packetProgress - 50) / 50; // 0 to 1 during phase 2
    
    // Packet to Dummy PC-02 (Top-Left: 22%, 15%)
    const dummyPcPos = {
      left: `${50 - t * 28}%`,
      top: `${50 - t * 35}%`
    };

    // Packet to Dummy DNS Server (Top-Right: 78%, 15%)
    const dummyDnsPos = {
      left: `${50 + t * 28}%`,
      top: `${50 - t * 35}%`
    };

    return { dummyPcPos, dummyDnsPos };
  };

  const packetPos = getPacketPosition();
  const floodedPos = getFloodedPacketPositions();
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;
  const currentPayload = currentMeta.payload;

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">

      {/* CLEAN MODE UNIFIED WIDGET (ZERO SCROLL, SINGLE CARD) */}
      {appMode !== 'expert' && (
        <CleanWidget
          title="DHCP Automatic IP Assignment Made Simple"
          subtitle="Watch how your computer gets an IP address automatically from the Router/DHCP Server"
          icon={Zap}
          ip="192.168.1.105 (Leased)"
          protocol="DHCP (UDP)"
          port="UDP 67 / 68"
          status={isRelayMode ? "DHCP Relay Active" : "Local LAN Broadcast"}
          actionTitle={currentMeta.title}
          actionDesc={currentMeta.subtitle}
          stepNumber={activeStep}
          totalSteps={4}
          showAnimation={showAnimation}
          setShowAnimation={setShowAnimation}
        />
      )}

      {/* FLOATING MODAL POPUP FOR PACKET PAYLOAD INSPECTOR (EXPERT MODE ONLY) */}
      {appMode === 'expert' && modalPayloadStep && activeModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-6 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
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

            {/* Modal Body with BIG READABLE FONTS */}
            <div className="space-y-4 font-mono">
              
              {/* L2 Ethernet & L3 IP & L4 UDP Headers Box */}
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

              {/* DHCP Payload Fields Box */}
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
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-bold">Client IP (ciaddr):</span>
                    <span className="text-slate-300 font-bold text-sm">{activeModalData.ciaddr}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-bold">Server IP (siaddr):</span>
                    <span className="text-slate-300 font-bold text-sm">{activeModalData.siaddr}</span>
                  </div>
                </div>
              </div>

              {/* DHCP Options List Box (BIG CLEAR TEXT) */}
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

            {/* Modal Footer */}
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
        
        {/* COMPACT LOW-PROFILE DORA STEP CARDS */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-800/80 pb-3">
          {[
            { num: 1, name: '1. DISCOVER', desc: 'Broadcast', icon: '📢' },
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

        {/* WORKSPACE CONTROL TOOLBAR */}
        <div className="glass-panel p-2.5 rounded-2xl border border-slate-800/90 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRelayMode(!isRelayMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                isRelayMode ? 'bg-purple-950 text-purple-300 border-purple-700 shadow-md' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isRelayMode ? '🌐 Relay Agent Mode' : '🔌 Direct LAN Mode'}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Animation Speed:</span>
              {[0.25, 0.5, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    speed === s ? 'bg-amber-500 text-slate-950 shadow-md' : 'hover:bg-slate-800 text-slate-400'
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
                <RotateCcw className="w-4 h-4" /> Reset & Restart DORA
              </button>
            ) : (
              <>
                <button
                  onClick={handleStepForward}
                  disabled={isPlaying}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-extrabold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  <SkipForward className="w-4 h-4 fill-current" /> Next DORA Step ({activeStep + 1}/4)
                </button>

                <button
                  onClick={handlePlayFull}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:scale-105 text-slate-950 shadow-amber-500/30'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isPlaying ? 'Pause' : 'Play Full DORA'}
                </button>

                <button onClick={handleReset} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer" title="Reset">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Action Banner (EXPERT MODE ONLY) */}
        {appMode === 'expert' && (
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

        {/* WORKSPACE STAGE CANVAS (TOGGLEABLE VIA ICON IN CLEAN MODE) */}
        {(showAnimation || appMode === 'expert') && (
          <div className={`py-6 px-4 relative bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden ${appMode !== 'expert' ? 'min-h-[360px]' : 'min-h-[580px]'}`}>
          
          {/* VISIBLE SVG NETWORK CABLE LINES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Cable 1: Left PC-01 (12%, 58%) -> Center Switch (50%, 50%) */}
            <line x1="12%" y1="58%" x2="50%" y2="50%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />
            
            {/* Cable 2: Center Switch (50%, 50%) -> Right DHCP Server (88%, 58%) */}
            <line x1="50%" y1="50%" x2="88%" y2="58%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />

            {/* Cable 3: Center Switch (50%, 50%) -> Top-Left Dummy PC-02 (22%, 15%) */}
            <line x1="50%" y1="50%" x2="22%" y2="15%" stroke="#64748b" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.5" />

            {/* Cable 4: Center Switch (50%, 50%) -> Top-Right Dummy DNS Server (78%, 15%) */}
            <line x1="50%" y1="50%" x2="78%" y2="15%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.5" />
          </svg>

          {/* 1. TOP LEFT: DUMMY PC-02 (22%, 15%) */}
          <div className="absolute left-[22%] top-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-700 shadow">
              UDP Port 68 (Client 2)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all ${
              isPlaying && currentMeta.transmissionType === 'BROADCAST' && packetProgress > 80
                ? 'bg-rose-950/90 border-rose-500 shadow-xl shadow-rose-500/30 animate-bounce'
                : 'bg-slate-900/90 border-slate-700'
            }`}>
              <Laptop className="w-10 h-10 text-slate-400" />
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

          {/* 2. TOP RIGHT: DUMMY DNS SERVER (78%, 15%) */}
          <div className="absolute left-[78%] top-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              UDP Port 53 (DNS Server)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all ${
              isPlaying && currentMeta.transmissionType === 'BROADCAST' && packetProgress > 80
                ? 'bg-rose-950/90 border-rose-500 shadow-xl shadow-rose-500/30 animate-bounce'
                : 'bg-slate-900/90 border-slate-700'
            }`}>
              <Globe className="w-10 h-10 text-cyan-400" />
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

          {/* 3. DEAD CENTER: L2 SWITCH (50%, 50%) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-blue-950 text-blue-300 border border-blue-600 shadow-lg">
              CENTRAL L2 SWITCH
            </span>
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              isPlaying ? 'bg-blue-900/90 border-blue-400 shadow-2xl shadow-blue-500/40 scale-110' : 'bg-blue-950/90 border-blue-500 text-blue-300'
            }`}>
              <Router className="w-14 h-14 text-blue-300" />
            </div>
            <div className="text-center font-mono">
              <p className="text-xs font-extrabold text-blue-300">SWITCH</p>
              <p className="text-[10px] text-slate-400">Floods Broadcasts / Unicasts Targets</p>
            </div>
          </div>

          {/* 4. LEFT DOWN: WORKSTATION PC-01 (12%, 58%) */}
          <div className="absolute left-[12%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              UDP Port 68 (Client 1)
            </span>
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 4
                ? 'bg-emerald-950/90 border-emerald-400 shadow-2xl shadow-emerald-500/30 scale-110'
                : activeStep === 1 || activeStep === 3
                ? 'bg-amber-950/90 border-amber-400 shadow-2xl shadow-amber-500/30 scale-105 animate-bounce'
                : 'bg-slate-900/90 border-slate-700'
            }`}>
              <Laptop className={`w-14 h-14 ${activeStep === 4 ? 'text-emerald-400' : 'text-cyan-400'}`} />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-slate-100">LAPTOP-01</p>
              <p className="text-xs text-slate-400">MAC: 00:50:56:A1:B2:C3</p>
              <div className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-all ${
                activeStep === 4 ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {activeStep === 4 ? 'IP: 192.168.1.105 (Leased!)' : 'IP: 0.0.0.0 (Unconfigured)'}
              </div>
            </div>
          </div>

          {/* 5. RIGHT DOWN: DHCP SERVER (88%, 58%) */}
          <div className="absolute left-[88%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-amber-950 text-amber-300 border border-amber-700 shadow">
              UDP Port 67 (DHCP Server)
            </span>
            <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
              activeStep === 2 || activeStep === 4
                ? 'bg-amber-950/90 border-amber-400 shadow-2xl shadow-amber-500/30 scale-105'
                : 'bg-slate-900/90 border-slate-700'
            }`}>
              <Server className="w-14 h-14 text-amber-400" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-amber-300">DHCP SERVER</p>
              <p className="text-xs text-slate-400">IP: 192.168.1.10</p>
              <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                activeStep === 4
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : activeStep === 2
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                Pool IP 192.168.1.105: {currentMeta.serverPoolState}
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

          {/* FLOODED BROADCAST PACKETS (Sent from Switch to Dummy PC-02 & Dummy DNS Server) */}
          {floodedPos && (
            <>
              {/* Flooded Packet to Dummy PC-02 */}
              <div
                style={{ left: floodedPos.dummyPcPos.left, top: floodedPos.dummyPcPos.top }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 px-2.5 py-1 rounded-full font-mono font-bold text-[10px] bg-rose-500 text-white shadow-lg flex items-center gap-1 border border-white animate-pulse"
              >
                <Radio className="w-3 h-3" />
                <span>FLOODED</span>
              </div>

              {/* Flooded Packet to Dummy DNS Server */}
              <div
                style={{ left: floodedPos.dummyDnsPos.left, top: floodedPos.dummyDnsPos.top }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 px-2.5 py-1 rounded-full font-mono font-bold text-[10px] bg-rose-500 text-white shadow-lg flex items-center gap-1 border border-white animate-pulse"
              >
                <Radio className="w-3 h-3" />
                <span>FLOODED</span>
              </div>
            </>
          )}
        </div>
        )}

        {/* LIVE PACKET VIEWER (REAL-TIME PROTOCOL HEADERS & PAYLOAD INSPECTOR - EXPERT MODE ONLY) */}
        {appMode === 'expert' && (
          <div className="p-4 bg-slate-950/95 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>LIVE PACKET VIEWER (REAL-TIME HEADERS & PAYLOAD)</span>
              </div>
              <span className="text-slate-400 text-[10px] font-bold">
                {packetPos.currentPort || `Src: ${currentMeta.srcIp} → Dst: ${currentMeta.dstIp}`}
              </span>
            </div>

            {currentPayload ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Column 1: Network Headers */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                    <span>Protocol Stack Headers:</span>
                    <span className="text-amber-400">{currentPayload.stepName}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Ethernet (L2):</span> {currentPayload.l2Header}
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">IPv4 (L3):</span> <span className="text-cyan-300 font-bold">{currentPayload.l3Header}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">UDP (L4):</span> <span className="text-emerald-300 font-bold">{currentPayload.l4Header}</span>
                  </p>
                </div>

                {/* Column 2: BOOTP/DHCP Payload Data */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                    <span>DHCP Payload & Parameters:</span>
                    <span className="text-slate-400 text-[10px]">xid: {currentPayload.xid}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Client MAC (chaddr):</span> <span className="text-cyan-300 font-bold">{currentPayload.clientMac}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Offered IP (yiaddr):</span> <span className="text-amber-300 font-bold">{currentPayload.yiaddr}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Key DHCP Option:</span> <span className="text-emerald-300 font-bold">{currentPayload.options[0]}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                <p className="font-bold">No active DHCP packet in flight.</p>
                <p className="text-[10px]">Click "Next DORA Step" or "Play Full DORA" to observe real-time packet headers.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TECHNICAL INSPECTOR & EVENT LOGS (EXPERT MODE ONLY) */}
      {appMode === 'expert' && (
        <SlideOutInspector title="Slide Out Technical Deep Dive & Wire Logs">
        <div className="space-y-4">
          
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

            {/* 4 COMMAND CARDS GRID */}
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
                  winDesc: 'Inspects configured scope range (192.168.1.100-200) and available IPs.',
                  linCmd: 'cat /etc/dhcp/dhcpd.conf',
                  linDesc: 'Server matches client subnet and prepares DHCPOFFER packet.'
                },
                {
                  step: 3,
                  title: '3. REQUEST',
                  color: 'text-blue-400 border-blue-500/40',
                  btnBg: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-black shadow-lg shadow-blue-500/20',
                  winCmd: 'ipconfig /renew',
                  winDesc: 'Client broadcasts acceptance of offered IP to all servers on LAN.',
                  linCmd: 'sudo dhclient eth0',
                  linDesc: 'Sends DHCPREQUEST broadcast confirming server choice.'
                },
                {
                  step: 4,
                  title: '4. ACK',
                  color: 'text-emerald-400 border-emerald-500/40',
                  btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20',
                  winCmd: 'Get-DhcpServerv4Lease & ipconfig /all',
                  winDesc: 'Server commits lease in dhcp.mdb; Client displays assigned IP & Gateway.',
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
      )}
    </div>
  );
}
