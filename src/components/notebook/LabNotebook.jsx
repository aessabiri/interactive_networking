import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Award, 
  Zap, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Layers, 
  Activity, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw,
  BookOpen,
  Lock,
  Radio
} from 'lucide-react';

export default function LabNotebook() {
  const [osMode, setOsMode] = useState('linux'); // 'linux' or 'windows'
  const [commandInput, setCommandInput] = useState('');
  const [xp, setXp] = useState(0);
  const [executedCmds, setExecutedCmds] = useState(new Set());
  const [cliLogs, setCliLogs] = useState([
    { type: 'sys', text: 'Welcome to the NetPulse Linux & Windows CLI Terminal Simulator & Tutor!' },
    { type: 'sys', text: 'Type any command or click a tutorial card below to test commands, earn XP, and level up!' },
    { type: 'sys', text: 'Type "help" or "commands" for quick reference.\n' }
  ]);

  const terminalEndRef = useRef(null);

  // Auto-scroll terminal to bottom when new log arrives
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cliLogs]);

  // Gamification Ranks (Levels 1 to 10)
  const ranks = [
    { level: 1, title: 'Junior IT Helpdesk', reqXp: 0, badge: '🌱 Trainee' },
    { level: 2, title: 'Network Support Tech', reqXp: 100, badge: '🔌 Cable Master' },
    { level: 3, title: 'Junior System Admin', reqXp: 250, badge: '💻 CLI Apprentice' },
    { level: 4, title: 'Linux Systems Engineer', reqXp: 450, badge: '🐧 Bash Specialist' },
    { level: 5, title: 'Network Security Admin', reqXp: 700, badge: '🛡️ Firewall Defender' },
    { level: 6, title: 'Senior Infrastructure Architect', reqXp: 1000, badge: '📡 Routing Wizard' },
    { level: 7, title: 'SOC Incident Responder', reqXp: 1350, badge: '🛸 Threat Hunter' },
    { level: 8, title: 'Enterprise DevOps Specialist', reqXp: 1750, badge: '⚡ Automation Ninja' },
    { level: 9, title: 'Cloud & SDN Engineer', reqXp: 2200, badge: '☁️ Cloud Master' },
    { level: 10, title: 'Principal Architect & Kernel Master', reqXp: 2750, badge: '👑 Kernel Legend' }
  ];

  // Calculate Current Level
  let currentRank = ranks[0];
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (xp >= ranks[i].reqXp) {
      currentRank = ranks[i];
      break;
    }
  }

  const nextRank = ranks.find(r => r.level === currentRank.level + 1) || currentRank;
  const xpForNext = nextRank.reqXp - currentRank.reqXp;
  const currentProgressXp = xp - currentRank.reqXp;
  const progressPercent = Math.min(100, Math.max(0, (currentProgressXp / (xpForNext || 1)) * 100));

  // Useful Command Tutorials List
  const commandTutorials = [
    {
      id: 'ip_a',
      os: 'linux',
      category: '1. Network Interfaces & Addressing',
      cmd: 'ip a',
      altCmd: 'ip addr / ifconfig',
      desc: 'Displays all local network interfaces (eth0, lo), MAC addresses, and assigned IPv4/IPv6 addresses.',
      xp: 50,
      output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default 
    link/ether 00:1a:2b:3c:4d:01 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.105/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86340sec preferred_lft 86340sec`
    },
    {
      id: 'ipconfig_all',
      os: 'windows',
      category: '1. Network Interfaces & Addressing',
      cmd: 'ipconfig /all',
      altCmd: 'Get-NetIPAddress',
      desc: 'Displays complete Windows IP configuration including MAC address, Gateway, DHCP Server, and DNS Servers.',
      xp: 50,
      output: `Windows IP Configuration

   Host Name . . . . . . . . . . . . : WS-SALES-LAP105
   Primary Dns Suffix  . . . . . . . : corp.com
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No

Ethernet adapter Local Area Connection:
   Connection-specific DNS Suffix  . : corp.com
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection i219-V
   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-01
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.1.105(Preferred) 
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.254
   DHCP Server . . . . . . . . . . . : 192.168.1.10
   DNS Servers . . . . . . . . . . . : 192.168.1.20`
    },
    {
      id: 'ping_icmp',
      os: 'both',
      category: '2. ICMP Connectivity & Path Testing',
      cmd: 'ping -c 4 8.8.8.8',
      altCmd: 'ping 192.168.1.254',
      desc: 'Sends ICMP Echo Requests to test end-to-end network reachability and measure round-trip latency.',
      xp: 40,
      output: `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.2 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=13.8 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=118 time=14.1 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=118 time=13.9 ms

--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.841/14.002/14.210/0.134 ms`
    },
    {
      id: 'traceroute',
      os: 'both',
      category: '2. ICMP Connectivity & Path Testing',
      cmd: 'traceroute 8.8.8.8',
      altCmd: 'tracert 8.8.8.8 (Windows)',
      desc: 'Traces the hop-by-hop router path across the internet using incrementing IP TTL (Time To Live).',
      xp: 60,
      output: `traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets
 1  192.168.1.254 (192.168.1.254)  1.104 ms  0.985 ms  0.912 ms [Dist Core Router]
 2  192.168.1.1 (192.168.1.1)  2.410 ms  2.320 ms  2.250 ms [Palo Alto NGFW Edge]
 3  203.0.113.1 (203.0.113.1)  8.740 ms  8.650 ms  8.590 ms [ISP Gateway]
 4  72.14.215.85 (72.14.215.85)  13.410 ms  13.320 ms  13.290 ms [Backbone Edge]
 5  dns.google (8.8.8.8)  14.050 ms  13.920 ms  13.880 ms [Target DNS Server]`
    },
    {
      id: 'nslookup',
      os: 'both',
      category: '3. DNS Resolver & Query Inspection',
      cmd: 'nslookup app.corp.com',
      altCmd: 'dig +short app.corp.com',
      desc: 'Queries DNS servers for A, AAAA, MX, or SRV resource records to verify domain hostname resolution.',
      xp: 50,
      output: `Server:  corp-dns.corp.com
Address:  192.168.1.20

Name:    app.corp.com
Address:  192.168.1.25`
    },
    {
      id: 'netstat_ports',
      os: 'both',
      category: '4. Active Ports, Sockets & Firewalls',
      cmd: 'netstat -tulpn',
      altCmd: 'ss -tulpn (Linux) / netstat -ano (Windows)',
      desc: 'Lists active listening TCP/UDP sockets, associated port numbers, and bound process IDs (PID).',
      xp: 60,
      output: `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1042/nginx: master  
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1042/nginx: master  
tcp        0      0 192.168.1.15:88         0.0.0.0:*               LISTEN      892/krb5kdc         
tcp        0      0 192.168.1.30:5432       0.0.0.0:*               LISTEN      1450/postgres       
udp        0      0 0.0.0.0:53              0.0.0.0:*                           780/named (BIND9)`
    },
    {
      id: 'arp_cache',
      os: 'both',
      category: '4. Active Ports, Sockets & Firewalls',
      cmd: 'arp -a',
      altCmd: 'ip neighbor (Linux)',
      desc: 'Displays local Address Resolution Protocol (ARP) table mapping IP addresses to physical MAC addresses.',
      xp: 40,
      output: `Interface: 192.168.1.105 --- 0x2
  Internet Address      Physical Address      Type
  192.168.1.10          00-50-56-00-00-10     dynamic [DHCP Server]
  192.168.1.15          00-50-56-00-00-15     dynamic [AD DC01 KDC]
  192.168.1.20          00-50-56-00-00-20     dynamic [DNS Server]
  192.168.1.50          00-11-22-33-44-55     dynamic [Laser Printer]
  192.168.1.254         00-00-0c-07-ac-fe     dynamic [Default Gateway]`
    },
    {
      id: 'systemctl',
      os: 'linux',
      category: '5. System Control, Logs & Sniffing',
      cmd: 'systemctl status nginx',
      altCmd: 'service nginx status',
      desc: 'Controls systemd services (start, stop, restart, status) to manage web servers, DNS, and database daemons.',
      xp: 50,
      output: `● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2026-08-02 21:00:15 CEST; 1h 10min ago
       Docs: man:nginx(8)
   Main PID: 1042 (nginx)
      Tasks: 4 (limit: 9452)
     Memory: 18.4M
        CPU: 142ms
     CGroup: /system.slice/nginx.service
             ├─1042 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             └─1043 nginx: worker process`
    },
    {
      id: 'tail_logs',
      os: 'linux',
      category: '5. System Control, Logs & Sniffing',
      cmd: 'tail -n 20 /var/log/syslog',
      altCmd: 'journalctl -f -u nginx',
      desc: 'Monitors real-time system and application log streams to debug authentication failures or network drops.',
      xp: 50,
      output: `Aug 02 22:10:01 netpulse-box systemd[1]: Starting Daily apt upgrade and clean activities...
Aug 02 22:10:05 netpulse-box krb5kdc[892]: AS_REQ (6 etypes {18 17 20 19 16 23}) 192.168.1.105: ISSUE: authtime 1785680000, sales.user@CORP.COM for krbtgt/CORP.COM@CORP.COM
Aug 02 22:10:12 netpulse-box named[780]: client @0x7f8a 192.168.1.105#54321 (app.corp.com): query: app.corp.com IN A +E(0)K (192.168.1.20)
Aug 02 22:10:18 netpulse-box kernel: [ 1420.512] Palo Alto NGFW SPI: Dynamic Session Matched (ALLOW TCP 192.168.1.105:41050 -> 192.168.1.25:443)`
    },
    {
      id: 'tcpdump',
      os: 'linux',
      category: '5. System Control, Logs & Sniffing',
      cmd: 'sudo tcpdump -i eth0 -n port 80',
      altCmd: 'tshark -i eth0',
      desc: 'Command-line packet analyzer for capturing and inspecting live network traffic frames on interface eth0.',
      xp: 70,
      output: `tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
22:12:05.104921 IP 192.168.1.105.51234 > 192.168.1.25.80: Flags [S], seq 3891049512, win 64240, length 0
22:12:05.105189 IP 192.168.1.25.80 > 192.168.1.105.51234: Flags [S.], seq 1049512389, ack 3891049513, win 65535, length 0
22:12:05.105310 IP 192.168.1.105.51234 > 192.168.1.25.80: Flags [.], ack 1, win 502, length 0 [TCP 3-Way Handshake Established]
22:12:05.105950 IP 192.168.1.105.51234 > 192.168.1.25.80: Flags [P.], seq 1:125, ack 1, win 502: HTTP: GET /api/v1/customers HTTP/1.1`
    }
  ];

  // Execute Command Logic
  const handleExecuteCommand = (rawCmd) => {
    const input = rawCmd.trim();
    if (!input) return;

    const matchedTut = commandTutorials.find(t => 
      t.cmd.toLowerCase() === input.toLowerCase() || 
      input.toLowerCase().startsWith(t.cmd.split(' ')[0])
    );

    let outputText = '';
    let gainedXp = 0;

    if (input.toLowerCase() === 'clear') {
      setCliLogs([]);
      setCommandInput('');
      return;
    } else if (input.toLowerCase() === 'help' || input.toLowerCase() === 'commands') {
      outputText = `NetPulse Command Reference & Tutor:
- ip a / ipconfig /all : Show network interface IP addresses & MACs
- ping -c 4 8.8.8.8 : Test ICMP connectivity & round-trip latency
- traceroute 8.8.8.8 : Trace hop-by-hop router paths
- nslookup app.corp.com : Perform DNS hostname resolution
- netstat -tulpn : Show listening TCP/UDP ports & socket PIDs
- arp -a : Display Address Resolution Protocol MAC cache
- systemctl status nginx : Check systemd service status
- tail -n 20 /var/log/syslog : Inspect live log events
- sudo tcpdump -i eth0 -n port 80 : Sniff live network packet frames
- clear : Clear terminal screen`;
    } else if (matchedTut) {
      outputText = matchedTut.output;
      if (!executedCmds.has(matchedTut.id)) {
        gainedXp = matchedTut.xp;
        setExecutedCmds(prev => new Set(prev).add(matchedTut.id));
        setXp(prev => prev + gainedXp);
      }
    } else {
      outputText = osMode === 'linux'
        ? `bash: ${input}: command executed successfully (Default Mock Output).\nType "help" to view full tutorial command suite.`
        : `C:\\Users\\SysAdmin> ${input} executed successfully.\nType "help" to view Windows command tutorials.`;
      if (!executedCmds.has(input)) {
        gainedXp = 25;
        setExecutedCmds(prev => new Set(prev).add(input));
        setXp(prev => prev + 25);
      }
    }

    setCliLogs(prev => [
      ...prev,
      { type: 'cmd', text: `${osMode === 'linux' ? 'sysadmin@netpulse-box:~$ ' : 'C:\\Users\\SysAdmin> '}${input}` },
      { type: 'res', text: outputText, xpGained: gainedXp }
    ]);

    setCommandInput('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP GAMIFIED PROGRESS & LEVEL HEADER BAR */}
      <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 shadow-2xl font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-xl shadow-cyan-500/20 text-white">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-950 text-cyan-300 border border-cyan-700">
                  LEVEL {currentRank.level}
                </span>
                <span className="text-base font-black text-slate-100">{currentRank.title}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Badge Title: <span className="text-amber-400 font-extrabold">{currentRank.badge}</span>
              </p>
            </div>
          </div>

          {/* XP STATS & OS TERMINAL SELECTOR */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Command XP</p>
              <p className="text-lg font-black text-emerald-400">{xp} XP</p>
            </div>

            {/* OS Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setOsMode('linux')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                  osMode === 'linux'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🐧 Linux Terminal (Bash)
              </button>
              <button
                onClick={() => setOsMode('windows')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                  osMode === 'windows'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🪟 Windows (CMD / PowerShell)
              </button>
            </div>
          </div>
        </div>

        {/* LEVEL XP PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Progress to Level {nextRank.level} ({nextRank.title}):</span>
            <span className="text-cyan-400">{xp} / {nextRank.reqXp} XP ({Math.round(progressPercent)}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500 rounded-full"
            ></div>
          </div>
        </div>
      </div>

      {/* DUAL TERMINAL SIMULATOR STAGE */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-2xl bg-slate-950/90 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">
              {osMode === 'linux' ? 'Linux Bash Terminal (sysadmin@netpulse-box:~)' : 'Windows Command Prompt (C:\\Users\\SysAdmin>)'}
            </h3>
          </div>
          <button
            onClick={() => setCliLogs([])}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Screen</span>
          </button>
        </div>

        {/* TERMINAL LOG DISPLAY STAGE */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 min-h-[300px] max-h-[420px] overflow-y-auto space-y-2 text-xs font-mono select-text shadow-inner scrollbar-thin">
          {cliLogs.map((log, idx) => (
            <div key={idx} className="space-y-1">
              {log.type === 'sys' && (
                <p className="text-slate-400 italic">{log.text}</p>
              )}
              {log.type === 'cmd' && (
                <p className="text-cyan-300 font-extrabold">{log.text}</p>
              )}
              {log.type === 'res' && (
                <div className="space-y-1">
                  <pre className="text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">{log.text}</pre>
                  {log.xpGained > 0 && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-extrabold animate-pulse">
                      + {log.xpGained} XP GAINED!
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* TERMINAL INPUT FORM */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand(commandInput);
          }}
          className="flex items-center gap-2"
        >
          <span className="text-cyan-400 font-black text-sm shrink-0">
            {osMode === 'linux' ? 'sysadmin@netpulse-box:~$ ' : 'C:\\Users\\SysAdmin> '}
          </span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder='Type command here (e.g. "ip a", "ping 8.8.8.8", "nslookup app.corp.com")...'
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>Run ⚡</span>
          </button>
        </form>
      </div>

      {/* ESSENTIAL COMMAND TUTORIALS & LEVEL-UP QUESTS */}
      <div className="space-y-4 font-mono">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Essential Networking & Sysadmin Command Tutorials:</span>
          </h3>
          <span className="text-xs text-slate-400">Click any card to execute command & earn XP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {commandTutorials.map((tut) => {
            const isCompleted = executedCmds.has(tut.id);
            return (
              <div
                key={tut.id}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/80 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                      {tut.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      isCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {isCompleted ? '✓ Completed' : `+${tut.xp} XP`}
                    </span>
                  </div>

                  <p className="text-sm font-black text-slate-100 bg-slate-900/90 p-2 rounded-xl border border-slate-800 font-mono text-cyan-300">
                    {tut.cmd}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{tut.desc}</p>
                </div>

                <button
                  onClick={() => handleExecuteCommand(tut.cmd)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCompleted
                      ? 'bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border-emerald-500/80'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 border-cyan-400 shadow-md'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isCompleted ? 'Re-Run Command ⚡' : 'Execute Command (+XP) ⚡'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
