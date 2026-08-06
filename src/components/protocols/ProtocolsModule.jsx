import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  BookOpen, 
  Search, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Zap, 
  Terminal, 
  Info, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Sliders, 
  Cpu, 
  HardDrive,
  Lock,
  Radio,
  Server,
  Wifi,
  Mail,
  FileText,
  Clock,
  Key
} from 'lucide-react';
import { CleanWidget, SlideOutInspector } from '../common/EasyCard';

export default function ProtocolsModule({ appMode = 'clean' }) {
  const { lang, t } = useLanguage();
  const [selectedSection, setSelectedSection] = useState('all'); // 'all', 'network', 'transport', 'application', 'datalink'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProtocolModal, setActiveProtocolModal] = useState(null);

  // Complete Comprehensive Protocols Catalog (All 4 OSI/TCP-IP Layer Sections Fully Populated)
  const protocolsData = [
    // -------------------------------------------------------------
    // 1. NETWORK LAYER PROTOCOLS (LAYER 3)
    // -------------------------------------------------------------
    {
      id: 'ipv4',
      name: 'IPv4',
      fullName: 'Internet Protocol version 4',
      section: 'network',
      layer: 'Layer 3 — Network / Internet',
      layerNum: 3,
      protocolNum: 'IP Protocol 4 / EtherType 0x0800',
      color: 'from-teal-500 to-emerald-600',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700 shadow-teal-900/50',
      shortDesc: '32-bit logical addressing, packet routing, TTL lifetime control, & fragmentation across subnets.',
      description: 'IPv4 is the foundational Network Layer protocol of the TCP/IP suite. It uses 32-bit logical addresses (displayed in four decimal octets like 192.168.1.1) to identify host network interfaces and route data packets across independent networks.',
      useCase: 'Primary logical addressing protocol used in home LANs, corporate enterprise networks, and public Internet routing. Used whenever any application sends data over an IP network.',
      headerFields: [
        { field: 'Version (4 bits)', desc: 'Identifies IP version (0100 for IPv4).' },
        { field: 'TTL / Time-To-Live (8 bits)', desc: 'Prevents infinite routing loops by decrementing at each router hop.' },
        { field: 'Protocol (8 bits)', desc: 'Specifies payload protocol (e.g. 6 for TCP, 17 for UDP, 1 for ICMP).' },
        { field: 'Source IP Address (32 bits)', desc: '32-bit IPv4 address of originating host.' },
        { field: 'Destination IP Address (32 bits)', desc: '32-bit IPv4 address of final recipient host.' },
        { field: 'Header Checksum (16 bits)', desc: 'Verifies IPv4 header integrity at each hop.' }
      ],
      cliCommands: [
        'ipconfig /all (Display IPv4 address, subnet mask & default gateway)',
        'route print (Display local IPv4 routing table)',
        'ping 192.168.1.1 (Test IPv4 ICMP connectivity to default gateway)'
      ]
    },
    {
      id: 'ipv6',
      name: 'IPv6',
      fullName: 'Internet Protocol version 6',
      section: 'network',
      layer: 'Layer 3 — Network / Internet',
      layerNum: 3,
      protocolNum: 'IP Protocol 41 / EtherType 0x86DD',
      color: 'from-cyan-500 to-blue-600',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-cyan-900/50',
      shortDesc: '128-bit hexadecimal addressing providing 340 undecillion addresses, built-in SLAAC & NDP.',
      description: 'IPv6 is the modern successor to IPv4, designed to eliminate IP address exhaustion. It features 128-bit addresses (displayed in eight hexadecimal blocks separated by colons like 2001:0db8:85a3::8a2e:0370:7334), simplified fixed 40-byte headers, and native auto-configuration.',
      useCase: 'Next-generation Internet infrastructure, mobile carrier 5G/4G networks, and modern enterprise networks requiring vast address spaces without NAT (Network Address Translation).',
      headerFields: [
        { field: 'Version (4 bits)', desc: 'Identifies IP version (0110 for IPv6).' },
        { field: 'Traffic Class (8 bits)', desc: 'Used for Quality of Service (QoS) packet prioritization.' },
        { field: 'Flow Label (20 bits)', desc: 'Identifies real-time packet flows requiring non-default routing.' },
        { field: 'Hop Limit (8 bits)', desc: 'Replaces IPv4 TTL; decremented by 1 at each router.' },
        { field: 'Source IPv6 Address (128 bits)', desc: '128-bit IPv6 address of sender.' },
        { field: 'Destination IPv6 Address (128 bits)', desc: '128-bit IPv6 address of recipient.' }
      ],
      cliCommands: [
        'ipconfig (Display IPv6 link-local and global unicast addresses)',
        'ping -6 fe80::1 (Ping IPv6 link-local address)',
        'netsh interface ipv6 show addresses (Display Windows IPv6 interface settings)'
      ]
    },
    {
      id: 'icmp',
      name: 'ICMP / ICMPv6',
      fullName: 'Internet Control Message Protocol',
      section: 'network',
      layer: 'Layer 3 — Network / Internet',
      layerNum: 3,
      protocolNum: 'IP Protocol 1 (IPv4) / Protocol 58 (IPv6)',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-emerald-900/50',
      shortDesc: 'Error reporting, diagnostic network probing (ping / traceroute), & router unreachable feedback.',
      description: 'ICMP is an essential supporting protocol in the IP suite. It does not carry application user data; instead, it transfers diagnostic, error-reporting, and operational messages between routers and host operating systems.',
      useCase: 'Used by system administrators to test network reachability (`ping`), trace packet routing paths (`tracert` / `pathping`), and receive Destination Unreachable or TTL Exceeded feedback messages.',
      headerFields: [
        { field: 'Type (8 bits)', desc: 'Message type (e.g. Type 8 = Echo Request, Type 0 = Echo Reply, Type 3 = Destination Unreachable).' },
        { field: 'Code (8 bits)', desc: 'Sub-category details (e.g. Code 1 = Host Unreachable, Code 3 = Port Unreachable).' },
        { field: 'Checksum (16 bits)', desc: 'Verifies ICMP message integrity.' },
        { field: 'Identifier & Sequence (32 bits)', desc: 'Matches Echo Request queries with Echo Reply responses.' }
      ],
      cliCommands: [
        'ping 8.8.8.8 (Send ICMP Echo Requests to test internet connectivity)',
        'tracert 1.1.1.1 (Trace router hops using ICMP / TTL Exceeded messages)',
        'pathping google.com (Combine ping and traceroute with latency statistics)'
      ]
    },
    {
      id: 'arp',
      name: 'ARP',
      fullName: 'Address Resolution Protocol',
      section: 'network',
      layer: 'Layer 3 / Layer 2 Interface',
      layerNum: 3,
      protocolNum: 'EtherType 0x0806',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700 shadow-amber-900/50',
      shortDesc: 'Maps 32-bit IPv4 network addresses to 48-bit MAC hardware addresses within a local LAN.',
      description: 'ARP resolves a known logical IPv4 address to an unknown physical MAC hardware address on a local Ethernet media segment. Before a host can send an Ethernet frame to a target IP, it broadcasts an ARP Request ("Who has 192.168.1.50? Tell 192.168.1.100").',
      useCase: 'Mandatory for all IPv4 local Ethernet LAN communication. Every computer maintains a local ARP cache table to store IP-to-MAC mappings and eliminate continuous broadcasting.',
      headerFields: [
        { field: 'Hardware Type (16 bits)', desc: 'Specifies physical network type (e.g. 1 for Ethernet 802.3).' },
        { field: 'Protocol Type (16 bits)', desc: 'Specifies network protocol (e.g. 0x0800 for IPv4).' },
        { field: 'Operation Code (16 bits)', desc: 'Specifies ARP operation (1 = Request, 2 = Reply).' },
        { field: 'Sender MAC & Sender IP', desc: 'Originating host hardware and IP address.' },
        { field: 'Target MAC & Target IP', desc: 'Target host hardware (blank on request) and IP address.' }
      ],
      cliCommands: [
        'arp -a (Display local ARP cache table containing IP-to-MAC mappings)',
        'arp -d * (Flush local ARP cache table to force fresh ARP broadcasts)'
      ]
    },
    {
      id: 'ospf',
      name: 'OSPF',
      fullName: 'Open Shortest Path First',
      section: 'network',
      layer: 'Layer 3 — Network Routing',
      layerNum: 3,
      protocolNum: 'IP Protocol 89',
      color: 'from-indigo-500 to-purple-600',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700 shadow-indigo-900/50',
      shortDesc: 'Interior Gateway Protocol (IGP) using Link-State Dijkstra SPF algorithm to calculate shortest paths.',
      description: 'OSPF is a widely deployed Link-State Interior Gateway Protocol (IGP). Every OSPF router maintains a complete topological map of the network area and runs Dijkstra Shortest Path First (SPF) algorithm to construct the optimal routing table based on link bandwidth costs.',
      useCase: 'Used inside corporate enterprise networks and campus backbones to automatically discover subnets, exchange routing tables, and reroute traffic around failed links in under 1 second.',
      headerFields: [
        { field: 'Version (8 bits)', desc: 'OSPF version (Version 2 for IPv4, Version 3 for IPv6).' },
        { field: 'Type (8 bits)', desc: 'OSPF packet type (1=Hello, 2=Database Description, 3=Link State Request, 4=LSU, 5=LSAck).' },
        { field: 'Router ID (32 bits)', desc: 'Unique 32-bit IPv4 address identifying the originating OSPF router.' },
        { field: 'Area ID (32 bits)', desc: 'Identifies OSPF area (e.g. Area 0.0.0.0 Backbone).' }
      ],
      cliCommands: [
        'show ip ospf neighbor (Cisco IOS command to view active OSPF router adjacencies)',
        'show ip route ospf (Display routes learned dynamically via OSPF)'
      ]
    },
    {
      id: 'bgp',
      name: 'BGP',
      fullName: 'Border Gateway Protocol',
      section: 'network',
      layer: 'Layer 3 / Layer 4 Routing (EGP)',
      layerNum: 3,
      protocolNum: 'TCP Port 179',
      color: 'from-rose-500 to-red-600',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-700 shadow-rose-900/50',
      shortDesc: 'Exterior Gateway Protocol (EGP) routing global Internet traffic between Autonomous Systems (AS).',
      description: 'BGP is the official routing protocol of the global Internet. As a Path-Vector Exterior Gateway Protocol (EGP), BGP exchanges prefix reachability information and Autonomous System (AS-PATH) attributes between major Internet Service Providers (ISPs) and data centers.',
      useCase: 'Routes all global Internet traffic, multi-homed corporate enterprise connections, and Cloud Provider peering (AWS Direct Connect, Azure ExpressRoute).',
      headerFields: [
        { field: 'Marker (128 bits)', desc: 'Used for BGP message synchronization and authentication.' },
        { field: 'Type (8 bits)', desc: 'BGP message type (1=OPEN, 2=UPDATE, 3=NOTIFICATION, 4=KEEPALIVE).' },
        { field: 'AS-PATH Attribute', desc: 'List of Autonomous System numbers traversed by the route.' },
        { field: 'NEXT-HOP Attribute', desc: 'IP address of the next BGP router peer.' }
      ],
      cliCommands: [
        'show ip bgp summary (Cisco IOS command to display BGP neighbor peering status)',
        'show ip bgp (Display global BGP routing table)'
      ]
    },
    {
      id: 'rip',
      name: 'RIP / RIPv2',
      fullName: 'Routing Information Protocol',
      section: 'network',
      layer: 'Layer 3 — Network Routing',
      layerNum: 3,
      protocolNum: 'UDP Port 520',
      color: 'from-blue-500 to-indigo-600',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700 shadow-blue-900/50',
      shortDesc: 'Distance-Vector Interior Gateway Protocol using simple hop count metric (maximum 15 hops).',
      description: 'RIP is a simple Distance-Vector Interior Gateway Protocol (IGP). It measures path cost strictly by counting the number of router hops to a destination network (maximum 15 hops; 16 hops is considered unreachable).',
      useCase: 'Used in small legacy office networks due to its extreme simplicity and low memory requirements. Replaced in larger networks by OSPF.',
      headerFields: [
        { field: 'Command (8 bits)', desc: '1 = Request, 2 = Response.' },
        { field: 'Version (8 bits)', desc: '1 for RIPv1, 2 for RIPv2 (supports CIDR & Subnet Masks).' },
        { field: 'IP Address & Subnet Mask', desc: 'Target network address and mask.' },
        { field: 'Metric / Hop Count (32 bits)', desc: 'Distance metric from 1 to 15 hops.' }
      ],
      cliCommands: [
        'show ip route rip (Display routes learned via RIP in Cisco IOS)'
      ]
    },
    {
      id: 'ipsec',
      name: 'IPsec',
      fullName: 'Internet Protocol Security',
      section: 'network',
      layer: 'Layer 3 — Network Security',
      layerNum: 3,
      protocolNum: 'ESP (IP 50) / AH (IP 51) / IKE (UDP 500/4500)',
      color: 'from-cyan-600 to-teal-700',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-cyan-900/50',
      shortDesc: 'Network-layer security framework providing AES-256 data encryption, authentication & Site-to-Site VPNs.',
      description: 'IPsec is a suite of security protocols operating at OSI Layer 3. It provides data confidentiality (AES-256 encryption), data integrity (SHA-256 hashing), and mutual peer authentication for all IP traffic passing through a Site-to-Site or Remote Access VPN tunnel.',
      useCase: 'Building secure encrypted Site-to-Site VPN tunnels over the public Internet between branch offices and enterprise HQ data centers.',
      headerFields: [
        { field: 'SPI / Security Parameter Index (32 bits)', desc: 'Identifies the specific Security Association (SA).' },
        { field: 'Sequence Number (32 bits)', desc: 'Prevents anti-replay attacks.' },
        { field: 'Encapsulated Payload', desc: 'Encrypted IPv4/IPv6 packet contents (ESP).' },
        { field: 'Authentication Data (ICV)', desc: 'Integrity Check Value verifying packet tampering.' }
      ],
      cliCommands: [
        'show crypto ipsec sa (Cisco IOS command to verify active IPsec Security Associations)',
        'show crypto ikev2 sa (View IKEv2 phase-1 tunnel status)'
      ]
    },
    {
      id: 'ndp',
      name: 'NDP',
      fullName: 'Neighbor Discovery Protocol',
      section: 'network',
      layer: 'Layer 3 / ICMPv6 Interface',
      layerNum: 3,
      protocolNum: 'ICMPv6 Messages 133–137',
      color: 'from-teal-600 to-emerald-700',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700 shadow-teal-900/50',
      shortDesc: 'IPv6 protocol replacing IPv4 ARP; handles MAC address resolution, router discovery & SLAAC.',
      description: 'NDP is an essential ICMPv6-based protocol operating at Layer 3. In IPv6 networks, NDP completely replaces IPv4 ARP broadcasts, using multicast Neighbor Solicitation (NS) and Neighbor Advertisement (NA) messages.',
      useCase: 'Used by all IPv6 devices on a LAN segment for IPv6-to-MAC address resolution, default router discovery, duplicate address detection (DAD), and SLAAC autoconfiguration.',
      headerFields: [
        { field: 'ICMPv6 Type 135 (Neighbor Solicitation)', desc: 'Replaces IPv4 ARP Request multicast.' },
        { field: 'ICMPv6 Type 136 (Neighbor Advertisement)', desc: 'Replaces IPv4 ARP Reply unicast.' },
        { field: 'Target Address (128 bits)', desc: 'IPv6 address being resolved.' },
        { field: 'Target Link-Layer Address Option', desc: '48-bit MAC address payload.' }
      ],
      cliCommands: [
        'netsh interface ipv6 show neighbors (Display Windows IPv6 NDP neighbor table)'
      ]
    },
    {
      id: 'slaac',
      name: 'SLAAC',
      fullName: 'Stateless Address Autoconfiguration',
      section: 'network',
      layer: 'Layer 3 — IPv6 Auto-Addressing',
      layerNum: 3,
      protocolNum: 'ICMPv6 Router Advertisement (Type 134)',
      color: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700 shadow-blue-900/50',
      shortDesc: 'IPv6 automatic IP address assignment without requiring a centralized DHCP server.',
      description: 'SLAAC allows IPv6 hosts to generate their own globally unique IPv6 address automatically upon connecting to a network. The host listens for ICMPv6 Router Advertisement (RA) messages to learn the network prefix (/64), then appends its own Interface ID.',
      useCase: 'Enables zero-touch Plug-and-Play IPv6 network connectivity for laptops, phones, and IoT devices without deploying a dedicated DHCPv6 server.',
      headerFields: [
        { field: 'Router Advertisement (ICMPv6 Type 134)', desc: 'Emitted periodically by IPv6 routers.' },
        { field: 'Prefix Information Option (64 bits)', desc: 'Advertised IPv6 network prefix (e.g. 2001:db8:1::/64).' },
        { field: 'Autonomous Flag / A-Flag', desc: 'Tells client to use SLAAC auto-addressing.' }
      ],
      cliCommands: [
        'ipconfig /all (Inspect SLAAC generated IPv6 address and temporary privacy address)'
      ]
    },

    // -------------------------------------------------------------
    // 2. TRANSPORT LAYER PROTOCOLS (LAYER 4)
    // -------------------------------------------------------------
    {
      id: 'tcp',
      name: 'TCP',
      fullName: 'Transmission Control Protocol',
      section: 'transport',
      layer: 'Layer 4 — Transport',
      layerNum: 4,
      protocolNum: 'IP Protocol 6',
      color: 'from-cyan-500 to-blue-600',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-cyan-900/50',
      shortDesc: 'Connection-oriented, reliable ordered stream delivery with 3-way handshake & sliding window flow control.',
      description: 'TCP is a core Transport Layer protocol that guarantees reliable, ordered, and error-checked delivery of a stream of octets between applications running on hosts communicating via an IP network.',
      useCase: 'Used for web browsing (HTTP/HTTPS), email (SMTP/IMAP), file transfer (FTP), remote administration (SSH), and any application where zero data loss is required.',
      headerFields: [
        { field: 'Source Port (16 bits) & Destination Port (16 bits)', desc: 'Multiplexes traffic to correct application process.' },
        { field: 'Sequence Number (32 bits)', desc: 'Ensures in-order packet reassembly.' },
        { field: 'Acknowledgment Number (32 bits)', desc: 'Confirms receipt of previous bytes.' },
        { field: 'Control Flags (9 bits)', desc: 'SYN, ACK, FIN, RST, PSH, URG connection state indicators.' },
        { field: 'Window Size (16 bits)', desc: 'Advertises receiver buffer capacity for flow control.' }
      ],
      cliCommands: [
        'netstat -ano (Display active TCP listening ports and established connections)',
        'telnet 192.168.1.1 80 (Test TCP port connectivity)'
      ]
    },
    {
      id: 'udp',
      name: 'UDP',
      fullName: 'User Datagram Protocol',
      section: 'transport',
      layer: 'Layer 4 — Transport',
      layerNum: 4,
      protocolNum: 'IP Protocol 17',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700 shadow-amber-900/50',
      shortDesc: 'Connectionless, lightweight datagram delivery with minimum overhead & no retransmission latency.',
      description: 'UDP is a minimal, connectionless Transport Layer protocol. It sends datagrams without establishing a prior connection, guaranteeing no acknowledgments, retransmissions, or ordering delays.',
      useCase: 'Used for real-time voice/video calls (VoIP, Zoom), DNS queries, DHCP leasing, online multiplayer gaming, and video streaming where speed is prioritized over 100% packet arrival.',
      headerFields: [
        { field: 'Source Port (16 bits)', desc: 'Port of sending application.' },
        { field: 'Destination Port (16 bits)', desc: 'Port of target application.' },
        { field: 'Length (16 bits)', desc: 'Total byte length of UDP header and payload.' },
        { field: 'Checksum (16 bits)', desc: 'Optional payload corruption validation.' }
      ],
      cliCommands: [
        'netstat -an -p UDP (Display active UDP listening endpoints)'
      ]
    },
    {
      id: 'quic',
      name: 'QUIC',
      fullName: 'Quick UDP Internet Connections',
      section: 'transport',
      layer: 'Layer 4 — Transport',
      layerNum: 4,
      protocolNum: 'UDP Port 443 / HTTP/3',
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-700 shadow-purple-900/50',
      shortDesc: 'Modern multiplexed transport built over UDP with zero-RTT TLS 1.3 encryption & connection migration.',
      description: 'QUIC is a modern Transport Layer protocol originally developed by Google and standardized by IETF. Running on top of UDP, QUIC combines transport multiplexing and built-in TLS 1.3 encryption to eliminate head-of-line blocking.',
      useCase: 'Powers HTTP/3, YouTube video streaming, Google Search, and mobile apps to establish instant zero-latency secure connections even when switching between Wi-Fi and 5G cellular.',
      headerFields: [
        { field: 'Header Form & Connection ID', desc: 'Enables seamless connection migration across IP address changes.' },
        { field: 'Packet Number', desc: 'Monotonically increasing sequence number preventing replay attacks.' },
        { field: 'Encrypted Payload (TLS 1.3)', desc: 'Entire transport header and data encrypted by default.' }
      ],
      cliCommands: [
        'curl --http3 https://google.com (Execute HTTP/3 QUIC request)'
      ]
    },

    // -------------------------------------------------------------
    // 3. APPLICATION & SESSION LAYER PROTOCOLS (LAYER 7-5)
    // -------------------------------------------------------------
    {
      id: 'http_https',
      name: 'HTTP / HTTPS',
      fullName: 'Hypertext Transfer Protocol (Secure)',
      section: 'application',
      layer: 'Layer 7 — Application',
      layerNum: 7,
      protocolNum: 'TCP Port 80 (HTTP) / Port 443 (HTTPS)',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-emerald-900/50',
      shortDesc: 'Web application protocol delivering HTML, JSON APIs, & encrypted TLS web traffic globally.',
      description: 'HTTP is the foundation of data exchange on the World Wide Web. HTTPS encrypts HTTP requests and responses using TLS 1.3, guaranteeing server authentication, data privacy, and tamper prevention.',
      useCase: 'Web browsing, RESTful API microservices, cloud web applications, and secure e-commerce transactions.',
      headerFields: [
        { field: 'Request Method (GET, POST, PUT, DELETE)', desc: 'Defines target operation on resource.' },
        { field: 'Host Header', desc: 'Specifies domain name for virtual web hosting.' },
        { field: 'Status Code (200 OK, 404 Not Found, 500 Error)', desc: 'Server response outcome.' },
        { field: 'Content-Type & Authorization', desc: 'MIME payload type and TLS bearer tokens.' }
      ],
      cliCommands: [
        'curl -I https://google.com (Inspect HTTPS response headers)',
        'invoke-webrequest https://api.github.com (PowerShell HTTP request)'
      ]
    },
    {
      id: 'dns',
      name: 'DNS',
      fullName: 'Domain Name System',
      section: 'application',
      layer: 'Layer 7 — Application',
      layerNum: 7,
      protocolNum: 'UDP / TCP Port 53',
      color: 'from-cyan-500 to-blue-600',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-cyan-900/50',
      shortDesc: 'Translates human-readable domain names (google.com) into 32-bit IPv4 or 128-bit IPv6 addresses.',
      description: 'DNS is the hierarchical distributed database of the Internet. It translates domain names (e.g. server.company.com) into numerical IP addresses required to route network traffic.',
      useCase: 'Mandatory for all web browsing, email delivery (MX records), Active Directory domain controller discovery (SRV records), and reverse IP lookups (PTR records).',
      headerFields: [
        { field: 'Transaction ID (16 bits)', desc: 'Matches DNS queries to responses.' },
        { field: 'Flags (QR, Opcode, AA, TC, RD, RA, RCODE)', desc: 'Query type and response status flags.' },
        { field: 'Questions & Answers Section', desc: 'Requested domain and returned resource records (A, AAAA, MX, CNAME).' }
      ],
      cliCommands: [
        'nslookup google.com (Query DNS A/AAAA records)',
        'ipconfig /flushdns (Purge local Windows DNS resolver cache)'
      ]
    },
    {
      id: 'dhcp',
      name: 'DHCP',
      fullName: 'Dynamic Host Configuration Protocol',
      section: 'application',
      layer: 'Layer 7 — Application',
      layerNum: 7,
      protocolNum: 'UDP Ports 67 (Server) & 68 (Client)',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700 shadow-amber-900/50',
      shortDesc: 'Automates IP address, subnet mask, default gateway, & DNS server leasing via DORA sequence.',
      description: 'DHCP automatically assigns IP addresses and network configuration settings to devices connecting to a network, eliminating manual static IP configuration.',
      useCase: 'Used in all home Wi-Fi routers, enterprise campus networks, and cloud VPCs to dynamically assign IP addresses to laptops, smartphones, and servers upon boot.',
      headerFields: [
        { field: 'Message Type (1=BootRequest, 2=BootReply)', desc: 'Indicates client query or server response.' },
        { field: 'Client MAC Address (chaddr)', desc: 'Hardware MAC address of requesting client.' },
        { field: 'Your IP Address (yiaddr)', desc: 'Leased IP address offered to client.' },
        { field: 'DHCP Options (Option 53, 3, 6, 82)', desc: 'Message type (DORA), Gateway, DNS, and Relay Option 82.' }
      ],
      cliCommands: [
        'ipconfig /release (Release current DHCP IP lease)',
        'ipconfig /renew (Send DHCP Discover/Request to renew IP lease)'
      ]
    },
    {
      id: 'smtp_imap',
      name: 'SMTP & IMAP',
      fullName: 'Simple Mail Transfer & Internet Message Access Protocol',
      section: 'application',
      layer: 'Layer 7 — Application',
      layerNum: 7,
      protocolNum: 'SMTP Port 25/587 | IMAP Port 143/993',
      color: 'from-indigo-500 to-purple-600',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700 shadow-indigo-900/50',
      shortDesc: 'Transfers outgoing email between servers (SMTP) and synchronizes mailboxes across client devices (IMAP).',
      description: 'SMTP handles server-to-server email transmission and client mail submission. IMAP allows email clients (Outlook, Apple Mail) to view, organize, and synchronize email folders directly on the mail server.',
      useCase: 'Enterprise email systems (Microsoft Exchange, Gmail, Postfix) for sending, receiving, and reading corporate messages.',
      headerFields: [
        { field: 'SMTP Commands (HELO, MAIL FROM, RCPT TO, DATA)', desc: 'Controls mail transmission sequence.' },
        { field: 'IMAP Commands (LOGIN, SELECT, FETCH, STORE)', desc: 'Synchronizes mailbox folders and unread flags.' }
      ],
      cliCommands: [
        'nslookup -type=MX company.com (Find authoritative Mail Exchange servers)',
        'test-netconnection mail.company.com -port 587 (Test SMTP submission port)'
      ]
    },
    {
      id: 'ssh',
      name: 'SSH',
      fullName: 'Secure Shell Protocol',
      section: 'application',
      layer: 'Layer 7 — Application',
      layerNum: 7,
      protocolNum: 'TCP Port 22',
      color: 'from-rose-500 to-red-600',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-700 shadow-rose-900/50',
      shortDesc: 'Cryptographically encrypted remote CLI terminal access, SFTP file transfer & port forwarding tunnels.',
      description: 'SSH is a cryptographic network protocol for operating network services securely over an unsecured network. It provides an encrypted command-line shell interface for remote server administration.',
      useCase: 'Managing Linux/Windows servers remotely, executing CLI commands, transferring files securely via SFTP, and creating secure encrypted local/remote port forwarding tunnels.',
      headerFields: [
        { field: 'SSH Handshake & Key Exchange (ECDH)', desc: 'Establishes shared AES-256 session key.' },
        { field: 'Public Key Authentication (RSA / Ed25519)', desc: 'Verifies client identity without passwords.' }
      ],
      cliCommands: [
        'ssh admin@192.168.1.1 (Open encrypted remote CLI session to server)',
        'scp file.txt user@server:/var/www/ (Secure copy file over SSH)'
      ]
    },
    {
      id: 'ntp',
      name: 'NTP',
      fullName: 'Network Time Protocol',
      section: 'application',
      layer: 'Layer 7 — Application',
      layerNum: 7,
      protocolNum: 'UDP Port 123',
      color: 'from-teal-500 to-emerald-600',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-700 shadow-teal-900/50',
      shortDesc: 'Precision clock synchronization across servers & network devices within milliseconds of UTC.',
      description: 'NTP synchronizes computer system clocks over packet-switched, variable-latency data networks to within a few milliseconds of Coordinated Universal Time (UTC).',
      useCase: 'Essential for Kerberos Active Directory authentication, cryptographic TLS certificate validity, database log correlation, and SIEM security auditing.',
      headerFields: [
        { field: 'Stratum Level (8 bits)', desc: 'Indicates distance from reference atomic clock (Stratum 0/1/2).' },
        { field: 'Transmit Timestamp (64 bits)', desc: 'Precision timestamp when packet left NTP server.' }
      ],
      cliCommands: [
        'w32tm /query /status (Check Windows time service NTP synchronization status)'
      ]
    },

    // -------------------------------------------------------------
    // 4. DATA LINK & PHYSICAL LAYER PROTOCOLS (LAYER 2-1)
    // -------------------------------------------------------------
    {
      id: 'ethernet',
      name: 'Ethernet',
      fullName: 'IEEE 802.3 Ethernet Standard',
      section: 'datalink',
      layer: 'Layer 2 / Layer 1 — Data Link',
      layerNum: 2,
      protocolNum: 'IEEE 802.3 Standard',
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-700 shadow-purple-900/50',
      shortDesc: 'Dominant wired LAN framing, 48-bit MAC addressing, LLC/MAC sublayers & FCS CRC error checking.',
      description: 'Ethernet is the ubiquitous family of wired computer networking technologies used in local area networks (LAN), metropolitan area networks (MAN), and wide area networks (WAN). It defines Layer 2 framing and Layer 1 physical signaling.',
      useCase: 'Connecting computers, switches, routers, and servers over copper twisted-pair cables (RJ-45) and fiber optics at speeds from 1 Gbps to 400 Gbps.',
      headerFields: [
        { field: 'Preamble & SFD (8 bytes)', desc: 'Synchronizes clock timing between physical NIC transceivers.' },
        { field: 'Destination MAC (6 bytes) & Source MAC (6 bytes)', desc: '48-bit hardware hardware addresses.' },
        { field: 'EtherType (2 bytes)', desc: 'Specifies encapsulated L3 protocol (0x0800=IPv4, 0x86DD=IPv6, 0x0806=ARP).' },
        { field: 'Payload Data (46–1500 bytes)', desc: 'Encapsulated L3 packet.' },
        { field: 'Frame Check Sequence / FCS (4 bytes)', desc: 'CRC-32 checksum validating hardware frame integrity.' }
      ],
      cliCommands: [
        'getmac (Display local physical Ethernet NIC MAC addresses)',
        'show interfaces (Cisco IOS command to view CRC errors and port link speed)'
      ]
    },
    {
      id: 'wifi',
      name: 'Wi-Fi',
      fullName: 'IEEE 802.11 Wireless LAN',
      section: 'datalink',
      layer: 'Layer 2 / Layer 1 — Wireless Data Link',
      layerNum: 2,
      protocolNum: 'IEEE 802.11a/b/g/n/ac/ax/be (Wi-Fi 6E/7)',
      color: 'from-cyan-500 to-blue-600',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-cyan-900/50',
      shortDesc: 'Radio frequency wireless local area networking over 2.4GHz, 5GHz & 6GHz RF bands.',
      description: 'IEEE 802.11 specifies the media access control (MAC) and physical layer (PHY) protocols for implementing wireless local area network (WLAN) Wi-Fi communication.',
      useCase: 'Providing wireless network access to smartphones, laptops, tablets, and IoT devices via Access Points (APs) with WPA3 enterprise encryption.',
      headerFields: [
        { field: 'Frame Control & Duration', desc: 'Specifies wireless frame type (Management, Control, Data).' },
        { field: 'Address 1, 2, 3, 4 (48-bit MACs)', desc: 'Receiver, Transmitter, Destination, and Source BSSID MACs.' },
        { field: 'SSID & Channel Frequency', desc: 'Network name and RF frequency channel.' }
      ],
      cliCommands: [
        'netsh wlan show interfaces (Display active Wi-Fi signal strength, SSID & channel)',
        'netsh wlan show networks (List available wireless access points)'
      ]
    },
    {
      id: 'vlan_dot1q',
      name: '802.1Q',
      fullName: 'VLAN Tagging (IEEE 802.1Q)',
      section: 'datalink',
      layer: 'Layer 2 — Data Link Trunking',
      layerNum: 2,
      protocolNum: 'EtherType 0x8100',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700 shadow-amber-900/50',
      shortDesc: 'Inserts a 4-byte VLAN tag into Ethernet frames to multiplex multiple logical LANs over trunk links.',
      description: 'IEEE 802.1Q supports Virtual LANs (VLANs) on an Ethernet network. It inserts a 4-byte 802.1Q tag containing a 12-bit VLAN ID (VLAN 1 to 4094) directly into the Ethernet frame header.',
      useCase: 'Carrying multiple isolated VLAN traffic streams (e.g. Management VLAN 10, Voice VLAN 20, Guest VLAN 30) over a single physical switch-to-switch trunk link.',
      headerFields: [
        { field: 'TPID / Tag Protocol Identifier (16 bits)', desc: 'Set to 0x8100 identifying 802.1Q tagged frame.' },
        { field: 'Priority Code Point / PCP (3 bits)', desc: 'IEEE 802.1p Quality of Service (QoS) priority.' },
        { field: 'VLAN Identifier / VID (12 bits)', desc: 'Identifies specific VLAN number from 1 to 4094.' }
      ],
      cliCommands: [
        'show interfaces trunk (Cisco IOS command to view active 802.1Q trunk ports)',
        'show vlan brief (Display configured VLAN database)'
      ]
    },
    {
      id: 'lacp',
      name: 'LACP',
      fullName: 'Link Aggregation Control Protocol (IEEE 802.3ad)',
      section: 'datalink',
      layer: 'Layer 2 — Link Aggregation',
      layerNum: 2,
      protocolNum: 'EtherType 0x8809 / Subtype 0x01',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-emerald-900/50',
      shortDesc: 'Bundles multiple physical Ethernet ports into one logical high-bandwidth trunk link (NIC Teaming).',
      description: 'LACP provides a method to control the bundling of several physical Ethernet ports together to form a single logical channel (EtherChannel / Port Channel).',
      useCase: 'Combining four 10 Gbps Ethernet cables into a single 40 Gbps aggregate link between core switches or hypervisor servers for load balancing and redundancy.',
      headerFields: [
        { field: 'Actor & Partner System ID', desc: 'MAC addresses and priority of aggregated switches.' },
        { field: 'Operational Key', desc: 'Ensures only compatible ports are aggregated.' }
      ],
      cliCommands: [
        'show etherchannel summary (Cisco IOS command to verify active LACP port channels)'
      ]
    }
  ];

  // Category Tabs Filter Dictionary
  const categories = [
    { id: 'all', name: 'All Protocols', populated: true, count: protocolsData.length },
    { id: 'network', name: '🌐 Network Layer (Layer 3)', populated: true, count: protocolsData.filter(p=>p.section==='network').length },
    { id: 'transport', name: '⚡ Transport Layer (Layer 4)', populated: true, count: protocolsData.filter(p=>p.section==='transport').length },
    { id: 'application', name: '💻 Application Layer (Layer 7-5)', populated: true, count: protocolsData.filter(p=>p.section==='application').length },
    { id: 'datalink', name: '🔌 Data Link & Physical (Layer 2-1)', populated: true, count: protocolsData.filter(p=>p.section==='datalink').length },
  ];

  // Filter Protocols based on search and section
  const filteredProtocols = protocolsData.filter(p => {
    const matchesSection = selectedSection === 'all' || p.section === selectedSection;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.protocolNum.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative font-sans text-slate-100">
      
      {/* HEADER BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-950 text-cyan-300 border border-cyan-800">
                  LEARN & TEST REFERENCE
                </span>
                <h2 className="text-2xl font-black text-slate-100 tracking-tight">Network Protocols Catalog & Field Inspector</h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Complete OSI 7-Layer & TCP/IP protocol reference. Click any protocol card to inspect its use cases, headers, & CLI commands!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-extrabold shadow-inner">
              {protocolsData.length} Protocols Fully Populated
            </span>
          </div>
        </div>

        {/* SEARCH BAR & SECTION CATEGORY SELECTOR TABS */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          {/* SEARCH INPUT */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search protocols, ports, headers..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* CATEGORY TABS */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full lg:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedSection(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSection === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black scale-102'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-900 text-cyan-300 border border-cyan-800 font-black">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PROTOCOLS CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs border-b border-slate-800 pb-2">
          <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Showing Protocols ({filteredProtocols.length})
          </h3>
          <span className="text-slate-400 font-bold">
            Category Filter: <strong className="text-cyan-300 uppercase">{selectedSection}</strong>
          </span>
        </div>

        {/* PROTOCOLS CARDS GRID WITH BIGGER PROTOCOL NAMES AS REQUESTED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProtocols.map(protocol => (
            <div
              key={protocol.id}
              onClick={() => setActiveProtocolModal(protocol)}
              className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-cyan-500/80 bg-slate-900/90 hover:bg-slate-900 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between space-y-4 hover:scale-102 group relative overflow-hidden"
            >
              {/* ACCENT HEADER LINE */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${protocol.color}`}></div>

              <div className="space-y-3">
                
                {/* BIG PROTOCOL ACRONYM BADGE & LAYER NUM */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`px-3.5 py-1 rounded-xl text-base font-mono font-black border shadow-lg tracking-wider ${protocol.badgeColor}`}>
                    {protocol.name}
                  </span>
                  <span className="text-xs font-mono font-black text-slate-300 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 shadow">
                    L{protocol.layerNum}
                  </span>
                </div>

                {/* BIG PROTOCOL FULL NAME (ENLARGED FONT SIZE AS REQUESTED) */}
                <div>
                  <h4 className="font-black text-xl text-slate-100 group-hover:text-cyan-300 transition-colors tracking-tight leading-snug">
                    {protocol.fullName}
                  </h4>
                  <p className="text-xs font-mono font-bold text-cyan-400 mt-1">
                    {protocol.protocolNum}
                  </p>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                  {protocol.shortDesc}
                </p>
              </div>

              {/* CARD FOOTER */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-xs text-cyan-400 font-bold group-hover:underline flex items-center gap-1">
                  Inspect Details & Use Cases
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <Info className="w-4.5 h-4.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROTOCOL DETAILS EXTENDED MODAL */}
      {activeProtocolModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-3xl p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans text-slate-100 relative">
            
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${activeProtocolModal.color} text-slate-950 font-black shadow-lg`}>
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {activeProtocolModal.layer}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {activeProtocolModal.protocolNum}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-100 tracking-tight mt-1">
                    {activeProtocolModal.name} — {activeProtocolModal.fullName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveProtocolModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: TECHNICAL DESCRIPTION */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Protocol Overview & Operating Description
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeProtocolModal.description}
              </p>
            </div>

            {/* SECTION 2: FOR WHAT IT IS USED (USE CASE) */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> For What It Is Used (Real-World Purpose & Scenarios)
              </h4>
              <p className="text-xs text-emerald-100 leading-relaxed font-sans font-medium">
                {activeProtocolModal.useCase}
              </p>
            </div>

            {/* SECTION 3: KEY HEADER FIELDS */}
            <div className="space-y-3 font-mono text-xs">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" /> Key Header Fields & Packet Structure:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeProtocolModal.headerFields.map((hf, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <p className="font-bold text-cyan-300 text-xs">{hf.field}</p>
                    <p className="text-[11px] text-slate-400 font-sans leading-snug">{hf.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: CLI COMMANDS & TROUBLESHOOTING */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> Associated CLI Diagnostic Commands:
              </h4>
              <div className="space-y-1.5">
                {activeProtocolModal.cliCommands.map((cmd, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-xs">
                    <code>&gt; {cmd}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveProtocolModal(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DEEP DIVE INSPECTOR SLIDE OUT */}
      <SlideOutInspector title="Network Protocols Technical Matrix & RFC References">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
          <p className="text-slate-300 font-bold">Standard Network Protocol Layering:</p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Network protocols are grouped into Application (L7-5), Transport (L4), Network (L3), and Data Link / Physical (L2-L1). Each layer encapsulates headers from the layer above.
          </p>
        </div>
      </SlideOutInspector>
    </div>
  );
}
