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
  Send
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

  // Send Custom Packet Through Stateful Firewall
  const handleTestFirewallPacket = () => {
    setIsPlaying(true);
    setPacketProgress(0);
    setActiveStep(1);

    const servicePortMap = {
      https: { port: 443, name: 'HTTPS (Port 443)', proto: 'TCP', dst: '93.184.216.34' },
      ssh: { port: 22, name: 'SSH (Port 22)', proto: 'TCP', dst: '203.0.113.10' },
      rdp: { port: 3389, name: 'RDP Remote Desktop (Port 3389)', proto: 'TCP', dst: '203.0.113.50' },
      icmp: { port: 0, name: 'ICMP Echo Ping', proto: 'ICMP', dst: '8.8.8.8' },
      telnet: { port: 23, name: 'Telnet Unencrypted (Port 23)', proto: 'TCP', dst: '203.0.113.99' }
    };

    const target = servicePortMap[selectedService];
    
    // Evaluate against firewall rules
    const matchedRule = fwRules.find(r => {
      if (target.proto === 'ICMP' && r.protocol === 'ICMP') return true;
      return r.port.includes(target.port.toString());
    });

    const isAllowed = matchedRule ? matchedRule.action === 'ACCEPT' : false;
    setFirewallAction(isAllowed ? 'ALLOW' : 'DROP');

    setInspectionDetail({
      srcIp: '192.168.1.105:52310',
      dstIp: `${target.dst}:${target.port || 'ICMP'}`,
      service: target.name,
      matchedRuleId: matchedRule ? matchedRule.id : 'DEFAULT DROP RULE',
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* CLEAN MODE UNIFIED WIDGET (ZERO SCROLL, SINGLE CARD) */}
      {appMode !== 'detailed' && appMode !== 'expert' && (
        <CleanWidget
          title="Firewall, NAT & VPN Security Made Simple"
          subtitle="Understand how Firewalls block dangerous traffic and how VPN Tunnels encrypt data over the Internet"
          icon={ShieldCheck}
          ip="192.168.1.105 (LAN) → 8.8.8.8 (Internet)"
          protocol={selectedService.toUpperCase()}
          port={selectedService === 'https' ? 443 : selectedService === 'ssh' ? 22 : selectedService === 'rdp' ? 3389 : selectedService === 'telnet' ? 23 : 'ICMP'}
          status={firewallAction === 'ALLOW' ? '🟢 ALLOWED' : firewallAction === 'DROP' ? '🔴 DROPPED' : 'Ready'}
          actionTitle={firewallAction ? `Traffic Verdict: ${firewallAction}` : 'Ready to Send Test Traffic'}
          actionDesc={firewallAction === 'ALLOW' ? '🟢 PERMITTED: Firewall verified this service is secure and allowed it through!' : firewallAction === 'DROP' ? '🔴 BLOCKED: Firewall detected insecure traffic and dropped the packet!' : 'Select a service (HTTPS, SSH, RDP) above and click "Transmit Packet Through Firewall".'}
          isPlaying={isPlaying}
          onPlay={handleTestFirewallPacket}
          onReset={handleReset}
          showAnimation={showAnimation}
          setShowAnimation={setShowAnimation}
        />
      )}

      {/* MODULE HEADER BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 text-white shadow-xl shadow-rose-500/20 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-100">Stateful Firewall, NAT & VPN Security Lab</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700">
                L4-L7 Deep Packet Inspection
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Simulate Stateful Packet Inspection (SPI), Port Address Translation (PAT), IPsec ESP Tunnels, and TLS 1.3 Handshake.
            </p>
          </div>
        </div>

        {/* MODE SUB-TABS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 font-mono text-xs">
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: STATEFUL FIREWALL INSPECTION (SPI) */}
      {activeSubTab === 'stateful' && (
        <div className="space-y-6">
          
          {/* FIREWALL WORKSPACE CONTROL TOOLBAR */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800/90 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shadow-xl font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Send className="w-4 h-4 text-rose-400" />
                <span className="text-slate-400 font-bold">Select Traffic Service:</span>
                <select
                  value={selectedService}
                  onChange={(e) => { setSelectedService(e.target.value); handleReset(); }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="https">HTTPS Web (Port 443) - Allow Rule #101</option>
                  <option value="ssh">SSH Remote Admin (Port 22) - Allow Rule #102</option>
                  <option value="rdp">RDP Desktop (Port 3389) - DROP Rule #104</option>
                  <option value="telnet">Telnet Plaintext (Port 23) - DROP Rule #105</option>
                  <option value="icmp">ICMP Ping (8.8.8.8) - Allow Rule #106</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <CleanControlButton
                icon={Play}
                label="Transmit Packet Through Firewall"
                description="Test Stateful Inspection Rule"
                onClick={handleTestFirewallPacket}
                disabled={isPlaying}
                color="rose"
              />

              <CleanControlButton
                icon={RotateCcw}
                label="Reset"
                description="Reset Firewall State"
                onClick={handleReset}
                color="rose"
              />
            </div>
          </div>

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

            {/* 1. Client PC (15%, 50%) */}
            <div className="absolute left-[15%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 font-mono z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                192.168.1.105
              </span>
              <div className="p-5 rounded-3xl border-4 bg-slate-900 border-slate-700">
                <Laptop className="w-12 h-12 text-cyan-400" />
              </div>
              <p className="text-xs font-bold text-slate-200">INTERNAL PC</p>
            </div>

            {/* 2. Enterprise Hardware Firewall (50%, 50%) */}
            <div className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 font-mono z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> FORTIGATE HARDWARE FIREWALL
              </span>
              <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${
                firewallAction === 'DROP'
                  ? 'bg-rose-950 border-rose-500 shadow-2xl shadow-rose-500/60 scale-110 animate-bounce'
                  : firewallAction === 'ALLOW'
                  ? 'bg-emerald-950 border-emerald-400 shadow-2xl shadow-emerald-500/50 scale-110'
                  : 'bg-slate-900 border-slate-700'
              }`}>
                <ShieldAlert className={`w-14 h-14 ${firewallAction === 'DROP' ? 'text-rose-400' : firewallAction === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
              <p className="text-xs font-bold text-slate-200">SPI RULES ENGINE</p>
            </div>

            {/* 3. Destination Public Server (85%, 50%) */}
            <div className="absolute left-[85%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 font-mono z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700">
                PUBLIC SERVER
              </span>
              <div className={`p-5 rounded-3xl border-4 transition-all ${
                firewallAction === 'ALLOW' && packetProgress > 80 ? 'bg-emerald-950 border-emerald-400 scale-110 shadow-xl' : 'bg-slate-900 border-slate-700'
              }`}>
                <Server className="w-12 h-12 text-blue-400" />
              </div>
              <p className="text-xs font-bold text-slate-200">TARGET SERVER</p>
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

          {/* INSPECTION RESULTS & RULES MATRIX */}
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

            {/* FIREWALL RULES MATRIX TABLE */}
            <div className="md:col-span-2 glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-cyan-400 font-extrabold text-sm">Active Stateful Firewall Access Control Matrix (ACL)</span>
                <span className="text-slate-500 text-[10px]">FortiGate Policy Table</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="py-2 px-2">ID</th>
                      <th className="py-2 px-2">Src Subnet</th>
                      <th className="py-2 px-2">Dst IP</th>
                      <th className="py-2 px-2">Service Port</th>
                      <th className="py-2 px-2">State</th>
                      <th className="py-2 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {fwRules.map(rule => (
                      <tr key={rule.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2 px-2 text-slate-500 font-bold">#{rule.id}</td>
                        <td className="py-2 px-2 text-cyan-300 font-bold">{rule.src}</td>
                        <td className="py-2 px-2 text-slate-300">{rule.dst}</td>
                        <td className="py-2 px-2 text-amber-300 font-bold">{rule.port}</td>
                        <td className="py-2 px-2 text-purple-300">{rule.state}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            rule.action === 'ACCEPT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
                          }`}>
                            {rule.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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

          {/* PAT ROUTER TRANSLATION TABLE */}
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
        </div>
      )}

      {/* SUB-TAB 3: IPSEC VPN TUNNEL VISUALIZER */}
      {activeSubTab === 'vpn' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl font-mono text-xs">
          
          {/* CONTROL BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">IPsec Site-to-Site Tunnel Walkthrough:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeStep >= 4) setActiveStep(1);
                  else setActiveStep(prev => prev + 1);
                  setIsPlaying(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all"
              >
                <SkipForward className="w-4 h-4 fill-current" />
                <span>Next VPN Phase ({activeStep + 1}/5)</span>
              </button>

              <button onClick={handleReset} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VPN PHASE STATUS BANNER */}
          <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-600/80 space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">Phase Step {activeStep + 1}:</span>
            <h4 className="text-base font-black text-emerald-200">{vpnSteps[activeStep].title}</h4>
            <p className="text-xs text-slate-300">{vpnSteps[activeStep].subtitle}</p>
          </div>

          {/* VISUAL TUNNEL DIAGRAM */}
          <div className="relative min-h-[260px] bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            
            {/* Branch Gateway */}
            <div className="flex flex-col items-center gap-2 z-10">
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-700 font-bold text-[10px]">
                192.168.10.1
              </span>
              <div className="p-4 bg-slate-900 border-2 border-cyan-500 rounded-2xl">
                <Router className="w-10 h-10 text-cyan-400" />
              </div>
              <p className="font-bold text-slate-200 text-xs">BRANCH GATEWAY</p>
            </div>

            {/* ENCRYPTED IPSEC TUNNEL CABLE PIPE */}
            <div className="flex-1 mx-8 relative flex items-center justify-center h-16 border-2 border-dashed border-emerald-500/60 rounded-full bg-emerald-950/30">
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full border border-emerald-500 text-[10px] font-black tracking-wider flex items-center gap-1.5 shadow-lg">
                <Lock className="w-3.5 h-3.5" /> ENCRYPTED IPSEC ESP TUNNEL (AES-256 + SHA-256)
              </span>

              {/* Animated ESP Packet */}
              {activeStep > 0 && (
                <div
                  style={{ left: `${(packetProgress / 100) * 80 + 10}%` }}
                  className="absolute p-2 bg-emerald-400 text-slate-950 rounded-full shadow-2xl animate-pulse font-bold text-xs border border-white"
                >
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* HQ Gateway */}
            <div className="flex flex-col items-center gap-2 z-10">
              <span className="px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-700 font-bold text-[10px]">
                172.16.0.1
              </span>
              <div className="p-4 bg-slate-900 border-2 border-purple-500 rounded-2xl">
                <Router className="w-10 h-10 text-purple-400" />
              </div>
              <p className="font-bold text-slate-200 text-xs">HQ GATEWAY</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TLS 1.3 HANDSHAKE VISUALIZER */}
      {activeSubTab === 'tls' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl font-mono text-xs">
          
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">TLS 1.3 1-RTT Handshake Sequence:</span>
            </div>

            <button
              onClick={() => {
                if (activeStep >= 4) setActiveStep(1);
                else setActiveStep(prev => prev + 1);
                setIsPlaying(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all"
            >
              <SkipForward className="w-4 h-4 fill-current" />
              <span>Next Handshake Step ({activeStep + 1}/5)</span>
            </button>
          </div>

          <div className="p-4 bg-cyan-950/80 rounded-2xl border border-cyan-600/80 space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase block">TLS Step {activeStep + 1}:</span>
            <h4 className="text-base font-black text-cyan-200">{tlsSteps[activeStep].title}</h4>
            <p className="text-xs text-slate-300">{tlsSteps[activeStep].subtitle}</p>
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
