import React, { useState, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Network, Laptop, Server, Router, ShieldCheck, Globe, Play, Square, Trash2, Plus, Zap, Gauge, CheckCircle2, Settings, Cpu, FileCode, Terminal, X, Radio, HardDrive, Mail, Layers, Activity, Printer, Wifi, Database, Download, Upload, FileJson, Sparkles, RotateCcw } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';
import { generateCiscoConfig, parseCiscoConfig } from './CiscoConfigExporter';
import { TOPOLOGY_PRESETS } from './TopologyPresets';
import { downloadPcapFile } from '../../utils/pcapExporter';
import { calculateOspfSpf } from '../../utils/routingEngine';
import { calculateSubnet } from '../../utils/subnetCalculator';
import CiscoTerminalModal from './CiscoTerminalModal';

export default function NetworkSandbox({ appMode = 'clean' }) {
  const { lang, t } = useLanguage();
  const [showAnimation, setShowAnimation] = useState(true);
  const [zoom, setZoom] = useState(1); // Canvas Zoom Level (0.75x to 1.5x)
  const [showCamModal, setShowCamModal] = useState(false); // Switch CAM Table Inspector
  const [showSubnetModal, setShowSubnetModal] = useState(false); // CIDR Subnet Calculator Modal
  const [terminalNodeId, setTerminalNodeId] = useState(null); // Active CLI Terminal Node ID
  // Initial Nodes on Canvas (Includes connected INTERNET-ISP node)
  const [nodes, setNodes] = useState([
    {
      id: 'lap1',
      name: 'LAPTOP-01',
      type: 'laptop',
      x: 80,
      y: 160,
      ip: '192.168.1.105',
      mac: '00:50:56:A1:B2:C1',
      os: 'Windows 11 Pro',
      roles: []
    },
    {
      id: 'sw1',
      name: 'L2-SWITCH-01',
      type: 'switch',
      x: 320,
      y: 200,
      ip: 'N/A (L2 Switch)',
      mac: '00:11:22:33:44:00',
      os: 'Cisco IOS L2',
      roles: []
    },
    {
      id: 'srv1',
      name: 'DC01-SERVER',
      type: 'server',
      x: 580,
      y: 100,
      ip: '192.168.1.10',
      mac: '00:0C:29:8E:7F:11',
      os: 'Windows Server 2022 Datacenter',
      roles: ['dhcp', 'ad', 'dns']
    },
    {
      id: 'r1',
      name: 'ISP-ROUTER',
      type: 'router',
      x: 580,
      y: 320,
      ip: '192.168.1.1',
      mac: '00:00:0C:07:AC:01',
      os: 'Enterprise Gateway OS',
      roles: ['nat']
    },
    {
      id: 'isp1',
      name: 'INTERNET-ISP 🌐',
      type: 'cloud',
      x: 820,
      y: 320,
      ip: '8.8.8.8 (WAN)',
      mac: '00:FE:88:99:AA:BB',
      os: 'Public WAN Gateway ISP',
      roles: []
    }
  ]);

  // Cable Connections (All hosts connected through Switch & Router to ISP Cloud)
  const [links, setLinks] = useState([
    { id: 'link1', from: 'lap1', to: 'sw1', cableType: 'straight' },
    { id: 'link2', from: 'sw1', to: 'srv1', cableType: 'straight' },
    { id: 'link3', from: 'sw1', to: 'r1', cableType: 'straight' },
    { id: 'link4', from: 'r1', to: 'isp1', cableType: 'straight' },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState('lap1');
  const [editingServerId, setEditingServerId] = useState(null); // Server ID for Config Modal
  const [disconnectModalNodeId, setDisconnectModalNodeId] = useState(null); // Node ID for Cable Disconnect Selection Modal
  const [isAddDeviceMenuOpen, setIsAddDeviceMenuOpen] = useState(false); // Floating Add Device Popover Menu State
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Cable Creation State
  const [isCableMode, setIsCableMode] = useState(false);
  const [selectedCableType, setSelectedCableType] = useState('straight'); // straight, crossover, fiber, serial, coax
  const [connectingFromId, setConnectingFromId] = useState(null);

  // Traffic Simulation Controls
  const [simSource, setSimSource] = useState('lap1');
  const [simTarget, setSimTarget] = useState('isp1');
  const [simType, setSimType] = useState('http');
  const [speed, setSpeed] = useState(0.5); // Default speed 0.5x (Blue - Slowest)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPacketPos, setSimPacketPos] = useState(null); // { x, y, isReturn }
  const [livePacketData, setLivePacketData] = useState(null); // Real-time packet inspector details
  const [statusBanner, setStatusBanner] = useState({
    title: 'Network Topology Sandbox',
    subtitle: 'Wire devices, configure Generic Servers via ⚙️ Gear icon, and run live traffic simulations!'
  });

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: 'Interactive Network Topology Sandbox ready. ISP Cloud active & green cables connected.' }
  ]);

  const canvasRef = useRef(null);
  const simTimerRef = useRef(null);

  const handleStopSimulation = () => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsSimulating(false);
    setSimPacketPos(null);
    setLivePacketData(null);
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: 'Traffic simulation stopped by user.' }
    ]);
  };

  // Helper to test if a node is an ISP / Internet Cloud
  const isISPNode = (node) => {
    if (!node) return false;
    return node.type === 'cloud' || node.type === 'isp' || node.name.toUpperCase().includes('ISP') || node.name.toUpperCase().includes('INTERNET');
  };

  // BFS CABLE NETWORK RECOVERY & DYNAMIC COLORING (Green = WAN/ISP Internet, Blue = LAN Network, Red = Disconnected / Cable Mismatch)
  const getLinkStatus = (link, nodeList, linkList) => {
    const n1 = nodeList.find(n => n.id === link.from);
    const n2 = nodeList.find(n => n.id === link.to);
    if (!n1 || !n2) return { color: '#ef4444', label: 'Disconnected / Damaged Cable' };

    // CCNA MDI/MDI-X Cable Mismatch Rule: Like-to-Like devices (PC-PC, Switch-Switch, Router-Router) require Crossover / Fiber cable
    const isHost1 = n1.type === 'laptop' || n1.type === 'desktop';
    const isHost2 = n2.type === 'laptop' || n2.type === 'desktop';
    const isLikeToLike = (isHost1 && isHost2) || (n1.type === n2.type && n1.type !== 'cloud');

    if (isLikeToLike && link.cableType === 'straight') {
      return { color: '#ef4444', label: '🔴 Cable Mismatch (Requires Crossover Cable)' };
    }

    const adj = {};
    nodeList.forEach(n => { adj[n.id] = []; });
    linkList.forEach(l => {
      if (adj[l.from] && adj[l.to]) {
        adj[l.from].push(l.to);
        adj[l.to].push(l.from);
      }
    });

    const visited = new Set();
    const queue = [link.from];
    visited.add(link.from);

    let hasCloudISP = false;

    while (queue.length > 0) {
      const currId = queue.shift();
      const currNode = nodeList.find(n => n.id === currId);
      
      if (isISPNode(currNode)) {
        hasCloudISP = true;
      }

      for (const neighborId of (adj[currId] || [])) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    if (hasCloudISP) {
      // 🟢 GREEN: Connected to Internet Cloud / ISP Provider
      return { color: '#10b981', label: 'WAN / ISP Internet Connected' };
    } else if (visited.size >= 2) {
      // 🔵 BLUE: Connected to LAN Network (Local devices/switches/servers)
      return { color: '#3b82f6', label: 'LAN Network Connected' };
    } else {
      // 🔴 RED: Not connected to any active LAN network / Dangling wire
      return { color: '#ef4444', label: 'Disconnected / Isolated' };
    }
  };

  // BFS GRAPH PATHFINDING ALGORITHM (Finds shortest connected cable path through switches & routers)
  const findShortestCablePath = (startId, endId, nodeList, linkList) => {
    if (startId === endId) return [startId];
    
    const adj = {};
    nodeList.forEach(n => { adj[n.id] = []; });
    linkList.forEach(l => {
      if (adj[l.from] && adj[l.to]) {
        adj[l.from].push(l.to);
        adj[l.to].push(l.from);
      }
    });

    const queue = [[startId]];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === endId) return path;

      for (const neighbor of (adj[current] || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // No connected path!
  };

  // Add Device from Palette
  const handleAddNode = (type) => {
    const id = `node_${Date.now()}`;
    const labels = {
      laptop: 'LAPTOP',
      desktop: 'DESKTOP',
      server: 'GENERIC-SERVER',
      switch: 'L2-SWITCH',
      router: 'GATEWAY-ROUTER',
      firewall: 'FIREWALL',
      printer: 'NET-PRINTER',
      wifi: 'WIFI-AP',
      storage: 'SAN-STORAGE',
      cloud: 'INTERNET-ISP'
    };

    const defaultOs = {
      laptop: 'Windows 11 Enterprise',
      desktop: 'Windows 11 Pro',
      server: 'Windows Server 2022 Datacenter',
      switch: 'Cisco IOS L2 Switch',
      router: 'RouterOS Gateway',
      firewall: 'FortiGate PAN-OS Firewall',
      printer: 'Network Print Firmware',
      wifi: 'Enterprise AP Firmware',
      storage: 'TrueNAS CORE Storage OS',
      cloud: 'Public WAN ISP'
    };

    const defaultRoles = {
      server: ['dhcp'],
      router: ['nat'],
      firewall: ['firewall']
    };

    const newNode = {
      id,
      name: `${labels[type] || 'DEVICE'}-0${nodes.length + 1}`,
      type,
      x: 180 + (nodes.length * 40) % 320,
      y: 140 + (nodes.length * 30) % 220,
      ip: type === 'cloud' ? '8.8.8.8' : `192.168.1.${120 + nodes.length}`,
      mac: `00:50:56:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`,
      os: defaultOs[type] || 'Generic OS',
      roles: defaultRoles[type] || []
    };

    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);

    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Added ${newNode.name} (${type.toUpperCase()}) to canvas.` }
    ]);
  };

  // Export Topology to JSON file
  const handleExportTopology = () => {
    const data = JSON.stringify({ nodes, links }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'netpulse_topology.json';
    a.click();
    URL.revokeObjectURL(url);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'EXPORT', message: 'Topology exported to netpulse_topology.json.' }]);
  };

  // Export Wireshark Binary Packet Capture (.pcap)
  const handleExportPcap = () => {
    const srcNode = nodes.find(n => n.id === simSource);
    const dstNode = nodes.find(n => n.id === simTarget);
    const packetList = [
      {
        srcMac: srcNode?.mac || '00:50:56:A1:B2:C1',
        dstMac: dstNode?.mac || '00:11:22:33:44:00',
        srcIp: srcNode?.ip || '192.168.1.105',
        dstIp: dstNode?.ip || '8.8.8.8',
        srcPort: 54321,
        dstPort: simType === 'http' ? 443 : simType === 'dns' ? 53 : simType === 'kerberos' ? 88 : simType === 'smb' ? 445 : 80,
        protocol: simType === 'dns' ? 'UDP' : simType === 'ping' ? 'ICMP' : 'TCP',
        payloadText: `NetPulse Live Simulation Packet [${simType.toUpperCase()}] from ${srcNode?.name || 'Src'} to ${dstNode?.name || 'Dst'}`
      }
    ];
    downloadPcapFile(packetList, `netpulse_${simType}_traffic.pcap`);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'EXPORT_PCAP', message: `Exported Wireshark packet capture file: netpulse_${simType}_traffic.pcap` }]);
  };

  // Run OSPF Dijkstra Shortest Path First calculation
  const handleCheckOspfRoute = () => {
    const spfResult = calculateOspfSpf(nodes, links, simSource, simTarget);
    if (spfResult.path) {
      const pathNames = spfResult.path.map(id => nodes.find(n => n.id === id)?.name).join(' ➔ ');
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'OSPF_SPF', message: `OSPF Dijkstra Shortest Path: ${pathNames} (Total Metric Cost = ${spfResult.totalCost})` }]);
      setStatusBanner({
        title: `🗺️ OSPF Dijkstra Shortest Path (Cost = ${spfResult.totalCost})`,
        subtitle: `Optimal Path: ${pathNames}`
      });
    } else {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'OSPF_SPF', message: `OSPF SPF: No reachable path between source and target.` }]);
    }
  };

  // Export Cisco IOS Running-Config Script (.cfg)
  const handleExportCiscoConfig = () => {
    const script = generateCiscoConfig(nodes, links);
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cisco_ios_running_config.cfg';
    a.click();
    URL.revokeObjectURL(url);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'EXPORT_CISCO', message: 'Exported Cisco IOS configuration script to cisco_ios_running_config.cfg.' }]);
  };

  // Import Topology from JSON or Cisco IOS CLI Config (.json, .cfg, .txt, .ios)
  const handleImportTopology = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      try {
        // Try parsing NetPulse JSON first
        const parsed = JSON.parse(content);
        if (parsed.nodes && parsed.links) {
          setNodes(parsed.nodes);
          setLinks(parsed.links);
          setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'IMPORT_JSON', message: `Topology imported from JSON (${parsed.nodes.length} devices, ${parsed.links.length} cables).` }]);
          return;
        }
      } catch (_jsonErr) {
        // Fallback: Parse Cisco IOS CLI Config script (.cfg, .txt, .ios)
        const importedNodes = parseCiscoConfig(content);
        const importedLinks = [];

        if (importedNodes.length > 0) {
          for (let i = 0; i < importedNodes.length - 1; i++) {
            importedLinks.push({
              id: `link-imported-${i}`,
              from: importedNodes[i].id,
              to: importedNodes[i + 1].id,
              cableType: 'straight'
            });
          }
          setNodes(importedNodes);
          setLinks(importedLinks);
          setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'IMPORT_CISCO', message: `Imported Cisco IOS Config (${importedNodes.length} devices auto-created).` }]);
          return;
        }

        alert('Unable to parse file. Please upload a valid NetPulse JSON topology file (.json) or Cisco IOS configuration script (.cfg, .txt, .ios).');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset Canvas State
  const handleResetCanvas = () => {
    if (nodes.length > 0 && !window.confirm('Are you sure you want to reset and clear all devices from the canvas?')) {
      return;
    }
    setNodes([]);
    setLinks([]);
    setSelectedNodeId(null);
    setEditingServerId(null);
    setDisconnectModalNodeId(null);
    setLivePacketData(null);
    setIsSimulating(false);
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'RESET', message: 'Canvas reset to clean empty workspace state.' }]);
  };

  // Load Preset Topology Template
  const handleLoadPreset = (templateKey) => {
    const sel = TOPOLOGY_PRESETS[templateKey];
    if (sel) {
      setNodes(sel.nodes);
      setLinks(sel.links);
      setSelectedNodeId(sel.nodes[0].id);
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'TEMPLATE', message: `Loaded preset topology: ${templateKey.toUpperCase()}` }]);
    }
  };

  // Node Click / Cable Wiring Logic
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);

    if (isCableMode) {
      if (!connectingFromId) {
        setConnectingFromId(nodeId);
        const sourceNode = nodes.find(n => n.id === nodeId);
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Wiring Cable: Click 2nd device to connect to ${sourceNode?.name}...` }]);
      } else if (connectingFromId !== nodeId) {
        const fromNode = nodes.find(n => n.id === connectingFromId);
        const toNode = nodes.find(n => n.id === nodeId);
        
        setLinks([...links, {
          id: `link_${Date.now()}`,
          from: connectingFromId,
          to: nodeId,
          cableType: selectedCableType
        }]);

        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Connected ${selectedCableType.toUpperCase()} cable between ${fromNode?.name} and ${toNode?.name}.` }]);
        setConnectingFromId(null);
        setIsCableMode(false);
      }
      return;
    }

    const n = nodes.find(item => item.id === nodeId);
    setDraggingNodeId(nodeId);
    setDragOffset({ x: e.clientX - n.x, y: e.clientY - n.y });
  };

  const handleMouseMove = (e) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(20, Math.min(rect.width - 140, e.clientX - dragOffset.x));
      const newY = Math.max(20, Math.min(rect.height - 110, e.clientY - dragOffset.y));
      setNodes(nodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
    }
  };

  const handleMouseUp = () => setDraggingNodeId(null);

  // Remove Selected Device Node
  const handleDeleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setLinks(links.filter(l => l.from !== nodeId && l.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Removed device ${nodeId} and associated cable links.` }]);
  };

  // Disconnect Cable Logic (Prompt modal if multiple connections)
  const handleInitiateDisconnect = (nodeId) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Click a device on the canvas first to disconnect its cable wires.` }]);
      return;
    }

    const connectedLinks = links.filter(l => l.from === targetId || l.to === targetId);
    if (connectedLinks.length === 0) {
      const targetNode = nodes.find(n => n.id === targetId);
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `${targetNode?.name || 'Device'} has no connected cable wires.` }]);
      return;
    }

    if (connectedLinks.length === 1) {
      // Single cable connection: disconnect directly
      const linkToRemove = connectedLinks[0];
      const fromNode = nodes.find(n => n.id === linkToRemove.from);
      const toNode = nodes.find(n => n.id === linkToRemove.to);
      setLinks(links.filter(l => l.id !== linkToRemove.id));
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Disconnected cable between ${fromNode?.name} and ${toNode?.name}.` }]);
    } else {
      // Multiple cable connections: prompt modal selection!
      setDisconnectModalNodeId(targetId);
    }
  };

  // Run Traffic Simulation with Graph Pathfinding & FULL ROUND-TRIP (OUTBOUND + RETURN TRIP) ANIMATION
  const handleRunSimulation = () => {
    if (simSource === simTarget) return;

    const srcNode = nodes.find(n => n.id === simSource);
    const dstNode = nodes.find(n => n.id === simTarget);

    // Calculate actual multi-hop cable path using BFS
    const cablePath = findShortestCablePath(simSource, simTarget, nodes, links);

    if (!cablePath) {
      setStatusBanner({
        title: '❌ NO CONNECTED CABLE PATH!',
        subtitle: `Cannot transmit: ${srcNode?.name} and ${dstNode?.name} are not wired together! Use "🔌 Add Cable" to connect them.`
      });
      setLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), tag: 'ROUTING_ERROR', message: `FAIL: No cable connection path between ${srcNode?.name} and ${dstNode?.name}. Packet dropped.` }
      ]);
      setLivePacketData(null);
      return;
    }

    setIsSimulating(true);

    const typeNames = {
      dhcp: 'DHCP DORA Lease Request',
      dns: 'DNS Hostname Resolution',
      kerberos: 'Kerberos Ticket Exchange (AS/TGS)',
      ping: 'ICMP Echo Ping Request',
      esxi: 'VMware ESXi Host vSphere Management',
      http: 'HTTPS Web Application Traffic',
      smb: 'SMB/CIFS Network File Transfer'
    };

    const packetPayloadTemplates = {
      dhcp: {
        etherType: '0x0806 (ARP / BOOTP DHCP)',
        l2: `Src MAC: ${srcNode?.mac} ➔ Dst MAC: FF:FF:FF:FF:FF:FF (Broadcast)`,
        l3: `Src IP: 0.0.0.0 ➔ Dst IP: 255.255.255.255`,
        l4: `UDP Port 68 ➔ UDP Port 67 (BOOTP Client/Server)`,
        payload: `DHCP DISCOVER (xid: 0x39a1f2, chaddr: ${srcNode?.mac})`
      },
      dns: {
        etherType: '0x0800 (IPv4 Datagram)',
        l2: `Src MAC: ${srcNode?.mac} ➔ Dst MAC: ${dstNode?.mac}`,
        l3: `Src IP: ${srcNode?.ip} ➔ Dst IP: ${dstNode?.ip}`,
        l4: `UDP Port 53 (Domain Name System)`,
        payload: `DNS Query: A corp.local IN (Transaction ID: 0x1a8f)`
      },
      kerberos: {
        etherType: '0x0800 (IPv4 Datagram)',
        l2: `Src MAC: ${srcNode?.mac} ➔ Dst MAC: ${dstNode?.mac}`,
        l3: `Src IP: ${srcNode?.ip} ➔ Dst IP: ${dstNode?.ip}`,
        l4: `TCP Port 88 (Kerberos KDC)`,
        payload: `KRB_AS_REQ (Principal: student@dts.local, Encrypted Timestamp)`
      },
      ping: {
        etherType: '0x0800 (IPv4 Datagram)',
        l2: `Src MAC: ${srcNode?.mac} ➔ Dst MAC: ${dstNode?.mac}`,
        l3: `Src IP: ${srcNode?.ip} ➔ Dst IP: ${dstNode?.ip}`,
        l4: `ICMP Type 8 (Echo Request)`,
        payload: `Ping Payload (32 bytes data, TTL=64, Seq=1)`
      },
      esxi: {
        etherType: '0x0800 (IPv4 Datagram)',
        l2: `Src MAC: ${srcNode?.mac} ➔ Dst MAC: ${dstNode?.mac}`,
        l3: `Src IP: ${srcNode?.ip} ➔ Dst IP: ${dstNode?.ip}`,
        l4: `TCP Port 443 (vSphere HTTPS Client)`,
        payload: `ESXi Management TLS Session (vCenter Host Handshake)`
      },
      http: {
        etherType: '0x0800 (IPv4 Datagram)',
        l2: `Src MAC: ${srcNode?.mac} ➔ Dst MAC: ${dstNode?.mac}`,
        l3: `Src IP: ${srcNode?.ip} ➔ Dst IP: ${dstNode?.ip}`,
        l4: `TCP Port 443 (TLS v1.3 HTTPS Web)`,
        payload: `GET /index.html HTTP/1.1 (TLS Handshake Encrypted)`
      },
      smb: {
        etherType: '0x0800 (IPv4 Datagram)',
        l2: `Src MAC: ${srcNode?.mac} ➔ Dst MAC: ${dstNode?.mac}`,
        l3: `Src IP: ${srcNode?.ip} ➔ Dst IP: ${dstNode?.ip}`,
        l4: `TCP Port 445 (Microsoft SMB File Share)`,
        payload: `SMB2 COM_TREE_CONNECT (Share: \\FILESERVER01\docs)`
      }
    };

    const outboundPath = [...cablePath];
    const returnPath = [...cablePath].reverse();
    const numSegments = outboundPath.length - 1;

    const pathNames = outboundPath.map(id => nodes.find(n => n.id === id)?.name).join(' ➔ ');

    setStatusBanner({
      title: `⚡ OUTBOUND REQUEST: ${typeNames[simType]}...`,
      subtitle: `Outbound Path: ${pathNames}`
    });

    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: simType.toUpperCase(), message: `OUTBOUND REQUEST: Transmitting ${typeNames[simType]} from ${srcNode?.name} ➔ ${dstNode?.name} along ${pathNames}` }
    ]);

    let isReturnPhase = false;
    let progress = 0;

    if (simTimerRef.current) clearInterval(simTimerRef.current);

    simTimerRef.current = setInterval(() => {
      progress += (0.045 * speed) / numSegments;

      if (progress <= 1) {
        const activePath = isReturnPhase ? returnPath : outboundPath;
        const totalScaled = progress * numSegments;
        const segIndex = Math.min(Math.floor(totalScaled), numSegments - 1);
        const segProgress = totalScaled - segIndex;

        const nodeA = nodes.find(n => n.id === activePath[segIndex]);
        const nodeB = nodes.find(n => n.id === activePath[segIndex + 1]);

        if (nodeA && nodeB) {
          const curX = nodeA.x + (nodeB.x - nodeA.x) * segProgress;
          const curY = nodeA.y + (nodeB.y - nodeA.y) * segProgress;
          setSimPacketPos({ x: curX, y: curY, isReturn: isReturnPhase });

          const baseTemplate = packetPayloadTemplates[simType] || packetPayloadTemplates.ping;
          const phaseLabel = isReturnPhase ? 'RESPONSE RETURN TRIP ↩️' : 'REQUEST OUTBOUND ⚡';
          setLivePacketData({
            ...baseTemplate,
            protocolName: `${typeNames[simType]} (${phaseLabel})`,
            currentHop: `${phaseLabel}: Hop ${segIndex + 1} of ${numSegments} (${nodeA.name} ➔ ${nodeB.name})`,
            nodeAId: nodeA.id,
            nodeBId: nodeB.id
          });
        }
      } else if (!isReturnPhase) {
        // Outbound Phase complete! Target receives request, now send Response ALL THE WAY BACK to Source!
        isReturnPhase = true;
        progress = 0;
        const returnPathNames = returnPath.map(id => nodes.find(n => n.id === id)?.name).join(' ➔ ');

        setLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), tag: simType.toUpperCase(), message: `Target ${dstNode?.name} received request! Transmitting RESPONSE BACK along reverse path: ${returnPathNames}` }
        ]);

        setStatusBanner({
          title: `↩️ RETURN TRIP: ${typeNames[simType]} RESPONSE...`,
          subtitle: `Response Packet traveling back to ${srcNode?.name}: ${returnPathNames}`
        });
      } else {
        // Return Trip complete! Packet has returned back to Source!
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        simTimerRef.current = null;
        setSimPacketPos(null);
        setIsSimulating(false);
        
        setStatusBanner({
          title: `✅ ${typeNames[simType]} COMPLETED & RETURNED!`,
          subtitle: `Response successfully delivered back to ${srcNode?.name} (${srcNode?.ip})!`
        });

        setLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), tag: simType.toUpperCase(), message: `SUCCESS: Response packet arrived safely back at ${srcNode?.name}!` }
        ]);
      }
    }, 40);
  };

  // Node Icon Helper (With Glowing Green Internet ISP Icon)
  const getNodeIcon = (type, roles = [], name = '') => {
    if (roles.includes('esxi')) return <Cpu className="w-7 h-7 text-emerald-400" />;
    if (type === 'cloud' || name.toUpperCase().includes('ISP') || name.toUpperCase().includes('INTERNET')) {
      return <Globe className="w-8 h-8 text-emerald-400 animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,1)]" />;
    }
    switch(type) {
      case 'laptop': return <Laptop className="w-7 h-7 text-cyan-400" />;
      case 'desktop': return <Laptop className="w-7 h-7 text-blue-400" />;
      case 'server': return <Server className="w-7 h-7 text-purple-400" />;
      case 'switch': return <Layers className="w-7 h-7 text-blue-400" />;
      case 'router': return <Router className="w-8 h-8 text-amber-400" />;
      case 'firewall': return <ShieldCheck className="w-7 h-7 text-rose-400" />;
      case 'printer': return <Printer className="w-7 h-7 text-emerald-400" />;
      case 'wifi': return <Wifi className="w-7 h-7 text-teal-400" />;
      case 'storage': return <Database className="w-7 h-7 text-amber-300" />;
      default: return <Server className="w-7 h-7 text-slate-400" />;
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const editingServer = nodes.find(n => n.id === editingServerId);
  const disconnectNode = nodes.find(n => n.id === disconnectModalNodeId);
  const nodeConnectedLinks = disconnectModalNodeId ? links.filter(l => l.from === disconnectModalNodeId || l.to === disconnectModalNodeId) : [];

  // Toggle Server Role
  const handleToggleRole = (role) => {
    if (!editingServer) return;
    const currentRoles = editingServer.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];

    setNodes(nodes.map(n => n.id === editingServer.id ? { ...n, roles: newRoles } : n));
  };

  // Change Server OS
  const handleChangeOs = (os) => {
    if (!editingServer) return;
    setNodes(nodes.map(n => n.id === editingServer.id ? { ...n, os } : n));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative font-sans">



      {/* DISCONNECT CABLE SELECTION MODAL POPUP (IF MORE THAN 1 CONNECTION) */}
      {disconnectNode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-700 space-y-4 bg-slate-900/95 relative text-slate-100 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">Disconnect Cable for {disconnectNode.name}</h3>
                  <p className="text-xs text-rose-400 font-bold">Select Cable Connection to Remove</p>
                </div>
              </div>
              <button
                onClick={() => setDisconnectModalNodeId(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="text-cyan-300 font-bold">{disconnectNode.name}</span> has <span className="text-amber-400 font-bold">{nodeConnectedLinks.length} active cable connections</span>. Select which cable to disconnect:
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {nodeConnectedLinks.map(link => {
                const otherId = link.from === disconnectModalNodeId ? link.to : link.from;
                const otherNode = nodes.find(n => n.id === otherId);
                return (
                  <div key={link.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-100">
                        <span className="text-cyan-300">{disconnectNode.name}</span> 🔌 <span className="text-amber-300">{otherNode?.name}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{link.cableType} Cable</p>
                    </div>
                    <button
                      onClick={() => {
                        setLinks(links.filter(l => l.id !== link.id));
                        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Disconnected ${link.cableType.toUpperCase()} cable between ${disconnectNode.name} and ${otherNode?.name}.` }]);
                        setDisconnectModalNodeId(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs cursor-pointer shadow transition-all flex items-center gap-1"
                    >
                      <span>✂️ Disconnect</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setDisconnectModalNodeId(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED FLOATING DEVICE CONFIGURATION GEAR MODAL POPUP (EVERY DEVICE) */}
      {editingServer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-xl w-full p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-5 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto font-mono">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Settings className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100 tracking-tight">Configure {editingServer.name}</h3>
                  <p className="text-xs text-amber-400 font-bold">Device Hostname, IP/MAC, OS & Server Roles</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleDeleteNode(editingServer.id);
                    setEditingServerId(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Remove Device"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Device</span>
                </button>

                <button
                  onClick={() => setEditingServerId(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Device Hostname / Label */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Device Hostname / Label:</label>
              <input
                type="text"
                value={editingServer.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setNodes(nodes.map(n => n.id === editingServer.id ? { ...n, name: newName } : n));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Network IP & Layer 2/3 Addressing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Network IP & Layer 2/3 Settings:</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">IPv4 Address:</label>
                  <input
                    type="text"
                    value={editingServer.ip}
                    onChange={(e) => {
                      const newIp = e.target.value;
                      setNodes(nodes.map(n => n.id === editingServer.id ? { ...n, ip: newIp } : n));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Subnet Mask:</label>
                  <input
                    type="text"
                    value={editingServer.subnetMask || '255.255.255.0'}
                    onChange={(e) => {
                      const mask = e.target.value;
                      setNodes(nodes.map(n => n.id === editingServer.id ? { ...n, subnetMask: mask } : n));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Default Gateway IP:</label>
                  <input
                    type="text"
                    value={editingServer.gateway || '192.168.1.1'}
                    onChange={(e) => {
                      const gw = e.target.value;
                      setNodes(nodes.map(n => n.id === editingServer.id ? { ...n, gateway: gw } : n));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">MAC Address (Hardware):</label>
                  <input
                    type="text"
                    value={editingServer.mac}
                    onChange={(e) => {
                      const mac = e.target.value;
                      setNodes(nodes.map(n => n.id === editingServer.id ? { ...n, mac } : n));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Operating System Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Operating System / Firmware:</label>
              <select
                value={editingServer.os || 'Windows 11 Enterprise'}
                onChange={(e) => handleChangeOs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Windows 11 Enterprise">💻 Windows 11 Enterprise (Client Workstation)</option>
                <option value="Windows Server 2022 Datacenter">🪟 Windows Server 2022 Datacenter (AD DS / KDC / DHCP)</option>
                <option value="Linux Enterprise (Ubuntu / RHEL)">🐧 Linux Enterprise Server (Ubuntu 24.04 / RHEL 9)</option>
                <option value="Cisco IOS-XE Gateway OS">🔀 Cisco IOS-XE Enterprise Router Firmware</option>
                <option value="FortiOS Enterprise Firewall">🛡️ FortiOS Stateful Inspection Firewall</option>
                <option value="VMware ESXi 8.0 Bare-Metal Hypervisor">🧱 VMware ESXi 8.0 Bare-Metal Hypervisor Host</option>
                <option value="Proxmox VE Hypervisor">🧱 Proxmox VE 8.1 Open Source Virtualization</option>
                <option value="macOS Sonoma">🍏 Apple macOS Sonoma Workspace</option>
              </select>
            </div>

            {/* Server & Gateway Roles Checkboxes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Enable Roles & Services:</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'dhcp', label: '🔌 DHCP Server (IP Pool)', color: 'text-amber-300' },
                  { id: 'ad', label: '🛡️ Active Directory (AD DS)', color: 'text-purple-300' },
                  { id: 'dns', label: '🌐 DNS Server (Resolver)', color: 'text-cyan-300' },
                  { id: 'mail', label: '✉️ Mail Server (SMTP/IMAP)', color: 'text-blue-300' },
                  { id: 'smb', label: '📁 SMB File Share / NAS', color: 'text-emerald-300' },
                  { id: 'nat', label: '🔀 NAT / PAT Gateway', color: 'text-teal-300' },
                  { id: 'vpn', label: '🔒 IPsec VPN Security Tunnel', color: 'text-rose-300' },
                  { id: 'firewall', label: '🧱 Stateful Firewall (SPI)', color: 'text-red-300' },
                ].map((roleItem) => {
                  const isEnabled = (editingServer.roles || []).includes(roleItem.id);
                  return (
                    <div
                      key={roleItem.id}
                      onClick={() => handleToggleRole(roleItem.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isEnabled
                          ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className={`font-bold text-[11px] ${roleItem.color}`}>{roleItem.label}</span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => {}}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-0 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  handleInitiateDisconnect(editingServer.id);
                  setEditingServerId(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✂️ Disconnect Wires</span>
              </button>

              <button
                onClick={() => setEditingServerId(null)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Save & Close ⚙️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMADE UNIFIED WORKSPACE CONTROLS & CABLE/PROTOCOL TOOLBAR */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl bg-slate-900/90 font-mono text-xs">
        
        {/* Left Group: Cable Type Selection & Export/Import Topology */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/90 px-3.5 py-2 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-bold">Cable Type:</span>
            <select
              value={selectedCableType}
              onChange={(e) => setSelectedCableType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-cyan-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="straight">Cat6 Ethernet (Straight-Through)</option>
              <option value="crossover">Cat6 Crossover Cable</option>
              <option value="fiber">Single-Mode Fiber Optic Cable</option>
              <option value="serial">Serial WAN Cable</option>
              <option value="coax">Coaxial Cable</option>
            </select>
          </div>

          {/* GROUPED HIGH-VISIBILITY TOOLBAR CONTROLS */}
          <div className="flex flex-wrap items-center gap-3 w-full border-b border-slate-800 pb-3">
            
            {/* GROUP 1: NETWORK TOOLS & INSPECTORS */}
            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase px-2 flex items-center gap-1 border-r border-slate-800">
                🛠️ Tools:
              </span>
              
              <button
                onClick={() => setShowSubnetModal(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-amber-950 text-amber-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-amber-700 transition-colors cursor-pointer"
                title="Open IPv4 CIDR Subnetting & Range Calculator"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" /> Subnet Calc
              </button>

              <button
                onClick={() => setShowCamModal(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-blue-950 text-blue-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-blue-700 transition-colors cursor-pointer"
                title="Inspect Layer 2 Switch MAC Address Table (CAM Table) & ARP Cache"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" /> CAM / ARP Table
              </button>

              <button
                onClick={() => setTerminalNodeId(selectedNodeId || nodes[0]?.id)}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-cyan-950 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-cyan-700 transition-colors cursor-pointer"
                title="Open Cisco IOS CLI Terminal Emulator for Selected Device"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Cisco CLI
              </button>

              <button
                onClick={handleCheckOspfRoute}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-emerald-950 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-emerald-700 transition-colors cursor-pointer"
                title="Calculate OSPF Dijkstra Shortest Path First (SPF) metric & route"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> OSPF Route
              </button>

              <button
                onClick={handleExportPcap}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-cyan-950 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-cyan-700 transition-colors cursor-pointer"
                title="Generate & download raw Wireshark packet capture file (.pcap)"
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Wireshark (.pcap)
              </button>
            </div>

            {/* GROUP 2: IMPORT / EXPORT & PRESETS */}
            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase px-2 flex items-center gap-1 border-r border-slate-800">
                📁 Files:
              </span>

              <button
                onClick={handleExportCiscoConfig}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-purple-950 text-purple-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-purple-700 transition-colors cursor-pointer"
                title="Generate & download Cisco IOS CLI running-config script (.cfg)"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-400" /> Export Cisco (.cfg)
              </button>

              <button
                onClick={handleExportTopology}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                title="Download current topology layout as JSON file"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Export JSON
              </button>

              <label className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer" title="Import NetPulse JSON topology (.json) or Cisco IOS running-config script (.cfg, .txt)">
                <Upload className="w-3.5 h-3.5 text-amber-400" /> Import
                <input type="file" accept=".json,.cfg,.txt,.ios" onChange={handleImportTopology} className="hidden" />
              </label>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadTemplate(e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="" disabled>Load Preset Template...</option>
                <option value="standard_lan">🏢 Standard Enterprise Office LAN</option>
                <option value="corporate">🌐 Corporate HQ & Server Rack</option>
                <option value="dmz">🛡️ DMZ Palo Alto NGFW Architecture</option>
                <option value="hybrid_wan">🛰️ Hybrid SD-WAN & Dual ISP WAN</option>
                <option value="vpn">🔒 Site-to-Site IPsec VPN Branch</option>
                <option value="enterprise_ha">⚡ High-Availability (HA) Core Campus</option>
              </select>
            </div>

            {/* GROUP 3: RESET */}
            <button
              onClick={handleResetCanvas}
              className="px-3 py-2 rounded-2xl bg-slate-950 hover:bg-rose-950 text-rose-300 hover:text-rose-200 font-bold text-xs flex items-center gap-1.5 border border-slate-800 hover:border-rose-700 transition-colors cursor-pointer ml-auto"
              title="Clear all devices and cables from canvas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Reset Canvas
            </button>
          </div>
        </div>

        {/* Center Group: Protocol & Source/Target Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Protocol:</label>
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="dhcp">DHCP DORA Request</option>
              <option value="dns">DNS Hostname Query</option>
              <option value="kerberos">Kerberos Authentication (AS/TGS)</option>
              <option value="ping">ICMP Echo Request (Ping)</option>
              <option value="esxi">VMware ESXi vSphere Management</option>
              <option value="http">HTTPS Web App Traffic</option>
              <option value="smb">SMB Network File Transfer</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">From:</label>
            <select
              value={simSource}
              onChange={(e) => setSimSource(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">To:</label>
            <select
              value={simTarget}
              onChange={(e) => setSimTarget(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          {/* SPEED SELECTOR WITH BLUE ➔ YELLOW ➔ RED COLOR FEEDBACK & STATE BADGE */}
          <button
            onClick={() => {
              const nextSpeed = speed === 0.5 ? 1 : speed === 1 ? 2 : 0.5;
              setSpeed(nextSpeed);
            }}
            className={`h-9 px-3 rounded-2xl font-mono text-xs font-black border transition-all duration-300 shadow cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
              speed === 0.5
                ? 'bg-blue-950/90 text-blue-300 border-blue-500 shadow-blue-500/30'
                : speed === 1
                ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-amber-500/30'
                : 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-rose-500/30 animate-pulse'
            }`}
            title={`Animation Speed: ${speed}x (Blue = 0.5x Slowest Default | Yellow = 1x Medium | Red = 2x Fast)`}
          >
            <Gauge className={`w-4 h-4 ${
              speed === 0.5 ? 'text-blue-400' : speed === 1 ? 'text-amber-400' : 'text-rose-400'
            }`} />
            <span>{speed}x</span>
          </button>
        </div>

        {/* Right Group: Play / Stop Action Circle Button */}
        {isSimulating ? (
          <button
            onClick={handleStopSimulation}
            className="w-9 h-9 rounded-full bg-rose-500 text-white border border-rose-400 hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer flex items-center justify-center"
            title="Stop Traffic Simulation"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleRunSimulation}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 border border-cyan-300 hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer flex items-center justify-center"
            title="Run Traffic Simulation Across Canvas"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* TOPOLOGY CANVAS STAGE */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-4 space-y-4 shadow-2xl relative">
        
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-2xl border border-slate-800 min-h-[660px] h-[680px] relative overflow-hidden bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-slate-950/90 select-none"
        >
          {/* FLOATING CABLE COLOR LEGEND AT TOP-LEFT OF WORKPLACE CANVAS */}
          <div className="absolute top-4 left-4 z-30 font-mono hidden sm:flex items-center gap-3 text-[11px] font-bold bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-slate-300 shadow-xl">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse"></span>
              <span>🟢 WAN (Internet ISP)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></span>
              <span>🔵 LAN Network</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500"></span>
              <span>🔴 Disconnected</span>
            </span>
          </div>
          {/* FLOATING CONTROL PANEL AT TOP-RIGHT OF WORKPLACE CANVAS: 1. ZOOM CONTROLS (- / +), 2. ADD DEVICE, 3. DISCONNECT, 4. ADD CABLE */}
          <div className="absolute top-4 right-4 z-30 font-mono flex flex-col items-end gap-2">
            
            {/* FLOATING PROMINENT ZOOM CONTROLS (- / +) */}
            <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 text-slate-100 shadow-2xl font-mono text-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase pr-1">Canvas Zoom:</span>
              <button
                onClick={() => setZoom(prev => Math.max(0.6, Math.round((prev - 0.1) * 100) / 100))}
                className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-lg border border-slate-600 cursor-pointer flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow"
                title="Zoom Out (-)"
              >
                -
              </button>
              <span className="px-1.5 font-black text-amber-300 min-w-[42px] text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(1.6, Math.round((prev + 0.1) * 100) / 100))}
                className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-lg border border-slate-600 cursor-pointer flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow"
                title="Zoom In (+)"
              >
                +
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-[10px] border border-slate-700 cursor-pointer"
                title="Reset Zoom to 100%"
              >
                Reset
              </button>
            </div>

            {/* 1. ADD DEVICE BUTTON & DROPDOWN POPOVER */}
            <div className="relative">
              <button
                onClick={() => setIsAddDeviceMenuOpen(!isAddDeviceMenuOpen)}
                className="w-40 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xl border border-cyan-300 cursor-pointer transition-all"
              >
                <Plus className={`w-4 h-4 transition-transform duration-200 ${isAddDeviceMenuOpen ? 'rotate-45' : ''}`} />
                <span>+ Add Device</span>
              </button>

              {/* EXPANDED DROPDOWN POPOVER MENU WITH MORE DEVICES */}
              {isAddDeviceMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-2 font-mono text-xs space-y-1 z-40 animate-fadeIn max-h-[380px] overflow-y-auto">
                  <div className="px-2 py-1 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                    Select Device to Add:
                  </div>
                  
                  <button
                    onClick={() => { handleAddNode('laptop'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-700 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <span>+ Laptop</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('desktop'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-blue-950 text-blue-300 hover:text-blue-200 border border-slate-800 hover:border-blue-700 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Laptop className="w-4 h-4 text-blue-400" />
                    <span>+ Desktop Workstation</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('server'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>+ Generic Server ⚙️</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('switch'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-blue-950 text-blue-300 hover:text-blue-200 border border-slate-800 hover:border-blue-700 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>+ L2 Switch</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('router'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-purple-950 text-purple-300 hover:text-purple-200 border border-slate-800 hover:border-purple-700 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Router className="w-4 h-4 text-purple-400" />
                    <span>+ Gateway Router</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('firewall'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-rose-950 text-rose-300 hover:text-rose-200 border border-slate-800 hover:border-rose-700 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    <span>+ Hardware Firewall</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('printer'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span>+ Network Printer</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('wifi'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-teal-950 text-teal-300 border border-slate-800 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Wifi className="w-4 h-4 text-teal-400" />
                    <span>+ Wireless AP (Wi-Fi)</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('storage'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-amber-950 text-amber-300 border border-slate-800 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-amber-300" />
                    <span>+ SAN / NAS Storage</span>
                  </button>

                  <button
                    onClick={() => { handleAddNode('cloud'); setIsAddDeviceMenuOpen(false); }}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>+ Internet ISP 🌐</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. DISCONNECT BUTTON (NAMED EXACTLY 'Disconnect' DIRECTLY UNDER ADD DEVICE) */}
            <button
              onClick={() => handleInitiateDisconnect(selectedNodeId)}
              className="w-40 px-3.5 py-2 rounded-2xl bg-rose-950/90 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-700/80 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
              title="Disconnect cable wires connected to the selected device"
            >
              <span>✂️ Disconnect</span>
            </button>

            {/* 3. ADD CABLE BUTTON (PLACED DIRECTLY UNDER DISCONNECT BUTTON) */}
            <button
              onClick={() => { setIsCableMode(!isCableMode); setConnectingFromId(null); }}
              className={`w-40 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                isCableMode
                  ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30 animate-pulse border border-cyan-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700'
              }`}
            >
              <span>{isCableMode ? (connectingFromId ? '⚡ Click 2nd Device...' : '⚡ Click 1st Device...') : '🔌 Add Cable'}</span>
            </button>
          </div>

          {/* INNER SCALABLE CANVAS STAGE */}
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            className="w-full h-full relative transition-transform duration-150 ease-out"
          >
            {/* CABLES SVG WITH DYNAMIC NETWORK STATUS COLORING & ACTIVE PACKET PULSE */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {links.map(link => {
              const n1 = nodes.find(n => n.id === link.from);
              const n2 = nodes.find(n => n.id === link.to);
              if (!n1 || !n2) return null;

              const status = getLinkStatus(link, nodes, links);

              // Check if active packet is currently traversing this specific wire link
              const isPacketTraversingLink = livePacketData && (
                (livePacketData.nodeAId === link.from && livePacketData.nodeBId === link.to) ||
                (livePacketData.nodeAId === link.to && livePacketData.nodeBId === link.from)
              );

              // Cable stroke color dynamically shifts!
              const wireStrokeColor = isPacketTraversingLink
                ? (simPacketPos?.isReturn ? '#10b981' : '#22d3ee')
                : status.color;

              const wireStrokeWidth = isPacketTraversingLink ? '6' : '4';

              return (
                <line
                  key={link.id}
                  x1={n1.x + 60}
                  y1={n1.y + 45}
                  x2={n2.x + 60}
                  y2={n2.y + 45}
                  stroke={wireStrokeColor}
                  strokeWidth={wireStrokeWidth}
                  strokeOpacity="0.95"
                  className="animate-wire-dash transition-colors duration-300"
                />
              );
            })}
          </svg>

          {/* ANIMATED PACKET OVERLAY (OUTBOUND REQUEST OR RETURN RESPONSE) */}
          {simPacketPos && (
            <div
              style={{ left: `${simPacketPos.x + 60}px`, top: `${simPacketPos.y + 45}px` }}
              className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-2xl animate-pulse pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-slate-950 ${
                simPacketPos.isReturn ? 'bg-emerald-400 shadow-emerald-400' : 'bg-cyan-400 shadow-cyan-400'
              }`}
            >
              {simPacketPos.isReturn ? '↩️' : '⚡'}
            </div>
          )}

          {/* NETWORK DEVICE NODES ON CANVAS */}
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isServer = node.type === 'server';
            const isCloudISP = isISPNode(node);
            const rolesText = (node.roles || []).join(', ').toUpperCase();

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute p-3 px-3.5 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing z-20 flex flex-col items-center gap-1 font-mono text-[11px] ${
                  isCloudISP
                    ? 'bg-emerald-950/90 border-emerald-400 shadow-2xl shadow-emerald-500/60 scale-105 animate-pulse'
                    : isSelected
                    ? 'bg-cyan-950 border-cyan-400 shadow-2xl shadow-cyan-500/30 scale-105'
                    : 'bg-slate-900/95 border-slate-700 hover:border-slate-500 shadow-lg'
                }`}
              >
                {/* ⚙️ GEAR ICON & QUICK DELETE BUTTON FOR EVERY DEVICE NODE */}
                <div className="absolute -top-3 -right-3 flex items-center gap-1 z-30">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingServerId(node.id); }}
                    className="p-1.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700 shadow-xl hover:scale-115 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                    title={`Configure ${node.name} (${node.type})`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                      className="p-1.5 rounded-full bg-slate-900 text-rose-400 border border-rose-800 shadow-xl hover:scale-115 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                      title={`Delete ${node.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {getNodeIcon(node.type, node.roles, node.name)}

                <span className={`font-extrabold text-xs truncate max-w-[130px] ${isCloudISP ? 'text-emerald-300' : 'text-slate-100'}`}>
                  {node.name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isCloudISP ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400 font-black' : 'bg-slate-800 text-cyan-300 border-slate-700'}`}>
                  {node.ip}
                </span>

                {/* Role / Type Badge */}
                {isServer && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold max-w-[120px] truncate">
                    {rolesText || 'UNCONFIGURED'}
                  </span>
                )}
                {isCloudISP && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 font-black">
                    GLOBAL WAN ISP 🌐
                  </span>
                )}
              </div>
            );
          })}
          </div>
        </div>

        {/* LIVE PACKET CONTENT INSPECTOR PANEL & LOGS */}
        <SlideOutInspector title="Technical Deep Dive & Sandbox Live Wire Logs">
          <div className="space-y-4">
            <div className="p-4 bg-slate-950/95 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>SANDBOX LIVE PACKET CONTENT INSPECTOR</span>
                </div>
                <span className="text-amber-400 text-[10px] font-bold">
                  {livePacketData ? livePacketData.currentHop : 'Idle (Waiting for Simulation)'}
                </span>
              </div>

              {livePacketData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-blue-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                      <span>Layer 2 & Layer 3 Stack:</span>
                      <span className="text-amber-400">{livePacketData.protocolName}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      <span className="text-slate-500 font-bold">EtherType:</span> <span className="text-amber-300 font-bold">{livePacketData.etherType}</span>
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      <span className="text-slate-500 font-bold">Layer 2 MACs:</span> <span className="text-cyan-300 font-bold">{livePacketData.l2}</span>
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      <span className="text-slate-500 font-bold">Layer 3 IPs:</span> <span className="text-emerald-300 font-bold">{livePacketData.l3}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1 text-[11px]">
                      <span>Layer 4 & Protocol Payload:</span>
                      <span className="text-slate-400 text-[10px]">{livePacketData.currentHop}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      <span className="text-slate-500 font-bold">Transport Layer:</span> <span className="text-purple-300 font-bold">{livePacketData.l4}</span>
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      <span className="text-slate-500 font-bold">Payload Data:</span> <span className="text-amber-300 font-bold">{livePacketData.payload}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                  <p className="font-bold">No active packet frame in flight.</p>
                  <p className="text-[10px]">Select source/target devices and click "Run Traffic Simulation" to inspect packet headers in real time.</p>
                </div>
              )}
            </div>

            <TerminalLog logs={logs} onClear={() => setLogs([])} />
          </div>
        </SlideOutInspector>

        {/* SWITCH CAM TABLE INSPECTOR MODAL POPUP */}
        {showCamModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-2xl w-full p-6 rounded-3xl border border-slate-700 space-y-4 bg-slate-900/95 font-mono text-xs text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Layers className="w-5 h-5" />
                  <span>Layer 2 Switch CAM Table & Host ARP Cache Inspector</span>
                </div>
                <button
                  onClick={() => setShowCamModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-cyan-300">Active Layer 2 CAM MAC Tables (Switches)</h4>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-1.5">Switch Name</th>
                        <th className="py-1.5">Learned MAC</th>
                        <th className="py-1.5">Mapped Device</th>
                        <th className="py-1.5">VLAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {nodes.filter(n => n.type === 'switch').length > 0 ? (
                        nodes.filter(n => n.type === 'switch').map(sw => {
                          const connectedLinks = links.filter(l => l.from === sw.id || l.to === sw.id);
                          return connectedLinks.map((link, i) => {
                            const otherId = link.from === sw.id ? link.to : link.from;
                            const otherNode = nodes.find(n => n.id === otherId);
                            return (
                              <tr key={`${sw.id}-${i}`}>
                                <td className="py-1.5 text-blue-300 font-bold">{sw.name}</td>
                                <td className="py-1.5 text-amber-300 font-mono">{otherNode?.mac || '00:11:22:33:44:55'}</td>
                                <td className="py-1.5 text-cyan-300 font-bold">{otherNode?.name || 'Device'}</td>
                                <td className="py-1.5 text-purple-300 font-bold">VLAN 10</td>
                              </tr>
                            );
                          });
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-3 text-center text-slate-500 italic">No L2 Switches present on canvas. Add an L2 Switch to inspect learned CAM MAC entries.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-extrabold text-amber-300">Active Host ARP Cache (`ip address` ➔ `mac address`)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {nodes.filter(n => n.type !== 'switch' && n.type !== 'cloud').map(node => (
                      <div key={node.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                        <span className="font-bold text-slate-200">{node.name}:</span>
                        <p className="text-cyan-300 font-mono mt-0.5">{node.ip || '192.168.1.100'} ➔ {node.mac || '00:11:22:33:44:55'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowCamModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IPV4 CIDR SUBNET CALCULATOR MODAL POPUP */}
        {showSubnetModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-700 space-y-4 bg-slate-900/95 font-mono text-xs text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Gauge className="w-5 h-5" />
                  <span>IPv4 CIDR Subnet & Range Calculator</span>
                </div>
                <button
                  onClick={() => setShowSubnetModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(() => {
                const selectedNodeObj = nodes.find(n => n.id === selectedNodeId) || nodes[0];
                const subnetInfo = calculateSubnet(selectedNodeObj?.ip || '192.168.1.100', 24);
                return (
                  <div className="space-y-3">
                    <p className="text-slate-300">
                      Calculated CIDR details for target device <span className="text-cyan-300 font-bold">{selectedNodeObj?.name || 'Device'}</span> ({selectedNodeObj?.ip || '192.168.1.100'}):
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">IP Address / CIDR:</span><span className="text-cyan-300 font-bold">{subnetInfo?.ip} /24</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Subnet Netmask:</span><span className="text-amber-300 font-bold">{subnetInfo?.netmask}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Network ID:</span><span className="text-purple-300 font-bold">{subnetInfo?.networkIp}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Broadcast ID:</span><span className="text-rose-300 font-bold">{subnetInfo?.broadcastIp}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Usable Host Range:</span><span className="text-emerald-300 font-bold">{subnetInfo?.usableHostRange}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Total Usable Hosts:</span><span className="text-blue-300 font-bold">{subnetInfo?.totalUsableHosts} hosts</span></div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowSubnetModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
                >
                  Close Calculator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CISCO IOS CLI TERMINAL EMULATOR MODAL */}
        {terminalNodeId && (
          <CiscoTerminalModal
            node={nodes.find(n => n.id === terminalNodeId) || nodes[0]}
            onClose={() => setTerminalNodeId(null)}
            onUpdateNode={(id, field, val) => {
              setNodes(nodes.map(n => n.id === id ? { ...n, [field]: val } : n));
            }}
          />
        )}
      </div>
    </div>
  );
}
