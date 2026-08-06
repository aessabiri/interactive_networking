import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Layers, Network, Router, Play, Pause, RotateCcw, CheckCircle2, Gauge, Mail, ChevronDown, ChevronUp, HelpCircle, FileCode, Terminal, SkipForward, Globe, XCircle, Info, X, Cpu, Hash, Activity, Zap, Laptop, Radio, ShieldCheck, Server, Sparkles } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';

export default function LANModule({ appMode = 'clean' }) {
  const { lang, t } = useLanguage();
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: ARP Broadcast Request, 2: Switch CAM Learn, 3: Unicast ARP Reply, 4: ICMP Ping Active
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5); // Default speed 0.5x
  const [isInterSubnetMode, setIsInterSubnetMode] = useState(false);
  const [activeOsTab, setActiveOsTab] = useState('windows');
  const [packetProgress, setPacketProgress] = useState(0); // 0 to 100%
  const [modalPayloadStep, setModalPayloadStep] = useState(null); // 1, 2, 3, 4 or null for floating modal

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'ARP', message: 'L2 Switch powered on. CAM / MAC Address Table empty. Local ARP Cache empty.' }
  ]);

  // Enhanced 4-Step ARP & LAN Routing Handshake Metadata & Frame Payloads
  const stepMeta = {
    0: {
      title: 'Ready for LAN ARP & Switching Resolution',
      subtitle: 'Click "Next Step" or "Play Full ARP" to watch how switches learn MAC addresses and forward Ethernet frames!',
      badge: 'STATE: CAM TABLE EMPTY',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      transmissionType: 'NONE',
      camPort1: 'EMPTY',
      camPort2: 'EMPTY',
    },
    1: {
      title: '📢 STEP 1: ARP REQUEST (BROADCAST FLOODING)',
      subtitle: 'PC-A shouts to all ports: "Who has IP 192.168.1.60? Tell 192.168.1.50!" Dst MAC: FF:FF:FF:FF:FF:FF.',
      badge: 'TRANSMISSION: BROADCAST FLOODING',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'PCA',
      target: 'SWITCH',
      camPort1: 'LEARNING (Port 1 = 00:11:22:33:44:55)',
      camPort2: 'EMPTY',
      explanation: 'PC-A sends an ARP Request broadcast frame. The L2 Switch receives it on Port 1, records PC-A MAC in its CAM table, and FLOODS it to all other active ports.',
      payload: {
        stepName: '1. ARP Request Broadcast',
        messageType: 'ARP Request (Opcode 1)',
        etherType: '0x0806 (Address Resolution Protocol)',
        l2Header: 'Src MAC: 00:11:22:33:44:55 (PC-A) → Dst MAC: FF:FF:FF:FF:FF:FF (Broadcast)',
        l3Header: 'Sender IP: 192.168.1.50 → Target IP: 192.168.1.60',
        l4Header: 'Layer 2 ARP Payload (No UDP/TCP Port needed)',
        hardwareType: 'Ethernet (1) | Protocol Type: IPv4 (0x0800)',
        frameDetails: [
          'Hardware Size (HLEN): 6 bytes | Protocol Size (PLEN): 4 bytes',
          'Opcode: 1 (ARP Request)',
          'Sender MAC (SHA): 00:11:22:33:44:55 | Sender IP (SPA): 192.168.1.50',
          'Target MAC (THA): 00:00:00:00:00:00 (Unknown) | Target IP (TPA): 192.168.1.60'
        ]
      }
    },
    2: {
      title: '🧠 STEP 2: SWITCH CAM LEARNING & PORT FLOODING',
      subtitle: 'Switch binds Port 1 ➔ MAC 00:11:22:33:44:55 in CAM table and forwards frame to PC-B and Router Gateway.',
      badge: 'CAM TABLE RECORDED & FLOODED',
      badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-500 animate-pulse',
      sender: 'SWITCH',
      target: 'PCB',
      camPort1: 'LEARNED (Port 1 = 00:11:22:33:44:55)',
      camPort2: 'INSPECTING TARGET...',
      explanation: 'The L2 Switch inspects the Source MAC address of the incoming frame, stores (Port 1, 00:11:22:33:44:55) in memory, and floods the frame. PC-B recognizes its IP and prepares a response.',
      payload: {
        stepName: '2. Switch CAM Table Update',
        messageType: 'CAM Address Learning & Flooding',
        etherType: '0x0806 (ARP)',
        l2Header: 'Switch Memory Binding: Port 1 ➔ MAC 00:11:22:33:44:55',
        l3Header: 'Sender IP: 192.168.1.50 → Target IP: 192.168.1.60',
        l4Header: 'VLAN 1 Default Port Association',
        hardwareType: 'L2 Forwarding Engine (MAC Table Lookup)',
        frameDetails: [
          'Learned MAC Address: 00:11:22:33:44:55 (PC-A)',
          'Ingress Port: FastEthernet 0/1',
          'Egress Ports: FastEthernet 0/2 (PC-B), FastEthernet 0/3 (Router)',
          'Action: Flooded to all ports in VLAN 1 except Ingress Port'
        ]
      }
    },
    3: {
      title: '✉️ STEP 3: ARP REPLY (DIRECT UNICAST RETURN)',
      subtitle: 'PC-B sends ARP Reply directly to PC-A: "IP 192.168.1.60 is at MAC 00:66:77:88:99:AA!"',
      badge: 'TRANSMISSION: DIRECT UNICAST',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500 animate-pulse',
      sender: 'PCB',
      target: 'PCA',
      camPort1: 'LEARNED (Port 1 = 00:11:22:33:44:55)',
      camPort2: 'LEARNED (Port 2 = 00:66:77:88:99:AA)',
      explanation: 'PC-B sends a UNICAST ARP Reply. The Switch looks up PC-A MAC in its CAM table and forwards the reply ONLY to Port 1. Switch learns PC-B MAC on Port 2!',
      payload: {
        stepName: '3. ARP Reply Unicast',
        messageType: 'ARP Reply (Opcode 2)',
        etherType: '0x0806 (Address Resolution Protocol)',
        l2Header: 'Src MAC: 00:66:77:88:99:AA (PC-B) → Dst MAC: 00:11:22:33:44:55 (Targeted PC-A)',
        l3Header: 'Sender IP: 192.168.1.60 → Target IP: 192.168.1.50',
        l4Header: 'Layer 2 Direct Unicast Response',
        hardwareType: 'Ethernet (1) | Protocol Type: IPv4 (0x0800)',
        frameDetails: [
          'Opcode: 2 (ARP Reply)',
          'Sender MAC (SHA): 00:66:77:88:99:AA (PC-B MAC Supplied)',
          'Sender IP (SPA): 192.168.1.60 | Target IP (TPA): 192.168.1.50',
          'Target MAC (THA): 00:11:22:33:44:55 (PC-A MAC)'
        ]
      }
    },
    4: {
      title: '✅ STEP 4: ARP CACHE BINDING & ICMP PING ESTABLISHED',
      subtitle: 'Both hosts store MAC addresses in ARP cache (arp -a). ICMP Echo Ping packets flow freely!',
      badge: 'ICMP PING ACTIVE (ARP RESOLVED)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'PCA',
      target: 'PCB',
      camPort1: 'BOUND (00:11:22:33:44:55)',
      camPort2: 'BOUND (00:66:77:88:99:AA)',
      explanation: 'PC-A receives the ARP Reply, updates its local OS ARP Cache (`192.168.1.60 ➔ 00:66:77:88:99:AA`), and transmits ICMP Echo Request packets directly over the L2 Switch!',
      payload: {
        stepName: '4. ICMP Echo Data Traffic',
        messageType: 'ICMP Echo Request / Reply (Protocol 1)',
        etherType: '0x0800 (IPv4 Datagram)',
        l2Header: 'Src MAC: 00:11:22:33:44:55 → Dst MAC: 00:66:77:88:99:AA',
        l3Header: 'Src IP: 192.168.1.50 → Dst IP: 192.168.1.60',
        l4Header: 'ICMP Type 8 (Echo Request) / Type 0 (Echo Reply)',
        hardwareType: 'Direct L2 Unicast Switching (Zero Flooding)',
        frameDetails: [
          'PC-A ARP Cache Entry: 192.168.1.60 ➔ 00:66:77:88:99:AA (Dynamic)',
          'PC-B ARP Cache Entry: 192.168.1.50 ➔ 00:11:22:33:44:55 (Dynamic)',
          'Switch CAM Table Status: Port 1 (PC-A), Port 2 (PC-B)',
          'Latency / TTL: 64 hops (0.2 ms)'
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
        setPacketProgress(prev => Math.min(100, prev + 2));
      }, 35 / speed);

      if (isSingleStep) {
        timer = setTimeout(() => {
          setIsPlaying(false);
          setIsSingleStep(false);
        }, 2200 / speed);
      } else {
        timer = setTimeout(() => {
          if (activeStep < 4) {
            const next = activeStep + 1;
            setActiveStep(next);
            const meta = stepMeta[next];
            setLogs(prev => [
              ...prev,
              { time: new Date().toLocaleTimeString(), tag: 'ARP', message: `${meta.title} - ${meta.subtitle}` }
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
  }, [isPlaying, activeStep, speed, isSingleStep]);

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
    const meta = stepMeta[nextStep];
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: 'ARP', message: `STEP ${nextStep}: ${meta.title}` }
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsSingleStep(false);
    setActiveStep(0);
    setPacketProgress(0);
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'ARP', message: 'ARP cache & Switch CAM table cleared.' }]);
  };

  const currentMeta = stepMeta[activeStep] || stepMeta[0];
  const isFinalStepComplete = activeStep === 4;
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;
  const currentPayload = currentMeta.payload;

  // STAR TOPOLOGY EXACT COORDINATES (% of stage width/height):
  // Central L2 Switch: (50%, 50%) -> DEAD CENTER
  // Workstation PC-A (Left-Down): (12%, 58%)
  // Workstation PC-B (Right-Down): (88%, 58%)
  // Dummy PC-C (Top-Left): (22%, 15%)
  // Default Gateway Router (Top-Right): (78%, 15%)

  const getPacketPosition = () => {
    if (!isPlaying && activeStep === 0) return null;
    const p = packetProgress / 100; // 0 to 1

    if (activeStep === 1) {
      // Step 1: PC-A (12%, 58%) -> Switch (50%, 50%) (Broadcast Request)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${12 + t * 38}%`,
          top: `${58 - t * 8}%`,
          label: 'ARP Request (Who has 192.168.1.60?)',
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-blue-500/50'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${50 + t * 38}%`,
          top: `${50 + t * 8}%`,
          label: 'Broadcast Flooding ➔ Switch Ports',
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-blue-500/50'
        };
      }
    } else if (activeStep === 2) {
      // Step 2: Switch (50%, 50%) -> PC-B (88%, 58%) (Flooding to target)
      const t = packetProgress / 100;
      return {
        left: `${50 + t * 38}%`,
        top: `${50 + t * 8}%`,
        label: 'CAM Learning (Port 1 = PC-A)',
        bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/50'
      };
    } else if (activeStep === 3) {
      // Step 3: PC-B (88%, 58%) -> Switch (50%, 50%) -> PC-A (12%, 58%) (Unicast ARP Reply)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${88 - t * 38}%`,
          top: `${58 - t * 8}%`,
          label: 'ARP Reply (MAC 00:66:77:88:99:AA)',
          bgColor: 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-cyan-500/50'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${50 - t * 38}%`,
          top: `${50 + t * 8}%`,
          label: 'Direct Unicast ➔ PC-A',
          bgColor: 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-cyan-500/50'
        };
      }
    } else if (activeStep === 4) {
      // Step 4: PC-A (12%, 58%) -> Switch (50%, 50%) -> PC-B (88%, 58%) (ICMP Ping Echo)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${12 + t * 38}%`,
          top: `${58 - t * 8}%`,
          label: 'ICMP Echo Request (Ping)',
          bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50 animate-bounce'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${50 + t * 38}%`,
          top: `${50 + t * 8}%`,
          label: 'ICMP Echo Reply ➔ PC-A',
          bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50 animate-bounce'
        };
      }
    }
    return null;
  };

  const packetPos = getPacketPosition();

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">

      {/* TOP UNIFIED CONTROL & BASIC INFO WIDGET */}
      <CleanWidget
        title={lang === 'de' ? 'Local Area Network (LAN) & ARP-Switching-Analysator' : 'Local Area Network (LAN) & ARP Switching Analyzer'}
        subtitle={lang === 'de' ? 'Erfahren Sie, wie Netzwerk-Switches Computer innerhalb eines Büros mithilfe von MAC-Adressen und ARP-Auflösung verbinden' : 'Learn how network switches connect computers inside an office using MAC addresses and ARP resolution'}
        icon={Layers}
        ip="192.168.1.105 → 192.168.1.200"
        protocol="ARP / ICMP Ping"
        port={lang === 'de' ? 'Ethernet-Schicht 2' : 'Ethernet Layer 2'}
        status={activeStep >= 3 ? (lang === 'de' ? 'MAC-Adresse aufgelöst' : 'MAC Address Resolved') : (lang === 'de' ? 'Ungelöstes ARP' : 'Unresolved ARP')}
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

      {/* FLOATING MODAL POPUP FOR ETHERNET FRAME & ARP INSPECTOR (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && modalPayloadStep && activeModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-6 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <FileCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">{activeModalData.stepName} Frame Inspector</h3>
                  <p className="text-xs text-cyan-400 font-mono font-bold">{activeModalData.messageType}</p>
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
              
              {/* L2 Ethernet & L3 Headers Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4" />
                  <span>Ethernet II Frame Stack Headers</span>
                </div>
                <div className="space-y-2 text-sm text-slate-200">
                  <p><span className="text-slate-500 font-bold">EtherType:</span> <span className="text-amber-400 font-bold">{activeModalData.etherType}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 2 (Ethernet):</span> <span className="text-cyan-300 font-bold">{activeModalData.l2Header}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 3 (IPv4):</span> <span className="text-blue-300 font-bold">{activeModalData.l3Header}</span></p>
                </div>
              </div>

              {/* Hardware Type & Protocol Specs Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-blue-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    <span>ARP Message Structure & Opcodes</span>
                  </span>
                  <span className="text-xs text-slate-400">{activeModalData.hardwareType}</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-200">
                  {activeModalData.frameDetails.map((item, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-blue-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalPayloadStep(null)}
                className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-lg shadow-blue-500/20"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN MASTER WORKSPACE STAGE (CONTAINING COMPACT CARDS, SPEED CONTROLS, BUTTONS & ENLARGED CANVAS) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* COMPACT LOW-PROFILE ARP STEP CARDS */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-800/80 pb-3">
          {[
            { num: 1, name: '1. ARP REQ', desc: 'Broadcast', icon: '📢' },
            { num: 2, name: '2. CAM LEARN', desc: 'Port MAC Bind', icon: '🧠' },
            { num: 3, name: '3. ARP REPLY', desc: 'Unicast', icon: '✉️' },
            { num: 4, name: '4. ICMP PING', desc: 'Data Traffic', icon: '✅' },
          ].map((card) => {
            const isDone = activeStep >= card.num;
            const isCurrent = activeStep === card.num;
            return (
              <div
                key={card.num}
                onClick={() => { setIsPlaying(false); setActiveStep(card.num); }}
                className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 font-extrabold shadow-md scale-102'
                    : isDone
                    ? 'bg-slate-900 text-slate-200 border-slate-700 font-bold'
                    : 'bg-slate-950/60 text-slate-500 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span>{card.icon}</span>
                  <span className="font-bold">{card.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isCurrent ? 'bg-slate-950 text-blue-300 font-bold' : 'text-slate-400'}`}>
                  {card.desc}
                </span>
              </div>
            );
          })}
        </div>



        {/* Dynamic Action Status Banner (DETAILED MODE ONLY) */}
        {(appMode === 'detailed' || appMode === 'expert') && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 ${currentMeta.badgeColor}`}>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-black uppercase bg-slate-950/80 border border-white/10 shadow flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-ping" />
                {currentMeta.badge}
              </span>
              <h3 className="text-lg font-black text-slate-100">{currentMeta.title}</h3>
            </div>
            <p className="text-xs text-slate-200 font-medium text-center sm:text-right max-w-md">{currentMeta.subtitle}</p>
          </div>
        )}

        {/* ENLARGED TOPOLOGY STAGE (DEAD-CENTER SWITCH, PC-A LEFT, PC-B RIGHT, ROUTER TOP-RIGHT, DUMMY TOP-LEFT) */}
        <div className={`py-6 px-4 relative bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden ${appMode !== 'detailed' && appMode !== 'expert' ? 'min-h-[520px]' : 'min-h-[660px]'}`}>
          
          {/* VISIBLE SVG NETWORK CABLE LINES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Cable 1: Left PC-A (12%, 58%) -> Center Switch (50%, 50%) */}
            <line x1="12%" y1="58%" x2="50%" y2="50%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />
            
            {/* Cable 2: Center Switch (50%, 50%) -> Right PC-B (88%, 58%) */}
            <line x1="50%" y1="50%" x2="88%" y2="58%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />

            {/* Cable 3: Center Switch (50%, 50%) -> Top-Right Router Gateway (78%, 15%) */}
            <line x1="50%" y1="50%" x2="78%" y2="15%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />

            {/* Cable 4: Center Switch (50%, 50%) -> Top-Left Dummy PC-C (22%, 15%) */}
            <line x1="50%" y1="50%" x2="22%" y2="15%" stroke="#64748b" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.5" />
          </svg>

          {/* FAINT HIGHLIGHT NETWORK AREA CONTAINERS */}
          {/* Access Subnet A */}
          <div className="absolute left-[3%] top-[4%] w-[44%] h-[92%] border-2 border-dashed border-cyan-800/30 bg-cyan-950/15 rounded-3xl pointer-events-none">
            <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 shadow">
              ACCESS SUBNET A (192.168.1.0/24)
            </span>
          </div>

          {/* Target Subnet B */}
          <div className="absolute right-[3%] top-[4%] w-[44%] h-[92%] border-2 border-dashed border-blue-800/30 bg-blue-950/15 rounded-3xl pointer-events-none">
            <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-950/90 text-blue-300 border border-blue-800/80 shadow">
              DEFAULT GATEWAY & TARGET ZONE
            </span>
          </div>

          {/* 1. TOP LEFT: DUMMY PC-C (22%, 15%) */}
          <div className="absolute left-[22%] top-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-700 shadow">
              Port 3 (Unicast Target Mismatch)
            </span>
            <div className="p-3 rounded-xl border-2 bg-slate-900 border-slate-700">
              <Laptop className="w-7 h-7 text-slate-500" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-slate-400">LAPTOP-PC-C</p>
              <p className="text-slate-500">192.168.1.70</p>
              {activeStep === 1 && isPlaying && packetProgress > 80 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-0.5 justify-center mt-1 font-bold">
                  <XCircle className="w-3 h-3" /> Dropped (IP Mismatch)
                </span>
              )}
            </div>
          </div>

          {/* 2. TOP RIGHT: DEFAULT GATEWAY ROUTER (78%, 15%) */}
          <div className="absolute left-[78%] top-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-700 shadow">
              Default Gateway (192.168.1.1)
            </span>
            <div className="p-3 rounded-xl border-2 bg-slate-900 border-amber-500/60">
              <Router className="w-7 h-7 text-amber-400" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-amber-300">ROUTER-GW-01</p>
              <p className="text-slate-400">MAC: 00:11:22:33:44:01</p>
            </div>
          </div>

          {/* 3. DEAD CENTER: CENTRAL SWITCH / ROUTING ENGINE (50%, 50%) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black border shadow-lg ${
              isInterSubnetMode
                ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-amber-500/30 animate-pulse'
                : 'bg-blue-950 text-blue-300 border-blue-600 shadow-blue-500/20'
            }`}>
              {isInterSubnetMode ? 'CENTRAL L3 MULTI-LAYER SWITCH / ROUTER (IP ROUTING)' : 'CENTRAL L2 SWITCH (MAC CAM TABLE)'}
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              isPlaying
                ? 'bg-blue-900/90 border-blue-400 shadow-2xl shadow-blue-500/40 scale-110'
                : isInterSubnetMode
                ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                : 'bg-blue-950/90 border-blue-500 text-blue-300'
            }`}>
              {isInterSubnetMode ? <Router className="w-9 h-9 text-amber-400" /> : <Layers className="w-9 h-9 text-blue-400" />}
            </div>
            <div className="text-center font-mono">
              <p className="text-xs font-extrabold text-blue-300">
                {isInterSubnetMode ? 'L3 SWITCH / ROUTER' : 'L2 SWITCH'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isInterSubnetMode ? 'Rewrites L2 MACs & Decrements TTL (L3 Routing)' : 'Learns MACs & Forwards L2 Frames'}
              </p>
            </div>
          </div>

          {/* 4. LEFT DOWN: WORKSTATION PC-A CLIENT (12%, 58%) */}
          <div className="absolute left-[12%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              Port 1 (Sender Host)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              activeStep === 4
                ? 'bg-emerald-950/90 border-emerald-400 shadow-2xl shadow-emerald-500/30 scale-110'
                : activeStep >= 1
                ? 'bg-cyan-950/90 border-cyan-400 shadow-2xl scale-105'
                : 'bg-slate-900/90 border-cyan-500/60'
            }`}>
              <Laptop className={`w-9 h-9 ${activeStep === 4 ? 'text-emerald-400' : 'text-cyan-400'}`} />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-cyan-300">LAPTOP-PC-A</p>
              <p className="text-xs text-slate-400">IP: 192.168.1.50</p>
              <p className="text-[10px] text-slate-500">MAC: 00:11:22:33:44:55</p>
            </div>
          </div>

          {/* 5. RIGHT DOWN: WORKSTATION PC-B TARGET (88%, 58%) */}
          <div className="absolute left-[88%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              Port 2 (Target Host)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              activeStep === 3 || activeStep === 4
                ? 'bg-emerald-950/90 border-emerald-400 shadow-2xl scale-105'
                : 'bg-slate-900/90 border-cyan-500/60'
            }`}>
              <Laptop className="w-9 h-9 text-cyan-400" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-cyan-300">LAPTOP-PC-B</p>
              <p className="text-xs text-slate-400">IP: 192.168.1.60</p>
              <p className="text-[10px] text-slate-500">MAC: 00:66:77:88:99:AA</p>
            </div>
          </div>

          {/* MAIN TARGET ARP / ETHERNET FRAME OVERLAY */}
          {packetPos && (
            <div
              style={{ left: packetPos.left, top: packetPos.top }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-full font-mono font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-white transition-all duration-100 ${packetPos.bgColor}`}
            >
              <Mail className="w-4 h-4 fill-current" />
              <span>{packetPos.label}</span>
            </div>
          )}
        </div>

        {/* LIVE PACKET & ETHERNET FRAME VIEWER (DETAILED MODE ONLY) */}
        {(appMode === 'detailed' || appMode === 'expert') && (
          <div className="p-4 bg-slate-950/95 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs">
                <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>LIVE ETHERNET FRAME & ARP VIEWER</span>
              </div>
              <span className="text-slate-400 text-[10px] font-bold">
                {packetPos ? packetPos.label : 'Waiting for ARP Resolution'}
              </span>
            </div>

            {currentPayload ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-blue-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                    <span>Ethernet Stack Headers:</span>
                    <span className="text-amber-400">{currentPayload.stepName}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">EtherType:</span> <span className="text-amber-300 font-bold">{currentPayload.etherType}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Layer 2 (Ethernet):</span> <span className="text-cyan-300 font-bold">{currentPayload.l2Header}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Layer 3 (IPv4):</span> <span className="text-blue-300 font-bold">{currentPayload.l3Header}</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                    <span>ARP Message Data & Opcode:</span>
                    <span className="text-slate-400 text-[10px]">{currentPayload.hardwareType}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Sender MAC (SHA):</span> <span className="text-cyan-300 font-bold">00:11:22:33:44:55 (PC-A)</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Target IP (TPA):</span> <span className="text-amber-300 font-bold">192.168.1.60 (PC-B)</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Key Frame Info:</span> <span className="text-emerald-300 font-bold">{currentPayload.frameDetails[0]}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                <p className="font-bold">No active ARP frame in flight.</p>
                <p className="text-[10px]">Click "Next Step" or "Start ARP Animation" to observe real-time Ethernet frame resolution.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WINDOWS CLI CHEATSHEET & FRAME INSPECTOR BUTTONS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">CLI Commands & Frame Inspector</h3>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveOsTab('windows')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeOsTab === 'windows' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🪟 Windows OS (arp & ping)
            </button>
          </div>
        </div>

        {/* 4 ARP STEP COMMAND CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {[
            {
              step: 1,
              title: '1. ARP REQUEST',
              color: 'text-blue-400 border-blue-500/40',
              btnBg: 'bg-blue-500 hover:bg-blue-400 text-white font-black shadow-lg shadow-blue-500/20',
              winCmd: 'arp -a & ping 192.168.1.60',
              winDesc: 'Triggers OS to send ARP Request broadcast on EtherType 0x0806.'
            },
            {
              step: 2,
              title: '2. CAM LEARNING',
              color: 'text-indigo-400 border-indigo-500/40',
              btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white font-black shadow-lg shadow-indigo-500/20',
              winCmd: 'show mac address-table',
              winDesc: 'Switch binds Port 1 ➔ MAC 00:11:22:33:44:55 in dynamic CAM memory.'
            },
            {
              step: 3,
              title: '3. ARP REPLY',
              color: 'text-cyan-400 border-cyan-500/40',
              btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20',
              winCmd: 'arp -s 192.168.1.60 00-66-77-88-99-aa',
              winDesc: 'Target PC-B returns direct Unicast ARP Reply with its MAC address.'
            },
            {
              step: 4,
              title: '4. ICMP PING',
              color: 'text-emerald-400 border-emerald-500/40',
              btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20',
              winCmd: 'ping -t 192.168.1.60',
              winDesc: 'Both hosts store MACs in ARP cache. Direct ICMP Echo Ping packets flow!'
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
                    <span>Show Info & Frame 🔍</span>
                  </button>
                </div>

                <p className="text-slate-200 font-extrabold font-mono text-sm bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  {item.winCmd}
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {item.winDesc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAM TABLE SUMMARY & LOGS */}
      <SlideOutInspector title={lang === 'de' ? 'Technischer Deep Dive & Switch-CAM-/ARP-Tabellen-Protokolle' : 'Technical Deep Dive & Switch CAM / ARP Table Logs'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            
            {/* LEFT: SWITCH CAM TABLE & HOST ARP TABLE */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'de' ? 'Switch-CAM-Tabelle & Host-ARP-Tabelle' : 'Switch CAM Table & Host ARP Table'}</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  {lang === 'de' ? 'Tabellen löschen (arp -d *)' : 'Clear Tables (arp -d *)'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold border-b border-slate-800 pb-1">
                    <span>🧠 Switch CAM Table (MAC ➔ Port)</span>
                    <span className="text-[10px] text-slate-500">VLAN 1</span>
                  </div>
                  <div className="grid grid-cols-3 text-slate-400 text-[10px] font-bold">
                    <div>Port</div>
                    <div>Learned MAC</div>
                    <div>Status</div>
                  </div>
                  <div className={`grid grid-cols-3 p-1.5 rounded-lg border text-[11px] ${activeStep >= 1 ? 'bg-blue-950/60 border-blue-500 text-blue-200 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-600'}`}>
                    <div>Port 1</div>
                    <div>{activeStep >= 1 ? '00:11:22:33:44:55' : 'EMPTY'}</div>
                    <div>{activeStep >= 1 ? 'PC-A Bound' : 'Empty'}</div>
                  </div>
                  <div className={`grid grid-cols-3 p-1.5 rounded-lg border text-[11px] ${activeStep >= 3 ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-600'}`}>
                    <div>Port 2</div>
                    <div>{activeStep >= 3 ? '00:66:77:88:99:AA' : 'EMPTY'}</div>
                    <div>{activeStep >= 3 ? 'PC-B Bound' : 'Empty'}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1">
                    <span>💻 PC-A Local ARP Cache (arp -a)</span>
                    <span className="text-[10px] text-slate-500">Interface 192.168.1.50</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${activeStep >= 3 ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-600'}`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>Target IP 192.168.1.200</span>
                      <span>{activeStep >= 3 ? '00:66:77:88:99:AA (Dynamic)' : 'UNRESOLVED'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: TERMINAL LOGS */}
            <TerminalLog logs={logs} onClear={() => setLogs([])} />
          </div>
        </SlideOutInspector>
    </div>
  );
}
