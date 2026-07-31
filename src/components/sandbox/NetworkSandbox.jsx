import React, { useState, useRef } from 'react';
import { Network, Laptop, Server, Router, ShieldCheck, Globe, Play, Trash2, Plus, Zap, Gauge, CheckCircle2, Settings, Cpu, FileCode, Terminal, X, Radio, HardDrive, Mail, Layers, Activity, Printer, Wifi, Database } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function NetworkSandbox() {
  // Initial Nodes on Canvas
  const [nodes, setNodes] = useState([
    {
      id: 'lap1',
      name: 'LAPTOP-01',
      type: 'laptop',
      x: 100,
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
      x: 380,
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
      x: 680,
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
      x: 680,
      y: 320,
      ip: '192.168.1.1',
      mac: '00:00:0C:07:AC:01',
      os: 'Enterprise Gateway OS',
      roles: ['nat']
    },
  ]);

  // Cable Connections
  const [links, setLinks] = useState([
    { id: 'link1', from: 'lap1', to: 'sw1', cableType: 'straight' },
    { id: 'link2', from: 'sw1', to: 'srv1', cableType: 'straight' },
    { id: 'link3', from: 'sw1', to: 'r1', cableType: 'straight' },
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
  const [simTarget, setSimTarget] = useState('srv1');
  const [simType, setSimType] = useState('dhcp');
  const [speed, setSpeed] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPacketPos, setSimPacketPos] = useState(null); // { x, y, isReturn }
  const [livePacketData, setLivePacketData] = useState(null); // Real-time packet inspector details
  const [statusBanner, setStatusBanner] = useState({
    title: 'Network Topology Sandbox',
    subtitle: 'Wire devices, configure Generic Servers via ⚙️ Gear icon, and run live traffic simulations!'
  });

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: 'Interactive Network Topology Sandbox ready. Devices and Generic Servers active.' }
  ]);

  const canvasRef = useRef(null);

  // BFS CABLE NETWORK RECOVERY & DYNAMIC COLORING (Green = WAN/ISP Internet, Blue = LAN Network, Red = Disconnected/No LAN)
  const getLinkStatus = (link, nodeList, linkList) => {
    const n1 = nodeList.find(n => n.id === link.from);
    const n2 = nodeList.find(n => n.id === link.to);
    if (!n1 || !n2) return { color: '#ef4444', label: 'Disconnected / Damaged Cable' };

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
      if (currNode?.type === 'cloud') {
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
      cloud: 'INTERNET-POP'
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

    const interval = setInterval(() => {
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
        clearInterval(interval);
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

  // Node Icon Helper
  const getNodeIcon = (type, roles = []) => {
    if (roles.includes('esxi')) return <Cpu className="w-10 h-10 text-emerald-400" />;
    switch(type) {
      case 'laptop': return <Laptop className="w-10 h-10 text-cyan-400" />;
      case 'desktop': return <Laptop className="w-10 h-10 text-blue-400" />;
      case 'server': return <Server className="w-10 h-10 text-amber-400" />;
      case 'switch': return <Layers className="w-10 h-10 text-blue-400" />;
      case 'router': return <Router className="w-10 h-10 text-purple-400" />;
      case 'firewall': return <ShieldCheck className="w-10 h-10 text-rose-400" />;
      case 'printer': return <Printer className="w-10 h-10 text-slate-300" />;
      case 'wifi': return <Wifi className="w-10 h-10 text-teal-400" />;
      case 'storage': return <Database className="w-10 h-10 text-amber-300" />;
      case 'cloud': return <Globe className="w-10 h-10 text-cyan-300" />;
      default: return <Server className="w-10 h-10 text-slate-400" />;
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

      {/* GENERIC SERVER CONFIGURATION GEAR MODAL POPUP */}
      {editingServer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel max-w-xl w-full p-7 rounded-3xl border border-slate-700 shadow-2xl space-y-6 bg-slate-900/95 relative text-slate-100 max-h-[90vh] overflow-y-auto font-mono">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Settings className="w-7 h-7 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-100 tracking-tight">Configure {editingServer.name}</h3>
                  <p className="text-xs text-amber-400 font-bold">Generic Server Roles & OS Selection</p>
                </div>
              </div>
              <button
                onClick={() => setEditingServerId(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operating System Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">1. Select Operating System / Hypervisor:</label>
              <select
                value={editingServer.os}
                onChange={(e) => handleChangeOs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Windows Server 2022 Datacenter">🪟 Windows Server 2022 Datacenter (AD DS / DHCP / DNS)</option>
                <option value="Linux Enterprise (Ubuntu / RHEL)">🐧 Linux Enterprise Server (Ubuntu 22.04 / RHEL 9)</option>
                <option value="VMware ESXi 8.0 Bare-Metal Hypervisor">🧱 VMware ESXi 8.0 Bare-Metal Hypervisor (VM Host)</option>
                <option value="Proxmox VE Hypervisor">🧱 Proxmox VE 8.1 Open Source Virtualization</option>
              </select>
            </div>

            {/* Server Roles Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">2. Enable Server Roles & Services:</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { id: 'dhcp', label: '🔌 DHCP Server (IP Lease Pool)', color: 'text-amber-300' },
                  { id: 'ad', label: '🛡️ Active Directory (AD DS / KDC)', color: 'text-purple-300' },
                  { id: 'dns', label: '🌐 DNS Server (Domain Lookup)', color: 'text-cyan-300' },
                  { id: 'mail', label: '✉️ Mail Server (SMTP / IMAP)', color: 'text-blue-300' },
                  { id: 'smb', label: '📁 SMB File Server / NAS', color: 'text-emerald-300' },
                  { id: 'esxi', label: '🧱 Bare-Metal Hypervisor VM Host', color: 'text-rose-300' },
                ].map((roleItem) => {
                  const isEnabled = (editingServer.roles || []).includes(roleItem.id);
                  return (
                    <div
                      key={roleItem.id}
                      onClick={() => handleToggleRole(roleItem.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isEnabled
                          ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className={`font-bold text-xs ${roleItem.color}`}>{roleItem.label}</span>
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

            {/* Configured Roles Badge Preview */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Active Roles Summary:</span>
              <p className="text-xs text-amber-300 font-bold">
                {editingServer.roles.length > 0
                  ? editingServer.roles.map(r => r.toUpperCase()).join(' • ')
                  : 'No roles enabled (Unconfigured Bare Metal)'}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingServerId(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Save & Apply Server Roles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMADE UNIFIED WORKSPACE CONTROLS & CABLE/PROTOCOL TOOLBAR */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-2xl bg-slate-900/90 font-mono text-xs">
        
        {/* Left Group: Cable Type Selection */}
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

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">Speed:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  speed === s ? 'bg-cyan-500 text-slate-950 shadow' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Group: Play Action Button */}
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 hover:scale-105 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer transition-all border border-cyan-300"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run Traffic Simulation</span>
        </button>
      </div>

      {/* TOPOLOGY CANVAS STAGE */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl relative">
        
        {/* Status Banner with Dynamic Cable Color Legend */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
          <div>
            <h3 className="font-extrabold text-cyan-300 text-base">{statusBanner.title}</h3>
            <p className="text-xs text-slate-300">{statusBanner.subtitle}</p>
          </div>

          {/* DYNAMIC CABLE COLOR LEGEND */}
          <div className="flex items-center gap-3 text-[11px] font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
              <span>🟢 WAN (Internet ISP)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></span>
              <span>🔵 LAN Network</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500"></span>
              <span>🔴 Disconnected / No LAN</span>
            </span>
          </div>
        </div>

        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-2xl border border-slate-800 h-[480px] relative overflow-hidden bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-slate-950/90 select-none"
        >
          {/* FLOATING CONTROL PANEL AT TOP-RIGHT OF WORKPLACE CANVAS: 1. ADD DEVICE, 2. DISCONNECT, 3. ADD CABLE */}
          <div className="absolute top-4 right-4 z-30 font-mono flex flex-col items-end gap-2">
            
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-cyan-300" />
                    <span>+ Internet Cloud</span>
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
            const rolesText = (node.roles || []).join(', ').toUpperCase();

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`absolute p-4 rounded-3xl border-4 transition-all cursor-grab active:cursor-grabbing z-20 flex flex-col items-center gap-1.5 font-mono text-xs ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 shadow-2xl shadow-cyan-500/30 scale-105'
                    : 'bg-slate-900/95 border-slate-700 hover:border-slate-500 shadow-lg'
                }`}
              >
                {/* GEAR ICON FOR GENERIC SERVERS */}
                {isServer && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingServerId(node.id); }}
                    className="absolute -top-2 -right-2 p-2 rounded-full bg-amber-500 text-slate-950 shadow-lg hover:scale-110 transition-transform cursor-pointer border border-white z-30"
                    title="Configure OS & Server Roles (DHCP, AD, DNS, ESXi)"
                  >
                    <Settings className="w-4 h-4 animate-spin-slow" />
                  </button>
                )}

                {getNodeIcon(node.type, node.roles)}

                <span className="font-extrabold text-slate-100 text-xs truncate max-w-[130px]">{node.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">{node.ip}</span>

                {/* Role / Type Badge */}
                {isServer && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold max-w-[120px] truncate">
                    {rolesText || 'UNCONFIGURED'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* LIVE PACKET CONTENT INSPECTOR PANEL */}
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
      </div>

      {/* SELECTED DEVICE INSPECTOR & LOGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        
        {/* LEFT COLUMN: SELECTED DEVICE DETAILS */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-extrabold text-sm">Selected Device Inspector</span>
            {selectedNode && (
              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Device
              </button>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-2 text-slate-200">
              <p><span className="text-slate-500 font-bold">Device Name:</span> <span className="text-cyan-300 font-bold">{selectedNode.name}</span></p>
              <p><span className="text-slate-500 font-bold">Device Type:</span> <span className="text-amber-300 font-bold">{selectedNode.type.toUpperCase()}</span></p>
              <p><span className="text-slate-500 font-bold">IPv4 Address:</span> <span className="text-emerald-300 font-bold">{selectedNode.ip}</span></p>
              <p><span className="text-slate-500 font-bold">MAC Address:</span> <span className="text-slate-400 font-bold">{selectedNode.mac}</span></p>
              <p><span className="text-slate-500 font-bold">Operating System:</span> <span className="text-purple-300 font-bold">{selectedNode.os}</span></p>
              
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleInitiateDisconnect(selectedNode.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>✂️ Disconnect Cable Wires</span>
                </button>

                {selectedNode.type === 'server' && (
                  <button
                    onClick={() => setEditingServerId(selectedNode.id)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <Settings className="w-4 h-4" />
                    Configure OS & Roles ⚙️
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">Click any device on the canvas to inspect settings.</p>
          )}
        </div>

        {/* RIGHT 2 COLUMNS: TERMINAL LOGS */}
        <div className="md:col-span-2">
          <TerminalLog logs={logs} onClear={() => setLogs([])} />
        </div>
      </div>
    </div>
  );
}
