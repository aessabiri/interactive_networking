import React, { useState, useEffect } from 'react';
import { Mail, Server, Laptop, ShieldCheck, Play, Pause, RotateCcw, CheckCircle2, Gauge, HelpCircle, FileCode, Terminal, SkipForward, Radio, Layers, Cpu, ArrowRight, X, Activity, Zap, HardDrive, Lock, RefreshCw, Send, Check, Inbox, Globe, Building2, Router } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function MailModule() {
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: MUA->MSA/MTA (587), 2: MTA->MTA Relay via Routers & ISP (25), 3: MDA/MRA->MUA (993/995)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [mailProtocol, setMailProtocol] = useState('smtp_imap'); // 'smtp_imap' or 'smtp_pop3'
  const [serverStack, setServerStack] = useState('exchange'); // 'exchange' or 'postfix_dovecot'
  const [packetProgress, setPacketProgress] = useState(0);
  const [modalPayloadStep, setModalPayloadStep] = useState(null);
  const [activeOsTab, setActiveOsTab] = useState('exchange');

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'MAIL', message: 'Multi-Tier Enterprise Mail Architecture (MUA ➔ MSA ➔ Routers ➔ ISP ➔ MDA ➔ MRA) initialized.' }
  ]);

  // Step Metadata for Multi-Tier Architectural Flow
  const stepMeta = {
    0: {
      title: 'Ready for Multi-Tier Mail Architecture (MUA ➔ MSA ➔ Routers ➔ ISP ➔ MDA ➔ MRA)',
      subtitle: 'Watch how emails travel from Sender MUA ➔ Local MSA ➔ Local Router ➔ ISP Internet Backbone ➔ Remote Router ➔ MDA Store ➔ Recipient MUA!',
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      sender: null,
      target: null
    },
    1: {
      title: '📩 STEP 1: MUA ➔ LOCAL MSA/MTA (PORT 587 STARTTLS)',
      subtitle: 'Sender MUA (Outlook) connects across LAN Switch to local MSA/MTA via SMTP Port 587 with STARTTLS encryption and AUTH PLAIN credentials.',
      badge: 'MUA ➔ MSA SUBMISSION (TCP 587)',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      sender: 'CLIENT',
      target: 'MTA_LOCAL',
      payload: {
        stepName: '1. MUA to MSA Submission (Client ➔ MSA/MTA)',
        protocol: 'MUA ➔ MSA Submission (RFC 6409 / RFC 5321)',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:0C:29:88:77:66 (MSA Server)',
        l3Header: 'Src IP: 192.168.1.105 (Private) → Dst IP: 192.168.1.50 (MSA Server)',
        l4Header: 'TCP Src Port: 59124 → Dst Port: 587 (SMTP Submission STARTTLS)',
        cmdHandshake: 'EHLO mail.dts.local ➔ STARTTLS ➔ AUTH PLAIN ➔ MAIL FROM:<student@dts.local> ➔ RCPT TO:<boss@dts.local>',
        archComponents: 'Sender MUA (Outlook) ➔ LAN Switch ➔ Local MSA (Mail Submission Agent)',
        dataBody: [
          'From: "Student Trainee" <student@dts.local>',
          'To: "Department Boss" <boss@dts.local>',
          'Subject: DTS Herford Multi-Tier Mail Architecture Lab',
          'Date: Sat, 01 Aug 2026 00:35:00 +0200',
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset=utf-8',
          'DKIM-Signature: v=1; a=rsa-sha256; d=dts.local; s=202608...',
          '',
          'Hello Boss, the Multi-Tier Mail Server architecture with Routers & ISP is operational!'
        ]
      }
    },
    2: {
      title: '🌐 STEP 2: LOCAL MTA ➔ LOCAL ROUTER ➔ ISP POP ➔ REMOTE ROUTER ➔ REMOTE MTA (PORT 25)',
      subtitle: 'Local MTA queries DNS for MX record, sends packet through Local Gateway Router ➔ ISP WAN ➔ Remote Gateway Router ➔ Inbound MTA (Port 25)!',
      badge: 'MTA RELAY VIA ROUTERS & ISP (PORT 25)',
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'MTA_LOCAL',
      target: 'MTA_REMOTE',
      payload: {
        stepName: '2. Multi-Hop MTA Relay via Gateway Routers & ISP',
        protocol: 'MTA Server Relay (RFC 5321)',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:11:22:33:44:01 (Local Router Gateway)',
        l3Header: 'Src IP: 203.0.113.50 (Public WAN) → Dst IP: 198.51.100.60 (Remote Public MTA)',
        l4Header: 'TCP Src Port: 42100 → Dst Port: 25 (SMTP Server Relay)',
        cmdHandshake: 'DNS MX Query: dts.local ➔ MX 10 mail.dts.local ➔ MAIL FROM:<student@dts.local> ➔ 250 2.0.0 OK Queued',
        archComponents: 'Outbound MTA ➔ Local Router Gateway ➔ ISP Telecom POP ➔ Remote Router Gateway ➔ Inbound MTA',
        dataBody: [
          'Received: from mail.dts.local (203.0.113.50) by mx01.dts.local (198.51.100.60) via ISP WAN with ESMTP id m20260801',
          'X-Spam-Status: No, score=-1.0 required=5.0 (Rspamd / SpamAssassin)',
          'X-Virus-Scanned: ClamAV / Exchange Anti-Malware Engine',
          'Authentication-Results: spf=pass (sender IP 203.0.113.50) dkim=pass',
          'Return-Path: <student@dts.local>',
          'Subject: DTS Herford Multi-Tier Mail Architecture Lab'
        ]
      }
    },
    3: {
      title: mailProtocol === 'smtp_imap' 
        ? '📬 STEP 3: MDA STORES EMAIL ➔ MRA SERVES RECIPIENT MUA (IMAP4 PORT 993)'
        : '📥 STEP 3: MDA STORES EMAIL ➔ MRA SERVES RECIPIENT MUA (POP3 PORT 995)',
      subtitle: mailProtocol === 'smtp_imap'
        ? 'MDA writes mail to storage (Maildir/.edb). Recipient MUA connects to MRA via IMAP4 Port 993 (IMAPS) for multi-device sync.'
        : 'MDA writes mail to storage (Maildir/.edb). Recipient MUA connects to MRA via POP3 Port 995 (POP3S) to download email.',
      badge: mailProtocol === 'smtp_imap' ? 'MDA STORE ➔ MRA IMAP4 (PORT 993)' : 'MDA STORE ➔ MRA POP3 (PORT 995)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'MTA_REMOTE',
      target: 'RECIPIENT',
      payload: {
        stepName: mailProtocol === 'smtp_imap' ? '3. MDA Storage & MRA IMAP4 Sync' : '3. MDA Storage & MRA POP3 Download',
        protocol: mailProtocol === 'smtp_imap' ? 'MDA Storage & MRA IMAP4rev1 (RFC 3501)' : 'MDA Storage & MRA POP3 (RFC 1939)',
        l2Header: 'Src MAC: 00:11:22:33:44:66 → Dst MAC: 00:50:56:FE:ED:01 (Recipient PC)',
        l3Header: 'Src IP: 10.0.0.60 (Mailbox Server) → Dst IP: 10.0.0.110 (Recipient PC)',
        l4Header: mailProtocol === 'smtp_imap' ? 'TCP Src Port: 993 (IMAPS TLS) → Dst Port: 60100' : 'TCP Src Port: 995 (POP3S TLS) → Dst Port: 60101',
        cmdHandshake: mailProtocol === 'smtp_imap'
          ? 'A1 LOGIN boss@dts.local **** ➔ A2 SELECT INBOX ➔ A3 FETCH 1 (FLAGS BODY[TEXT])'
          : 'USER boss@dts.local ➔ PASS **** ➔ STAT ➔ RETR 1 ➔ DELE 1 ➔ QUIT',
        archComponents: 'Inbound MTA ➔ MDA (Mail Delivery Agent) ➔ Storage ➔ MRA (Mail Retrieval Agent) ➔ Recipient MUA',
        dataBody: [
          mailProtocol === 'smtp_imap'
            ? 'IMAP4 MRA: Multi-device sync enabled. Message stored in folder INBOX.'
            : 'POP3 MRA: Downloaded to local client storage. Server copy marked for deletion.',
          `MDA Delivery Database: ${serverStack === 'exchange' ? 'Microsoft Exchange ESE (.edb) Store' : 'Linux Dovecot LDA (Maildir /home/user/Maildir/)'}`,
          'Status: Read / Unseen Synced',
          'Body Payload: Hello Boss, the Multi-Tier Mail Server architecture with Routers & ISP is operational!'
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

  // MULTI-TIER STAGGERED TOPOLOGY NODE COORDINATES (% of stage width/height):
  // Sender MUA: (10%, 68%) [Bottom-Left]
  // Local Switch: (19%, 40%) [Middle-Left]
  // Local MSA/MTA: (28%, 68%) [Bottom-Center-Left]
  // Local Gateway Router: (38%, 20%) [Top-Left-Center]
  // ISP Telecom POP Cloud: (55%, 20%) [Top-Center]
  // Remote Gateway Router: (72%, 20%) [Top-Right]
  // Remote MDA/MRA Server: (72%, 68%) [Bottom-Center-Right]
  // Recipient MUA: (90%, 68%) [Bottom-Right]

  const getPacketPos = () => {
    if (!isPlaying && activeStep === 0) return null;
    const p = packetProgress / 100; // 0 to 1

    if (activeStep === 1) {
      // Step 1: Sender MUA (10%, 68%) -> Local Switch (19%, 40%) -> Local MSA/MTA (28%, 68%)
      if (packetProgress <= 50) {
        const t = packetProgress / 50;
        return {
          left: `${10 + t * 9}%`,
          top: `${68 - t * 28}%`,
          label: 'MUA ➔ Switch (Port 587)',
          bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
        };
      } else {
        const t = (packetProgress - 50) / 50;
        return {
          left: `${19 + t * 9}%`,
          top: `${40 + t * 28}%`,
          label: 'Switch ➔ MSA Submission',
          bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
        };
      }
    } else if (activeStep === 2) {
      // Step 2: Multi-Hop Server Relay across Routers & ISP:
      // Subphase 1 (0-25%): Local MTA (28%, 68%) -> Local Router (38%, 20%)
      // Subphase 2 (25-50%): Local Router (38%, 20%) -> ISP Telecom POP (55%, 20%)
      // Subphase 3 (50-75%): ISP POP (55%, 20%) -> Remote Router (72%, 20%)
      // Subphase 4 (75-100%): Remote Router (72%, 20%) -> Remote MDA Server (72%, 68%)
      if (packetProgress <= 25) {
        const t = packetProgress / 25;
        return {
          left: `${28 + t * 10}%`,
          top: `${68 - t * 48}%`,
          label: 'Local MTA ➔ Local Router',
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
        };
      } else if (packetProgress <= 50) {
        const t = (packetProgress - 25) / 25;
        return {
          left: `${38 + t * 17}%`,
          top: '20%',
          label: 'WAN Relay ➔ ISP Backbone',
          bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50 animate-pulse'
        };
      } else if (packetProgress <= 75) {
        const t = (packetProgress - 50) / 25;
        return {
          left: `${55 + t * 17}%`,
          top: '20%',
          label: 'ISP ➔ Remote Router Gateway',
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
        };
      } else {
        const t = (packetProgress - 75) / 25;
        return {
          left: '72%',
          top: `${20 + t * 48}%`,
          label: 'Remote Router ➔ Inbound MTA/MDA',
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
        };
      }
    } else if (activeStep === 3) {
      // Step 3: Remote MDA/MRA (72%, 68%) -> Recipient MUA (90%, 68%) (IMAP 993 / POP3 995)
      return {
        left: `${72 + p * 18}%`,
        top: '68%',
        label: mailProtocol === 'smtp_imap' ? 'MRA ➔ MUA IMAP4 (Port 993)' : 'MRA ➔ MUA POP3 (Port 995)',
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
              
              {/* Architecture Components Banner */}
              <div className="p-4 bg-amber-950/60 rounded-2xl border border-amber-700/60 space-y-1">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Active Mail Architecture Components:</span>
                <p className="text-sm font-black text-amber-200">{activeModalData.archComponents}</p>
              </div>

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

      {/* TOP BAR: ARCHITECTURE TOGGLE & PROTOCOL SELECTOR */}
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
            <option value="smtp_imap">IMAP4 (Port 993 IMAPS - Multi-Device MRA Sync)</option>
            <option value="smtp_pop3">POP3 (Port 995 POP3S - Local MUA Download)</option>
          </select>
        </div>
      </div>

      {/* PROMINENT MAIL ARCHITECTURE COMPONENTS (MUA, MSA, MTA, MDA, MRA) CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-cyan-500/40 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold">
            <Laptop className="w-4 h-4" />
            <span>MUA</span>
          </div>
          <p className="text-[11px] font-bold text-slate-100">Mail User Agent</p>
          <p className="text-[10px] text-slate-400 leading-tight">Client app (Outlook, Thunderbird, Webmail) to compose & read email.</p>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-2xl border border-amber-500/40 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold">
            <Send className="w-4 h-4" />
            <span>MSA</span>
          </div>
          <p className="text-[11px] font-bold text-slate-100">Mail Submission Agent</p>
          <p className="text-[10px] text-slate-400 leading-tight">Accepts mail on Port 587, authenticates user & signs DKIM/SPF.</p>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-2xl border border-blue-500/40 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-400 font-extrabold">
            <Server className="w-4 h-4" />
            <span>MTA</span>
          </div>
          <p className="text-[11px] font-bold text-slate-100">Mail Transfer Agent</p>
          <p className="text-[10px] text-slate-400 leading-tight">Relays email across Internet on Port 25 via DNS MX lookup (Postfix/Exchange).</p>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-2xl border border-purple-500/40 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-400 font-extrabold">
            <Inbox className="w-4 h-4" />
            <span>MDA</span>
          </div>
          <p className="text-[11px] font-bold text-slate-100">Mail Delivery Agent</p>
          <p className="text-[10px] text-slate-400 leading-tight">Receives from MTA and writes message to storage (Maildir / .edb DB).</p>
        </div>

        <div className="p-3 bg-slate-900/90 rounded-2xl border border-emerald-500/40 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
            <RefreshCw className="w-4 h-4" />
            <span>MRA</span>
          </div>
          <p className="text-[11px] font-bold text-slate-100">Mail Retrieval Agent</p>
          <p className="text-[10px] text-slate-400 leading-tight">Serves mailbox to recipient MUA via IMAP4 (Port 993) or POP3 (Port 995).</p>
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

      {/* ENLARGED MULTI-TIER TOPOLOGY STAGE WITH ROUTERS & ISP CLOUD */}
      <div className="py-8 px-4 relative min-h-[580px] bg-slate-950/70 rounded-3xl border border-slate-800/80 overflow-hidden font-mono select-none">
        
        {/* NETWORK BOUNDARY CONTAINERS */}
        {/* Private Subnet A Container */}
        <div className="absolute left-[2%] top-[34%] w-[33%] h-[62%] border-2 border-dashed border-amber-800/40 rounded-3xl pointer-events-none p-3">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            SENDER LAN SUBNET A (192.168.1.0/24)
          </span>
        </div>

        {/* Public WAN & ISP Transit Container */}
        <div className="absolute left-[36%] top-[4%] w-[42%] h-[38%] border-2 border-dashed border-amber-500/40 rounded-3xl pointer-events-none p-3 text-center">
          <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-600 shadow">
            PUBLIC WAN & ISP INTERNET BACKBONE (203.0.113.0/24 ➔ 198.51.100.0/24)
          </span>
        </div>

        {/* Private Subnet B Container */}
        <div className="absolute right-[2%] top-[34%] w-[27%] h-[62%] border-2 border-dashed border-emerald-800/40 rounded-3xl pointer-events-none p-3 text-right">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            RECIPIENT LAN SUBNET B (10.0.0.0/24)
          </span>
        </div>

        {/* VISIBLE MULTI-TIER NETWORK CONNECTION LINES (WIRES) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Cable 1: Sender MUA (10%, 68%) -> Local Switch (19%, 40%) */}
          <line x1="10%" y1="68%" x2="19%" y2="40%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 2: Local MSA/MTA (28%, 68%) -> Local Switch (19%, 40%) */}
          <line x1="28%" y1="68%" x2="19%" y2="40%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 3: Local Switch (19%, 40%) -> Local Router (38%, 20%) */}
          <line x1="19%" y1="40%" x2="38%" y2="20%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 4: Local Router (38%, 20%) -> ISP Telecom POP (55%, 20%) [WAN WIRE] */}
          <line x1="38%" y1="20%" x2="55%" y2="20%" stroke="#10b981" strokeWidth="5" strokeDasharray="10 6" className="animate-wire-dash" strokeOpacity="0.9" />

          {/* Cable 5: ISP Telecom POP (55%, 20%) -> Remote Router (72%, 20%) [WAN WIRE] */}
          <line x1="55%" y1="20%" x2="72%" y2="20%" stroke="#10b981" strokeWidth="5" strokeDasharray="10 6" className="animate-wire-dash" strokeOpacity="0.9" />

          {/* Cable 6: Remote Router (72%, 20%) -> Remote MDA/MRA Server (72%, 68%) */}
          <line x1="72%" y1="20%" x2="72%" y2="68%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 7: Remote MDA/MRA Server (72%, 68%) -> Recipient MUA (90%, 68%) */}
          <line x1="72%" y1="68%" x2="90%" y2="68%" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />
        </svg>

        {/* 1. SENDER CLIENT MUA (BOTTOM-LEFT: 10%, 68%) */}
        <div className="absolute left-[10%] top-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-700 shadow font-extrabold">
            Sender MUA (Port 587)
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 1 ? 'bg-amber-950 border-amber-400 shadow-2xl scale-110 animate-bounce' : 'bg-slate-900 border-slate-700'
          }`}>
            <Laptop className="w-11 h-11 text-amber-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-slate-100">SENDER-MUA-01</p>
            <p className="text-[10px] text-amber-300 font-bold">student@dts.local</p>
          </div>
        </div>

        {/* 2. LOCAL L2 SWITCH (MIDDLE-LEFT: 19%, 40%) */}
        <div className="absolute left-[19%] top-[40%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-blue-950 text-blue-300 border border-blue-700 shadow font-bold">
            Subnet A L2 Switch
          </span>
          <div className="p-4 rounded-2xl border-2 bg-slate-900 border-slate-700">
            <Layers className="w-9 h-9 text-blue-400" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-bold text-blue-300">LAN SWITCH</p>
          </div>
        </div>

        {/* 3. LOCAL MSA / OUTBOUND MTA SERVER (BOTTOM-CENTER-LEFT: 28%, 68%) */}
        <div className="absolute left-[28%] top-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-700 shadow font-extrabold">
            {serverStack === 'exchange' ? 'Exchange MSA & Outbound MTA' : 'Postfix MSA (587) & MTA (25)'}
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 1 || activeStep === 2 ? 'bg-blue-950 border-blue-400 shadow-2xl scale-105' : 'bg-slate-900 border-slate-700'
          }`}>
            <Server className="w-12 h-12 text-blue-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-blue-300">
              {serverStack === 'exchange' ? 'EXCHANGE-MSA-MTA' : 'POSTFIX-MSA-MTA'}
            </p>
            <p className="text-[10px] text-slate-400">192.168.1.50 (MSA/MTA)</p>
          </div>
        </div>

        {/* 4. LOCAL GATEWAY ROUTER (TOP-LEFT-CENTER: 38%, 20%) */}
        <div className="absolute left-[38%] top-[20%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-amber-950 text-amber-300 border border-amber-600 shadow font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" /> LOCAL ROUTER (NAT)
          </span>
          <div className={`p-4 rounded-2xl border-4 transition-all ${
            activeStep === 2 ? 'bg-amber-900/90 border-amber-400 shadow-2xl scale-110' : 'bg-slate-900 border-slate-700'
          }`}>
            <Router className="w-10 h-10 text-amber-400" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-extrabold text-amber-300">ROUTER-GW-01</p>
            <p className="text-slate-400">203.0.113.1 (WAN)</p>
          </div>
        </div>

        {/* 5. ISP TELECOM POP / INTERNET BACKBONE CLOUD (TOP-CENTER: 55%, 20%) */}
        <div className="absolute left-[55%] top-[20%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-2xl shadow-emerald-500/50 font-black flex items-center gap-1 animate-pulse">
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> ISP BACKBONE 🌐
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 2 && packetProgress > 25 && packetProgress < 75
              ? 'bg-emerald-950 border-emerald-400 shadow-2xl shadow-emerald-500/60 scale-110 animate-bounce'
              : 'bg-emerald-950/80 border-emerald-500/80'
          }`}>
            <Building2 className="w-12 h-12 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-black text-emerald-300">INTERNET ISP POP</p>
            <p className="text-emerald-400 font-bold">MX WAN Transit</p>
          </div>
        </div>

        {/* 6. REMOTE GATEWAY ROUTER (TOP-RIGHT: 72%, 20%) */}
        <div className="absolute left-[72%] top-[20%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-blue-950 text-blue-300 border border-blue-600 shadow font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" /> REMOTE ROUTER
          </span>
          <div className={`p-4 rounded-2xl border-4 transition-all ${
            activeStep === 2 && packetProgress >= 50 ? 'bg-blue-900/90 border-blue-400 shadow-2xl scale-110' : 'bg-slate-900 border-slate-700'
          }`}>
            <Router className="w-10 h-10 text-blue-400" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-extrabold text-blue-300">REMOTE-GW-02</p>
            <p className="text-slate-400">198.51.100.1 (WAN)</p>
          </div>
        </div>

        {/* 7. DESTINATION INBOUND MDA / MRA SERVER (BOTTOM-CENTER-RIGHT: 72%, 68%) */}
        <div className="absolute left-[72%] top-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 shadow font-extrabold">
            {serverStack === 'exchange' ? 'Exchange MDA (EDB) & MRA' : 'Dovecot MDA & MRA (993/995)'}
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 2 || activeStep === 3 ? 'bg-emerald-950 border-emerald-400 shadow-2xl scale-105' : 'bg-slate-900 border-slate-700'
          }`}>
            <HardDrive className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-emerald-300">
              {serverStack === 'exchange' ? 'EXCHANGE-MDA-MRA' : 'DOVECOT-MDA-MRA'}
            </p>
            <p className="text-[10px] text-slate-400">10.0.0.60 ({mailProtocol === 'smtp_imap' ? 'MRA 993' : 'MRA 995'})</p>
          </div>
        </div>

        {/* 8. RECIPIENT CLIENT MUA (BOTTOM-RIGHT: 90%, 68%) */}
        <div className="absolute left-[90%] top-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 shadow font-extrabold">
            Recipient MUA (Outlook)
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 3 ? 'bg-emerald-950 border-emerald-400 shadow-2xl scale-110' : 'bg-slate-900 border-slate-700'
          }`}>
            <Laptop className="w-11 h-11 text-emerald-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-slate-100">RECIPIENT-MUA-02</p>
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
                <span className="text-blue-400 font-extrabold text-sm block">1. Exchange Server Roles (MUA / MSA / MTA / MDA / MRA)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Microsoft Exchange 2019 consolidates Mailbox Role (Transport MTA, Delivery MDA, ESE Store) and Front-End CAS Services (MRA via Outlook MAPI/EWS & ActiveSync).
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 text-slate-300 font-mono text-[11px]">
                  <p><span className="text-slate-500">MTA Service:</span> Microsoft Exchange Transport Service</p>
                  <p><span className="text-slate-500">MDA / Store:</span> Extensible Storage Engine (ESE / .edb database)</p>
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
                  Linux open-source mail servers decouple MSA/MTA (Postfix on Port 587/25) from MDA/MRA (Dovecot IMAP 993 / POP3 995) for security and scalability.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 text-slate-300 font-mono text-[11px]">
                  <p><span className="text-slate-500">MSA / MTA (Port 587/25):</span> Postfix / Exim / Sendmail</p>
                  <p><span className="text-slate-500">MDA / MRA (Port 993/995):</span> Dovecot LDA / Dovecot IMAP/POP3 Daemon</p>
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
