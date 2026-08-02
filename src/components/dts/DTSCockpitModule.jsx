import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Zap, 
  Activity, 
  Terminal, 
  Server, 
  Laptop, 
  Lock, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  Database, 
  Layers, 
  Eye, 
  RefreshCw,
  Gauge,
  Play,
  Pause
} from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, SlideOutInspector } from '../common/EasyCard';

export default function DTSCockpitModule({ appMode = 'clean' }) {
  const [activeScenario, setActiveScenario] = useState('ransomware'); // 'ransomware', 'bruteforce', 'phishing', 'dns_exfil', 'ot_intrusion'
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [speed, setSpeed] = useState(0.5); // Default 0.5x speed (Blue)
  const [logs, setLogs] = useState([]);
  const [liveStreamActive, setLiveStreamActive] = useState(true);
  const [remediationsApplied, setRemediationsApplied] = useState({
    hostIsolated: false,
    ipBlocked: false,
    tokenRevoked: false,
    dnsSinkholed: false,
    otSegmented: false
  });

  // DTS Cockpit Attack Scenarios Metadata
  const attackScenarios = {
    ransomware: {
      id: 'ransomware',
      name: 'Ransomware Outbreak & EDR Isolation',
      mitreId: 'T1486 - Data Encrypted for Impact',
      target: 'Laptop-A (192.168.1.105)',
      threatLevel: 'CRITICAL',
      badgeColor: 'bg-rose-950/90 border-rose-500 text-rose-300',
      description: 'Suspicious process attempting shadow copy deletion and bulk file encryption on Sales Laptop-A.',
      steps: [
        { title: '1. Red Team Execution', desc: 'Malicious macro executes powershell.exe vssadmin delete shadows on Laptop-A.' },
        { title: '2. DTS SOC Detection', desc: 'Cortex XDR EDR agent detects behavioral anomaly (Behavioral Threat Protection score 98/100).' },
        { title: '3. Purple Team Correlation', desc: 'DTS Cockpit correlates SIEM log with Palo Alto NGFW C2 beaconing alerts.' },
        { title: '4. Automated Remediation', desc: 'SOAR Playbook triggers Cortex XDR API to isolate Laptop-A from local LAN.' }
      ]
    },
    bruteforce: {
      id: 'bruteforce',
      name: 'Brute-Force SSH/RDP Probe & Palo Alto NGFW Drop',
      mitreId: 'T1110 - Brute Force Password Spraying',
      target: 'Core Edge Router & Palo Alto NGFW (203.0.113.45)',
      threatLevel: 'HIGH',
      badgeColor: 'bg-amber-950/90 border-amber-500 text-amber-300',
      description: 'External IP 198.51.100.77 attempting 500+ RDP/SSH login failures per minute targeting WAN Gateway.',
      steps: [
        { title: '1. Red Team Reconnaissance', desc: 'Automated botnet probes WAN port 3389 with dictionary password spray.' },
        { title: '2. PAN-OS Engine Telemetry', desc: 'Palo Alto Next-Gen Firewall triggers Threat ID 40012 (SSH Brute Force).' },
        { title: '3. DTS Cockpit Correlation', desc: 'DTS Cockpit SIEM engine matches threshold alert with global Threat Intelligence feeds.' },
        { title: '4. Automated NGFW IP Block', desc: 'Dynamic Address Group update automatically pushes 198.51.100.77 to Palo Alto Drop Rule.' }
      ]
    },
    phishing: {
      id: 'phishing',
      name: 'Phishing Credential Theft & Mail Exchange Quarantine',
      mitreId: 'T1566 - Phishing Spearphishing Attachment',
      target: 'Exchange Mail Server (192.168.1.28)',
      threatLevel: 'HIGH',
      badgeColor: 'bg-amber-950/90 border-amber-500 text-amber-300',
      description: 'Spoofed email targeting HR Department containing malicious credential harvesting link.',
      steps: [
        { title: '1. Red Team Ingress', desc: 'Inbound email from fake-hr.com delivered with zero-day credential harvester URL.' },
        { title: '2. DTS Mail Security Filter', desc: 'DTS Mail Guard flags DMARC/SPF failure and suspicious domain age (< 24h).' },
        { title: '3. DTS Cockpit Alerting', desc: 'SOC Analyst notified of active phishing campaign targeting internal domain.' },
        { title: '4. Automated Exchange Quarantine', desc: 'Mail Security Playbook purges matching message hashes across all inbox mailboxes.' }
      ]
    },
    dns_exfil: {
      id: 'dns_exfil',
      name: 'DNS Tunneling Exfiltration & Sinkhole Enforcement',
      mitreId: 'T1071.004 - Application Layer Protocol: DNS',
      target: 'Corporate DNS Resolver (192.168.1.20)',
      threatLevel: 'CRITICAL',
      badgeColor: 'bg-rose-950/90 border-rose-500 text-rose-300',
      description: 'Compromised host sending encoded Base64 database records via TXT DNS queries to rogue NS server.',
      steps: [
        { title: '1. Data Exfiltration Stream', desc: 'Host PC-B queries continuous 250-byte subdomains (e.g. x7f9a.bad-dns.com).' },
        { title: '2. DTS DNS Security Inspection', desc: 'DNS Security module flags high-entropy TXT record requests and abnormal query volume.' },
        { title: '3. DTS Cockpit Threat Graph', desc: 'DTS Cockpit maps rogue destination IP 198.51.100.99 to active C2 Infrastructure.' },
        { title: '4. BIND9 / NGFW Sinkholing', desc: 'Automated DNS Sinkhole rewrites bad-dns.com queries to 127.0.0.1 (Loopback Isolation).' }
      ]
    },
    ot_intrusion: {
      id: 'ot_intrusion',
      name: 'DTS OT Insights Industrial Controller Anomaly',
      mitreId: 'T0855 - Unauthorized Command Message (ICS/OT)',
      target: 'Production OT Network & SCADA Gateway',
      threatLevel: 'CRITICAL',
      badgeColor: 'bg-purple-950/90 border-purple-500 text-purple-300',
      description: 'Unauthorized Modbus TCP write command detected in production industrial network segment.',
      steps: [
        { title: '1. OT Segment Intrusion', desc: 'Unregistered laptop connected to OT VLAN attempts Modbus FC16 Write Multiple Registers.' },
        { title: '2. DTS OT Insights Detection', desc: 'DTS OT Insights sensor analyzes industrial packet inspects PLC register boundaries.' },
        { title: '3. SOC Analyst Alarm', desc: 'DTS Cockpit raises instant High-Priority Alert: Critical Infrastructure Command Anomaly.' },
        { title: '4. Microsegmentation Lock', desc: 'DTS NAC (Network Access Control) port security immediately disables OT switch port.' }
      ]
    }
  };

  const currScenario = attackScenarios[activeScenario];

  // 24/7 Live Monitoring Telemetry Stream
  useEffect(() => {
    if (!liveStreamActive || isSimulating) return;

    const monitoringTemplates = [
      { tag: 'PAN-OS_SPI', msg: '🟢 Palo Alto NGFW Session #84920: ALLOW TCP 192.168.1.105:51234 -> 192.168.1.25:443 (SSL Ingress OK)' },
      { tag: 'CORTEX_XDR', msg: '🟢 EDR Heartbeat: WS-SALES-LAP105 Agent v8.3.1 Active • 0 Behavioral Anomalies' },
      { tag: 'DTS_DNS_GUARD', msg: '🟢 DNS Inspection: Resolved app.corp.com -> 192.168.1.20 (Latency: 1.1ms, Reputation: 100/100)' },
      { tag: 'DTS_AD_KDC', msg: '🟢 AD Kerberos Audit: AS_REQ ticket issued for sales.user@CORP.COM (AES-256 Encryption OK)' },
      { tag: 'DTS_OT_INSIGHTS', msg: '🟢 SCADA Gateway Sensor: Modbus FC03 Register 40001 Read • PLC Node 192.168.10.15 Normal' },
      { tag: 'DTS_MAIL_GUARD', msg: '🟢 Mail Security Relay: Inbound SMTP 192.168.1.28 • SPF/DKIM/DMARC PASSED' },
      { tag: 'DTS_NAC_GUARD', msg: '🟢 Switch Port Gi1/0/12: MAC 00:1A:2B:3C:4D:01 Verified • 802.1X Auth Succeeded' },
      { tag: 'SIEM_CORRELATOR', msg: 'ℹ️ DTS Cockpit SIEM: 1,420 events/sec ingested across 12 PAN-OS Firewalls and 1,248 Endpoints' }
    ];

    const interval = setInterval(() => {
      const randomItem = monitoringTemplates[Math.floor(Math.random() * monitoringTemplates.length)];
      setLogs(prev => [
        ...prev.slice(-30), // keep last 30 logs
        {
          time: new Date().toLocaleTimeString(),
          tag: randomItem.tag,
          message: randomItem.msg
        }
      ]);
    }, 2800);

    return () => clearInterval(interval);
  }, [liveStreamActive, isSimulating]);

  // Simulation Controller Timer
  useEffect(() => {
    let timer;
    if (isSimulating && activeStep < 4) {
      const delay = (1000 / speed);
      timer = setTimeout(() => {
        const next = activeStep + 1;
        setActiveStep(next);
        const stepDetail = currScenario.steps[next - 1];
        setLogs(prev => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            tag: `DTS_SOC_STEP_${next}`,
            message: `[${currScenario.threatLevel}] ${stepDetail.title}: ${stepDetail.desc}`
          }
        ]);
      }, delay);
    } else if (activeStep === 4) {
      setIsSimulating(false);
    }
    return () => clearTimeout(timer);
  }, [isSimulating, activeStep, speed, currScenario]);

  const handleStartSimulation = (scenarioKey) => {
    setActiveScenario(scenarioKey);
    setActiveStep(1);
    setIsSimulating(true);
    const firstStep = attackScenarios[scenarioKey].steps[0];
    setLogs(prev => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        tag: 'DTS_SOC_INIT',
        message: `🚨 DTS Cockpit Incident Triggered: ${attackScenarios[scenarioKey].name}`
      },
      {
        time: new Date().toLocaleTimeString(),
        tag: 'DTS_SOC_STEP_1',
        message: `[${attackScenarios[scenarioKey].threatLevel}] ${firstStep.title}: ${firstStep.desc}`
      }
    ]);
  };

  const handleManualRemediation = (type) => {
    setRemediationsApplied(prev => ({ ...prev, [type]: true }));
    setLogs(prev => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        tag: 'DTS_SOAR_REMEDIATE',
        message: `✅ SOC Analyst Manual Remediation Applied: ${type.toUpperCase()} executed successfully on DTS Cockpit.`
      }
    ]);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setActiveStep(0);
    setRemediationsApplied({
      hostIsolated: false,
      ipBlocked: false,
      tokenRevoked: false,
      dnsSinkholed: false,
      otSegmented: false
    });
    setLogs([
      {
        time: new Date().toLocaleTimeString(),
        tag: 'DTS_SOC_RESET',
        message: 'ℹ️ DTS Cockpit Security Operations Center Reset to Baseline Green Status.'
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP UNIFIED CONTROL & BASIC INFO WIDGET */}
      <CleanWidget
        title="DTS Cockpit — Security Operations Center & Cyber Defense Platform"
        subtitle="Proprietary SOC Platform developed by DTS Systeme GmbH (Herford, Germany). Centralized 24/7 Managed SOC, Purple Teaming & Automated Threat Remediation."
        icon={ShieldCheck}
        ip="DTS Systeme GmbH • Herford SOC Engine"
        protocol="SIEM & XDR Telemetry"
        port="SOC 24/7"
        status={activeStep === 4 ? 'INCIDENT CONTAINED' : isSimulating ? 'THREAT IN PROGRESS' : 'SOC SYSTEM ONLINE'}
        actionTitle={`Scenario: ${currScenario.name}`}
        actionDesc={currScenario.description}
        stepNumber={activeStep}
        totalSteps={4}
        isPlaying={isSimulating}
        onPlay={() => handleStartSimulation(activeScenario)}
        onStep={() => {
          if (activeStep < 4) handleStartSimulation(activeScenario);
        }}
        onReset={handleReset}
        speed={speed}
        setSpeed={setSpeed}
      />

      {/* DTS BRANDING & KEY METRICS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>SOC Health Score</span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-xl font-black text-emerald-400">98.4 / 100</p>
          <p className="text-[10px] text-slate-500">ISO 27001 & NIS2 Compliant</p>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>Active EDR Agents</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-black text-cyan-300">1,248 Endpoints</p>
          <p className="text-[10px] text-slate-500">Cortex XDR & DTS Agent</p>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>Palo Alto NGFWs</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-300">12 Firewalls (HA)</p>
          <p className="text-[10px] text-slate-500">PAN-OS SPI Active Sync</p>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>DTS SOC Operations</span>
            <Radio className="w-4 h-4 text-purple-400 animate-ping" />
          </div>
          <p className="text-xl font-black text-purple-300">Herford 24/7/365</p>
          <p className="text-[10px] text-slate-500">Purple Teaming Active</p>
        </div>
      </div>

      {/* LIVE 24/7 SYSTEM MONITORING TELEMETRY TICKER BAR */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-xl">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${liveStreamActive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${liveStreamActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <div>
            <p className="font-extrabold text-slate-100 flex items-center gap-2">
              <span>DTS Cockpit Live Telemetry Ingestion Feed</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                1,420 events/sec
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Active Monitoring: Palo Alto NGFW • Cortex XDR • DTS DNS Guard • Active Directory KDC • DTS OT Insights
            </p>
          </div>
        </div>

        <button
          onClick={() => setLiveStreamActive(!liveStreamActive)}
          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            liveStreamActive
              ? 'bg-slate-950 text-emerald-300 border-emerald-800 hover:bg-slate-800'
              : 'bg-amber-950 text-amber-300 border-amber-800 hover:bg-amber-900'
          }`}
        >
          {liveStreamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{liveStreamActive ? 'Pause Telemetry' : 'Resume Telemetry'}</span>
        </button>
      </div>

      {/* PURPLE TEAMING ATTACK SCENARIO SELECTOR CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <h3 className="font-extrabold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span>Select Purple Teaming Cyber Attack Simulation:</span>
          </h3>
          <span className="text-[10px] text-slate-400">Click scenario chip to launch live SOC simulation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 font-mono text-xs">
          {Object.values(attackScenarios).map((scen) => {
            const isSelected = activeScenario === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => handleStartSimulation(scen.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/20 scale-[1.02] ring-2 ring-cyan-400/30'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${scen.badgeColor}`}>
                    {scen.threatLevel}
                  </span>
                  <p className="font-black text-slate-100 text-xs leading-snug">{scen.name}</p>
                </div>
                <p className="text-[9px] text-slate-500">{scen.mitreId}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC SCENARIO STAGE DISPLAY & REMEDIATION CONTROLS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden bg-slate-950/80 font-mono">
        
        {/* SCENARIO HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${currScenario.badgeColor}`}>
                {currScenario.threatLevel} THREAT
              </span>
              <h2 className="text-lg font-black text-slate-100">{currScenario.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">{currScenario.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-extrabold text-cyan-400">Target Asset:</span>
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200">
              {currScenario.target}
            </span>
          </div>
        </div>

        {/* 4-STEP PURPLE TEAM TIMELINE PROGRESS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currScenario.steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = activeStep >= stepNum;
            const isCurrent = activeStep === stepNum;
            return (
              <div
                key={stepNum}
                className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/80 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Step {stepNum}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-800"></span>
                  )}
                </div>
                <h4 className="font-black text-xs text-slate-100">{st.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>

        {/* DTS SOC ANALYST SOAR REMEDIATION PLAYBOOK BUTTONS */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DTS SOC Analyst SOAR Automated Remediation Playbooks:</span>
            </h4>
            <span className="text-[10px] text-emerald-400 font-bold">1-Click Incident Containment</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handleManualRemediation('hostIsolated')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-2 ${
                remediationsApplied.hostIsolated
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-rose-300 border-rose-800/80'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{remediationsApplied.hostIsolated ? '✓ EDR Host Isolated' : '1. Isolate EDR Endpoint'}</span>
            </button>

            <button
              onClick={() => handleManualRemediation('ipBlocked')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-2 ${
                remediationsApplied.ipBlocked
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-amber-800/80'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{remediationsApplied.ipBlocked ? '✓ Palo Alto IP Blocked' : '2. Push Palo Alto IP Drop'}</span>
            </button>

            <button
              onClick={() => handleManualRemediation('tokenRevoked')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-2 ${
                remediationsApplied.tokenRevoked
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-cyan-300 border-cyan-800/80'
              }`}
            >
              <KeyIcon className="w-4 h-4" />
              <span>{remediationsApplied.tokenRevoked ? '✓ AD Kerberos Revoked' : '3. Revoke AD Kerberos Token'}</span>
            </button>

            <button
              onClick={() => handleManualRemediation('dnsSinkholed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-2 ${
                remediationsApplied.dnsSinkholed
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-purple-300 border-purple-800/80'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{remediationsApplied.dnsSinkholed ? '✓ DNS Sinkhole Active' : '4. Enable DNS Sinkhole'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TECHNICAL INSPECTOR & SIEM EVENT LOGS */}
      <SlideOutInspector title="Technical Deep Dive & DTS SOC SIEM Event Correlation Logs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          
          {/* LEFT: DTS COCKPIT THREAT INTELLIGENCE & COMPLIANCE INSPECTOR */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>DTS Cockpit SIEM & Compliance Inspector</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-emerald-400 border border-slate-800 font-bold">
                BSI & NIS2 Verified
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold border-b border-slate-800/80 pb-1">
                  <span>Platform Engine:</span>
                  <span className="text-cyan-300 font-bold">DTS Cockpit SOC (Made in Germany)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  <span className="text-slate-500 font-bold">Headquarters:</span> Herford, North Rhine-Westphalia, Germany
                </p>
                <p className="text-slate-300 text-[11px]">
                  <span className="text-slate-500 font-bold">SIEM Ingestion:</span> Palo Alto PAN-OS, Cortex XDR, BIND9, Active Directory
                </p>
                <p className="text-slate-300 text-[11px]">
                  <span className="text-slate-500 font-bold">SOAR Engine:</span> Automated Mitigation Playbooks (Host, IP, Mail, DNS)
                </p>
                <p className="text-slate-300 text-[11px]">
                  <span className="text-slate-500 font-bold">Compliance Standards:</span> ISO 27001, NIS2 EU Directive, BSI IT-Grundschutz
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: SIEM TERMINAL EVENT LOGS */}
          <TerminalLog logs={logs} onClear={() => setLogs([])} />
        </div>
      </SlideOutInspector>
    </div>
  );
}

function KeyIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="m21 2-9.6 9.6"/>
      <path d="m15.5 7.5 3 3"/>
    </svg>
  );
}
