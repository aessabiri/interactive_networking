import React, { useState, useEffect } from 'react';
import { Mail, Server, Laptop, ShieldCheck, Play, Pause, RotateCcw, CheckCircle2, Gauge, HelpCircle, FileCode, Terminal, SkipForward, Radio, Layers, Cpu, ArrowRight, X, Activity, Zap, HardDrive, Lock, RefreshCw, Send, Check, Inbox, Globe, Building2, Router, Search, Sparkles, Cloud } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';

export default function MailModule({ appMode = 'clean' }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Submission (587), 2: DNS MX Query (Cross-domain only), 3: MTA Relay (25), 4: MRA Retrieval (993/995)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSingleStep, setIsSingleStep] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [mailProtocol, setMailProtocol] = useState('smtp_imap'); // 'smtp_imap' or 'smtp_pop3'
  const [serverStack, setServerStack] = useState('exchange'); // 'exchange' or 'postfix_dovecot'
  const [domainMode, setDomainMode] = useState('cross'); // 'intra' (Same Domain) or 'cross' (Different Domains)
  const [packetProgress, setPacketProgress] = useState(0);
  const [modalPayloadStep, setModalPayloadStep] = useState(null);
  const [activeOsTab, setActiveOsTab] = useState('exchange');

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'MAIL', message: 'Multi-Tier Enterprise Mail Architecture (PC & Exchange ➔ LAN Switch ➔ Router ➔ ISP ➔ DNS) initialized.' }
  ]);

  // Dynamic Domain Parameters
  const senderEmail = domainMode === 'cross' ? 'student@dts-herford.de' : 'student@dts.local';
  const recipientEmail = domainMode === 'cross' ? 'alex@company-partner.com' : 'boss@dts.local';
  const senderDomain = domainMode === 'cross' ? 'dts-herford.de' : 'dts.local';
  const recipientDomain = domainMode === 'cross' ? 'company-partner.com' : 'dts.local';
  const mxHost = domainMode === 'cross' ? 'mx01.company-partner.com' : 'mx01.dts.local';
  const resolvedMxIp = domainMode === 'cross' ? '198.51.100.60' : '192.168.1.50';

  const totalSteps = domainMode === 'cross' ? 4 : 3;

  // Step Metadata for Same-Domain vs Cross-Domain Mail Flow
  const stepMetaCross = {
    0: {
      title: 'Ready for Enterprise Mail Traversal (PC & Exchange ➔ Switch ➔ Router ➔ ISP ➔ DNS)',
      subtitle: `Watch packet: 1. MUA Submission ➔ 2. DNS MX Query via ISP (8.8.8.8) ➔ 3. MTA Relay over ISP WAN ➔ 4. MRA Retrieval!`,
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      sender: null,
      target: null
    },
    1: {
      title: '📩 STEP 1: SENDER MUA ➔ LAN SWITCH ➔ EXCHANGE MSA/MTA (PORT 587 STARTTLS)',
      subtitle: `Sender MUA (Outlook at 12%, 68%) sends mail via LAN Switch (28%, 43%) to Exchange Server (12%, 18%) over SMTP Port 587.`,
      badge: 'MUA ➔ SWITCH ➔ EXCHANGE (TCP 587)',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      sender: 'CLIENT',
      target: 'MTA_LOCAL',
      payload: {
        stepName: '1. MUA to MSA Submission (Sender PC ➔ Switch ➔ Exchange)',
        protocol: 'MUA ➔ MSA Submission (RFC 6409 / RFC 5321)',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:0C:29:88:77:66 (Exchange Server)',
        l3Header: 'Src IP: 192.168.1.105 (Private) → Dst IP: 192.168.1.50 (Exchange Server)',
        l4Header: 'TCP Src Port: 59124 → Dst Port: 587 (SMTP Submission STARTTLS)',
        cmdHandshake: `EHLO mail.${senderDomain} ➔ STARTTLS ➔ AUTH PLAIN ➔ MAIL FROM:<${senderEmail}> ➔ RCPT TO:<${recipientEmail}>`,
        archComponents: `Sender MUA (Outlook at 12%, 68%) ➔ Subnet A Switch (28%, 43%) ➔ Exchange MSA Server (12%, 18%)`,
        dataBody: [
          `From: "Student Trainee" <${senderEmail}>`,
          `To: "Alex Partner" <${recipientEmail}>`,
          'Subject: Inter-Domain B2B Contract & Infrastructure Report',
          'Date: Sat, 01 Aug 2026 00:45:00 +0200',
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset=utf-8',
          `DKIM-Signature: v=1; a=rsa-sha256; d=${senderDomain}; s=202608...`,
          '',
          'Hello, this email follows the complete LAN Switch ➔ Gateway Router ➔ ISP ➔ DNS topology!'
        ]
      }
    },
    2: {
      title: `🔍 STEP 2 (EXTRA STEP): EXCHANGE ➔ SWITCH ➔ ROUTER ➔ ISP ➔ PUBLIC DNS (MX QUERY FOR @${recipientDomain.toUpperCase()})`,
      subtitle: `Exchange Server sends DNS query via Switch ➔ Local Router ➔ ISP to Public DNS (8.8.8.8) and receives resolved IP ${resolvedMxIp}!`,
      badge: `DNS MX RESOLUTION VIA ISP (${recipientDomain} ➔ ${resolvedMxIp})`,
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-500 animate-pulse',
      sender: 'MTA_LOCAL',
      target: 'DNS',
      payload: {
        stepName: `2. DNS MX Record Lookup via ISP DNS (${recipientDomain})`,
        protocol: 'DNS Query / Answer (RFC 1035 over UDP Port 53)',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:11:22:33:44:01 (Local Router Gateway)',
        l3Header: 'Src IP: 192.168.1.50 (Exchange Server) → Dst IP: 8.8.8.8 (Public DNS Server via ISP)',
        l4Header: 'UDP Src Port: 53100 → Dst Port: 53 (DNS Query)',
        cmdHandshake: `Query: MX ${recipientDomain} ➔ Exchange ➔ Switch ➔ Router ➔ ISP ➔ DNS 8.8.8.8 ➔ Answer: ${resolvedMxIp}`,
        archComponents: `Exchange Server (12%, 18%) ➔ Switch (28%, 43%) ➔ Router (40%, 43%) ➔ ISP (58%, 18%) ➔ DNS (58%, 48%)`,
        dataBody: [
          `;; QUESTION SECTION:`,
          `;; ${recipientDomain}. IN MX`,
          '',
          `;; ANSWER SECTION (from ISP Public DNS 8.8.8.8):`,
          `${recipientDomain}. 3600 IN MX 10 ${mxHost}.`,
          `${mxHost}. 3600 IN A ${resolvedMxIp}`,
          '',
          `Result: Exchange Server receives resolved destination IP ${resolvedMxIp} back via LAN Switch!`
        ]
      }
    },
    3: {
      title: `🌐 STEP 3: EXCHANGE ➔ SWITCH ➔ ROUTER ➔ ISP POP ➔ REMOTE ROUTER ➔ REMOTE MTA (PORT 25)`,
      subtitle: `Exchange Server sends mail via Switch ➔ Local Router ➔ ISP WAN ➔ Remote Router ➔ Remote MTA (${resolvedMxIp}) over Port 25!`,
      badge: `EXCHANGE ➔ SWITCH ➔ ROUTER ➔ ISP (PORT 25)`,
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'MTA_LOCAL',
      target: 'MTA_REMOTE',
      payload: {
        stepName: `3. SMTP MTA Relay (${senderDomain} ➔ ${recipientDomain})`,
        protocol: 'MTA Server Relay (RFC 5321)',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:11:22:33:44:01 (Local Router Gateway)',
        l3Header: `Src IP: 203.0.113.50 (Public WAN) → Dst IP: ${resolvedMxIp} (${mxHost})`,
        l4Header: 'TCP Src Port: 42100 → Dst Port: 25 (SMTP Server Relay)',
        cmdHandshake: `Handoff: Exchange (12%,18%) ➔ Switch (28%,43%) ➔ Router (40%,43%) ➔ ISP (58%,18%) ➔ Remote MTA (${resolvedMxIp}:25)`,
        archComponents: `Exchange Server ➔ LAN Switch ➔ Local Gateway Router ➔ ISP WAN ➔ Remote Router ➔ Inbound MTA (${resolvedMxIp})`,
        dataBody: [
          `Received: from mail.${senderDomain} (203.0.113.50) by ${mxHost} (${resolvedMxIp}) via ISP WAN with ESMTP id m20260801`,
          'X-Spam-Status: No, score=-1.0 required=5.0 (Rspamd / SpamAssassin)',
          'X-Virus-Scanned: ClamAV / Exchange Anti-Malware Engine',
          `Authentication-Results: spf=pass (IP 203.0.113.50 for ${senderDomain}) dkim=pass (${senderDomain}) dmarc=pass`,
          `Return-Path: <${senderEmail}>`,
          'Subject: Inter-Domain B2B Contract & Infrastructure Report'
        ]
      }
    },
    4: {
      title: mailProtocol === 'smtp_imap' 
        ? `📬 STEP 4: MDA DELIVERS TO ${recipientDomain.toUpperCase()} STORAGE ➔ MRA SERVES RECIPIENT MUA (IMAP4 993)`
        : `📥 STEP 4: MDA DELIVERS TO ${recipientDomain.toUpperCase()} STORAGE ➔ MRA SERVES RECIPIENT MUA (POP3 995)`,
      subtitle: mailProtocol === 'smtp_imap'
        ? `MDA writes mail to ${recipientDomain} storage. Recipient MUA (${recipientEmail}) connects to MRA via IMAP4 Port 993 (IMAPS).`
        : `MDA writes mail to ${recipientDomain} storage. Recipient MUA (${recipientEmail}) connects to MRA via POP3 Port 995 (POP3S).`,
      badge: mailProtocol === 'smtp_imap' ? 'MDA STORE ➔ MRA IMAP4 (PORT 993)' : 'MDA STORE ➔ MRA POP3 (PORT 995)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'MTA_REMOTE',
      target: 'RECIPIENT',
      payload: {
        stepName: mailProtocol === 'smtp_imap' ? '4. MDA Storage & MRA IMAP4 Sync' : '4. MDA Storage & MRA POP3 Download',
        protocol: mailProtocol === 'smtp_imap' ? 'MDA Storage & MRA IMAP4rev1 (RFC 3501)' : 'MDA Storage & MRA POP3 (RFC 1939)',
        l2Header: 'Src MAC: 00:11:22:33:44:66 → Dst MAC: 00:50:56:FE:ED:01 (Recipient PC)',
        l3Header: `Src IP: ${resolvedMxIp} (Mailbox Server) → Dst IP: 10.0.0.110 (Recipient PC)`,
        l4Header: mailProtocol === 'smtp_imap' ? 'TCP Src Port: 993 (IMAPS TLS) → Dst Port: 60100' : 'TCP Src Port: 995 (POP3S TLS) → Dst Port: 60101',
        cmdHandshake: mailProtocol === 'smtp_imap'
          ? `A1 LOGIN ${recipientEmail} **** ➔ A2 SELECT INBOX ➔ A3 FETCH 1 (FLAGS BODY[TEXT])`
          : `USER ${recipientEmail} ➔ PASS **** ➔ STAT ➔ RETR 1 ➔ DELE 1 ➔ QUIT`,
        archComponents: `Inbound MTA (${recipientDomain}) ➔ MDA ➔ Storage ➔ MRA ➔ Recipient MUA (${recipientEmail})`,
        dataBody: [
          mailProtocol === 'smtp_imap'
            ? `IMAP4 MRA: Multi-device sync enabled for ${recipientEmail}. Message stored in INBOX.`
            : `POP3 MRA: Downloaded to local storage for ${recipientEmail}. Server copy marked for deletion.`,
          `MDA Delivery Database: ${serverStack === 'exchange' ? 'Microsoft Exchange ESE (.edb) Store' : 'Linux Dovecot LDA (Maildir)'}`,
          'Status: Read / Unseen Synced (Switch-Router Topology Verified)',
          'Body Payload: Hello, this email follows the complete LAN Switch ➔ Gateway Router ➔ ISP ➔ DNS topology!'
        ]
      }
    }
  };

  const stepMetaIntra = {
    0: {
      title: 'Ready for Same-Domain (Intra-Domain) Mail Traversal',
      subtitle: `Watch packet: 1. MUA Submission ➔ 2. Internal MTA Relay ➔ 3. MRA Retrieval for ${senderEmail} ➔ ${recipientEmail}!`,
      badge: 'IDLE',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      sender: null,
      target: null
    },
    1: {
      title: '📩 STEP 1: SENDER MUA ➔ SWITCH ➔ EXCHANGE MSA/MTA (PORT 587 STARTTLS)',
      subtitle: `Sender MUA (Outlook at 12%, 68%) connects across LAN Switch (28%, 43%) to Exchange Server (12%, 18%) for ${senderEmail}.`,
      badge: 'MUA ➔ SWITCH ➔ EXCHANGE (TCP 587)',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500 animate-pulse',
      sender: 'CLIENT',
      target: 'MTA_LOCAL',
      payload: {
        stepName: '1. MUA to MSA Submission (Sender PC ➔ Switch ➔ Exchange)',
        protocol: 'MUA ➔ MSA Submission (RFC 6409 / RFC 5321)',
        l2Header: 'Src MAC: 00:50:56:A1:B2:C3 → Dst MAC: 00:0C:29:88:77:66 (Exchange Server)',
        l3Header: 'Src IP: 192.168.1.105 (Private) → Dst IP: 192.168.1.50 (Exchange Server)',
        l4Header: 'TCP Src Port: 59124 → Dst Port: 587 (SMTP Submission STARTTLS)',
        cmdHandshake: `EHLO mail.${senderDomain} ➔ STARTTLS ➔ AUTH PLAIN ➔ MAIL FROM:<${senderEmail}> ➔ RCPT TO:<${recipientEmail}>`,
        archComponents: `Sender MUA (Outlook) ➔ LAN Switch ➔ Local MSA (Mail Submission Agent for ${senderDomain})`,
        dataBody: [
          `From: "Student Trainee" <${senderEmail}>`,
          `To: "Department Boss" <${recipientEmail}>`,
          'Subject: Intra-Domain Internal Department Report',
          'Date: Sat, 01 Aug 2026 00:45:00 +0200',
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset=utf-8',
          '',
          'Hello Boss, internal intra-domain email delivered!'
        ]
      }
    },
    2: {
      title: `🌐 STEP 2: INTERNAL LOCAL MTA RELAY (PORT 25)`,
      subtitle: `Local MTA processes internal recipient "${recipientEmail}" within same domain. No external DNS MX or WAN transit required!`,
      badge: `INTERNAL MTA RELAY (${senderDomain})`,
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-500 animate-pulse',
      sender: 'MTA_LOCAL',
      target: 'MTA_REMOTE',
      payload: {
        stepName: '2. Internal Local MTA Relay',
        protocol: 'Internal Mail Delivery (RFC 5321)',
        l2Header: 'Src MAC: 00:0C:29:88:77:66 → Dst MAC: 00:11:22:33:44:66 (Local Store)',
        l3Header: 'Src IP: 192.168.1.50 (Local MTA) → Dst IP: 192.168.1.50 (Local Store)',
        l4Header: 'Internal Queue Handoff (No WAN Transit)',
        cmdHandshake: `Local Handoff: ${recipientEmail} in local domain ${senderDomain} ➔ 250 2.0.0 Delivered to MDA`,
        archComponents: `Local MTA (${senderDomain}) ➔ Internal Store Handoff ➔ MDA`,
        dataBody: [
          `Received: from student@dts.local by mail.dts.local with ESMTP id int20260801`,
          `Return-Path: <${senderEmail}>`,
          'Subject: Intra-Domain Internal Department Report'
        ]
      }
    },
    3: {
      title: mailProtocol === 'smtp_imap' 
        ? `📬 STEP 3: MDA DELIVERS TO STORAGE ➔ MRA SERVES RECIPIENT MUA (IMAP4 993)`
        : `📥 STEP 3: MDA DELIVERS TO STORAGE ➔ MRA SERVES RECIPIENT MUA (POP3 995)`,
      subtitle: mailProtocol === 'smtp_imap'
        ? `MDA writes mail to storage. Recipient MUA (${recipientEmail}) connects to MRA via IMAP4 Port 993 (IMAPS).`
        : `MDA writes mail to storage. Recipient MUA (${recipientEmail}) connects to MRA via POP3 Port 995 (POP3S).`,
      badge: mailProtocol === 'smtp_imap' ? 'MDA STORE ➔ MRA IMAP4 (PORT 993)' : 'MDA STORE ➔ MRA POP3 (PORT 995)',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500',
      sender: 'MTA_REMOTE',
      target: 'RECIPIENT',
      payload: {
        stepName: mailProtocol === 'smtp_imap' ? '3. MDA Storage & MRA IMAP4 Sync' : '3. MDA Storage & MRA POP3 Download',
        protocol: mailProtocol === 'smtp_imap' ? 'MDA Storage & MRA IMAP4rev1 (RFC 3501)' : 'MDA Storage & MRA POP3 (RFC 1939)',
        l2Header: 'Src MAC: 00:11:22:33:44:66 → Dst MAC: 00:50:56:FE:ED:01 (Recipient PC)',
        l3Header: 'Src IP: 192.168.1.50 (Mailbox Server) → Dst IP: 192.168.1.110 (Recipient PC)',
        l4Header: mailProtocol === 'smtp_imap' ? 'TCP Src Port: 993 (IMAPS TLS) → Dst Port: 60100' : 'TCP Src Port: 995 (POP3S TLS) → Dst Port: 60101',
        cmdHandshake: mailProtocol === 'smtp_imap'
          ? `A1 LOGIN ${recipientEmail} **** ➔ A2 SELECT INBOX ➔ A3 FETCH 1 (FLAGS BODY[TEXT])`
          : `USER ${recipientEmail} ➔ PASS **** ➔ STAT ➔ RETR 1 ➔ DELE 1 ➔ QUIT`,
        archComponents: `Local MTA ➔ MDA ➔ Storage ➔ MRA ➔ Recipient MUA (${recipientEmail})`,
        dataBody: [
          mailProtocol === 'smtp_imap'
            ? `IMAP4 MRA: Multi-device sync enabled for ${recipientEmail}. Message stored in INBOX.`
            : `POP3 MRA: Downloaded to local storage for ${recipientEmail}. Server copy marked for deletion.`,
          'Status: Read / Unseen Synced (Intra-Domain Local)',
          'Body Payload: Hello Boss, internal intra-domain email delivered!'
        ]
      }
    }
  };

  const stepMeta = domainMode === 'cross' ? stepMetaCross : stepMetaIntra;

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
  }, [isPlaying, activeStep, speed, isSingleStep, mailProtocol, serverStack, domainMode]);

  const handlePlayFull = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (activeStep === totalSteps) setActiveStep(1);
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
      { time: new Date().toLocaleTimeString(), tag: 'MAIL', message: `STEP ${nextStep}: ${meta.title}` }
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsSingleStep(false);
    setActiveStep(0);
    setPacketProgress(0);
    setLogs([{ time: new Date().toLocaleTimeString(), tag: 'MAIL', message: `Mail state reset. Active Mode: ${domainMode === 'cross' ? `Cross-Domain (@${senderDomain} ➔ Switch ➔ Router ➔ ISP ➔ DNS ➔ @${recipientDomain})` : 'Same-Domain (@dts.local)'}` }]);
  };

  const currentMeta = stepMeta[activeStep] || stepMeta[0];
  const isFinalStepComplete = activeStep === totalSteps;
  const activeModalData = modalPayloadStep ? stepMeta[modalPayloadStep]?.payload : null;
  const currentPayload = currentMeta.payload;

  // EXACT USER-DIRECTED TOPOLOGY COORDINATES (% of stage width/height):
  // 1. Exchange Server (Top-Left): (12%, 18%)
  // 2. Sender Client MUA PC-01 (Bottom-Left): (12%, 68%)
  // 3. Subnet A Switch (Middle-Left): (28%, 43%)
  // 4. Local Gateway Router (Center-Left down in middle close to switch): (40%, 43%)
  // 5. ISP Backbone Cloud (Top-Center WAN): (58%, 18%)
  // 6. ISP Public DNS Server (Middle-Center under ISP): (58%, 48%)
  // 7. Remote Gateway Router (Top-Right): (76%, 18%)
  // 8. Remote MDA/MRA Server (Center-Right): (76%, 68%)
  // 9. Recipient Client MUA PC-02 (Bottom-Right): (92%, 68%)

  const getPacketPos = () => {
    if (!isPlaying && activeStep === 0) return null;
    const p = packetProgress / 100; // 0 to 1

    if (domainMode === 'cross') {
      if (activeStep === 1) {
        // Step 1: Sender PC (12%, 68%) -> Switch (28%, 43%) -> Exchange Server (12%, 18%)
        if (packetProgress <= 50) {
          const t = packetProgress / 50;
          return {
            left: `${12 + t * 16}%`,
            top: `${68 - t * 25}%`,
            label: 'Sender PC ➔ Switch (Port 587)',
            bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
          };
        } else {
          const t = (packetProgress - 50) / 50;
          return {
            left: `${28 - t * 16}%`,
            top: `${43 - t * 25}%`,
            label: 'Switch ➔ Exchange MSA Submission',
            bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
          };
        }
      } else if (activeStep === 2) {
        // Step 2 (DNS MX QUERY VIA SWITCH ➔ ROUTER ➔ ISP ➔ DNS 8.8.8.8):
        // Phase 1 (0-50%): Exchange (12%, 18%) -> Switch (28%, 43%) -> Router (40%, 43%) -> ISP (58%, 18%) -> DNS (58%, 48%)
        // Phase 2 (50-100%): DNS (58%, 48%) -> ISP (58%, 18%) -> Router (40%, 43%) -> Switch (28%, 43%) -> Exchange (12%, 18%)
        if (packetProgress <= 50) {
          const t = packetProgress / 50;
          if (t <= 0.33) {
            const subT = t / 0.33;
            return {
              left: `${12 + subT * 16}%`,
              top: `${18 + subT * 25}%`,
              label: 'Exchange ➔ Switch Query',
              bgColor: 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-purple-500/50 animate-pulse'
            };
          } else if (t <= 0.66) {
            const subT = (t - 0.33) / 0.33;
            return {
              left: `${28 + subT * 12}%`,
              top: '43%',
              label: 'Switch ➔ Local Router',
              bgColor: 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-purple-500/50 animate-pulse'
            };
          } else {
            const subT = (t - 0.66) / 0.34;
            return {
              left: `${40 + subT * 18}%`,
              top: `${43 - subT * 25}%`,
              label: `Router ➔ ISP ➔ DNS Query: MX ${recipientDomain}?`,
              bgColor: 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-purple-500/50 animate-pulse'
            };
          }
        } else {
          // ANSWER RETURN: DNS (58%, 48%) -> ISP (58%, 18%) -> Router (40%, 43%) -> Switch (28%, 43%) -> Exchange (12%, 18%)
          const t = (packetProgress - 50) / 50;
          if (t <= 0.33) {
            const subT = t / 0.33;
            return {
              left: '58%',
              top: `${48 - subT * 30}%`,
              label: `DNS Answer ➔ ISP: ${resolvedMxIp}`,
              bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50'
            };
          } else if (t <= 0.66) {
            const subT = (t - 0.33) / 0.33;
            return {
              left: `${58 - subT * 18}%`,
              top: `${18 + subT * 25}%`,
              label: 'ISP ➔ Router',
              bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50'
            };
          } else {
            const subT = (t - 0.66) / 0.34;
            return {
              left: `${40 - subT * 28}%`,
              top: `${43 - subT * 25}%`,
              label: `Router ➔ Switch ➔ Exchange (${resolvedMxIp})`,
              bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50 animate-bounce'
            };
          }
        }
      } else if (activeStep === 3) {
        // Step 3: EXCHANGE ➔ SWITCH ➔ ROUTER ➔ ISP ➔ REMOTE ROUTER ➔ REMOTE MDA
        // Subphase 1 (0-25%): Exchange (12%, 18%) -> Switch (28%, 43%)
        // Subphase 2 (25-50%): Switch (28%, 43%) -> Local Router (40%, 43%)
        // Subphase 3 (50-75%): Local Router (40%, 43%) -> ISP (58%, 18%) -> Remote Router (76%, 18%)
        // Subphase 4 (75-100%): Remote Router (76%, 18%) -> Remote MDA Server (76%, 68%)
        if (packetProgress <= 25) {
          const t = packetProgress / 25;
          return {
            left: `${12 + t * 16}%`,
            top: `${18 + t * 25}%`,
            label: 'Exchange ➔ Switch (Port 25)',
            bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
          };
        } else if (packetProgress <= 50) {
          const t = (packetProgress - 25) / 25;
          return {
            left: `${28 + t * 12}%`,
            top: '43%',
            label: 'Switch ➔ Local Router',
            bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
          };
        } else if (packetProgress <= 75) {
          const t = (packetProgress - 50) / 25;
          return {
            left: `${40 + t * 36}%`,
            top: `${43 - t * 25}%`,
            label: `Router ➔ ISP WAN Relay (${senderDomain} ➔ ${recipientDomain})`,
            bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50 animate-pulse'
          };
        } else {
          const t = (packetProgress - 75) / 25;
          return {
            left: '76%',
            top: `${18 + t * 50}%`,
            label: `Remote Router ➔ ${recipientDomain} MTA`,
            bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
          };
        }
      } else if (activeStep === 4) {
        // Step 4: Remote MDA/MRA (76%, 68%) -> Recipient MUA (92%, 68%) (IMAP 993 / POP3 995)
        return {
          left: `${76 + p * 16}%`,
          top: '68%',
          label: mailProtocol === 'smtp_imap' ? 'MRA ➔ MUA IMAP4 (Port 993)' : 'MRA ➔ MUA POP3 (Port 995)',
          bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50 animate-bounce'
        };
      }
    } else {
      // SAME-DOMAIN TRAJECTORIES (3 STEPS):
      if (activeStep === 1) {
        if (packetProgress <= 50) {
          const t = packetProgress / 50;
          return {
            left: `${12 + t * 16}%`,
            top: `${68 - t * 25}%`,
            label: 'MUA ➔ Switch (Port 587)',
            bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
          };
        } else {
          const t = (packetProgress - 50) / 50;
          return {
            left: `${28 - t * 16}%`,
            top: `${43 - t * 25}%`,
            label: 'Switch ➔ Exchange Submission',
            bgColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/50'
          };
        }
      } else if (activeStep === 2) {
        return {
          left: `${12 + p * 64}%`,
          top: `${18 + p * 50}%`,
          label: 'Internal MTA Handoff ➔ MDA Store',
          bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-slate-950 shadow-blue-500/50'
        };
      } else if (activeStep === 3) {
        return {
          left: `${76 + p * 16}%`,
          top: '68%',
          label: mailProtocol === 'smtp_imap' ? 'MRA ➔ MUA IMAP4 (Port 993)' : 'MRA ➔ MUA POP3 (Port 995)',
          bgColor: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/50 animate-bounce'
        };
      }
    }
    return null;
  };

  const animPos = getPacketPos();

  // Active state lighting logic for architecture components (MUA, MSA, MTA, MDA, MRA)
  const isMUAActive = activeStep === 1 || activeStep === 4;
  const isMSAActive = activeStep === 1;
  const isMTAActive = activeStep === 1 || activeStep === 2 || activeStep === 3;
  const isMDAActive = activeStep === 4;
  const isMRAActive = activeStep === 4;

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP UNIFIED CONTROL & MAIL CONFIGURATION CARD */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3 shadow-2xl bg-slate-900/90 font-mono text-xs">
        <CleanWidget
          title="Enterprise Mail Architecture"
          subtitle={`Sending email from ${senderEmail} to ${recipientEmail}`}
          icon={Mail}
          ip={recipientDomain}
          protocol="SMTP / IMAP / POP3"
          port="Port 587 / 25 / 993"
          status={domainMode === 'cross' ? 'Cross-Domain MX Routing' : 'Intra-Domain Direct Delivery'}
          actionTitle={currentMeta.title}
          actionDesc={currentMeta.subtitle}
          stepNumber={activeStep}
          totalSteps={totalSteps}
          isPlaying={isPlaying}
          onPlay={handlePlayFull}
          onStep={handleStepForward}
          onReset={handleReset}
          speed={speed}
          setSpeed={setSpeed}
          showAnimation={showAnimation}
          setShowAnimation={setShowAnimation}
        />

        {/* COMBINED MAIL CONFIGURATION CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-[11px]">
          {/* Domain Routing Mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold">Mail Domain Mode:</span>
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => { setDomainMode('intra'); handleReset(); }}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                  domainMode === 'intra' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏢 Same Domain (@dts.local)
              </button>
              <button
                onClick={() => { setDomainMode('cross'); handleReset(); }}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  domainMode === 'cross' ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>🌐 Cross-Domain (DNS MX)</span>
              </button>
            </div>
          </div>

          {/* Server Stack */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold">Stack:</span>
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setServerStack('exchange')}
                className={`px-2 py-0.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                  serverStack === 'exchange' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                🪟 Exchange
              </button>
              <button
                onClick={() => setServerStack('postfix_dovecot')}
                className={`px-2 py-0.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                  serverStack === 'postfix_dovecot' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                🐧 Linux Stack
              </button>
            </div>
          </div>

          {/* Retrieval Protocol Mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-bold">Retrieval:</span>
            <select
              value={mailProtocol}
              onChange={(e) => setMailProtocol(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-cyan-300 font-bold focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="smtp_imap">IMAP4 (Port 993 IMAPS Sync)</option>
              <option value="smtp_pop3">POP3 (Port 995 POP3S Download)</option>
            </select>
          </div>
        </div>
      </div>

      {/* COMPACT STAGE LIGHTING CHIPS FOR ARCHITECTURE AGENTS (MUA, MSA, MTA, MDA, MRA) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
        {/* MUA Chip */}
        <div className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all duration-300 ${
          isMUAActive
            ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30 scale-105 animate-pulse font-extrabold'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center gap-2">
            <Laptop className={`w-4 h-4 ${isMUAActive ? 'text-cyan-300' : 'text-slate-500'}`} />
            <div>
              <p className="font-black text-xs">MUA</p>
              <p className="text-[9px] text-slate-400">User Agent</p>
            </div>
          </div>
          {isMUAActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
        </div>

        {/* MSA Chip */}
        <div className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all duration-300 ${
          isMSAActive
            ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30 scale-105 animate-pulse font-extrabold'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center gap-2">
            <Send className={`w-4 h-4 ${isMSAActive ? 'text-amber-300' : 'text-slate-500'}`} />
            <div>
              <p className="font-black text-xs">MSA</p>
              <p className="text-[9px] text-slate-400">Port 587 Auth</p>
            </div>
          </div>
          {isMSAActive && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
        </div>

        {/* MTA Chip */}
        <div className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all duration-300 ${
          isMTAActive
            ? 'bg-blue-950/90 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/30 scale-105 animate-pulse font-extrabold'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center gap-2">
            <Server className={`w-4 h-4 ${isMTAActive ? 'text-blue-300' : 'text-slate-500'}`} />
            <div>
              <p className="font-black text-xs">MTA</p>
              <p className="text-[9px] text-slate-400">Port 25 Relay</p>
            </div>
          </div>
          {isMTAActive && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
        </div>

        {/* MDA Chip */}
        <div className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all duration-300 ${
          isMDAActive
            ? 'bg-purple-950/90 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/30 scale-105 animate-pulse font-extrabold'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center gap-2">
            <Inbox className={`w-4 h-4 ${isMDAActive ? 'text-purple-300' : 'text-slate-500'}`} />
            <div>
              <p className="font-black text-xs">MDA</p>
              <p className="text-[9px] text-slate-400">Local Delivery</p>
            </div>
          </div>
          {isMDAActive && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
        </div>

        {/* MRA Chip */}
        <div className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-all duration-300 ${
          isMRAActive
            ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30 scale-105 animate-pulse font-extrabold'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-60'
        }`}>
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isMRAActive ? 'text-emerald-300' : 'text-slate-500'}`} />
            <div>
              <p className="font-black text-xs">MRA</p>
              <p className="text-[9px] text-slate-400">IMAP/POP3 Sync</p>
            </div>
          </div>
          {isMRAActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
        </div>
      </div>

      {/* Dynamic Action Status Banner (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && (
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
      )}

      {/* ENLARGED MULTI-TIER TOPOLOGY STAGE WITH EXACT USER-SPECIFIED NODE POSITIONS & WIRES */}
      <div className={`py-8 px-4 relative bg-slate-950/70 rounded-3xl border border-slate-800/80 overflow-hidden font-mono select-none ${appMode !== 'detailed' && appMode !== 'expert' ? 'min-h-[520px]' : 'min-h-[660px]'}`}>
        
        {/* NETWORK BOUNDARY CONTAINERS */}
        {/* Private Subnet A Container */}
        <div className="absolute left-[2%] top-[4%] w-[32%] h-[92%] border-2 border-dashed border-amber-800/40 bg-amber-950/20 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/90 text-amber-400 border border-amber-800 shadow">
            SENDER SUBNET A (@{senderDomain})
          </span>
        </div>

        {/* Public WAN & ISP Transit Container */}
        <div className="absolute left-[36%] top-[4%] w-[42%] h-[58%] border-2 border-dashed border-purple-800/40 bg-purple-950/20 rounded-3xl pointer-events-none">
          <span className="absolute top-3 left-1/2 transform -translate-x-1/2 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-600 shadow">
            PUBLIC WAN & ISP BACKBONE (DNS MX: {domainMode === 'cross' ? `${recipientDomain} ➔ ${resolvedMxIp}` : 'Intra-Domain Direct'})
          </span>
        </div>

        {/* Private Subnet B Container */}
        <div className="absolute right-[2%] top-[4%] w-[22%] h-[92%] border-2 border-dashed border-emerald-800/40 bg-emerald-950/20 rounded-3xl pointer-events-none">
          <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-800 shadow">
            RECIPIENT SUBNET B (@{recipientDomain})
          </span>
        </div>

        {/* VISIBLE MULTI-TIER NETWORK CONNECTION LINES (WIRES) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Cable 1: Sender PC-01 (12%, 68%) -> Subnet A Switch (28%, 43%) */}
          <line x1="12%" y1="68%" x2="28%" y2="43%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 2: Exchange Server (12%, 18%) -> Subnet A Switch (28%, 43%) */}
          <line x1="12%" y1="18%" x2="28%" y2="43%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 3: Subnet A Switch (28%, 43%) -> Local Gateway Router (40%, 43%) [Switch to Router] */}
          <line x1="28%" y1="43%" x2="40%" y2="43%" stroke="#3b82f6" strokeWidth="5" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.9" />

          {/* Cable 4: Local Gateway Router (40%, 43%) -> ISP Telecom POP (58%, 18%) [Router to ISP] */}
          <line x1="40%" y1="43%" x2="58%" y2="18%" stroke="#10b981" strokeWidth="5" strokeDasharray="10 6" className="animate-wire-dash" strokeOpacity="0.9" />

          {/* Cable 5: ISP Telecom POP (58%, 18%) -> ISP Public DNS (58%, 48%) [ISP to DNS] */}
          {domainMode === 'cross' && (
            <line x1="58%" y1="18%" x2="58%" y2="48%" stroke="#a855f7" strokeWidth="5" strokeDasharray="6 4" className="animate-wire-dash" strokeOpacity="0.95" />
          )}

          {/* Cable 6: ISP Telecom POP (58%, 18%) -> Remote Router (76%, 18%) [ISP to Remote Router] */}
          <line x1="58%" y1="18%" x2="76%" y2="18%" stroke="#10b981" strokeWidth="5" strokeDasharray="10 6" className="animate-wire-dash" strokeOpacity="0.9" />

          {/* Cable 7: Remote Router (76%, 18%) -> Remote MDA/MRA Server (76%, 68%) */}
          <line x1="76%" y1="18%" x2="76%" y2="68%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />

          {/* Cable 8: Remote MDA/MRA Server (76%, 68%) -> Recipient PC-02 (92%, 68%) */}
          <line x1="76%" y1="68%" x2="92%" y2="68%" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" strokeOpacity="0.8" />
        </svg>

        {/* 1. EXCHANGE SERVER (TOP-LEFT: 12%, 18%) */}
        <div className="absolute left-[12%] top-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-700 shadow font-extrabold">
            {serverStack === 'exchange' ? 'Exchange MSA & Outbound MTA' : 'Postfix MSA (587) & MTA (25)'}
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            activeStep === 1 || (domainMode === 'cross' ? (activeStep === 2 || activeStep === 3) : activeStep === 2) ? 'bg-blue-950 border-blue-400 shadow-2xl scale-105' : 'bg-slate-900 border-slate-700'
          }`}>
            <Server className="w-12 h-12 text-blue-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-blue-300">
              {serverStack === 'exchange' ? 'EXCHANGE-MSA-MTA' : 'POSTFIX-MSA-MTA'}
            </p>
            <p className="text-[10px] text-slate-400">192.168.1.50 (mail.{senderDomain})</p>
          </div>
        </div>

        {/* 2. SENDER CLIENT MUA PC-01 (BOTTOM-LEFT: 12%, 68%) */}
        <div className="absolute left-[12%] top-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
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
            <p className="text-[10px] text-amber-300 font-bold max-w-[130px] truncate">{senderEmail}</p>
          </div>
        </div>

        {/* 3. SUBNET A SWITCH (MIDDLE-LEFT: 28%, 43%) */}
        <div className="absolute left-[28%] top-[43%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-blue-950 text-blue-300 border border-blue-700 shadow font-bold">
            Subnet A Switch
          </span>
          <div className="p-4 rounded-2xl border-2 bg-slate-900 border-slate-700">
            <Layers className="w-9 h-9 text-blue-400" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-bold text-blue-300">LAN SWITCH</p>
          </div>
        </div>

        {/* 4. LOCAL GATEWAY ROUTER (CENTER-LEFT DOWN IN MIDDLE CLOSE TO SWITCH: 40%, 43%) */}
        <div className="absolute left-[40%] top-[43%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-amber-950 text-amber-300 border border-amber-600 shadow font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" /> LOCAL ROUTER
          </span>
          <div className={`p-4 rounded-2xl border-4 transition-all ${
            domainMode === 'cross' && (activeStep === 2 || activeStep === 3) ? 'bg-amber-900/90 border-amber-400 shadow-2xl scale-110' : 'bg-slate-900 border-slate-700'
          }`}>
            <Router className="w-10 h-10 text-amber-400" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-extrabold text-amber-300">ROUTER-GW-01</p>
            <p className="text-slate-400">203.0.113.1 (WAN)</p>
          </div>
        </div>

        {/* 5. ISP TELECOM POP / INTERNET BACKBONE CLOUD (TOP-CENTER: 58%, 18%) */}
        <div className="absolute left-[58%] top-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] bg-sky-950 text-sky-300 border border-sky-500 shadow-2xl shadow-sky-500/50 font-black flex items-center gap-1 animate-pulse">
            <Cloud className="w-3.5 h-3.5 text-sky-400" /> ISP WAN CLOUD 🌐
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            (domainMode === 'cross' && (activeStep === 2 || (activeStep === 3 && packetProgress > 25 && packetProgress < 75)))
              ? 'bg-sky-950 border-sky-400 shadow-2xl shadow-sky-500/60 scale-110 animate-bounce'
              : 'bg-slate-900 border-sky-500/60'
          }`}>
            <Cloud className="w-12 h-12 text-sky-400 animate-pulse" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-black text-sky-300">INTERNET ISP WAN</p>
            <p className="text-sky-400 font-bold">MX WAN Transit</p>
          </div>
        </div>

        {/* 6. ISP PUBLIC DNS SERVER (MIDDLE-CENTER DIRECTLY CONNECTED TO ISP: 58%, 48%) */}
        <div className="absolute left-[58%] top-[48%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-purple-950 text-purple-300 border border-purple-600 shadow-xl flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-purple-400" /> ISP PUBLIC DNS (8.8.8.8)
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            domainMode === 'cross' && activeStep === 2 ? 'bg-purple-900 border-purple-400 shadow-2xl shadow-purple-500/60 scale-110 animate-bounce' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-11 h-11 text-purple-400" />
          </div>
          <div className="font-mono text-[10px] text-center">
            <p className="font-extrabold text-purple-300">ISP DNS MX RESOLVER</p>
            <p className="text-purple-400 font-bold">MX {recipientDomain} ➔ {resolvedMxIp}</p>
          </div>
        </div>

        {/* 7. REMOTE GATEWAY ROUTER (TOP-RIGHT: 76%, 18%) */}
        <div className="absolute left-[76%] top-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-amber-950 text-amber-300 border border-amber-600 shadow font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" /> REMOTE ROUTER
          </span>
          <div className={`p-4 rounded-2xl border-4 transition-all ${
            domainMode === 'cross' && activeStep === 3 && packetProgress >= 50 ? 'bg-amber-900/90 border-amber-400 shadow-2xl scale-110' : 'bg-slate-900 border-amber-500/60'
          }`}>
            <Router className="w-10 h-10 text-amber-400" />
          </div>
          <div className="text-center text-[10px]">
            <p className="font-extrabold text-amber-300">REMOTE-GW-02</p>
            <p className="text-slate-400">198.51.100.1 (WAN)</p>
          </div>
        </div>

        {/* 8. DESTINATION INBOUND MDA / MRA SERVER (CENTER-RIGHT: 76%, 68%) */}
        <div className="absolute left-[76%] top-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-purple-950 text-purple-300 border border-purple-700 shadow font-extrabold">
            {serverStack === 'exchange' ? `Exchange MDA (${recipientDomain})` : `Dovecot MDA/MRA (${recipientDomain})`}
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            (domainMode === 'cross' ? (activeStep === 3 || activeStep === 4) : (activeStep === 2 || activeStep === 3)) ? 'bg-purple-950 border-purple-400 shadow-2xl scale-105' : 'bg-slate-900 border-purple-500/60'
          }`}>
            <Server className="w-12 h-12 text-purple-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-purple-300">
              {serverStack === 'exchange' ? 'EXCHANGE-MDA-MRA' : 'DOVECOT-MDA-MRA'}
            </p>
            <p className="text-[10px] text-slate-400">{resolvedMxIp} ({mxHost})</p>
          </div>
        </div>

        {/* 9. RECIPIENT CLIENT MUA PC-02 (BOTTOM-RIGHT: 92%, 68%) */}
        <div className="absolute left-[92%] top-[68%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700 shadow font-extrabold">
            Recipient MUA (Outlook)
          </span>
          <div className={`p-5 rounded-3xl border-4 transition-all duration-300 ${
            (domainMode === 'cross' ? activeStep === 4 : activeStep === 3) ? 'bg-emerald-950 border-emerald-400 shadow-2xl scale-110' : 'bg-slate-900 border-cyan-500/60'
          }`}>
            <Laptop className="w-11 h-11 text-cyan-400" />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-xs font-extrabold text-cyan-300">RECIPIENT-MUA-02</p>
            <p className="text-[10px] text-cyan-300 font-bold max-w-[130px] truncate">{recipientEmail}</p>
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

      {/* STEP INSPECTION CARDS & LOGS (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && (
        <SlideOutInspector title="Slide Out Technical Deep Dive & Wire Logs">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
              {(domainMode === 'cross' ? [1, 2, 3, 4] : [1, 2, 3]).map((stepNum) => {
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

            <TerminalLog logs={logs} onClear={() => setLogs([])} />
          </div>
        </SlideOutInspector>
      )}
    </div>
  );
}
