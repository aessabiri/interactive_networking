import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Send, 
  RotateCcw, 
  Search, 
  Check, 
  Monitor
} from 'lucide-react';

export default function LabNotebook() {
  const [osMode, setOsMode] = useState('bash'); // 'bash' (Linux Bash) or 'cmd' (Windows CMD)
  const [commandInput, setCommandInput] = useState('');
  const [executedCmds, setExecutedCmds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [faintGlow, setFaintGlow] = useState(false);

  // VIRTUAL FILE SYSTEM STATE FOR LINUX BASH
  const [linuxCwd, setLinuxCwd] = useState('/home/sysadmin');
  const [linuxFs, setLinuxFs] = useState({
    '/': { type: 'dir', children: ['home', 'var', 'etc', 'usr', 'bin'] },
    '/home': { type: 'dir', children: ['sysadmin'] },
    '/home/sysadmin': { type: 'dir', children: ['Documents', 'Downloads', 'network_configs', 'notes.txt', 'script.sh'] },
    '/home/sysadmin/Documents': { type: 'dir', children: ['network_topology.json', 'cisco_ios_backup.cfg'] },
    '/home/sysadmin/Downloads': { type: 'dir', children: ['paloalto_panos_10.1.qcow2', 'wireshark_capture.pcap'] },
    '/home/sysadmin/network_configs': { type: 'dir', children: ['router_core.cfg', 'switch_access.cfg', 'firewall_rules.acl'] },
    '/home/sysadmin/notes.txt': { type: 'file', size: 240, content: 'NetPulse Enterprise Network Lab Notes:\n- Core Gateway Router: 192.168.1.254\n- DNS Server: 192.168.1.20\n- Palo Alto NGFW: 192.168.1.1' },
    '/home/sysadmin/script.sh': { type: 'file', size: 128, content: '#!/bin/bash\necho "Checking interface IP addresses..."\nip a' },
    '/var': { type: 'dir', children: ['log'] },
    '/var/log': { type: 'dir', children: ['syslog', 'auth.log', 'nginx.log'] },
    '/var/log/syslog': { type: 'file', size: 1024, content: 'Aug 02 22:15:01 netpulse-box systemd[1]: Network interfaces initialized.\nAug 02 22:15:05 netpulse-box krb5kdc[892]: AS_REQ 192.168.1.105: ISSUE sales.user@CORP.COM' },
    '/var/log/auth.log': { type: 'file', size: 512, content: 'Aug 02 22:14:00 netpulse-box sshd[1042]: Accepted password for sysadmin from 192.168.1.105 port 51234' },
    '/etc': { type: 'dir', children: ['hosts', 'resolv.conf', 'network'] },
    '/etc/hosts': { type: 'file', size: 180, content: '127.0.0.1   localhost\n192.168.1.15   dc01.corp.com dc01\n192.168.1.25   app.corp.com' },
    '/etc/resolv.conf': { type: 'file', size: 64, content: 'nameserver 192.168.1.20\nsearch corp.com' }
  });

  // VIRTUAL FILE SYSTEM STATE FOR WINDOWS CMD
  const [windowsCwd, setWindowsCwd] = useState('C:\\Users\\SysAdmin');
  const [windowsFs, setWindowsFs] = useState({
    'C:\\': { type: 'dir', children: ['Users', 'Windows', 'Program Files'] },
    'C:\\Users': { type: 'dir', children: ['SysAdmin', 'Public'] },
    'C:\\Users\\SysAdmin': { type: 'dir', children: ['Desktop', 'Documents', 'Downloads', 'Config_Exports', 'notes.txt'] },
    'C:\\Users\\SysAdmin\\Desktop': { type: 'dir', children: ['NetPulse_Lab.lnk', 'Putty_SSH.lnk'] },
    'C:\\Users\\SysAdmin\\Documents': { type: 'dir', children: ['cisco_ios_running_config.txt', 'network_subnet_plan.xlsx'] },
    'C:\\Users\\SysAdmin\\Config_Exports': { type: 'dir', children: ['router_cisco_2911.cfg', 'switch_catalyst_3850.cfg'] },
    'C:\\Users\\SysAdmin\\notes.txt': { type: 'file', size: 312, content: 'Windows SysAdmin Network Notes:\n- Domain Controller: DC01.corp.com (192.168.1.15)\n- DHCP Server: 192.168.1.10\n- DNS Primary: 192.168.1.20' },
    'C:\\Windows': { type: 'dir', children: ['System32', 'SysWOW64'] },
    'C:\\Windows\\System32': { type: 'dir', children: ['cmd.exe', 'drivers', 'ipconfig.exe', 'ping.exe', 'tracert.exe'] },
    'C:\\Windows\\System32\\drivers': { type: 'dir', children: ['etc'] },
    'C:\\Windows\\System32\\drivers\\etc': { type: 'dir', children: ['hosts', 'lmhosts', 'networks', 'protocol', 'services'] },
    'C:\\Windows\\System32\\drivers\\etc\\hosts': { type: 'file', size: 150, content: '# Copyright (c) 1993-2009 Microsoft Corp.\n127.0.0.1       localhost\n192.168.1.15    dc01.corp.com' }
  });

  // SEPARATE ISOLATED LOGS
  const [linuxLogs, setLinuxLogs] = useState([
    { type: 'sys', text: 'GNU Bash Interactive Terminal Environment (sysadmin@netpulse-box:~).' },
    { type: 'sys', text: 'Simulates interactive Linux file system navigation (cd, ls, pwd, cat, mkdir, touch, rm).' }
  ]);

  const [windowsLogs, setWindowsLogs] = useState([
    { type: 'sys', text: 'Microsoft Windows Command Prompt [Version 10.0.19045.3803].' },
    { type: 'sys', text: 'Simulates interactive Windows file system navigation (cd, dir, type, mkdir, del).' }
  ]);

  const logsContainerRef = useRef(null);

  const activeLogs = osMode === 'bash' ? linuxLogs : windowsLogs;

  // Scroll internal terminal box ONLY when active logs update
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [linuxLogs, windowsLogs, osMode]);

  // 50 Essential Command Tutorials Suite
  const commandTutorials = [
    // Navigation & File Operations
    { id: 'c_ls', os: 'linux', cat: 'OS Navigation', cmd: 'ls', desc: 'List files and directories in current working directory.', out: `Documents  Downloads  network_configs  notes.txt  script.sh` },
    { id: 'c_ls_la', os: 'linux', cat: 'OS Navigation', cmd: 'ls -la', desc: 'List all files with hidden dotfiles, file permissions, owners, and sizes.', out: `drwxr-xr-x 5 sysadmin sysadmin 4096 Aug  2 22:15 .\ndrwxr-xr-x 3 root     root     4096 Aug  2 21:00 ..\ndrwxr-xr-x 2 sysadmin sysadmin 4096 Aug  2 22:00 Documents\ndrwxr-xr-x 2 sysadmin sysadmin 4096 Aug  2 22:00 Downloads\ndrwxr-xr-x 2 sysadmin sysadmin 4096 Aug  2 22:00 network_configs\n-rw-r--r-- 1 sysadmin sysadmin  240 Aug  2 22:10 notes.txt\n-rwxr-xr-x 1 sysadmin sysadmin  128 Aug  2 22:12 script.sh` },
    { id: 'c_pwd', os: 'linux', cat: 'OS Navigation', cmd: 'pwd', desc: 'Print working directory path.', out: `/home/sysadmin` },
    { id: 'c_cd', os: 'linux', cat: 'OS Navigation', cmd: 'cd /var/log', desc: 'Change current working directory to /var/log.', out: `` },
    { id: 'c_cat', os: 'linux', cat: 'OS Navigation', cmd: 'cat notes.txt', desc: 'Display contents of a file.', out: `NetPulse Enterprise Network Lab Notes:\n- Core Gateway Router: 192.168.1.254\n- DNS Server: 192.168.1.20\n- Palo Alto NGFW: 192.168.1.1` },
    { id: 'c_dir', os: 'windows', cat: 'OS Navigation', cmd: 'dir', desc: 'List files and directories in Windows CMD.', out: ` Volume in drive C has no label.\n Volume Serial Number is A1B2-C3D4\n\n Directory of C:\\Users\\SysAdmin\n\n08/02/2026  10:15 PM    <DIR>          Desktop\n08/02/2026  10:15 PM    <DIR>          Documents\n08/02/2026  10:15 PM    <DIR>          Downloads\n08/02/2026  10:15 PM    <DIR>          Config_Exports\n08/02/2026  10:10 PM               312 notes.txt\n               1 File(s)            312 bytes\n               4 Dir(s)  45,210,480,640 bytes free` },
    { id: 'c_type', os: 'windows', cat: 'OS Navigation', cmd: 'type notes.txt', desc: 'Display contents of a text file in Windows CMD.', out: `Windows SysAdmin Network Notes:\n- Domain Controller: DC01.corp.com (192.168.1.15)\n- DHCP Server: 192.168.1.10\n- DNS Primary: 192.168.1.20` },
    { id: 'c_cd_win', os: 'windows', cat: 'OS Navigation', cmd: 'cd C:\\Windows\\System32', desc: 'Change directory to System32 in Windows CMD.', out: `` },

    // Networking Commands
    { id: 'c1', os: 'linux', cat: 'Network Interfaces', cmd: 'ip a', desc: 'Display all Linux network interfaces (eth0, lo), MACs, and assigned IPv4/IPv6 addresses.', out: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default \n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default \n    link/ether 00:1a:2b:3c:4d:01 brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.105/24 brd 192.168.1.255 scope global dynamic eth0` },
    { id: 'c2', os: 'windows', cat: 'Network Interfaces', cmd: 'ipconfig /all', desc: 'Display full Windows IP configuration including MAC, Default Gateway, DHCP, and DNS Servers.', out: `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : WS-SALES-LAP105\n   Primary Dns Suffix  . . . . . . . : corp.com\n   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-01\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105(Preferred)\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.254\n   DNS Servers . . . . . . . . . . . : 192.168.1.20` },
    { id: 'c11', os: 'linux', cat: 'ICMP & Path Tracing', cmd: 'ping -c 4 8.8.8.8', desc: 'Send 4 ICMP Echo Requests to test internet connectivity.', out: `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.2 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=13.8 ms\n\n--- 8.8.8.8 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss` },
    { id: 'c12', os: 'windows', cat: 'ICMP & Path Tracing', cmd: 'ping 192.168.1.254', desc: 'Send ICMP Echo Requests to test local default gateway reachability.', out: `Pinging 192.168.1.254 with 32 bytes of data:\nReply from 192.168.1.254: bytes=32 time=1ms TTL=64\nReply from 192.168.1.254: bytes=32 time=1ms TTL=64` },
    { id: 'c13', os: 'linux', cat: 'ICMP & Path Tracing', cmd: 'traceroute 8.8.8.8', desc: 'Trace hop-by-hop router path across network using incrementing TTL.', out: `traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets\n 1  192.168.1.254 (192.168.1.254)  1.104 ms\n 2  192.168.1.1 (192.168.1.1)  2.410 ms` },
    { id: 'c14', os: 'windows', cat: 'ICMP & Path Tracing', cmd: 'tracert 8.8.8.8', desc: 'Trace router path in Windows displaying round-trip delay per hop.', out: `Tracing route to dns.google [8.8.8.8]\n  1    1 ms    1 ms    1 ms  192.168.1.254\n  2    2 ms    2 ms    2 ms  8.8.8.8\nTrace complete.` },
    { id: 'c21', os: 'both', cat: 'DNS & Domains', cmd: 'nslookup app.corp.com', desc: 'Query DNS server for IPv4 address (A Record) of app.corp.com.', out: `Server:  corp-dns.corp.com\nAddress:  192.168.1.20\n\nName:    app.corp.com\nAddress:  192.168.1.25` },
    { id: 'c31', os: 'linux', cat: 'Ports & Firewalls', cmd: 'netstat -tulpn', desc: 'Display listening TCP/UDP sockets, port numbers, and process PIDs in Linux.', out: `Active Internet connections\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1042/nginx` },
    { id: 'c33', os: 'windows', cat: 'Ports & Firewalls', cmd: 'netstat -ano', desc: 'Display active Windows network connections, listening ports, and PIDs.', out: `Active Connections\n  Proto  Local Address          Foreign Address        State           PID\n  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       1042` },
    { id: 'c41', os: 'linux', cat: 'System & Logs', cmd: 'systemctl status nginx', desc: 'Display detailed systemd service status for Nginx web daemon.', out: `● nginx.service - A high performance web server\n     Active: active (running) since Sun 2026-08-02 21:00:15 CEST` }
  ];

  // Internal 50-command Tracking
  const uniqueMasteredCount = Math.min(50, executedCmds.size);
  const completionPercentage = Math.round((uniqueMasteredCount / 50) * 100);

  // Filter commands by active OS
  const filteredTutorials = commandTutorials.filter(t => {
    const isOsMatch = osMode === 'bash' 
      ? (t.os === 'linux' || t.os === 'both')
      : (t.os === 'windows' || t.os === 'both');
    
    const isSearchMatch = searchQuery === '' ||
      t.cmd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cat.toLowerCase().includes(searchQuery.toLowerCase());

    return isOsMatch && isSearchMatch;
  });

  const handleClearTerminal = () => {
    if (osMode === 'bash') setLinuxLogs([]);
    else setWindowsLogs([]);
  };

  // INTERACTIVE OS FILESYSTEM COMMAND SIMULATOR (cd, ls, dir, pwd, cat, type, mkdir, touch, rm)
  const handleExecuteCommand = (rawCmd) => {
    const input = rawCmd.trim();
    if (!input) return;

    const parts = input.split(' ').filter(Boolean);
    const cmdName = parts[0].toLowerCase();
    const arg1 = parts[1] || '';

    let outputText = '';
    let isSuccess = false;

    if (cmdName === 'clear' || cmdName === 'cls') {
      handleClearTerminal();
      setCommandInput('');
      return;
    }

    // --- LINUX BASH OS SIMULATION ---
    if (osMode === 'bash') {
      if (cmdName === 'pwd') {
        outputText = linuxCwd;
        isSuccess = true;
      } else if (cmdName === 'ls') {
        const node = linuxFs[linuxCwd];
        if (node && node.type === 'dir') {
          if (arg1 === '-la' || arg1 === '-l') {
            const listStr = node.children.map(childName => {
              const fullPath = linuxCwd === '/' ? `/${childName}` : `${linuxCwd}/${childName}`;
              const childNode = linuxFs[fullPath];
              const isDir = childNode && childNode.type === 'dir';
              const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
              const size = isDir ? 4096 : (childNode?.size || 128);
              return `${perm} 1 sysadmin sysadmin ${String(size).padStart(5, ' ')} Aug 2 22:30 ${childName}`;
            }).join('\n');
            outputText = `total ${node.children.length * 4}\n${listStr}`;
          } else {
            outputText = node.children.join('  ');
          }
          isSuccess = true;
        }
      } else if (cmdName === 'cd') {
        if (!arg1 || arg1 === '~') {
          setLinuxCwd('/home/sysadmin');
          outputText = '';
          isSuccess = true;
        } else if (arg1 === '..') {
          if (linuxCwd !== '/') {
            const lastSlash = linuxCwd.lastIndexOf('/');
            const parent = linuxCwd.substring(0, lastSlash) || '/';
            setLinuxCwd(parent);
          }
          outputText = '';
          isSuccess = true;
        } else {
          let targetPath = arg1.startsWith('/') ? arg1 : (linuxCwd === '/' ? `/${arg1}` : `${linuxCwd}/${arg1}`);
          if (linuxFs[targetPath] && linuxFs[targetPath].type === 'dir') {
            setLinuxCwd(targetPath);
            outputText = '';
            isSuccess = true;
          } else {
            outputText = `bash: cd: ${arg1}: No such file or directory`;
            isSuccess = false;
          }
        }
      } else if (cmdName === 'cat') {
        let filePath = arg1.startsWith('/') ? arg1 : (linuxCwd === '/' ? `/${arg1}` : `${linuxCwd}/${arg1}`);
        const fileNode = linuxFs[filePath];
        if (fileNode && fileNode.type === 'file') {
          outputText = fileNode.content;
          isSuccess = true;
        } else {
          outputText = `cat: ${arg1 || 'file'}: No such file or directory`;
          isSuccess = false;
        }
      } else if (cmdName === 'mkdir') {
        if (!arg1) {
          outputText = `mkdir: missing operand`;
          isSuccess = false;
        } else {
          let newDirPath = linuxCwd === '/' ? `/${arg1}` : `${linuxCwd}/${arg1}`;
          setLinuxFs(prev => ({
            ...prev,
            [linuxCwd]: { ...prev[linuxCwd], children: [...prev[linuxCwd].children, arg1] },
            [newDirPath]: { type: 'dir', children: [] }
          }));
          outputText = ``;
          isSuccess = true;
        }
      } else if (cmdName === 'touch') {
        if (!arg1) {
          outputText = `touch: missing file operand`;
          isSuccess = false;
        } else {
          let newFilePath = linuxCwd === '/' ? `/${arg1}` : `${linuxCwd}/${arg1}`;
          setLinuxFs(prev => ({
            ...prev,
            [linuxCwd]: { ...prev[linuxCwd], children: [...prev[linuxCwd].children, arg1] },
            [newFilePath]: { type: 'file', size: 0, content: '' }
          }));
          outputText = ``;
          isSuccess = true;
        }
      } else if (cmdName === 'rm') {
        if (!arg1) {
          outputText = `rm: missing operand`;
          isSuccess = false;
        } else {
          setLinuxFs(prev => ({
            ...prev,
            [linuxCwd]: { ...prev[linuxCwd], children: prev[linuxCwd].children.filter(c => c !== arg1) }
          }));
          outputText = ``;
          isSuccess = true;
        }
      } else if (cmdName === 'dir' || cmdName === 'type') {
        // REJECT WINDOWS COMMANDS IN BASH
        outputText = `bash: ${cmdName}: command not found (Did you mean "${cmdName === 'dir' ? 'ls' : 'cat'}"?)`;
        isSuccess = false;
      }
    }

    // --- WINDOWS CMD OS SIMULATION ---
    if (osMode === 'cmd') {
      if (cmdName === 'dir') {
        const node = windowsFs[windowsCwd];
        if (node && node.type === 'dir') {
          const listStr = node.children.map(childName => {
            const fullPath = `${windowsCwd}\\${childName}`;
            const childNode = windowsFs[fullPath];
            const isDir = childNode && childNode.type === 'dir';
            const tag = isDir ? '<DIR>         ' : '              ';
            const size = isDir ? '' : String(childNode?.size || 256).padStart(8, ' ');
            return `08/02/2026  10:20 PM    ${tag} ${size} ${childName}`;
          }).join('\n');
          outputText = ` Volume in drive C has no label.\n Volume Serial Number is A1B2-C3D4\n\n Directory of ${windowsCwd}\n\n${listStr}\n               ${node.children.length} File(s)/Dir(s)`;
          isSuccess = true;
        }
      } else if (cmdName === 'cd' || cmdName === 'chdir') {
        if (!arg1) {
          outputText = windowsCwd;
          isSuccess = true;
        } else if (arg1 === '..') {
          if (windowsCwd !== 'C:\\') {
            const lastSlash = windowsCwd.lastIndexOf('\\');
            const parent = windowsCwd.substring(0, lastSlash) || 'C:\\';
            setWindowsCwd(parent);
          }
          outputText = '';
          isSuccess = true;
        } else {
          let targetPath = arg1.includes(':\\') ? arg1 : `${windowsCwd}\\${arg1}`;
          if (windowsFs[targetPath] && windowsFs[targetPath].type === 'dir') {
            setWindowsCwd(targetPath);
            outputText = '';
            isSuccess = true;
          } else {
            outputText = `The system cannot find the path specified.`;
            isSuccess = false;
          }
        }
      } else if (cmdName === 'type') {
        let filePath = arg1.includes(':\\') ? arg1 : `${windowsCwd}\\${arg1}`;
        const fileNode = windowsFs[filePath];
        if (fileNode && fileNode.type === 'file') {
          outputText = fileNode.content;
          isSuccess = true;
        } else {
          outputText = `The system cannot find the file specified.`;
          isSuccess = false;
        }
      } else if (cmdName === 'mkdir' || cmdName === 'md') {
        if (!arg1) {
          outputText = `The syntax of the command is incorrect.`;
          isSuccess = false;
        } else {
          let newDirPath = `${windowsCwd}\\${arg1}`;
          setWindowsFs(prev => ({
            ...prev,
            [windowsCwd]: { ...prev[windowsCwd], children: [...prev[windowsCwd].children, arg1] },
            [newDirPath]: { type: 'dir', children: [] }
          }));
          outputText = ``;
          isSuccess = true;
        }
      } else if (cmdName === 'del') {
        if (!arg1) {
          outputText = `The syntax of the command is incorrect.`;
          isSuccess = false;
        } else {
          setWindowsFs(prev => ({
            ...prev,
            [windowsCwd]: { ...prev[windowsCwd], children: prev[windowsCwd].children.filter(c => c !== arg1) }
          }));
          outputText = ``;
          isSuccess = true;
        }
      } else if (cmdName === 'ls' || cmdName === 'cat' || cmdName === 'pwd') {
        // REJECT LINUX COMMANDS IN CMD
        outputText = `'${cmdName}' is not recognized as an internal or external command, operable program or batch file.`;
        isSuccess = false;
      }
    }

    // --- FALLBACK FOR NETWORKING & TUTORIAL COMMANDS ---
    if (!outputText && !isSuccess) {
      const matchedTut = commandTutorials.find(t => 
        t.cmd.toLowerCase() === input.toLowerCase() || 
        t.cmd.toLowerCase().startsWith(cmdName)
      );

      if (cmdName === 'help') {
        outputText = osMode === 'bash' 
          ? `Linux Bash Command Reference:\n- cd <dir> / pwd / ls -la : File system navigation\n- cat <file> / mkdir <dir> / touch <file> / rm <file> : File management\n- ip a / ping / traceroute / dig / ss -tulpn / systemctl : Networking`
          : `Windows Command Prompt Reference:\n- cd <dir> / dir / type <file> / mkdir <dir> / del <file> : File system\n- ipconfig /all / ping / tracert / nslookup / netstat -ano : Networking`;
        isSuccess = true;
      } else if (matchedTut) {
        const isTutAllowed = osMode === 'bash' 
          ? (matchedTut.os === 'linux' || matchedTut.os === 'both')
          : (matchedTut.os === 'windows' || matchedTut.os === 'both');

        if (isTutAllowed) {
          outputText = matchedTut.out;
          isSuccess = true;
          if (!executedCmds.has(matchedTut.id)) {
            setExecutedCmds(prev => new Set(prev).add(matchedTut.id));
          }
        } else {
          outputText = osMode === 'bash'
            ? `bash: ${cmdName}: command not found\n[Bash Notice: "${input}" is a Windows CMD command. Switch to Windows CMD mode to run it.]`
            : `'${cmdName}' is not recognized as an internal or external command, operable program or batch file.`;
          isSuccess = false;
        }
      } else {
        outputText = osMode === 'bash'
          ? `bash: ${input}: command executed successfully.`
          : `C:\\Users\\SysAdmin> ${input} executed successfully.`;
        isSuccess = true;
        if (!executedCmds.has(input)) {
          setExecutedCmds(prev => new Set(prev).add(input));
        }
      }
    }

    if (isSuccess) {
      setFaintGlow(true);
      setTimeout(() => setFaintGlow(false), 800);
    }

    // Dynamic Prompt String based on CWD
    const promptStr = osMode === 'bash'
      ? `sysadmin@netpulse-box:${linuxCwd.replace('/home/sysadmin', '~')}$`
      : `${windowsCwd}>`;

    // Append to active OS log
    if (osMode === 'bash') {
      setLinuxLogs(prev => [
        ...prev,
        { type: 'cmd', text: `${promptStr} ${input}` },
        { type: 'res', text: outputText, isError: !isSuccess }
      ]);
    } else {
      setWindowsLogs(prev => [
        ...prev,
        { type: 'cmd', text: `${promptStr} ${input}` },
        { type: 'res', text: outputText, isError: !isSuccess }
      ]);
    }

    setCommandInput('');
  };

  const activePromptStr = osMode === 'bash'
    ? `sysadmin@netpulse-box:${linuxCwd.replace('/home/sysadmin', '~')}$`
    : `${windowsCwd}>`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">
      
      {/* TOP HEADER & UNLABELED DYNAMIC PROGRESS BAR */}
      <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 shadow-2xl font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-slate-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Isolated OS CLI & File System Simulator</span>
            </h1>
          </div>

          {/* OS TERMINAL MODE SWITCHER */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setOsMode('bash')}
              className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer text-xs flex items-center gap-2 ${
                osMode === 'bash'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>🐧 Linux (Bash)</span>
            </button>

            <button
              onClick={() => setOsMode('cmd')}
              className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer text-xs flex items-center gap-2 ${
                osMode === 'cmd'
                  ? 'bg-black text-white border border-gray-700 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>🪟 Windows (CMD)</span>
            </button>
          </div>
        </div>

        {/* UNLABELED PROGRESS BAR WITH DYNAMIC COLOR FILL */}
        <div className="pt-2 border-t border-slate-800">
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
            <div 
              style={{ width: `${completionPercentage}%` }}
              className={`h-full transition-all duration-700 rounded-full shadow-lg ${
                completionPercentage < 25
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : completionPercentage < 50
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : completionPercentage < 75
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* DUAL THEMED ISOLATED TERMINAL WINDOW STAGE */}
      <div 
        className={`transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl font-mono ${
          osMode === 'cmd' 
            ? 'bg-black border-2 border-gray-800 text-gray-200' 
            : 'glass-panel border border-slate-800 bg-slate-950/90 text-slate-100'
        } ${
          faintGlow ? 'ring-2 ring-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : ''
        }`}
      >
        
        {/* WINDOW HEADER BAR */}
        {osMode === 'cmd' ? (
          <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800 select-none">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-300">Command Prompt - C:\Windows\system32\cmd.exe</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
              <span>_</span>
              <span>□</span>
              <span className="hover:text-red-400 cursor-pointer">✕</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 px-4 py-3 flex items-center justify-between border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span className="text-xs font-extrabold text-slate-300 ml-2">sysadmin@netpulse-box:~ (bash)</span>
            </div>

            <button
              onClick={handleClearTerminal}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Terminal</span>
            </button>
          </div>
        )}

        {/* TERMINAL OUTPUT AREA */}
        <div 
          ref={logsContainerRef}
          className={`p-5 min-h-[340px] max-h-[460px] overflow-y-auto space-y-2 text-xs font-mono select-text scrollbar-thin ${
            osMode === 'cmd' ? 'bg-black text-gray-200' : 'bg-slate-950/95 text-slate-200'
          }`}
        >
          {osMode === 'cmd' && (
            <div className="space-y-0.5 mb-3 text-gray-400">
              <p>Microsoft Windows [Version 10.0.19045.3803]</p>
              <p>(c) Microsoft Corporation. All rights reserved.</p>
            </div>
          )}

          {activeLogs.map((log, idx) => (
            <div key={idx} className="space-y-1">
              {log.type === 'sys' && (
                <p className={osMode === 'cmd' ? 'text-gray-400' : 'text-slate-400 italic'}>{log.text}</p>
              )}
              {log.type === 'cmd' && (
                <div className="font-extrabold flex items-center gap-1.5">
                  {osMode === 'bash' ? (
                    <p className="text-cyan-300">
                      <span className="text-emerald-400">{log.text.split(' ')[0]}</span> {log.text.substring(log.text.indexOf(' ') + 1)}
                    </p>
                  ) : (
                    <p className="text-gray-200">{log.text}</p>
                  )}
                </div>
              )}
              {log.type === 'res' && log.text && (
                <pre className={`font-mono whitespace-pre-wrap leading-relaxed ${
                  log.isError 
                    ? 'text-rose-400 font-bold' 
                    : osMode === 'cmd' 
                    ? 'text-gray-300' 
                    : 'text-emerald-300'
                }`}>{log.text}</pre>
              )}
            </div>
          ))}
        </div>

        {/* TERMINAL INPUT FORM */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand(commandInput);
          }}
          className={`p-3 border-t flex items-center gap-2 ${
            osMode === 'cmd' ? 'bg-black border-gray-800' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <span className={`${osMode === 'bash' ? 'text-emerald-400' : 'text-gray-200'} font-bold text-xs shrink-0 font-mono`}>
            {activePromptStr}
          </span>

          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={osMode === 'bash' ? 'type Linux command (e.g. "ls -la", "cd /var/log", "cat notes.txt", "ip a")...' : 'type Windows command (e.g. "dir", "cd System32", "type notes.txt", "ipconfig /all")...'}
            className={`flex-1 bg-transparent px-3 py-2 text-xs font-bold focus:outline-none font-mono ${
              osMode === 'cmd' ? 'text-gray-100' : 'text-slate-100'
            }`}
          />

          <button
            type="submit"
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              osMode === 'cmd'
                ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md font-black'
            }`}
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </button>
        </form>
      </div>

      {/* TUTORIAL CARDS DIRECTORY */}
      <div className="space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              <span>{osMode === 'bash' ? '🐧 Native Linux Commands' : '🪟 Native Windows Commands'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-cyan-400 border border-slate-800 font-bold">
                {filteredTutorials.length} Commands
              </span>
            </h3>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${osMode === 'bash' ? 'Linux' : 'Windows'} commands...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* COMMAND CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTutorials.map((tut) => {
            const isDone = executedCmds.has(tut.id);
            return (
              <div
                key={tut.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 flex flex-col justify-between ${
                  isDone
                    ? 'bg-slate-900/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/90 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                      {tut.cat}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-950 text-slate-400 border border-slate-800">
                      {tut.os === 'linux' ? '🐧 Linux' : tut.os === 'windows' ? '🪟 Windows' : '🌐 Cross-OS'}
                    </span>
                  </div>

                  <p className="text-xs font-black text-slate-100 bg-slate-900/90 p-2 rounded-xl border border-slate-800 font-mono text-cyan-300 truncate">
                    {tut.cmd}
                  </p>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{tut.desc}</p>
                </div>

                <button
                  onClick={() => handleExecuteCommand(tut.cmd)}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isDone
                      ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-600/80'
                      : osMode === 'cmd'
                      ? 'bg-gray-900 hover:bg-gray-800 text-white border-gray-700'
                      : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
                  }`}
                >
                  <span>{isDone ? 'Re-Run Command' : 'Execute Command'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
