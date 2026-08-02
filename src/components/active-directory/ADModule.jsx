import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Lock, UserCheck, Server, Play, Pause, RotateCcw, FolderTree, Gauge, Mail, ChevronDown, ChevronUp, HelpCircle, FileCode, Terminal, SkipForward, Globe, XCircle, Info, X, Layers, Cpu, Hash, Activity, Zap, HardDrive, Radio, Laptop, Router, Sparkles } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';

export default function ADModule({ appMode = 'clean' }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: AS-REQ, 2: AS-REP, 3: TGS-REQ, 4: TGS-REP & AP-REQ
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5); // Default speed 0.5x
  const [isNtlmFallback, setIsNtlmFallback] = useState(false);
  const [username, setUsername] = useState('dts.student');
  const [activeOsTab, setActiveOsTab] = useState('windows');
  const [packetProgress, setPacketProgress] = useState(0); // 0 to 100%
  const [modalPayloadStep, setModalPayloadStep] = useState(null); // 1, 2, 3, 4 or null for floating modal

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'DC', message: 'Active Directory KDC Service listening on Port 88 (Kerberos v5).' }
  ]);

  // Enhanced 4-Step Kerberos Handshake Metadata & Ticket Payloads
  const stepMeta = {
    0: {
      title: 'Ready for Active Directory Kerberos Login',
      subtitle: 'Click "Next Step" or "Play Full Kerberos" to watch how Windows authenticates users securely without sending passwords!',
      badge: 'STATE: UNAUTHENTICATED',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      transmissionType: 'NONE',
      tgtStatus: 'NOT ISSUED',
      stStatus: 'NOT ISSUED',
    },
    1: {
      title: '🔐 STEP 1: KERBEROS AS-REQ (AUTHENTICATION SERVICE REQUEST)',
      subtitle: `User ${username} enters credentials. Client PC hashes password and sends encrypted timestamp to DC01 KDC on Port 88!`,
      badge: 'KERBEROS AS-REQ (UDP/TCP 88)',
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-500 animate-pulse',
      sender: 'CLIENT',
      target: 'KDC',
      tgtStatus: 'REQUESTING TGT...',
      stStatus: 'NONE',
      explanation: `PC-01 sends an AS-REQ packet containing the Client Principal (${username}@CORP.LOCAL) and an encrypted timestamp to prove identity without sending the plaintext password.`,
      payload: {
        stepName: '1. Kerberos AS-REQ',
        messageType: 'KRB_AS_REQ (Message Type 10)',
        kdcRealm: 'CORP.LOCAL',
        clientPrincipal: `${username}@CORP.LOCAL`,
        servicePrincipal: 'krbtgt/CORP.LOCAL',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:0C:29:88:77:66 (DC01)',
        l3Header: 'Src IP: 192.168.1.105 → Dst IP: 192.168.1.10 (DC01 KDC)',
        l4Header: 'UDP/TCP Src Port: 58801 → Dst Port: 88 (Kerberos KDC)',
        encryptionType: 'AES-256-CTS-HMAC-SHA1-96',
        ticketDetails: [
          'Pre-Authentication Data: Encrypted Timestamp (PA-ENC-TIMESTAMP)',
          `Client Principal: ${username}@CORP.LOCAL`,
          'Requested Service: Ticket Granting Service (krbtgt/CORP.LOCAL)',
          'Nonce: 0x58291F4A'
        ]
      }
    },
    2: {
      title: '🎫 STEP 2: KERBEROS AS-REP (TGT TICKET GRANTED)',
      subtitle: 'DC01 KDC verifies user password hash in NTDS.DIT and returns a Ticket Granting Ticket (TGT) & KDC Session Key!',
      badge: 'KERBEROS AS-REP (TGT ISSUED)',
      badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-500 animate-pulse',
      sender: 'KDC',
      target: 'CLIENT',
      tgtStatus: 'ISSUED & CACHED (10 Hours)',
      stStatus: 'NONE',
      explanation: 'KDC returns a TGT encrypted with the krbtgt account key (which the client cannot decrypt) plus a Session Key encrypted with the user password hash. Client caches the TGT in LSA memory.',
      payload: {
        stepName: '2. Kerberos AS-REP (TGT)',
        messageType: 'KRB_AS_REP (Message Type 11)',
        kdcRealm: 'CORP.LOCAL',
        clientPrincipal: `${username}@CORP.LOCAL`,
        servicePrincipal: 'krbtgt/CORP.LOCAL',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:50:56:A1:B2:C3',
        l3Header: 'Src IP: 192.168.1.10 → Dst IP: 192.168.1.105',
        l4Header: 'UDP/TCP Src Port: 88 → Dst Port: 58801',
        encryptionType: 'AES-256-CTS-HMAC-SHA1-96',
        ticketDetails: [
          'Ticket Granting Ticket (TGT): Encrypted with krbtgt Secret Key',
          'Client Session Key: Encrypted with User Password Hash',
          'PAC (Privilege Attribute Certificate): Contains User SIDs & Group Memberships',
          'Ticket Lifetime: 10 Hours (Renewable up to 7 Days)'
        ]
      }
    },
    3: {
      title: '📩 STEP 3: KERBEROS TGS-REQ (SERVICE TICKET REQUEST)',
      subtitle: 'Client PC presents cached TGT to KDC requesting a Service Ticket for Member File Server \\\\FILESVR01...',
      badge: 'KERBEROS TGS-REQ (SMB ACCESS)',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'CLIENT',
      target: 'KDC',
      tgtStatus: 'PRESENTED TO KDC',
      stStatus: 'REQUESTING ST...',
      explanation: 'PC-01 presents its TGT to the Ticket Granting Service (TGS) on DC01 along with an Authenticator encrypted with the KDC Session Key, requesting access to cifs/FILESVR01.',
      payload: {
        stepName: '3. Kerberos TGS-REQ',
        messageType: 'KRB_TGS_REQ (Message Type 12)',
        kdcRealm: 'CORP.LOCAL',
        clientPrincipal: `${username}@CORP.LOCAL`,
        servicePrincipal: 'cifs/FILESVR01.corp.local',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:0C:29:88:77:66',
        l3Header: 'Src IP: 192.168.1.105 → Dst IP: 192.168.1.10 (DC01 KDC)',
        l4Header: 'UDP/TCP Src Port: 58802 → Dst Port: 88 (KDC Port)',
        encryptionType: 'AES-256-CTS-HMAC-SHA1-96',
        ticketDetails: [
          'Authorization Ticket: TGT (Ticket Granting Ticket)',
          'Requested SPN: cifs/FILESVR01.corp.local (SMB File Share)',
          'Authenticator: Encrypted Timestamp with KDC Session Key'
        ]
      }
    },
    4: {
      title: '🎟️ STEP 4: TGS-REP & AP-REQ (SERVICE TICKET & SMB ACCESS GRANTED)',
      subtitle: 'DC01 issues Service Ticket for \\\\FILESVR01. Client presents it over SMB Port 445. Access Granted!',
      badge: 'SMB ACCESS GRANTED (PORT 445)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'KDC',
      target: 'FILESVR',
      tgtStatus: 'ACTIVE (10 Hours)',
      stStatus: 'COMMITTED (cifs/FILESVR01)',
      explanation: 'DC01 returns a Service Ticket encrypted with FILESVR01 machine password. Client presents it to FILESVR01 over SMB Port 445. FILESVR01 validates ticket offline and grants file access!',
      payload: {
        stepName: '4. TGS-REP & AP-REQ',
        messageType: 'KRB_TGS_REP & KRB_AP_REQ (Message Type 13 & 14)',
        kdcRealm: 'CORP.LOCAL',
        clientPrincipal: `${username}@CORP.LOCAL`,
        servicePrincipal: 'cifs/FILESVR01.corp.local',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:50:56:FE:ED:01 (FILESVR01)',
        l3Header: 'Src IP: 192.168.1.105 → Dst IP: 192.168.1.20 (FILESVR01)',
        l4Header: 'TCP Src Port: 59001 → Dst Port: 445 (Microsoft SMB)',
        encryptionType: 'AES-256-CTS-HMAC-SHA1-96',
        ticketDetails: [
          'Service Ticket: Encrypted with FILESVR01 Machine Password',
          'Service Session Key: Shared between Client & FILESVR01',
          'PAC Validation: Contains User SIDs (Domain Admins / Trainees)',
          'SMB Connection: \\\\FILESVR01\\Shares Granted!'
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
              { time: new Date().toLocaleTimeString(), tag: 'KERBEROS', message: `${meta.title} - ${meta.subtitle}` }
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
      { time: new Date().toLocaleTimeString(), tag: 'KERBEROS', message: `STEP ${nextStep}: ${meta.title}` }
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsSingleStep(false);
    setActiveStep(0);
    setPacketProgress(0);
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'DC', message: 'Kerberos tickets purged (klist purge).' }]);
  };

  const currentMeta = stepMeta[activeStep] || stepMeta[0];
  const isFinalStepComplete = activeStep === 4;
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;
  const currentPayload = currentMeta.payload;

  // STAR TOPOLOGY EXACT COORDINATES (% of stage width/height):
  // Central L2 Switch: (50%, 50%) -> DEAD CENTER
  // Workstation PC-01 (Left-Down): (12%, 58%)
  // DC01 KDC Server (Right-Down): (88%, 58%)
  // Dummy Unjoined PC-02 (Top-Left): (22%, 15%)
  // FILESVR01 Member Server (Top-Right): (78%, 15%)

  const getPacketPosition = () => {
    if (!isPlaying && activeStep === 0) return null;
    const p = packetProgress / 100; // 0 to 1

    if (activeStep === 1) {
      // Step 1: PC-01 (12%, 58%) -> Switch (50%, 50%) -> DC01 KDC (88%, 58%)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${12 + t * 38}%`,
          top: `${58 - t * 8}%`,
          label: 'AS-REQ (User Auth)',
          bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/50'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${50 + t * 38}%`,
          top: `${50 + t * 8}%`,
          label: 'AS-REQ → DC01 KDC',
          bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/50'
        };
      }
    } else if (activeStep === 2) {
      // Step 2: DC01 KDC (88%, 58%) -> Switch (50%, 50%) -> PC-01 (12%, 58%) (AS-REP TGT Return)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${88 - t * 38}%`,
          top: `${58 - t * 8}%`,
          label: 'AS-REP (TGT Granted)',
          bgColor: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-indigo-500/50'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${50 - t * 38}%`,
          top: `${50 + t * 8}%`,
          label: 'TGT Ticket ➔ PC-01',
          bgColor: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-indigo-500/50'
        };
      }
    } else if (activeStep === 3) {
      // Step 3: PC-01 (12%, 58%) -> Switch (50%, 50%) -> DC01 KDC (88%, 58%) (TGS-REQ Service Ticket)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${12 + t * 38}%`,
          top: `${58 - t * 8}%`,
          label: 'TGS-REQ (cifs/FILESVR)',
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-blue-500/50'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${50 + t * 38}%`,
          top: `${50 + t * 8}%`,
          label: 'TGS-REQ → DC01 KDC',
          bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-blue-500/50'
        };
      }
    } else if (activeStep === 4) {
      // Step 4: DC01 (88%, 58%) -> Switch (50%, 50%) -> FILESVR01 (78%, 15%) (Service Ticket Delivered over SMB)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${88 - t * 38}%`,
          top: `${58 - t * 8}%`,
          label: 'TGS-REP (Service Ticket)',
          bgColor: 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-500/50'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${50 + t * 28}%`,
          top: `${50 - t * 35}%`,
          label: 'AP-REQ → FILESVR01 (Port 445 SMB)',
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
        title="Active Directory & Kerberos Security Made Simple"
        subtitle="Understand how Windows Domain Controllers log in users securely using encrypted digital tickets"
        icon={ShieldCheck}
        ip="192.168.1.10 (DC01 Domain Controller)"
        protocol="Kerberos (TCP/UDP)"
        port="Port 88 (KDC)"
        status={activeStep >= 2 ? "Ticket Granted" : "Unauthenticated"}
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

      {/* FLOATING MODAL POPUP FOR PACKET & TICKET PAYLOAD INSPECTOR (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && modalPayloadStep && activeModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-6 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <FileCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">{activeModalData.stepName} Payload Inspector</h3>
                  <p className="text-xs text-purple-400 font-mono font-bold">{activeModalData.messageType}</p>
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
              
              {/* L2, L3, L4 Headers Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4" />
                  <span>Network Stack Packet Headers</span>
                </div>
                <div className="space-y-2 text-sm text-slate-200">
                  <p><span className="text-slate-500 font-bold">Layer 2 (Ethernet):</span> <span className="text-cyan-300 font-bold">{activeModalData.l2Header}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 3 (IPv4):</span> <span className="text-purple-300 font-bold">{activeModalData.l3Header}</span></p>
                  <p><span className="text-slate-500 font-bold">Layer 4 (Kerberos Port):</span> <span className="text-emerald-300 font-bold">{activeModalData.l4Header}</span></p>
                </div>
              </div>

              {/* Kerberos Ticket Structure Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-purple-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    <span>Kerberos v5 Ticket Structure & Principals</span>
                  </span>
                  <span className="text-xs text-slate-400">Encryption: {activeModalData.encryptionType}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-bold">Client Principal:</span>
                    <span className="text-purple-300 font-bold text-base">{activeModalData.clientPrincipal}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-bold">Service Principal (SPN):</span>
                    <span className="text-amber-300 font-bold text-base">{activeModalData.servicePrincipal}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Details & PAC Authorization List Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm border-b border-slate-800 pb-2">
                  <Hash className="w-4 h-4" />
                  <span>PAC (Privilege Attribute Certificate) & Ticket Parameters</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-200">
                  {activeModalData.ticketDetails.map((item, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-purple-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
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
                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-purple-500/20"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN MASTER WORKSPACE STAGE (CONTAINING COMPACT CARDS, SPEED CONTROLS, BUTTONS & ENLARGED CANVAS) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* COMPACT LOW-PROFILE KERBEROS STEP CARDS */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-800/80 pb-3">
          {[
            { num: 1, name: '1. AS-REQ', desc: 'Auth Service Request', icon: '🔐' },
            { num: 2, name: '2. AS-REP', desc: 'TGT Ticket Issued', icon: '🎫' },
            { num: 3, name: '3. TGS-REQ', desc: 'Service Ticket Req', icon: '📩' },
            { num: 4, name: '4. TGS-REP', desc: 'Access Granted', icon: '🎟️' },
          ].map((card) => {
            const isDone = activeStep >= card.num;
            const isCurrent = activeStep === card.num;
            return (
              <div
                key={card.num}
                onClick={() => { setIsPlaying(false); setActiveStep(card.num); }}
                className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 font-extrabold shadow-md scale-102'
                    : isDone
                    ? 'bg-slate-900 text-slate-200 border-slate-700 font-bold'
                    : 'bg-slate-950/60 text-slate-500 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span>{card.icon}</span>
                  <span className="font-bold">{card.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isCurrent ? 'bg-slate-950 text-purple-300 font-bold' : 'text-slate-400'}`}>
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
                <Radio className="w-3.5 h-3.5 text-purple-400 animate-ping" />
                {currentMeta.badge}
              </span>
              <h3 className="text-lg font-black text-slate-100">{currentMeta.title}</h3>
            </div>
            <p className="text-xs text-slate-200 font-medium text-center sm:text-right max-w-md">{currentMeta.subtitle}</p>
          </div>
        )}

        {/* ENLARGED TOPOLOGY STAGE (DEAD-CENTER SWITCH, PC-01 LEFT, DC01 RIGHT, FILESVR TOP-RIGHT, DUMMY TOP-LEFT) */}
        <div className={`py-6 px-4 relative bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden ${appMode !== 'detailed' && appMode !== 'expert' ? 'min-h-[520px]' : 'min-h-[660px]'}`}>
          
          {/* VISIBLE SVG NETWORK CABLE LINES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Cable 1: Left PC-01 (12%, 58%) -> Center Switch (50%, 50%) */}
            <line x1="12%" y1="58%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />
            
            {/* Cable 2: Center Switch (50%, 50%) -> Right DC01 KDC (88%, 58%) */}
            <line x1="50%" y1="50%" x2="88%" y2="58%" stroke="#6366f1" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />

            {/* Cable 3: Center Switch (50%, 50%) -> Top-Right FILESVR01 (78%, 15%) */}
            <line x1="50%" y1="50%" x2="78%" y2="15%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.7" />

            {/* Cable 4: Center Switch (50%, 50%) -> Top-Left Dummy Unjoined PC (22%, 15%) */}
            <line x1="50%" y1="50%" x2="22%" y2="15%" stroke="#64748b" strokeWidth="3" strokeDasharray="6 4" strokeOpacity="0.5" />
          </svg>

          {/* 1. TOP LEFT: DUMMY UNJOINED WORKSTATION (22%, 15%) */}
          <div className="absolute left-[22%] top-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-700 shadow">
              Workgroup PC (Not Domain Joined)
            </span>
            <div className="p-3 rounded-xl border-2 bg-slate-900 border-slate-700">
              <Laptop className="w-7 h-7 text-slate-500" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-slate-400">UNJOINED-PC-02</p>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-0.5 justify-center mt-1 font-bold">
                <XCircle className="w-3 h-3" /> No TGT / Kerberos Denied
              </span>
            </div>
          </div>

          {/* 2. TOP RIGHT: FILESVR01 MEMBER SERVER (78%, 15%) */}
          <div className="absolute left-[78%] top-[15%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-center z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-700 shadow">
              TCP Port 445 (Microsoft SMB)
            </span>
            <div className={`p-3 rounded-xl border-2 transition-all ${
              activeStep === 4 ? 'bg-purple-950 border-purple-400 scale-110 shadow-2xl shadow-purple-500/30' : 'bg-slate-900 border-purple-500/60'
            }`}>
              <Server className="w-7 h-7 text-purple-400" />
            </div>
            <div className="font-mono text-[10px]">
              <p className="font-bold text-purple-300">FILESVR01 (MEMBER SERVER)</p>
              <p className="text-slate-400">SPN: cifs/FILESVR01</p>
            </div>
          </div>

          {/* 3. DEAD CENTER: L2 SWITCH (50%, 50%) */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-blue-950 text-blue-300 border border-blue-600 shadow-lg">
              CENTRAL L2 SWITCH
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              isPlaying ? 'bg-blue-900/90 border-blue-400 shadow-2xl shadow-blue-500/40 scale-110' : 'bg-blue-950/90 border-blue-500 text-blue-300'
            }`}>
              <Layers className="w-9 h-9 text-blue-400" />
            </div>
            <div className="text-center font-mono">
              <p className="text-xs font-extrabold text-blue-300">SWITCH</p>
              <p className="text-[10px] text-slate-400">Routes Kerberos Packets</p>
            </div>
          </div>

          {/* 4. LEFT DOWN: WORKSTATION PC-01 CLIENT (12%, 58%) */}
          <div className="absolute left-[12%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 shadow">
              Kerberos Client ({username})
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              activeStep === 4
                ? 'bg-emerald-950/90 border-emerald-400 shadow-2xl shadow-emerald-500/30 scale-110'
                : activeStep >= 2
                ? 'bg-purple-950/90 border-purple-400 shadow-2xl scale-105'
                : 'bg-slate-900/90 border-cyan-500/60'
            }`}>
              <Laptop className={`w-9 h-9 ${activeStep === 4 ? 'text-emerald-400' : 'text-cyan-400'}`} />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-cyan-300">LAPTOP-01</p>
              <p className="text-xs text-slate-400">192.168.1.105</p>
              <div className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-all ${
                activeStep >= 2 ? 'bg-purple-950 text-purple-300 border-purple-600 shadow' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {activeStep >= 2 ? '🎫 TGT Cached in LSA Memory' : 'Unauthenticated'}
              </div>
            </div>
          </div>

          {/* 5. RIGHT DOWN: DC01 KDC SERVER (88%, 58%) */}
          <div className="absolute left-[88%] top-[58%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-purple-950 text-purple-300 border border-purple-700 shadow">
              Port 88 (KDC / AS / TGS)
            </span>
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              activeStep === 1 || activeStep === 3
                ? 'bg-purple-950/90 border-purple-400 shadow-2xl scale-105 animate-pulse'
                : 'bg-slate-900/90 border-purple-500/60'
            }`}>
              <Server className="w-9 h-9 text-purple-400" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-sm font-extrabold text-purple-300">DC01 (KDC DOMAIN CONTROLLER)</p>
              <p className="text-xs text-slate-400">IP: 192.168.1.10</p>
              <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-purple-950 text-purple-300 border-purple-800">
                NTDS.DIT Database Active
              </div>
            </div>
          </div>

          {/* MAIN TARGET KERBEROS PACKET OVERLAY */}
          {packetPos && (
            <div
              style={{ left: packetPos.left, top: packetPos.top }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-full font-mono font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-white transition-all duration-100 ${packetPos.bgColor}`}
            >
              <Lock className="w-4 h-4 fill-current" />
              <span>{packetPos.label}</span>
            </div>
          )}
        </div>

        {/* LIVE PACKET & KERBEROS TICKET VIEWER (DETAILED MODE ONLY) */}
        {(appMode === 'detailed' || appMode === 'expert') && (
          <div className="p-4 bg-slate-950/95 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xs">
                <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>LIVE PACKET & KERBEROS TICKET VIEWER</span>
              </div>
              <span className="text-slate-400 text-[10px] font-bold">
                {packetPos ? packetPos.label : 'Waiting for Kerberos Handshake'}
              </span>
            </div>

            {currentPayload ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Column 1: Network Headers */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-purple-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                    <span>Kerberos Message & Realm:</span>
                    <span className="text-amber-400">{currentPayload.stepName}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Protocol:</span> <span className="text-purple-300 font-bold">{currentPayload.protocol}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Client Principal:</span> <span className="text-cyan-300 font-bold">{currentPayload.clientPrincipal}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Layer 3 (IPv4):</span> <span className="text-blue-300 font-bold">{currentPayload.l3Header}</span>
                  </p>
                </div>

                {/* Column 2: Ticket Payload Fields */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                    <span>Encryption & Service Principal:</span>
                    <span className="text-slate-400 text-[10px]">{currentPayload.encryptionType}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Target SPN:</span> <span className="text-amber-300 font-bold">{currentPayload.servicePrincipal}</span>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500 font-bold">Key Ticket Info:</span> <span className="text-emerald-300 font-bold">{currentPayload.ticketDetails[0]}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                <p className="font-bold">No active Kerberos packet in flight.</p>
                <p className="text-[10px]">Click "Next Step" or "Start Kerberos Login" to observe real-time Kerberos ticket generation.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WINDOWS CLI CHEATSHEET & TICKET INSPECTOR BUTTONS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">CLI Commands & Ticket Inspector</h3>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveOsTab('windows')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeOsTab === 'windows' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🪟 Windows OS (klist)
            </button>
          </div>
        </div>

        {/* 4 KERBEROS STEP COMMAND CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {[
            {
              step: 1,
              title: '1. AS-REQ',
              color: 'text-purple-400 border-purple-500/40',
              btnBg: 'bg-purple-500 hover:bg-purple-400 text-white font-black shadow-lg shadow-purple-500/20',
              winCmd: 'klist get krbtgt',
              winDesc: 'Sends encrypted timestamp to KDC Port 88 to request Ticket Granting Ticket (TGT).'
            },
            {
              step: 2,
              title: '2. AS-REP',
              color: 'text-indigo-400 border-indigo-500/40',
              btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white font-black shadow-lg shadow-indigo-500/20',
              winCmd: 'klist (Inspect TGT)',
              winDesc: 'KDC returns TGT & Session Key. TGT is cached in Windows LSA memory (10h lifetime).'
            },
            {
              step: 3,
              title: '3. TGS-REQ',
              color: 'text-blue-400 border-blue-500/40',
              btnBg: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-black shadow-lg shadow-blue-500/20',
              winCmd: 'klist get cifs/FILESVR01',
              winDesc: 'Presents TGT to KDC to request Service Ticket for SMB file share.'
            },
            {
              step: 4,
              title: '4. TGS-REP & AP-REQ',
              color: 'text-emerald-400 border-emerald-500/40',
              btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20',
              winCmd: 'net use \\\\FILESVR01\\Shares',
              winDesc: 'KDC issues Service Ticket. Client presents ticket to FILESVR01 over SMB Port 445!'
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
                    <span>Show Ticket & Info 🔍</span>
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

      {/* SIDE-BY-SIDE TICKET CACHE SUMMARY & LOGS (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && (
        <SlideOutInspector title="Slide Out Technical Deep Dive & Wire Logs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            
            {/* LEFT: LSA TICKET CACHE SUMMARY */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Windows LSA Ticket Cache (klist)</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Purge Cache (klist purge)
                </button>
              </div>

              <div className="space-y-2">
                <div className={`p-3 rounded-2xl border transition-all ${
                  activeStep >= 2 ? 'bg-purple-950/70 border-purple-500 text-purple-200' : 'bg-slate-950/50 border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>🎫 Ticket Granting Ticket (TGT)</span>
                    <span>{activeStep >= 2 ? 'VALID (krbtgt)' : 'EMPTY'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Client: {username}@CORP.LOCAL | Realm: CORP.LOCAL</p>
                </div>

                <div className={`p-3 rounded-2xl border transition-all ${
                  activeStep >= 4 ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200' : 'bg-slate-950/50 border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>🎟️ Service Ticket (ST)</span>
                    <span>{activeStep >= 4 ? 'VALID (cifs/FILESVR01)' : 'EMPTY'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Target SPN: cifs/FILESVR01.corp.local | SMB Port 445</p>
                </div>
              </div>
            </div>

            {/* RIGHT: TERMINAL LOGS */}
            <TerminalLog logs={logs} onClear={() => setLogs([])} />
          </div>
        </SlideOutInspector>
      )}
    </div>
  );
}
