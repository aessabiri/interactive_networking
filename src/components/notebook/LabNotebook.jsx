import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Terminal, 
  Send, 
  RotateCcw, 
  Search, 
  Check, 
  Monitor,
  Folder,
  Globe,
  Radio,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';

export default function LabNotebook() {
  const { lang, t } = useLanguage();
  const [osMode, setOsMode] = useState('bash'); // 'bash' (Linux Bash) or 'cmd' (Windows CMD)
  const [commandInput, setCommandInput] = useState('');
  const [executedCmds, setExecutedCmds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
    { type: 'sys', text: 'Select command categories below (Basic OS Navigation, Network Interfaces, ICMP Tracing, DNS, Ports/Firewalls, System Logs).' }
  ]);

  const [windowsLogs, setWindowsLogs] = useState([
    { type: 'sys', text: 'Microsoft Windows Command Prompt [Version 10.0.19045.3803].' },
    { type: 'sys', text: 'Select command categories below (Basic OS Navigation, Network Interfaces, ICMP Tracing, DNS, Ports/Firewalls, System Logs).' }
  ]);

  const logsContainerRef = useRef(null);

  const activeLogs = osMode === 'bash' ? linuxLogs : windowsLogs;

  // Scroll internal terminal box ONLY when active logs update
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [linuxLogs, windowsLogs, osMode]);

  // Categories list
  const categoriesList = [
    { id: 'All', label: 'All Categories', icon: Layers },
    { id: 'OS Navigation', label: '📁 Basic OS & Navigation', icon: Folder },
    { id: 'Network Interfaces', label: '🌐 Network Interfaces & IP', icon: Globe },
    { id: 'ICMP & Path Tracing', label: '📡 ICMP Connectivity & Path', icon: Radio },
    { id: 'DNS & Domains', label: '🔍 DNS & Domain Services', icon: Search },
    { id: 'Ports & Firewalls', label: '🛡️ Ports, Sockets & Firewalls', icon: ShieldCheck },
    { id: 'System & Logs', label: '⚡ System Daemons & Logs', icon: Cpu }
  ];

  // 50 Essential Command Tutorials Suite (Categorized & OS Isolated)
  const commandTutorials = [
    // 1. Basic OS & Navigation
    { id: 'c_ls', os: 'linux', cat: 'OS Navigation', cmd: 'ls', desc: 'List files and directories in current working directory.', desc_de: 'Dateien und Verzeichnisse im aktuellen Arbeitsverzeichnis auflisten.', out: `Documents  Downloads  network_configs  notes.txt  script.sh` },
    { id: 'c_ls_la', os: 'linux', cat: 'OS Navigation', cmd: 'ls -la', desc: 'List all files with hidden dotfiles, file permissions, owners, and sizes.', desc_de: 'Alle Dateien inklusive versteckter Punktdateien, Zugriffsrechte, Besitzer und Größen anzeigen.', out: `drwxr-xr-x 5 sysadmin sysadmin 4096 Aug  2 22:15 .\ndrwxr-xr-x 3 root     root     4096 Aug  2 21:00 ..\ndrwxr-xr-x 2 sysadmin sysadmin 4096 Aug  2 22:00 Documents\ndrwxr-xr-x 2 sysadmin sysadmin 4096 Aug  2 22:00 Downloads\ndrwxr-xr-x 2 sysadmin sysadmin 4096 Aug  2 22:00 network_configs\n-rw-r--r-- 1 sysadmin sysadmin  240 Aug  2 22:10 notes.txt\n-rwxr-xr-x 1 sysadmin sysadmin  128 Aug  2 22:12 script.sh` },
    { id: 'c_pwd', os: 'linux', cat: 'OS Navigation', cmd: 'pwd', desc: 'Print current working directory path.', desc_de: 'Pfad des aktuellen Arbeitsverzeichnisses ausgeben.', out: `/home/sysadmin` },
    { id: 'c_cd', os: 'linux', cat: 'OS Navigation', cmd: 'cd /var/log', desc: 'Change current working directory to /var/log.', desc_de: 'Arbeitsverzeichnis nach /var/log wechseln.', out: `` },
    { id: 'c_cat', os: 'linux', cat: 'OS Navigation', cmd: 'cat notes.txt', desc: 'Display contents of a file.', desc_de: 'Inhalt einer Datei im Terminal anzeigen.', out: `NetPulse Enterprise Network Lab Notes:\n- Core Gateway Router: 192.168.1.254\n- DNS Server: 192.168.1.20\n- Palo Alto NGFW: 192.168.1.1` },
    { id: 'c_mkdir_lin', os: 'linux', cat: 'OS Navigation', cmd: 'mkdir backups', desc: 'Create a new directory in Linux.', desc_de: 'Neues Verzeichnis in Linux erstellen.', out: `` },
    { id: 'c_touch_lin', os: 'linux', cat: 'OS Navigation', cmd: 'touch config.sys', desc: 'Create a new empty file in Linux.', desc_de: 'Neue leere Datei in Linux erstellen.', out: `` },
    { id: 'c_rm_lin', os: 'linux', cat: 'OS Navigation', cmd: 'rm script.sh', desc: 'Remove a file in Linux.', desc_de: 'Datei in Linux löschen.', out: `` },

    { id: 'c_dir', os: 'windows', cat: 'OS Navigation', cmd: 'dir', desc: 'List files and directories in Windows CMD.', desc_de: 'Dateien und Ordner in der Windows-Eingabeaufforderung (CMD) auflisten.', out: ` Volume in drive C has no label.\n Volume Serial Number is A1B2-C3D4\n\n Directory of C:\\Users\\SysAdmin\n\n08/02/2026  10:15 PM    <DIR>          Desktop\n08/02/2026  10:15 PM    <DIR>          Documents\n08/02/2026  10:15 PM    <DIR>          Downloads\n08/02/2026  10:15 PM    <DIR>          Config_Exports\n08/02/2026  10:10 PM               312 notes.txt\n               1 File(s)            312 bytes\n               4 Dir(s)  45,210,480,640 bytes free` },
    { id: 'c_type', os: 'windows', cat: 'OS Navigation', cmd: 'type notes.txt', desc: 'Display contents of a text file in Windows CMD.', desc_de: 'Inhalt einer Textdatei in Windows CMD anzeigen.', out: `Windows SysAdmin Network Notes:\n- Domain Controller: DC01.corp.com (192.168.1.15)\n- DHCP Server: 192.168.1.10\n- DNS Primary: 192.168.1.20` },
    { id: 'c_cd_win', os: 'windows', cat: 'OS Navigation', cmd: 'cd C:\\Windows\\System32', desc: 'Change directory to System32 in Windows CMD.', desc_de: 'Verzeichnis zu System32 in Windows CMD wechseln.', out: `` },
    { id: 'c_mkdir_win', os: 'windows', cat: 'OS Navigation', cmd: 'mkdir Backups', desc: 'Create a new directory in Windows CMD.', desc_de: 'Neuen Ordner in Windows CMD erstellen.', out: `` },
    { id: 'c_del_win', os: 'windows', cat: 'OS Navigation', cmd: 'del notes.txt', desc: 'Delete a file in Windows CMD.', desc_de: 'Datei in Windows CMD löschen.', out: `` },

    // 2. Network Interfaces & IP Configuration
    { id: 'c1', os: 'linux', cat: 'Network Interfaces', cmd: 'ip a', desc: 'Display all Linux network interfaces (eth0, lo), MACs, and assigned IPv4/IPv6 addresses.', desc_de: 'Alle Linux-Netzwerkschnittstellen, MAC-Adressen und zugewiesenen IPv4/IPv6-Adressen anzeigen.', out: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default \n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default \n    link/ether 00:1a:2b:3c:4d:01 brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.105/24 brd 192.168.1.255 scope global dynamic eth0` },
    { id: 'c3', os: 'linux', cat: 'Network Interfaces', cmd: 'ip link', desc: 'Display L2 Ethernet link layer status and MAC addresses without IP details.', desc_de: 'L2 Ethernet-Link-Layer Status und MAC-Adressen ohne IP-Details anzeigen.', out: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000\n    link/ether 00:1a:2b:3c:4d:01 brd ff:ff:ff:ff:ff:ff` },
    { id: 'c4', os: 'linux', cat: 'Network Interfaces', cmd: 'hostname -I', desc: 'Display host machine IP addresses in concise single-line format.', desc_de: 'IP-Adressen des Hosts in kompakter einzeiliger Form ausgeben.', out: `192.168.1.105 172.17.0.1` },
    { id: 'c8', os: 'linux', cat: 'Network Interfaces', cmd: 'cat /etc/resolv.conf', desc: 'Inspect configured Linux DNS nameserver resolvers and search domains.', desc_de: 'Konfigurierte Linux DNS-Nameserver-Resolver und Suchdomänen prüfen.', out: `# Generated by NetworkManager\nnameserver 192.168.1.20\nsearch corp.com` },

    { id: 'c2', os: 'windows', cat: 'Network Interfaces', cmd: 'ipconfig /all', desc: 'Display full Windows IP configuration including MAC, Default Gateway, DHCP, and DNS Servers.', desc_de: 'Vollständige Windows-IP-Konfiguration inklusive MAC, Standard-Gateway, DHCP und DNS-Server anzeigen.', out: `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : WS-SALES-LAP105\n   Primary Dns Suffix  . . . . . . . : corp.com\n   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-01\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105(Preferred)\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.254\n   DNS Servers . . . . . . . . . . . : 192.168.1.20` },
    { id: 'c5', os: 'windows', cat: 'Network Interfaces', cmd: 'getmac /v', desc: 'Display detailed physical MAC addresses and network adapter transport names in Windows.', desc_de: 'Detaillierte physische MAC-Adressen und Netzwerkkarten-Namen in Windows anzeigen.', out: `Connection Name Network Adapter Physical Address    Transport Name\n=============== =============== =================== =========================================\nEthernet        Intel i219-V    00-1A-2B-3C-4D-01   \\Device\\Tcpip_{A1B2C3D4-E5F6-7890-1234}` },
    { id: 'c6', os: 'windows', cat: 'Network Interfaces', cmd: 'ipconfig /renew', desc: 'Trigger Windows DHCP client to send DHCP REQUEST and renew IP lease.', desc_de: 'Windows DHCP-Client auslösen, um eine erneute IP-Lease per DHCP REQUEST anzufordern.', out: `DHCP DISCOVER broadcast sent...\nDHCP OFFER received from 192.168.1.10\nDHCP REQUEST sent...\nDHCP ACK received. IPv4 Address renewed: 192.168.1.105` },
    { id: 'c7', os: 'windows', cat: 'Network Interfaces', cmd: 'ipconfig /flushdns', desc: 'Clear and reset contents of Windows DNS client resolver cache.', desc_de: 'Inhalt des Windows DNS-Resolver-Caches leeren und zurücksetzen.', out: `Successfully flushed the DNS Resolver Cache.` },
    { id: 'c10', os: 'windows', cat: 'Network Interfaces', cmd: 'netsh interface ipv4 show config', desc: 'Display detailed IP address configuration for all interfaces via Netsh.', desc_de: 'Detaillierte IP-Adress-Konfiguration aller Schnittstellen über Netsh anzeigen.', out: `Configuration for interface "Ethernet"\n    DHCP enabled:                         Yes\n    IP Address:                           192.168.1.105\n    Subnet Prefix:                        192.168.1.0/24 (mask 255.255.255.0)\n    Default Gateway:                      192.168.1.254` },

    // 3. ICMP Connectivity & Path Tracing
    { id: 'c11', os: 'linux', cat: 'ICMP & Path Tracing', cmd: 'ping -c 4 8.8.8.8', desc: 'Send 4 ICMP Echo Requests to test internet connectivity.', desc_de: '4 ICMP-Echo-Requests senden, um die Internet-Konnektivität zu testen.', out: `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=14.2 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=13.8 ms\n\n--- 8.8.8.8 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss` },
    { id: 'c13', os: 'linux', cat: 'ICMP & Path Tracing', cmd: 'traceroute 8.8.8.8', desc: 'Trace hop-by-hop router path across network using incrementing TTL.', desc_de: 'Hop-by-Hop Router-Pfad durch das Netzwerk mit ansteigender TTL verfolgen.', out: `traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets\n 1  192.168.1.254 (192.168.1.254)  1.104 ms\n 2  192.168.1.1 (192.168.1.1)  2.410 ms` },
    { id: 'c16', os: 'linux', cat: 'ICMP & Path Tracing', cmd: 'ip route', desc: 'Display Linux kernel routing table entries and default gateway.', desc_de: 'Linux Kernel-Routing-Tabelle und Standard-Gateway anzeigen.', out: `default via 192.168.1.254 dev eth0 proto dhcp src 192.168.1.105 metric 100 \n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.105 metric 100` },
    { id: 'c18', os: 'linux', cat: 'ICMP & Path Tracing', cmd: 'route -n', desc: 'Display Linux routing table with numeric IP addresses.', desc_de: 'Linux-Routing-Tabelle mit numerischen IP-Adressen ausgeben.', out: `Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\n0.0.0.0         192.168.1.254   0.0.0.0         UG    100    0        0 eth0` },

    { id: 'c12', os: 'windows', cat: 'ICMP & Path Tracing', cmd: 'ping 192.168.1.254', desc: 'Send ICMP Echo Requests to test local default gateway reachability.', desc_de: 'ICMP Echo Requests senden, um die Erreichbarkeit des lokalen Standard-Gateways zu testen.', out: `Pinging 192.168.1.254 with 32 bytes of data:\nReply from 192.168.1.254: bytes=32 time=1ms TTL=64\nReply from 192.168.1.254: bytes=32 time=1ms TTL=64` },
    { id: 'c14', os: 'windows', cat: 'ICMP & Path Tracing', cmd: 'tracert 8.8.8.8', desc: 'Trace router path in Windows displaying round-trip delay per hop.', desc_de: 'Router-Pfad in Windows mit Paketlaufzeiten pro Hop verfolgen.', out: `Tracing route to dns.google [8.8.8.8]\n  1    1 ms    1 ms    1 ms  192.168.1.254\n  2    2 ms    2 ms    2 ms  8.8.8.8\nTrace complete.` },
    { id: 'c15', os: 'windows', cat: 'ICMP & Path Tracing', cmd: 'pathping 8.8.8.8', desc: 'Combines ping and tracert to measure packet loss per intermediate router.', desc_de: 'Kombiniert Ping und Tracert, um Paketverluste pro Zwischenrouter zu messen.', out: `Tracing route to dns.google [8.8.8.8] over a maximum of 30 hops...\ncomputing statistics...` },
    { id: 'c17', os: 'windows', cat: 'ICMP & Path Tracing', cmd: 'route print', desc: 'Display Windows IPv4 routing table, gateway metrics, and interface list.', desc_de: 'Windows IPv4-Routing-Tabelle, Gateway-Metriken und Schnittstellenliste anzeigen.', out: `IPv4 Route Table\n===========================================================================\nActive Routes:\nNetwork Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0    192.168.1.254   192.168.1.105      25` },

    // 4. DNS Resolution & Domain Services
    { id: 'c21', os: 'both', cat: 'DNS & Domains', cmd: 'nslookup app.corp.com', desc: 'Query DNS server for IPv4 address (A Record) of app.corp.com.', desc_de: 'DNS-Server nach IPv4-Adresse (A-Eintrag) von app.corp.com abfragen.', out: `Server:  corp-dns.corp.com\nAddress:  192.168.1.20\n\nName:    app.corp.com\nAddress:  192.168.1.25` },
    { id: 'c22', os: 'linux', cat: 'DNS & Domains', cmd: 'dig +short app.corp.com', desc: 'Perform concise DNS lookup returning only answered IP address.', desc_de: 'Kompakte DNS-Abfrage ausführen, die nur die Ziel-IP zurückgibt.', out: `192.168.1.25` },
    { id: 'c23', os: 'linux', cat: 'DNS & Domains', cmd: 'dig ANY corp.com', desc: 'Query all available DNS record types (A, MX, NS, SOA, TXT) for domain.', desc_de: 'Alle verfügbaren DNS-Eintragstypen (A, MX, NS, SOA, TXT) abfragen.', out: `; <<>> DiG 9.18.18 <<>> ANY corp.com\n;; ANSWER SECTION:\ncorp.com.		3600	IN	A	192.168.1.25\ncorp.com.		3600	IN	MX	10 mail.corp.com.` },
    { id: 'c25', os: 'linux', cat: 'DNS & Domains', cmd: 'host -t AAAA google.com', desc: 'Perform DNS lookup specifically for IPv6 address (AAAA Record).', desc_de: 'DNS-Abfrage speziell für IPv6-Adresse (AAAA-Eintrag) ausführen.', out: `google.com has IPv6 address 2a00:1450:4001:830::200e` },

    { id: 'c27', os: 'windows', cat: 'DNS & Domains', cmd: 'dcdiag /test:DNS', desc: 'Run Active Directory Domain Controller diagnostic tests for DNS health.', desc_de: 'Active Directory Domänencontroller Diagnosetests für DNS ausführen.', out: `Directory Server Diagnosis\n\n   Testing server: DC01\n   Starting test: DNS\n      DNS Tests passed on DC01.corp.com.` },
    { id: 'c28', os: 'windows', cat: 'DNS & Domains', cmd: 'nltest /dsgetdc:corp.com', desc: 'Locate Active Directory Domain Controller via DNS SRV records.', desc_de: 'Active Directory Domänencontroller über DNS SRV-Einträge ermitteln.', out: `DC: \\\\DC01.corp.com\nAddress: \\\\192.168.1.15\nThe command completed successfully` },
    { id: 'c30', os: 'windows', cat: 'DNS & Domains', cmd: 'klist', desc: 'Display cached Kerberos TGT and Service Tickets in LSA cache.', desc_de: 'Zwischengespeicherte Kerberos TGT und Dienst-Tickets im LSA-Cache anzeigen.', out: `Cached Tickets: (1)\n\n[0] Client: sales.user @ CORP.COM\n    Server: krbtgt/CORP.COM @ CORP.COM` },

    // 5. Ports, Sockets & Firewalls
    { id: 'c31', os: 'linux', cat: 'Ports & Firewalls', cmd: 'netstat -tulpn', desc: 'Display listening TCP/UDP sockets, port numbers, and process PIDs in Linux.', desc_de: 'Aktive TCP/UDP-Sockets, Portnummern und Prozess-PIDs in Linux anzeigen.', out: `Active Internet connections\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1042/nginx` },
    { id: 'c32', os: 'linux', cat: 'Ports & Firewalls', cmd: 'ss -tulpn', desc: 'Modern high-speed socket statistics utility replacing netstat in Linux.', desc_de: 'Modernes Hochgeschwindigkeits-Socket-Statistik-Werkzeug als Netstat-Ersatz in Linux.', out: `Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process\ntcp   LISTEN 0      128          0.0.0.0:80         0.0.0.0:*     users:(("nginx",pid=1042,fd=6))` },
    { id: 'c36', os: 'linux', cat: 'Ports & Firewalls', cmd: 'sudo iptables -L -n -v', desc: 'Display active Linux iptables firewall rules and packet counters.', desc_de: 'Aktive Linux iptables Firewall-Regeln und Paket-Zähler anzeigen.', out: `Chain INPUT (policy ACCEPT 1420 packets, 112KB)\n pkts bytes target     prot opt in     out     source               destination         \n    0     0 DROP       all  --  *      *       198.51.100.77        0.0.0.0/0` },
    { id: 'c37', os: 'linux', cat: 'Ports & Firewalls', cmd: 'sudo ufw status verbose', desc: 'Display Uncomplicated Firewall (UFW) status and active rules in Ubuntu.', desc_de: 'Uncomplicated Firewall (UFW) Status und aktive Regeln in Ubuntu anzeigen.', out: `Status: active\nLogging: on (low)\nDefault: deny (incoming), allow (outgoing)` },

    { id: 'c33', os: 'windows', cat: 'Ports & Firewalls', cmd: 'netstat -ano', desc: 'Display active Windows network connections, listening ports, and PIDs.', desc_de: 'Aktive Windows-Netzwerkverbindungen, lauschende Ports und PIDs anzeigen.', out: `Active Connections\n  Proto  Local Address          Foreign Address        State           PID\n  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       1042` },
    { id: 'c34', os: 'both', cat: 'Ports & Firewalls', cmd: 'arp -a', desc: 'Display ARP resolution table mapping IP addresses to physical MACs.', desc_de: 'ARP-Tabelle zur Zuordnung von IP-Adressen zu physischen MACs anzeigen.', out: `Interface: 192.168.1.105\n  Internet Address      Physical Address      Type\n  192.168.1.10          00-50-56-00-00-10     dynamic\n  192.168.1.254         00-00-0c-07-ac-fe     dynamic` },
    { id: 'c38', os: 'windows', cat: 'Ports & Firewalls', cmd: 'netsh advfirewall show allprofiles', desc: 'Display status of Domain, Private, and Public Windows Firewall profiles.', desc_de: 'Status der Domänen-, privaten und öffentlichen Windows Firewall-Profile anzeigen.', out: `Domain Profile Settings:\nState                                 ON\nFirewall Policy                       BlockInbound,AllowOutbound` },

    // 6. System Daemons, Logs & Traffic Sniffing
    { id: 'c41', os: 'linux', cat: 'System & Logs', cmd: 'systemctl status nginx', desc: 'Display detailed systemd service status for Nginx web daemon.', desc_de: 'Detaillierten systemd Service-Status für den Nginx Web-Server anzeigen.', out: `● nginx.service - A high performance web server\n     Active: active (running) since Sun 2026-08-02 21:00:15 CEST` },
    { id: 'c42', os: 'linux', cat: 'System & Logs', cmd: 'tail -n 20 /var/log/syslog', desc: 'View last 20 lines of Linux system event log.', desc_de: 'Die letzten 20 Zeilen des Linux System-Ereignisprotokolls anzeigen.', out: `Aug 02 22:10:05 netpulse-box krb5kdc[892]: AS_REQ 192.168.1.105: ISSUE: sales.user@CORP.COM` },
    { id: 'c43', os: 'linux', cat: 'System & Logs', cmd: 'sudo tcpdump -i eth0 -n port 80', desc: 'Sniff live HTTP network packet frames on interface eth0.', desc_de: 'Live HTTP-Netzwerkpakete auf Schnittstelle eth0 mitschneiden (Mitmusterung).', out: `listening on eth0, capture size 262144 bytes\n22:12:05 IP 192.168.1.105.51234 > 192.168.1.25.80: Flags [S]` },
    { id: 'c44', os: 'linux', cat: 'System & Logs', cmd: 'curl -I https://app.corp.com', desc: 'Fetch HTTP response headers (Status Code, Server, TLS details) via cURL.', desc_de: 'HTTP-Antwort-Header (Statuscode, Server, TLS-Details) per cURL abrufen.', out: `HTTP/2 200 \nserver: nginx/1.24.0\ndate: Sun, 02 Aug 2026 22:15:00 GMT` },

    { id: 'c46', os: 'windows', cat: 'System & Logs', cmd: 'tasklist /v', desc: 'Display all running Windows processes with memory usage and window titles.', desc_de: 'Alle laufenden Windows-Prozesse mit Speichernutzung und Fenstertiteln anzeigen.', out: `Image Name                   PID Session Name        Session#    Mem Usage Status\n========================= ====== ================ ======== ============ =============\ncmd.exe                     4812 Console                 1      4,892 K Running` },
    { id: 'c47', os: 'windows', cat: 'System & Logs', cmd: 'systeminfo', desc: 'Display operating system build, hotfixes, memory, and hardware details.', desc_de: 'Betriebssystem-Build, Hotfixes, Arbeitsspeicher und Hardware-Details anzeigen.', out: `Host Name:                 WS-SALES-LAP105\nOS Name:                   Microsoft Windows 10 Pro\nSystem Manufacturer:       DELL Inc.` }
  ];

  // Internal 50-command Tracking
  const uniqueMasteredCount = Math.min(50, executedCmds.size);
  const completionPercentage = Math.round((uniqueMasteredCount / 50) * 100);

  // STRICT OS & CATEGORY FILTERING FOR CARDS DIRECTORY
  const filteredTutorials = commandTutorials.filter(t => {
    const isOsMatch = osMode === 'bash' 
      ? (t.os === 'linux' || t.os === 'both')
      : (t.os === 'windows' || t.os === 'both');

    const isCategoryMatch = selectedCategory === 'All' || t.cat === selectedCategory;
    
    const isSearchMatch = searchQuery === '' ||
      t.cmd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cat.toLowerCase().includes(searchQuery.toLowerCase());

    return isOsMatch && isCategoryMatch && isSearchMatch;
  });

  const handleClearTerminal = () => {
    if (osMode === 'bash') setLinuxLogs([]);
    else setWindowsLogs([]);
  };

  // INTERACTIVE OS FILESYSTEM COMMAND SIMULATOR
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
          ? `Linux Bash Command Reference:\n- Basic OS Navigation: cd, ls, pwd, cat, mkdir, touch, rm\n- Network Interfaces: ip a, ip link, hostname -I\n- ICMP & Tracing: ping, traceroute, ip route\n- DNS & Domains: nslookup, dig, host\n- Firewall & Ports: netstat -tulpn, ss, iptables, ufw`
          : `Windows Command Prompt Reference:\n- Basic OS Navigation: cd, dir, type, mkdir, del\n- Network Interfaces: ipconfig /all, getmac, netsh\n- ICMP & Tracing: ping, tracert, pathping, route print\n- DNS & Domains: nslookup, dcdiag, nltest, klist\n- Firewall & Ports: netstat -ano, netsh advfirewall`;
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

    const promptStr = osMode === 'bash'
      ? `sysadmin@netpulse-box:${linuxCwd.replace('/home/sysadmin', '~')}$`
      : `${windowsCwd}>`;

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
              <span>Categorized OS CLI & File System Simulator</span>
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

      {/* CATEGORIES TAB FILTER & TUTORIAL CARDS DIRECTORY */}
      <div className="space-y-4 font-mono">
        
        {/* SEARCH AND COMPACT CATEGORY FILTER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
              <span>{osMode === 'bash' ? '🐧 Native Linux Commands' : '🪟 Native Windows Commands'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-cyan-400 border border-slate-800 font-bold">
                {filteredTutorials.length} Commands Available
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* COMPACT CATEGORY DROPDOWN FILTER */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner"
            >
              {categoriesList.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-200">
                  {cat.label}
                </option>
              ))}
            </select>

            {/* SEARCH INPUT FILTER */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${osMode === 'bash' ? 'Linux' : 'Windows'} commands...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
              />
            </div>
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

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{lang === 'de' ? (tut.desc_de || tut.desc) : tut.desc}</p>
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
                  <span>{isDone ? (lang === 'de' ? 'Befehl erneut ausführen' : 'Re-Run Command') : (lang === 'de' ? 'Befehl ausführen' : 'Execute Command')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
