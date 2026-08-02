import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  Globe, 
  Server, 
  Laptop, 
  Router, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Gauge, 
  Zap, 
  Layers, 
  Cpu, 
  Radio, 
  SkipForward, 
  FileCode, 
  ArrowRight, 
  Terminal,
  Sliders,
  Shield,
  Eye,
  Send,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Cloud
} from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';

export default function FirewallVPNModule({ appMode = 'clean' }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('stateful'); // 'stateful', 'nat', 'vpn', 'tls'
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [packetProgress, setPacketProgress] = useState(0);

  // Stateful Firewall Interactive State
  const [selectedService, setSelectedService] = useState('https'); // 'https', 'ssh', 'rdp', 'icmp', 'telnet'
  const [firewallAction, setFirewallAction] = useState(null); // 'ALLOW' or 'DROP'
  const [inspectionDetail, setInspectionDetail] = useState(null);

  // Custom Firewall Rules Table State
  const [fwRules, setFwRules] = useState([
    { id: 101, src: '192.168.1.0/24', dst: 'ANY', port: '443 (HTTPS)', protocol: 'TCP', state: 'NEW, ESTABLISHED', action: 'ACCEPT', desc: 'Allow Secure Web Browsing' },
    { id: 102, src: '192.168.1.0/24', dst: '203.0.113.10', port: '22 (SSH)', protocol: 'TCP', state: 'NEW, ESTABLISHED', action: 'ACCEPT', desc: 'Allow IT Admin Management SSH' },
    { id: 103, src: '192.168.1.0/24', dst: 'ANY', port: '80 (HTTP)', protocol: 'TCP', state: 'NEW, ESTABLISHED', action: 'ACCEPT', desc: 'Allow Web Traffic' },
    { id: 104, src: 'ANY', dst: 'ANY', port: '3389 (RDP)', protocol: 'TCP', state: 'ANY', action: 'DROP', desc: 'Block Insecure Remote Desktop (RDP)' },
    { id: 105, src: 'ANY', dst: 'ANY', port: '23 (TELNET)', protocol: 'TCP', state: 'ANY', action: 'DROP', desc: 'Block Unencrypted Telnet Traffic' },
    { id: 106, src: '192.168.1.0/24', dst: '8.8.8.8', port: 'ICMP (PING)', protocol: 'ICMP', state: 'NEW', action: 'ACCEPT', desc: 'Allow Outbound Ping Diagnostics' },
  ]);

  // VPN Tunnel Phase Steps
  const vpnSteps = [
    { title: 'Ready for IPsec VPN Tunneling', subtitle: 'Branch Gateway (192.168.10.1) & HQ Gateway (172.16.0.1) connected over Public WAN Internet.' },
    { title: '🔑 PHASE 1: IKEv2 / Diffie-Hellman Key Exchange', subtitle: 'Gateways negotiate Security Association (SA), exchange DH public keys, and create secure IKE SA channel (UDP Port 500).' },
    { title: '🔒 PHASE 2: IPsec ESP Tunnel & Encryption (AES-256)', subtitle: 'Data payload from Branch LAN is wrapped in IPsec ESP header, encrypted with AES-256-GCM, and authenticated with HMAC SHA-256.' },
    { title: '🌐 TRANSIT OVER UNTRUSTED PUBLIC WAN', subtitle: 'Encrypted ESP packet transits public internet routers. Eavesdroppers only see encrypted noise payload!' },
    { title: '✅ DECAPSULATION AT HQ GATEWAY', subtitle: 'HQ Gateway decrypts ESP payload using shared secret key and delivers cleartext packet to HQ Internal Server (172.16.0.50).' }
  ];

  // TLS 1.3 Handshake Steps
  const tlsSteps = [
    { title: 'Ready for TLS 1.3 Encrypted Handshake', subtitle: 'Client Browser (192.168.1.105) preparing to negotiate encrypted HTTPS session with Web Server (93.184.216.34).' },
    { title: '🤝 STEP 1: CLIENT HELLO + KEY SHARE', subtitle: 'Client sends TLS ClientHello offering supported cipher suites (TLS_AES_256_GCM_SHA384) + ECDHE key share parameters.' },
    { title: '📜 STEP 2: SERVER HELLO + CERTIFICATE + FINISHED', subtitle: 'Server agrees on cipher suite, sends ECDHE key share, X.509 Server Certificate, CertificateVerify signature, and Server Finished message.' },
    { title: '🔐 STEP 3: SYMMETRIC KEY DERIVATION & CLIENT FINISHED', subtitle: 'Client verifies certificate chain, calculates symmetric Session Key using ECDHE secret, and returns Client Finished message.' },
    { title: '✅ ENCRYPTED APPLICATION DATA STREAM', subtitle: 'All subsequent HTTP data is encrypted via AES-256-GCM with zero-overhead symmetric encryption!' }
  ];

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'FIREWALL', message: 'Enterprise Stateful Firewall & VPN Security Engine initialized. Rules active.' }
  ]);

  // Handle Packet Animation Interval
  useEffect(() => {
    let timer;
    let anim;
    if (isPlaying) {
      setPacketProgress(0);
      anim = setInterval(() => {
        setPacketProgress(prev => Math.min(100, prev + 3));
      }, 30 / speed);

      const currentTotalSteps = activeSubTab === 'vpn' ? 4 : activeSubTab === 'tls' ? 4 : 1;

      timer = setTimeout(() => {
        if (activeStep < currentTotalSteps) {
          const next = activeStep + 1;
          setActiveStep(next);
          const metaTitle = activeSubTab === 'vpn' ? vpnSteps[next].title : activeSubTab === 'tls' ? tlsSteps[next].title : 'Firewall Inspection Complete';
          setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: activeSubTab.toUpperCase(), message: metaTitle }]);
        } else {
          setIsPlaying(false);
        }
      }, 2500 / speed);
    }
    return () => {
      clearInterval(anim);
      clearTimeout(timer);
    };
  }, [isPlaying, activeStep, speed, activeSubTab]);

  // Custom Rule Creation Modal State
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({
    src: '192.168.1.0/24',
    dst: 'ANY',
    port: '8080 (CUSTOM)',
    protocol: 'TCP',
    state: 'NEW, ESTABLISHED',
    action: 'ACCEPT',
    desc: 'Custom App Rule'
  });

  const handleToggleRuleAction = (id) => {
    setFwRules(prev => prev.map(r => r.id === id ? { ...r, action: r.action === 'ACCEPT' ? 'DROP' : 'ACCEPT' } : r));
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'ACL_EDIT', message: `Toggled Rule #${id} action.` }]);
  };

  const handleDeleteRule = (id) => {
    setFwRules(prev => prev.filter(r => r.id !== id));
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'ACL_DELETE', message: `Deleted Rule #${id} from ACL table.` }]);
  };

  const handleMoveRule = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fwRules.length) return;
    const updated = [...fwRules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFwRules(updated);
  };

  const handleAddRule = () => {
    const nextId = fwRules.length > 0 ? Math.max(...fwRules.map(r => r.id)) + 1 : 101;
    const created = { id: nextId, ...newRule };
    setFwRules([created, ...fwRules]);
    setShowAddRuleModal(false);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'ACL_ADD', message: `Added Rule #${nextId}: ${created.desc}` }]);
  };

  // Send Custom Packet Through Stateful Firewall
  const handleTestFirewallPacket = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    setPacketProgress(0);
    setActiveStep(1);

    const servicePortMap = {
      http: { port: 80, name: 'HTTP Web Unencrypted (Port 80)', proto: 'TCP', dst: '93.184.216.34' },
      https: { port: 443, name: 'HTTPS Secure Web (Port 443)', proto: 'TCP', dst: '93.184.216.34' },
      ssh: { port: 22, name: 'SSH Secure Shell (Port 22)', proto: 'TCP', dst: '203.0.113.10' },
      rdp: { port: 3389, name: 'RDP Remote Desktop (Port 3389)', proto: 'TCP', dst: '203.0.113.50' },
      telnet: { port: 23, name: 'Telnet Plaintext Admin (Port 23)', proto: 'TCP', dst: '203.0.113.99' },
      ftp: { port: 21, name: 'FTP File Transfer (Port 21)', proto: 'TCP', dst: '198.51.100.22' },
      mysql: { port: 3306, name: 'MySQL Database Query (Port 3306)', proto: 'TCP', dst: '10.0.0.50' },
      smb: { port: 445, name: 'SMB Windows Share (Port 445)', proto: 'TCP', dst: '192.168.1.200' },
      dns: { port: 53, name: 'DNS Hostname Query (Port 53)', proto: 'UDP', dst: '8.8.8.8' },
      smtp: { port: 25, name: 'SMTP Mail Server (Port 25)', proto: 'TCP', dst: '172.16.0.25' },
      icmp: { port: 0, name: 'ICMP Echo Ping Diagnostic', proto: 'ICMP', dst: '8.8.8.8' }
    };

    const target = servicePortMap[selectedService] || servicePortMap.https;
    
    // Evaluate against user-configured firewall rules top-to-bottom
    let matchedRule = null;
    for (const r of fwRules) {
      const protoMatch = r.protocol === 'ANY' || r.protocol === target.proto;
      const portStr = target.port.toString();
      const portMatch = r.port.includes('ANY') || r.port.includes(portStr) || (target.proto === 'ICMP' && r.protocol === 'ICMP');
      if (protoMatch && portMatch) {
        matchedRule = r;
        break; // First matching rule wins (Top-to-Bottom ACL)
      }
    }

    const isAllowed = matchedRule ? matchedRule.action === 'ACCEPT' : false;
    setFirewallAction(isAllowed ? 'ALLOW' : 'DROP');

    setInspectionDetail({
      srcIp: '192.168.1.105:52310',
      dstIp: `${target.dst}:${target.port || 'ICMP'}`,
      service: target.name,
      matchedRuleId: matchedRule ? `Rule #${matchedRule.id} (${matchedRule.desc})` : 'DEFAULT DROP RULE',
      state: 'NEW (TCP SYN)',
      verdict: isAllowed ? 'PASSED (ACCEPT)' : 'BLOCKED (DROP)'
    });

    setLogs(prev => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        tag: isAllowed ? 'FIREWALL_ACCEPT' : 'FIREWALL_DROP',
        message: `Packet ${target.name} from 192.168.1.105 to ${target.dst}: Rule #${matchedRule ? matchedRule.id : 'DEF'} -> VERDICT: ${isAllowed ? 'ACCEPT 🟢' : 'DROP 🔴'}`
      }
    ]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
    setPacketProgress(0);
    setFirewallAction(null);
    setInspectionDetail(null);
  };

  // Unified Simulation Control Handlers for all 4 Sub-Modules (SPI, PAT, IPsec VPN, TLS 1.3)
  const handlePlayActiveTab = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (activeSubTab === 'stateful') {
      handleTestFirewallPacket();
    } else {
      const maxSteps = activeSubTab === 'vpn' ? 4 : activeSubTab === 'tls' ? 4 : 2;
      if (activeStep >= maxSteps) setActiveStep(1);
      else if (activeStep === 0) setActiveStep(1);
      setIsPlaying(true);
    }
  };

  const handleStepActiveTab = () => {
    const maxSteps = activeSubTab === 'vpn' ? 4 : activeSubTab === 'tls' ? 4 : 2;
    if (activeStep >= maxSteps) return;
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    setIsPlaying(true);
  const metaTitle = activeSubTab === 'vpn' ? vpnSteps[nextStep]?.title : activeSubTab === 'tls' ? tlsSteps[nextStep]?.title : `NAT PAT Overload Step ${nextStep}`;
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: activeSubTab.toUpperCase(), message: metaTitle }]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* SINGLE UNIFIED TOP CARD (COMBINED CLEAN WIDGET + LAB SECURITY MODES + TRAFFIC SELECTOR) */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-3 shadow-2xl bg-slate-900/90 font-mono text-xs">
        {/* TOP ROW: CLEAN WIDGET HEADER */}
        <CleanWidget
          title="Stateful Firewall, NAT & VPN Security Lab"
          subtitle="L4-L7 Deep Packet Inspection & Security Rules"
          icon={ShieldCheck}
          ip={activeSubTab === 'stateful' ? '192.168.1.105 (LAN) → 8.8.8.8' : activeSubTab === 'nat' ? '192.168.1.10 ➔ 203.0.113.1 (PAT)' : activeSubTab === 'vpn' ? '192.168.10.1 ➔ 172.16.0.1 (IPsec)' : '192.168.1.105 ➔ 93.184.216.34'}
          protocol={activeSubTab === 'stateful' ? selectedService.toUpperCase() : activeSubTab === 'nat' ? 'PAT Overload' : activeSubTab === 'vpn' ? 'IPsec ESP (AES-256)' : 'TLS 1.3 (ECDHE)'}
          port={activeSubTab === 'stateful' ? (selectedService === 'https' ? 443 : selectedService === 'ssh' ? 22 : selectedService === 'rdp' ? 3389 : selectedService === 'telnet' ? 23 : 'ICMP') : activeSubTab === 'nat' ? 'Ephemeral 40001' : activeSubTab === 'vpn' ? 'UDP 500 / ESP 50' : 'Port 443'}
          status={activeSubTab === 'stateful' ? (firewallAction === 'ALLOW' ? '🟢 ALLOWED' : firewallAction === 'DROP' ? '🔴 DROPPED' : 'Ready') : activeSubTab === 'nat' ? 'Stateful PAT Table Active' : activeSubTab === 'vpn' ? `VPN Phase ${activeStep}/4` : `TLS Step ${activeStep}/4`}
          actionTitle={activeSubTab === 'stateful' ? (firewallAction ? `Verdict: ${firewallAction}` : 'Ready to Send Packet') : activeSubTab === 'nat' ? 'Port Address Translation' : activeSubTab === 'vpn' ? vpnSteps[activeStep].title : tlsSteps[activeStep].title}
          actionDesc={activeSubTab === 'stateful' ? (firewallAction === 'ALLOW' ? '🟢 PERMITTED: Traffic passed firewall rule inspection!' : firewallAction === 'DROP' ? '🔴 BLOCKED: Traffic dropped by firewall rule!' : 'Select traffic service and click Play in top right.') : activeSubTab === 'nat' ? 'Rewriting private IP to public WAN IP' : activeSubTab === 'vpn' ? vpnSteps[activeStep].subtitle : tlsSteps[activeStep].subtitle}
          isPlaying={isPlaying}
          onPlay={handlePlayActiveTab}
          onStep={handleStepActiveTab}
          onReset={handleReset}
          speed={speed}
          setSpeed={setSpeed}
          showAnimation={showAnimation}
          setShowAnimation={setShowAnimation}
        />

        {/* BOTTOM ROW: LAB SECURITY MODE TABS & TRAFFIC SELECTOR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
          {/* Mode Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'stateful', label: 'Stateful Firewall (SPI)', icon: ShieldCheck },
              { id: 'nat', label: 'NAT / PAT Engine', icon: Router },
              { id: 'vpn', label: 'IPsec VPN Tunnel', icon: Lock },
              { id: 'tls', label: 'TLS 1.3 Handshake', icon: Key },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveSubTab(tab.id); handleReset(); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer text-[11px] ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Traffic Service Selector & Add Rule Button (Only when Stateful Firewall active) */}
          {activeSubTab === 'stateful' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                <Send className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-400 font-bold">Traffic Service:</span>
                <select
                  value={selectedService}
                  onChange={(e) => { setSelectedService(e.target.value); handleReset(); }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-300 focus:outline-none cursor-pointer"
                >
                  <optgroup label="🌐 Web Services">
                    <option value="https">HTTPS Secure Web (Port 443)</option>
                    <option value="http">HTTP Web Unencrypted (Port 80)</option>
                  </optgroup>
                  <optgroup label="🔑 Admin Access">
                    <option value="ssh">SSH Secure Shell (Port 22)</option>
                    <option value="rdp">RDP Remote Desktop (Port 3389)</option>
                    <option value="telnet">Telnet Plaintext Admin (Port 23)</option>
                  </optgroup>
                  <optgroup label="💾 Data & File">
                    <option value="ftp">FTP File Transfer (Port 21)</option>
                    <option value="mysql">MySQL DB Query (Port 3306)</option>
                    <option value="smb">SMB File Share (Port 445)</option>
                  </optgroup>
                  <optgroup label="🛠️ Core Services">
                    <option value="dns">DNS Query (Port 53)</option>
                    <option value="smtp">SMTP Mail (Port 25)</option>
                    <option value="icmp">ICMP Ping</option>
                  </optgroup>
                </select>
              </div>

              <button
                onClick={() => setShowAddRuleModal(true)}
                className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                title="Add Custom Firewall Rule"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Rule</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: STATEFUL FIREWALL INSPECTION (SPI) */}
      {activeSubTab === 'stateful' && (
        <div className="space-y-4">

          {/* VISUAL FIREWALL TOPOLOGY STAGE */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden bg-slate-950/70 min-h-[380px]">
            
            {/* Connection Wires */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Cable 1: PC (15%) -> Firewall (50%) */}
              <line x1="15%" y1="50%" x2="50%" y2="50%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 6" className="animate-wire-dash" />
              
              {/* Cable 2: Firewall (50%) -> Target Server (85%) */}
              <line
                x1="50%"
                y1="50%"
                x2="85%"
                y2="50%"
                stroke={firewallAction === 'DROP' ? '#ef4444' : firewallAction === 'ALLOW' ? '#10b981' : '#475569'}
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-wire-dash"
              />
            </svg>

            {/* Stage Nodes */}
            <div className="relative z-10 flex items-center justify-between h-[300px] px-8">
              
              {/* Source LAN Client */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-lg text-center w-44">
                <Laptop className="w-10 h-10 text-cyan-400" />
                <span className="font-bold text-slate-100">Workstation PC-01</span>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">192.168.1.105</span>
              </div>

              {/* Stateful Inspection Firewall Engine */}
              <div className={`flex flex-col items-center gap-2 p-5 rounded-3xl border shadow-2xl text-center w-52 transition-all duration-300 ${
                firewallAction === 'ALLOW'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-500/20'
                  : firewallAction === 'DROP'
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-rose-500/20'
                  : 'bg-slate-900/95 border-rose-500/40 text-slate-100'
              }`}>
                {firewallAction === 'ALLOW' ? (
                  <ShieldCheck className="w-12 h-12 text-emerald-400 animate-bounce" />
                ) : firewallAction === 'DROP' ? (
                  <ShieldAlert className="w-12 h-12 text-rose-400 animate-pulse" />
                ) : (
                  <Shield className="w-12 h-12 text-rose-400" />
                )}
                <span className="font-extrabold text-sm">FortiGate Firewall</span>
                <span className="text-[10px] font-mono opacity-80 uppercase">Stateful Inspection Engine</span>
              </div>

              {/* Target Internet Server */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-lg text-center w-44">
                <Server className="w-10 h-10 text-purple-400" />
                <span className="font-bold text-purple-300">Target Server</span>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">203.0.113.99 / WAN</span>
              </div>
            </div>

            {/* ANIMATED PACKET OVERLAY */}
            {isPlaying && (
              <div
                style={{
                  left: `${
                    firewallAction === 'DROP' && packetProgress > 50
                      ? 50
                      : 15 + (packetProgress / 100) * 70
                  }%`,
                  top: '50%'
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full font-mono font-black text-xs shadow-2xl z-30 border-2 border-white flex items-center gap-1.5 transition-all duration-75 ${
                  firewallAction === 'DROP' && packetProgress >= 50
                    ? 'bg-rose-600 text-white animate-ping'
                    : firewallAction === 'ALLOW'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-cyan-400 text-slate-950'
                }`}
              >
                {firewallAction === 'DROP' && packetProgress >= 50 ? (
                  <>
                    <XCircle className="w-4 h-4" /> 🛑 DROPPED BY RULE
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> {selectedService.toUpperCase()} Packet
                  </>
                )}
              </div>
            )}
          </div>

          {/* INTERACTIVE FIREWALL RULE SETTER QUICK BAR (SETTABLE IN ALL MODES) */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-slate-200 font-extrabold text-xs">Active Firewall Rules (Click Action Badge to ACCEPT ↔ DROP)</span>
              </div>
              <button
                onClick={() => setShowAddRuleModal(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] shadow transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Rule</span>
              </button>
            </div>

            {/* Quick Rule Matrix Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {fwRules.map((rule, idx) => (
                <div key={rule.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold text-[10px]">#{rule.id}</span>
                    <div>
                      <span className="text-amber-300 font-extrabold block">{rule.port}</span>
                      <span className="text-slate-400 text-[9px]">{rule.protocol}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleRuleAction(rule.id)}
                      className={`px-2.5 py-0.5 rounded-full font-black text-[10px] cursor-pointer transition-all border shadow ${
                        rule.action === 'ACCEPT'
                          ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-600'
                          : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-600'
                      }`}
                      title="Click to toggle Accept/Drop verdict"
                    >
                      {rule.action === 'ACCEPT' ? '🟢 ACCEPT' : '🔴 DROP'}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/80 transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INSPECTION RESULTS & USER-CONFIGURABLE RULES MATRIX (DETAILED MODE ONLY) */}
          {(appMode === 'detailed' || appMode === 'expert') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            
            {/* LIVE INSPECTOR VERDICT */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-rose-400 font-extrabold text-sm">
                <span>Packet Inspection Verdict</span>
                <Shield className="w-4 h-4 text-rose-400" />
              </div>

              {inspectionDetail ? (
                <div className="space-y-2 text-slate-200">
                  <p><span className="text-slate-500 font-bold">Source Socket:</span> <span className="text-cyan-300 font-bold">{inspectionDetail.srcIp}</span></p>
                  <p><span className="text-slate-500 font-bold">Target Socket:</span> <span className="text-amber-300 font-bold">{inspectionDetail.dstIp}</span></p>
                  <p><span className="text-slate-500 font-bold">Service:</span> <span className="text-slate-300 font-bold">{inspectionDetail.service}</span></p>
                  <p><span className="text-slate-500 font-bold">TCP State:</span> <span className="text-purple-300 font-bold">{inspectionDetail.state}</span></p>

                  <div className={`p-3 rounded-2xl border font-bold text-center mt-3 ${
                    firewallAction === 'ALLOW'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950 border-rose-500 text-rose-300'
                  }`}>
                    VERDICT: {inspectionDetail.verdict}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6">Transmit a packet above to view live firewall rule evaluation.</p>
              )}
            </div>

            {/* USER-CONFIGURABLE FIREWALL RULES MATRIX TABLE */}
            <div className="md:col-span-2 glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-cyan-400 font-extrabold text-sm">User-Configurable Access Control Table (ACL)</span>
                  <p className="text-[10px] text-slate-400 font-normal">Rules evaluate top-to-bottom. Click Action badge to toggle ACCEPT / DROP!</p>
                </div>
                <button
                  onClick={() => setShowAddRuleModal(true)}
                  className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Add Custom Firewall Rule"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="py-2 px-2">Priority</th>
                      <th className="py-2 px-2">ID</th>
                      <th className="py-2 px-2">Service Port</th>
                      <th className="py-2 px-2">Proto</th>
                      <th className="py-2 px-2">Action (Click to Toggle)</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {fwRules.map((rule, idx) => (
                      <tr key={rule.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2 px-2 font-mono text-slate-500">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveRule(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-30 cursor-pointer"
                              title="Move Up Priority"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveRule(idx, 1)}
                              disabled={idx === fwRules.length - 1}
                              className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-30 cursor-pointer"
                              title="Move Down Priority"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-slate-400 font-bold">#{rule.id}</td>
                        <td className="py-2 px-2 text-amber-300 font-bold">{rule.port}</td>
                        <td className="py-2 px-2 text-purple-300 font-mono">{rule.protocol}</td>
                        <td className="py-2 px-2">
                          <button
                            onClick={() => handleToggleRuleAction(rule.id)}
                            className={`px-2.5 py-1 rounded-full font-black text-[10px] cursor-pointer transition-all border shadow ${
                              rule.action === 'ACCEPT' ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-600' : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-600'
                            }`}
                            title="Click to toggle between ACCEPT and DROP"
                          >
                            {rule.action === 'ACCEPT' ? '🟢 ACCEPT' : '🔴 DROP'}
                          </button>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800 transition-colors cursor-pointer"
                            title="Delete Firewall Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* SUB-TAB 2: NAT / PAT TRANSLATION ENGINE */}
      {activeSubTab === 'nat' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-cyan-300">Port Address Translation (PAT) Overload Engine</h3>
              <p className="text-slate-400 text-xs">Multiple private LAN hosts share 1 public WAN IP using ephemeral source port mapping.</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-700 font-bold">
              WAN IP: 203.0.113.1 (Public)
            </span>
          </div>

          {/* PAT VISUAL DIAGRAM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
            
            {/* Private LAN PC Hosts */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-cyan-300">PC-01</p>
                  <p className="text-[10px] text-slate-400">192.168.1.10:5001</p>
                </div>
                <Laptop className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-300">PC-02</p>
                  <p className="text-[10px] text-slate-400">192.168.1.20:5001</p>
                </div>
                <Laptop className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            {/* NAT Router Translation Center */}
            <div className="p-5 bg-amber-950/60 rounded-2xl border border-amber-600 text-center space-y-2">
              <Router className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
              <p className="font-black text-amber-300">PAT ROUTER GATEWAY</p>
              <p className="text-[10px] text-amber-200">Rewrites Src IP & Ephemeral Port in IP Header</p>
            </div>

            {/* Public Internet Target */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-2">
              <Globe className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="font-black text-emerald-300">PUBLIC WEB SERVER</p>
              <p className="text-[10px] text-slate-400">93.184.216.34:443</p>
            </div>
          </div>

          {/* PAT ROUTER TRANSLATION TABLE (DETAILED MODE ONLY) */}
          {(appMode === 'detailed' || appMode === 'expert') && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-xs">Live NAT / PAT Translation Table (PAT Table)</h4>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase">
                      <th className="py-2">Protocol</th>
                      <th className="py-2">Inside Private Socket</th>
                      <th className="py-2">Outside Translated Public Socket</th>
                      <th className="py-2">Destination Server</th>
                      <th className="py-2">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="py-2.5 font-bold text-purple-400">TCP</td>
                      <td className="py-2.5 text-cyan-300 font-bold">192.168.1.10:5001</td>
                      <td className="py-2.5 text-amber-300 font-bold">203.0.113.1:40001</td>
                      <td className="py-2.5 text-emerald-300 font-bold">93.184.216.34:443</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-700 font-bold">ESTABLISHED</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-purple-400">TCP</td>
                      <td className="py-2.5 text-blue-300 font-bold">192.168.1.20:5001</td>
                      <td className="py-2.5 text-amber-300 font-bold">203.0.113.1:40002</td>
                      <td className="py-2.5 text-emerald-300 font-bold">93.184.216.34:443</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-700 font-bold">ESTABLISHED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: IPSEC VPN TUNNEL VISUALIZER */}
      {activeSubTab === 'vpn' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl font-mono text-xs">
          
          {/* IPSEC STEP SELECTION CARDS */}
          <div className="grid grid-cols-5 gap-2 border-b border-slate-800 pb-3">
            {vpnSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => { setActiveStep(idx); setIsPlaying(true); }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black border-emerald-300 shadow-md scale-102'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <p className="text-[10px] opacity-80 uppercase font-mono">Phase {idx}</p>
                  <p className="text-xs font-bold truncate">{step.title.split(':')[0]}</p>
                </button>
              );
            })}
          </div>

          {/* VPN EXPLANATION BANNER */}
          <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-600/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Phase Step {activeStep}:</span>
              <h4 className="text-base font-black text-emerald-200">{vpnSteps[activeStep].title}</h4>
              <p className="text-xs text-slate-300">{vpnSteps[activeStep].subtitle}</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 whitespace-nowrap">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Virtual Network: 192.168.10.0/24</span>
            </div>
          </div>

          {/* MULTI-HOP VISUAL TOPOLOGY STAGE */}
          <div className="relative min-h-[340px] bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner overflow-hidden">
            
            {/* GLOWING ENCRYPTED TUNNEL OVERLAY PIPE (PHYSICALLY APART, LOGICALLY CONNECTED) */}
            <div className="absolute top-[28%] left-[8%] right-[8%] h-24 border-2 border-emerald-400/80 rounded-3xl bg-emerald-950/20 backdrop-blur-xs shadow-[0_0_30px_rgba(16,185,129,0.25)] pointer-events-none flex items-center justify-center z-20">
              <div className="px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] font-black tracking-wider flex items-center gap-2 shadow-2xl animate-pulse">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>🔒 ENCRYPTED IPSEC TUNNEL CABLE — LOGICALLY ON SAME VIRTUAL PRIVATE NETWORK</span>
              </div>

              {/* Animated ESP Encrypted Packet moving inside glowing tunnel */}
              {isPlaying && activeStep > 0 && (
                <div
                  style={{ left: `${(packetProgress / 100) * 85 + 5}%` }}
                  className="absolute p-2 bg-emerald-400 text-slate-950 rounded-full shadow-[0_0_20px_#10b981] font-black text-xs border-2 border-white flex items-center gap-1 z-30 transition-all duration-75"
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-[9px] font-mono">ESP Packet</span>
                </div>
              )}
            </div>

            {/* PHYSICAL CONNECTIONS WIRE */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="12%" y1="75%" x2="28%" y2="75%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="28%" y1="75%" x2="44%" y2="75%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="44%" y1="75%" x2="56%" y2="75%" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="56%" y1="75%" x2="72%" y2="75%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="72%" y1="75%" x2="88%" y2="75%" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" />
            </svg>

            {/* TOPOLOGY NODES GRID */}
            <div className="relative z-10 grid grid-cols-6 gap-2 items-end h-[290px]">
              
              {/* NODE 1: BRANCH PC-01 */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  192.168.10.105
                </span>
                <div className="p-3 bg-slate-900 border-2 border-cyan-500 rounded-2xl shadow-lg">
                  <Laptop className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="font-extrabold text-[11px] text-slate-100">Branch PC-01</p>
                <p className="text-[9px] text-slate-400">London Office</p>
              </div>

              {/* NODE 2: BRANCH SWITCH */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                  VLAN 10 Switch
                </span>
                <div className="p-3 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-lg">
                  <Layers className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-extrabold text-[11px] text-slate-100">Branch Switch</p>
                <p className="text-[9px] text-slate-400">Layer 2 LAN</p>
              </div>

              {/* NODE 3: BRANCH VPN GATEWAY */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  203.0.113.5
                </span>
                <div className="p-3 bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-lg">
                  <Router className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <p className="font-extrabold text-[11px] text-emerald-300">Branch Gateway</p>
                <p className="text-[9px] text-slate-400">VPN Router</p>
              </div>

              {/* NODE 4: PUBLIC ISP CLOUD */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Public WAN
                </span>
                <div className="p-3 bg-amber-950/40 border-2 border-amber-600 rounded-2xl shadow-lg">
                  <Cloud className="w-8 h-8 text-amber-400" />
                </div>
                <p className="font-extrabold text-[11px] text-amber-300">ISP WAN Cloud</p>
                <p className="text-[9px] text-slate-400">Untrusted Internet</p>
              </div>

              {/* NODE 5: HQ VPN GATEWAY */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  198.51.100.1
                </span>
                <div className="p-3 bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-lg">
                  <Router className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <p className="font-extrabold text-[11px] text-purple-300">HQ Gateway</p>
                <p className="text-[9px] text-slate-400">VPN Router</p>
              </div>

              {/* NODE 6: HQ HOST PC-02 */}
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  172.16.0.50
                </span>
                <div className="p-3 bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-lg">
                  <Laptop className="w-8 h-8 text-purple-400" />
                </div>
                <p className="font-extrabold text-[11px] text-slate-100">HQ Host PC-02</p>
                <p className="text-[9px] text-slate-400">Tokyo HQ LAN</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TLS 1.3 HANDSHAKE VISUALIZER */}
      {activeSubTab === 'tls' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl font-mono text-xs">
          
          {/* TLS STEP SELECTION CARDS */}
          <div className="grid grid-cols-5 gap-2 border-b border-slate-800 pb-3">
            {tlsSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => { setActiveStep(idx); setIsPlaying(true); }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black border-cyan-300 shadow-md scale-102'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <p className="text-[10px] opacity-80 uppercase font-mono">Step {idx}</p>
                  <p className="text-xs font-bold truncate">{step.title.split(':')[0]}</p>
                </button>
              );
            })}
          </div>

          {/* TLS STEP STATUS BANNER */}
          <div className="p-4 bg-cyan-950/80 rounded-2xl border border-cyan-600/80 space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase block">TLS 1.3 Handshake Step {activeStep}:</span>
            <h4 className="text-base font-black text-cyan-200">{tlsSteps[activeStep].title}</h4>
            <p className="text-xs text-slate-300">{tlsSteps[activeStep].subtitle}</p>
          </div>

          {/* VISUAL HANDSHAKE STAGE */}
          <div className="relative min-h-[260px] bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between overflow-hidden">
            
            {/* Client Browser */}
            <div className="flex flex-col items-center gap-2 z-10">
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-700 font-bold text-[10px]">
                192.168.1.105
              </span>
              <div className="p-4 bg-slate-900 border-2 border-cyan-500 rounded-2xl shadow-xl">
                <Laptop className="w-10 h-10 text-cyan-400" />
              </div>
              <p className="font-bold text-slate-200 text-xs">CLIENT BROWSER</p>
            </div>

            {/* HANDSHAKE CABLE & PACKET */}
            <div className="flex-1 mx-8 relative flex items-center justify-center h-16 border-2 border-dashed border-cyan-500/60 rounded-full bg-cyan-950/30">
              <span className="px-3 py-1 bg-cyan-950 text-cyan-300 rounded-full border border-cyan-500 text-[10px] font-black tracking-wider flex items-center gap-1.5 shadow-lg z-10">
                <Key className="w-3.5 h-3.5" /> 1-RTT TLS 1.3 HANDSHAKE (ECDHE_RSA + AES_256_GCM)
              </span>

              {/* Animated TLS Handshake Packet */}
              {activeStep > 0 && (
                <div
                  style={{ left: `${(packetProgress / 100) * 80 + 10}%` }}
                  className="absolute p-2.5 bg-cyan-400 text-slate-950 rounded-full shadow-2xl animate-pulse font-bold text-xs border-2 border-white z-20 flex items-center gap-1"
                >
                  <Key className="w-4 h-4" />
                  <span className="text-[9px] font-mono font-black">TLS Record</span>
                </div>
              )}
            </div>

            {/* HTTPS Web Server */}
            <div className="flex flex-col items-center gap-2 z-10">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-700 font-bold text-[10px]">
                93.184.216.34:443
              </span>
              <div className="p-4 bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-xl">
                <Server className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="font-bold text-slate-200 text-xs">HTTPS WEB SERVER</p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MODAL POPUP FOR ADDING CUSTOM FIREWALL RULE */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-5 bg-slate-900/95 relative text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">Create Custom Firewall Rule</h3>
                  <p className="text-xs text-slate-400">Rules evaluate top-to-bottom in ACL order</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">RULE DESCRIPTION:</label>
                <input
                  type="text"
                  value={newRule.desc}
                  onChange={(e) => setNewRule({ ...newRule, desc: e.target.value })}
                  placeholder="e.g. Allow Custom App Port 8080"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">PROTOCOL:</label>
                  <select
                    value={newRule.protocol}
                    onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-purple-300 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                    <option value="ANY">ANY (All Protocols)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">SERVICE PORT / NUMBER:</label>
                  <input
                    type="text"
                    value={newRule.port}
                    onChange={(e) => setNewRule({ ...newRule, port: e.target.value })}
                    placeholder="e.g. 8080 (ALT-HTTP)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">ACTION PERMISSION:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRule({ ...newRule, action: 'ACCEPT' })}
                    className={`py-2 rounded-xl font-black transition-all cursor-pointer border ${
                      newRule.action === 'ACCEPT'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🟢 ACCEPT (Allow)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRule({ ...newRule, action: 'DROP' })}
                    className={`py-2 rounded-xl font-black transition-all cursor-pointer border ${
                      newRule.action === 'DROP'
                        ? 'bg-rose-500 text-white border-rose-300 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🔴 DROP (Block)
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer transition-all"
              >
                Save & Apply Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMINAL EVENT LOGS (DETAILED MODE ONLY) */}
      {(appMode === 'detailed' || appMode === 'expert') && (
        <SlideOutInspector title="Slide Out Technical Deep Dive & Wire Logs">
          <TerminalLog logs={logs} onClear={() => setLogs([])} />
        </SlideOutInspector>
      )}
    </div>
  );
}
