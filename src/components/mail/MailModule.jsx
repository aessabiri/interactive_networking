import React, { useState, useEffect } from 'react';
import { Mail, Server, Laptop, ShieldCheck, Play, Pause, RotateCcw, CheckCircle2, Gauge, HelpCircle, FileCode, Terminal, SkipForward, Radio, Layers, Cpu, ArrowRight, X, Activity, Zap, HardDrive, Lock, RefreshCw, Send, Check } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function MailModule() {
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: SMTP Submission (587), 2: SMTP MTA Relay (25), 3: IMAP/POP3 Retrieval (993/995)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [mailProtocol, setMailProtocol] = useState('smtp_imap'); // 'smtp_imap' or 'smtp_pop3'
  const [serverStack, setServerStack] = useState('exchange'); // 'exchange' or 'postfix_dovecot'
  const [packetProgress, setPacketProgress] = useState(0);
  const [modalPayloadStep, setModalPayloadStep] = useState(null);
  const [activeOsTab, setActiveOsTab] = useState('exchange');

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'MAIL', message: 'Enterprise Mail Transfer & Retrieval Subsystem initialized.' }
  ]);

  // Step Metadata for Mail Delivery & Retrieval Flow
  const stepMeta = {
    0: {
      title: 'Ready for Mail Traversal & Protocol Inspection',
      subtitle: 'Watch how emails travel from Client PC ➔ Submission Server (SMTP 587) ➔ MTA Gateway (SMTP 25) ➔ Recipient Mailbox (IMAP 993 / POP3 995)!',
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      sender: null,
      target: null
    },
    1: {
      title: '📩 STEP 1: SMTP CLIENT MAIL SUBMISSION (PORT 587 STARTTLS)',
      subtitle: 'Client PC (student@dts.local) connects to Mail Server via SMTP Port 587 with TLS encryption to send an email.',
      badge: 'SMTP SUBMISSION (TCP 587 STARTTLS)',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      sender: 'CLIENT',
      target: 'MTA_LOCAL',
      payload: {
        stepName: '1. SMTP Submission (Client ➔ Local MTA)',
        protocol: 'SMTP / ESMTP (RFC 5321)',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:0C:29:88:77:66 (Mail Server)',
        l3Header: 'Src IP: 192.168.1.105 (Private) → Dst IP: 192.168.1.50 (Mail Server)',
        l4Header: 'TCP Src Port: 59124 → Dst Port: 587 (SMTP Submission STARTTLS)',
        cmdHandshake: 'EHLO mail.dts.local ➔ STARTTLS ➔ AUTH PLAIN ➔ MAIL FROM:<student@dts.local> ➔ RCPT TO:<boss@dts.local>',
        dataBody: [
          'From: "Student Trainee" <student@dts.local>',
          'To: "Department Boss" <boss@dts.local>',
          'Subject: DTS Herford Network Infrastructure Lab Report',
          'Date: Sat, 01 Aug 2026 00:32:00 +0200',
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset=utf-8',
          'DKIM-Signature: v=1; a=rsa-sha256; d=dts.local; s=202608...',
          '',
          'Hello Boss, the Mail Server protocol simulation is fully operational!'
        ]
      }
    },
    2: {
      title: '🌐 STEP 2: SMTP MTA SERVER RELAY & MX LOOKUP (PORT 25)',
      subtitle: 'Local MTA Server queries DNS for MX Record of dts.local and relays mail over Port 25 to Recipient Mailbox Server.',
      badge: 'SMTP MTA RELAY (TCP PORT 25)',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'MTA_LOCAL',
      target: 'MTA_REMOTE',
      payload: {
        stepName: '2. SMTP Server-to-Server Relay (MTA ➔ MTA)',
        protocol: 'SMTP MTA Transfer (RFC 5321)',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:11:22:33:44:55 (Router Gateway)',
        l3Header: 'Src IP: 192.168.1.50 (Local MTA) → Dst IP: 192.168.1.60 (Destination Mailbox Server)',
        l4Header: 'TCP Src Port: 42100 → Dst Port: 25 (SMTP Server Relay)',
        cmdHandshake: 'DNS MX Query: dts.local ➔ MX 10 mail.dts.local ➔ MAIL FROM:<student@dts.local> ➔ 250 2.0.0 OK Queued',
        dataBody: [
          'Received: from mail.dts.local (192.168.1.50) by mx01.dts.local (192.168.1.60) with ESMTP id m20260801',
          'X-Spam-Status: No, score=-1.0 required=5.0 (Rspamd / SpamAssassin)',
          'X-Virus-Scanned: ClamAV / Exchange Anti-Malware Engine',
          'Authentication-Results: spf=pass (sender IP 192.168.1.50) dkim=pass',
          'Return-Path: <student@dts.local>',
          'Subject: DTS Herford Network Infrastructure Lab Report'
        ]
      }
    },
    3: {
      title: mailProtocol === 'smtp_imap' 
        ? '📬 STEP 3: IMAP4 CLIENT SYNCHRONIZATION (PORT 993 IMAPS)'
        : '📥 STEP 3: POP3 CLIENT MAIL DOWNLOAD (PORT 995 POP3S)',
      subtitle: mailProtocol === 'smtp_imap'
        ? 'Recipient Client PC connects via IMAP4 Port 993 (IMAPS). Messages remain synced on server in Maildir / EDB database.'
        : 'Recipient Client PC connects via POP3 Port 995 (POP3S). Email is downloaded to local client storage.',
      badge: mailProtocol === 'smtp_imap' ? 'IMAP4 SYNC (TCP 993 IMAPS)' : 'POP3 DOWNLOAD (TCP 995 POP3S)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'MTA_REMOTE',
      target: 'RECIPIENT',
      payload: {
        stepName: mailProtocol === 'smtp_imap' ? '3. IMAP4 Multi-Device Sync' : '3. POP3 Message Download',
        protocol: mailProtocol === 'smtp_imap' ? 'IMAP4rev1 (RFC 3501)' : 'POP3 (RFC 1939)',
        l2Header: 'Src MAC: 00:11:22:33:44:66 → Dst MAC: 00:50:56:FE:ED:01 (Recipient PC)',
        l3Header: 'Src IP: 192.168.1.60 (Mailbox Server) → Dst IP: 192.168.1.110 (Recipient PC)',
        l4Header: mailProtocol === 'smtp_imap' ? 'TCP Src Port: 993 (IMAPS TLS) → Dst Port: 60100' : 'TCP Src Port: 995 (POP3S TLS) → Dst Port: 60101',
        cmdHandshake: mailProtocol === 'smtp_imap'
          ? 'A1 LOGIN boss@dts.local **** ➔ A2 SELECT INBOX ➔ A3 FETCH 1 (FLAGS BODY[TEXT])'
          : 'USER boss@dts.local ➔ PASS **** ➔ STAT ➔ RETR 1 ➔ DELE 1 ➔ QUIT',
        dataBody: [
          mailProtocol === 'smtp_imap'
            ? 'IMAP Storage Engine: Multi-device sync enabled. Message kept in server folder INBOX.'
            : 'POP3 Storage Engine: Downloaded to local OST/PST file. Server copy marked for deletion.',
          `Database Format: ${serverStack === 'exchange' ? 'Microsoft Exchange ESE (.edb) Store' : 'Linux Maildir (One File per Email)'}`,
          'Status: Read / Unseen Synced',
          'Body Payload: Hello Boss, the Mail Server protocol simulation is fully operational!'
        ]
      }
    }
  };

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
          if (activeStep < 3) {
            const next = activeStep + 1;
            setActiveStep(next);
            const meta = stepMeta[next];
            setLogs(prev => [
              ...prev,
              { time: new Date().toLocaleTimeString(), tag: 'MAIL', message: `${meta.title} - ${meta.subtitle}` }
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
  }, [isPlaying, activeStep, speed, isSingleStep, mailProtocol, serverStack]);

  const handlePlayFull = () => {
    if (activeStep === 3) setActiveStep(1);
    else if (activeStep === 0) setActiveStep(1);
    setIsSingleStep(false);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    if (activeStep >= 3) return;
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    setIsSingleStep(true);
    setIsPlaying(true);
    const meta = stepMeta[nextStep];
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: 'MAIL', message: `STEP ${nextStep}: ${meta.title}` }
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsSingleStep(false);
    setActiveStep(0);
    setPacketProgress(0);
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'MAIL', message: 'Mail queues & TCP connections reset.' }]);
  };

  const currentMeta = stepMeta[activeStep] || stepMeta[0];
  const isFinalStepComplete = activeStep === 3;
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;
  const currentPayload = currentMeta.payload;

  // TOPOLOGY NODE COORDINATES (% of stage width/height):
  // Sender Client PC: (10%, 55%)
  // Local MTA Server: (35%, 55%)
  // L2 Switch / Gateway: (35%, 18%)
  // Destination Mailbox Server: (65%, 55%)
  // Recipient Client PC: (90%, 55%)

  const getPacketPos = () => {
    if (!isPlaying && activeStep === 0) return null;
    const p = packetProgress / 100; // 0 to 1

    if (activeStep === 1) {
      // Step 1: Sender PC (10%, 55%) -> Local MTA Server (35%, 55%) (SMTP Port 587)
      return {
        left: `${10 + p * 25}%`,
        top: '55%',
        label: 'SMTP Submission (Port 587 STARTTLS)',
        bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
      };
    } else if (activeStep === 2) {
      // Step 2: Local MTA (35%, 55%) -> Dest Mailbox Server (65%, 55%) (SMTP Port 25 MX Relay)
      return {
        left: `${35 + p * 30}%`,
        top: '55%',
        label: 'SMTP MTA Relay (Port 25)',
        bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
      };
    } else if (activeStep === 3) {
      // Step 3: Dest Mailbox Server (65%, 55%) -> Recipient PC (90%, 55%) (IMAP 993 / POP3 995)
      return {
        left: `${65 + p * 25}%`,
        top: '55%',
        label: mailProtocol === 'smtp_imap' ? 'IMAP4 Sync (Port 993 IMAPS)' : 'POP3 Download (Port 995 POP3S)',
        bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50 animate-bounce'
      };
    }
    return null;
  };

  const animPos = getPacketPos();

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* FLOATING MODAL POPUP FOR MAIL PAYLOAD INSPECTOR */}
      {modalPayloadStep && activeModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-6 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto font-mono">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">{activeModalData.stepName} Payload</h3>
                  <p className="text-xs text-amber-400 font-bold">{activeModalData.protocol}</p>
                </div>
              </div>
              <button
                onClick={() => setModalPayloadStep(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              
              {/* Network Stack Headers */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-extrabold text-sm block border-b border-slate-800 pb-1">Network Stack Headers:</span>
                <p><span className="text-slate-500 font-bold">Ethernet (L2):</span> <span className="text-slate-200">{activeModalData.l2Header}</span></p>
                <p><span className="text-slate-500 font-bold">IPv4 (L3):</span> <span className="text-cyan-300 font-bold">{activeModalData.l3Header}</span></p>
                <p><span className="text-slate-500 font-bold">TCP Transport (L4):</span> <span className="text-amber-300 font-bold">{activeModalData.l4Header}</span></p>
              </div>

              {/* Protocol Handshake */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-extrabold text-sm block border-b border-slate-800 pb-1">Protocol Handshake Commands:</span>
                <p className="text-slate-200 font-bold bg-slate-900 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                  {activeModalData.cmdHandshake}
                </p>
              </div>

              {/* Email Headers & Body Payload */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-extrabold text-sm block border-b border-slate-800 pb-1">Raw RFC 5322 Email Data Body:</span>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] text-slate-300">
                  {activeModalData.dataBody.map((line, idx) => (
                    <p key={idx} className={line.startsWith('Subject:') ? 'text-cyan-300 font-bold' : line.startsWith('Hello') ? 'text-amber-300 font-bold pt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalPayloadStep(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR: SERVER STACK TOGGLE (EXCHANGE VS LINUX POSTFIX/DOVECOT) & PROTOCOL SELECTOR */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl bg-slate-900/90 font-mono text-xs">
        
        {/* Left: Server Stack Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">Mail Architecture:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setServerStack('exchange')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                serverStack === 'exchange'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>🪟 Microsoft Exchange 2019</span>
            </button>

            <button
              onClick={() => setServerStack('postfix_dovecot')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                serverStack === 'postfix_dovecot'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>🐧 Linux (Postfix + Dovecot)</span>
            </button>
          </div>
        </div>

        {/* Right: Retrieval Protocol Mode */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">Retrieval Protocol:</span>
          <select
            value={mailProtocol}
            onChange={(e) => setMailProtocol(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="smtp_imap">IMAP4 (Port 993 IMAPS - Multi-Device Server Sync)</option>
            <option value="smtp_pop3">POP3 (Port 995 POP3S - Local Client Download)</option>
          </select>
        </div>
      </div>

      {/* WORKSPACE CONTROL TOOLBAR */}
      <div className="glass-panel p-2.5 rounded-2xl border border-slate-800/90 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shadow-xl font-mono text-xs">
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
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
              <RotateCcw className="w-4 h-4" /> Reset Mail Flow
            </button>
          ) : (
            <>
              <button
                onClick={handleStepForward}
                disabled={isPlaying}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-extrabold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
              >
                <SkipForward className="w-4 h-4 fill-current" /> Next Step ({activeStep + 1}/3)
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
                {isPlaying ? 'Pause' : 'Start Mail Delivery'}
              </button>

              <button onClick={handleReset} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer" title="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Action Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 font-mono ${currentMeta.badgeColor}`}>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-slate-950/80 border border-white/10 shadow flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-ping" />
            {currentMeta.badge}
          </span>
          <h3 className="text-lg font-black text-slate-100">{currentMeta.title}</h3>
        </div>
        <p className="text-xs text-slate-200 font-medium text-center sm:text-right max-w-md">{currentMeta.subtitle}</p>
      </div>

      {/* MAIN TOPOLOGY STAGE */}
      <div className="py-6 px-4 relative min-h-[520px] bg-slate-950/60 rounded-3xl border border-slate-800/80 overflow-hidden font-mono">
        
        {/* VISIBLE NETWORK CABLE LINES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Cable 1: Sender PC (10%, 55%) -> Local MTA (35%, 55%) */}
          <line x1="10%" y1="55%" x2="35%" y2="55%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 2: Local MTA (35%, 55%) -> Dest Mailbox Server (65%, 55%) */}
          <line x1="35%" y1="55%" x2="65%" y2="55%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 3: Dest Mailbox Server (65%, 55%) -> Recipient PC (90%, 55%) */}
          <line x1="65%" y1="55%" x2="90%" y2="55%" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />
        </svg>

        {/* 1. SENDER CLIENT PC (LEFT: 10%, 55%) */}
        <div className="absolute left-[10%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-700 shadow font-bold">
            Sender Client (Port 587)
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 1 ? 'bg-amber-950 border-amber-400 shadow-2xl scale-110 animate-bounce' : 'bg-slate-900 border-slate-700'
          }`}>
            <Laptop className="w-12 h-12 text-amber-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-slate-100">SENDER-PC-01</p>
            <p className="text-[10px] text-amber-300 font-bold">student@dts.local</p>
          </div>
        </div>

        {/* 2. LOCAL SUBMISSION MTA SERVER (35%, 55%) */}
        <div className="absolute left-[35%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-700 shadow font-bold">
            {serverStack === 'exchange' ? 'Exchange Edge Transport' : 'Postfix MTA (Port 25/587)'}
          </span>
          <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 1 || activeStep === 2 ? 'bg-blue-950 border-blue-400 shadow-2xl scale-105' : 'bg-slate-900 border-slate-700'
          }`}>
            <Server className="w-14 h-14 text-blue-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-blue-300">
              {serverStack === 'exchange' ? 'EXCHANGE-MTA-01' : 'POSTFIX-MTA-01'}
            </p>
            <p className="text-[10px] text-slate-400">192.168.1.50 (SMTP Relay)</p>
          </div>
        </div>

        {/* 3. DESTINATION MAILBOX SERVER (65%, 55%) */}
        <div className="absolute left-[65%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 shadow font-bold">
            {serverStack === 'exchange' ? 'Exchange Mailbox (EDB Store)' : 'Dovecot IMAP/POP3 (Maildir)'}
          </span>
          <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 2 || activeStep === 3 ? 'bg-emerald-950 border-emerald-400 shadow-2xl scale-105' : 'bg-slate-900 border-slate-700'
          }`}>
            <HardDrive className="w-14 h-14 text-emerald-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-emerald-300">
              {serverStack === 'exchange' ? 'EXCHANGE-MBX-01' : 'DOVECOT-IMAP-01'}
            </p>
            <p className="text-[10px] text-slate-400">192.168.1.60 ({mailProtocol === 'smtp_imap' ? 'Port 993' : 'Port 995'})</p>
          </div>
        </div>

        {/* 4. RECIPIENT CLIENT PC (RIGHT: 90%, 55%) */}
        <div className="absolute left-[90%] top-[55%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 shadow font-bold">
            Recipient Host
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 3 ? 'bg-emerald-950 border-emerald-400 shadow-2xl scale-110' : 'bg-slate-900 border-slate-700'
          }`}>
            <Laptop className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-slate-100">RECIPIENT-PC-02</p>
            <p className="text-[10px] text-emerald-300 font-bold">boss@dts.local</p>
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
      </div>

      {/* STEP INSPECTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono">
        {[1, 2, 3].map((stepNum) => {
          const meta = stepMeta[stepNum];
          return (
            <div key={stepNum} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
              <div className="space-y-1 text-xs">
                <span className="text-amber-400 font-bold">{meta.title.split(':')[0]}</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{meta.subtitle}</p>
              </div>

              <button
                onClick={() => setModalPayloadStep(stepNum)}
                className="w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileCode className="w-4 h-4" />
                <span>Inspect Mail Payload & Headers 🔍</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* COMPARISON CHEATSHEET: MICROSOFT EXCHANGE VS LINUX POSTFIX/DOVECOT */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">Enterprise Mail Architecture Comparison & CLI Commands</h3>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveOsTab('exchange')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeOsTab === 'exchange' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🪟 Exchange Server 2019
            </button>
            <button
              onClick={() => setActiveOsTab('linux')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeOsTab === 'linux' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🐧 Linux (Postfix + Dovecot)
            </button>
          </div>
        </div>

        {/* DETAILED ARCHITECTURE & COMMAND GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {activeOsTab === 'exchange' ? (
            <>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-blue-400 font-extrabold text-sm block">1. Exchange Server Roles & Services</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Microsoft Exchange 2019 consolidates Mailbox Role (Database & Transport) and Client Access Services (CAS). Uses MAPI over HTTP, EWS, and ActiveSync for mobile clients.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 text-slate-300 font-mono text-[11px]">
                  <p><span className="text-slate-500">MTA Service:</span> Microsoft Exchange Transport Service</p>
                  <p><span className="text-slate-500">Store Engine:</span> Extensible Storage Engine (ESE / .edb database)</p>
                  <p><span className="text-slate-500">Database High Availability:</span> DAG (Database Availability Group)</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-extrabold text-sm block">2. Exchange Management Shell (PowerShell)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Key Exchange PowerShell cmdlets for mailbox provisioning and transport queue management:
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px] text-cyan-200">
                  <p><span className="text-slate-500">View Databases:</span> Get-MailboxDatabase -Status</p>
                  <p><span className="text-slate-500">Check Mail Queues:</span> Get-Queue | ft Identity,MessageCount</p>
                  <p><span className="text-slate-500">New User Mailbox:</span> Enable-Mailbox -Identity student@dts.local</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-extrabold text-sm block">1. Linux Modular Mail Stack (Postfix + Dovecot)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Linux open-source mail servers decouple MTA (Postfix / Sendmail) from MDA/IMAP (Dovecot) for maximum security and scalability.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 text-slate-300 font-mono text-[11px]">
                  <p><span className="text-slate-500">MTA (Port 25/587):</span> Postfix / Exim / Sendmail</p>
                  <p><span className="text-slate-500">IMAP/POP3 Server:</span> Dovecot / Courier-IMAP</p>
                  <p><span className="text-slate-500">Mailbox Storage:</span> Maildir (/home/user/Maildir/ - 1 File/Email)</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-extrabold text-sm block">2. Linux Mail CLI & Queue Management</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Essential Linux terminal commands for managing mail daemons and inspecting mail logs:
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px] text-amber-200">
                  <p><span className="text-slate-500">Service Status:</span> systemctl status postfix dovecot</p>
                  <p><span className="text-slate-500">View Postfix Queue:</span> mailq  or  postqueue -p</p>
                  <p><span className="text-slate-500">Tail Live Mail Logs:</span> tail -f /var/log/mail.log</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* REAL-TIME LOGS */}
      <div>
        <TerminalLog logs={logs} onClear={() => setLogs([])} />
      </div>
    </div>
  );
}
