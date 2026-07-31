import React, { useState, useRef } from 'react';
import { Network, Laptop, Server, Router, ShieldCheck, Globe, Play, Trash2, Plus, Zap, Gauge, CheckCircle2, Settings, Cpu, FileCode, Terminal, X, Radio, HardDrive, Mail, Layers, Activity, AlertTriangle } from 'lucide-react';
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
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Cable Creation State
  const [isCableMode, setIsCableMode] = useState(false);
  const [selectedCableType, setSelectedCableType] = useState('straight'); // straight, crossover, fiber, serial
  const [connectingFromId, setConnectingFromId] = useState(null);

  // Traffic Simulation Controls
  const [simSource, setSimSource] = useState('lap1');
  const [simTarget, setSimTarget] = useState('srv1');
  const [simType, setSimType] = useState('dhcp');
  const [speed, setSpeed] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPacketPos, setSimPacketPos] = useState(null);
  const [statusBanner, setStatusBanner] = useState({
    title: 'Sandbox Ready',
    subtitle: 'Drag devices, configure Generic Servers via ⚙️ Gear icon, and run traffic simulations!'
  });

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: 'Interactive Network Topology Sandbox ready. Laptop and Generic Servers active.' }
  ]);

  const canvasRef = useRef(null);

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
      server: 'GENERIC-SERVER',
      switch: 'L2-SWITCH',
      router: 'GATEWAY-ROUTER',
      cloud: 'INTERNET-POP'
    };

    const defaultOs = {
      laptop: 'Windows 11 Enterprise',
      server: 'Windows Server 2022 Datacenter',
      switch: 'Cisco IOS L2 Switch',
      router: 'RouterOS Gateway',
      cloud: 'Public WAN ISP'
    };

    const defaultRoles = {
      server: ['dhcp'],
      router: ['nat']
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

  // Run Traffic Simulation with Graph Pathfinding Traversal
  const handleRunSimulation = () => {
    if (simSource === simTarget) return;

    const srcNode = nodes.find(n => n.id === simSource);
    const dstNode = nodes.find(n => n.id === simTarget);

    // Calculate actual multi-hop cable path using BFS
    const cablePath = findShortestCablePath(simSource, simTarget, nodes, links);

    if (!cablePath) {
      setStatusBanner({
        title: '❌ NO CONNECTED CABLE PATH!',
        subtitle: `Cannot transmit: ${srcNode?.name} and ${dstNode?.name} are not wired together! Use "🔌 Add Cable Wire" to connect them.`
      });
      setLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), tag: 'ROUTING_ERROR', message: `FAIL: No cable connection path between ${srcNode?.name} and ${dstNode?.name}. Packet dropped.` }
      ]);
      return;
    }

    setIsSimulating(true);

    const typeNames = {
      dhcp: 'DHCP DORA Lease Request',
      dns: 'DNS Hostname Resolution',
      kerberos: 'Kerberos Ticket Exchange (AS/TGS)',
      ping: 'ICMP Echo Ping Request',
      esxi: 'VMware ESXi Host vSphere Management'
    };

    const pathNames = cablePath.map(id => nodes.find(n => n.id === id)?.name).join(' ➔ ');

    setStatusBanner({
      title: `⚡ ROUTING ${typeNames[simType]}...`,
      subtitle: `Path Found: ${pathNames}`
    });

    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: simType.toUpperCase(), message: `Routing ${typeNames[simType]} along path: ${pathNames}` }
    ]);

    const numSegments = cablePath.length - 1;
    let progress = 0;

    const interval = setInterval(() => {
      progress += (0.04 * speed) / numSegments;
      if (progress <= 1) {
        const totalScaled = progress * numSegments;
        const segIndex = Math.min(Math.floor(totalScaled), numSegments - 1);
        const segProgress = totalScaled - segIndex;

        const nodeA = nodes.find(n => n.id === cablePath[segIndex]);
        const nodeB = nodes.find(n => n.id === cablePath[segIndex + 1]);

        if (nodeA && nodeB) {
          const curX = nodeA.x + (nodeB.x - nodeA.x) * segProgress;
          const curY = nodeA.y + (nodeB.y - nodeA.y) * segProgress;
          setSimPacketPos({ x: curX, y: curY });
        }
      } else {
        clearInterval(interval);
        setSimPacketPos(null);
        setIsSimulating(false);
        setStatusBanner({
          title: `✅ ${typeNames[simType]} DELIVERED!`,
          subtitle: `Packet traversed cable path (${pathNames}) successfully!`
        });
        setLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), tag: simType.toUpperCase(), message: `SUCCESS: Delivered to ${dstNode?.name} across ${numSegments} cable hop(s)!` }
        ]);
      }
    }, 40);
  };

  // Node Icon Helper
  const getNodeIcon = (type, roles = []) => {
    if (roles.includes('esxi')) return <Cpu className="w-10 h-10 text-emerald-400" />;
    switch(type) {
      case 'laptop': return <Laptop className="w-10 h-10 text-cyan-400" />;
      case 'server': return <Server className="w-10 h-10 text-amber-400" />;
      case 'switch': return <Layers className="w-10 h-10 text-blue-400" />;
      case 'router': return <Router className="w-10 h-10 text-purple-400" />;
      case 'cloud': return <Globe className="w-10 h-10 text-amber-400" />;
      default: return <Server className="w-10 h-10 text-slate-400" />;
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const editingServer = nodes.find(n => n.id === editingServerId);

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
    <div className="space-y-6 max-w-6xl mx-auto relative">

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

      {/* TOP BANNER & DEVICE PALETTE TOOLBAR */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">Interactive Network Sandbox</h2>
            <p className="text-xs text-slate-400">Build custom topologies, configure Generic Servers via Gear ⚙️ icon, and run traffic</p>
          </div>
        </div>

        {/* DEVICE PALETTE BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 font-mono">
          <button onClick={() => handleAddNode('laptop')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + Laptop
          </button>
          <button onClick={() => handleAddNode('server')} className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/30 cursor-pointer">
            <Plus className="w-4 h-4" /> + Generic Server ⚙️
          </button>
          <button onClick={() => handleAddNode('switch')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + L2 Switch
          </button>
          <button onClick={() => handleAddNode('router')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + Router
          </button>
          <button onClick={() => handleAddNode('cloud')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + Internet Cloud
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTROLS & CABLE SELECTION TOOLBAR */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          
          {/* Cable Wire Creation Button */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">Cable Type:</span>
            <select
              value={selectedCableType}
              onChange={(e) => setSelectedCableType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-cyan-300 font-bold focus:outline-none"
            >
              <option value="straight">Cat6 Ethernet (Straight-Through)</option>
              <option value="crossover">Cat6 Crossover Cable</option>
              <option value="fiber">Single-Mode Fiber Optic Cable</option>
              <option value="serial">Serial WAN Cable</option>
            </select>

            <button
              onClick={() => { setIsCableMode(!isCableMode); setConnectingFromId(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCableMode ? 'bg-cyan-500 text-slate-950 shadow-md animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isCableMode ? (connectingFromId ? '⚡ Click 2nd Device...' : '⚡ Click 1st Device...') : '🔌 Add Cable Wire'}
            </button>
          </div>

          {/* Traffic Operation Selector */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Traffic Protocol</label>
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-300 font-bold focus:outline-none"
            >
              <option value="dhcp">DHCP DORA Request</option>
              <option value="dns">DNS Hostname Query</option>
              <option value="kerberos">Kerberos Authentication (AS/TGS)</option>
              <option value="ping">ICMP Echo Request (Ping)</option>
              <option value="esxi">VMware ESXi vSphere Management</option>
            </select>
          </div>

          {/* Source Device */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Source</label>
            <select
              value={simSource}
              onChange={(e) => setSimSource(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none"
            >
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          {/* Target Device */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Target</label>
            <select
              value={simTarget}
              onChange={(e) => setSimTarget(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none"
            >
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Speed:</span>
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

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer transition-all"
        >
          <Play className="w-4 h-4 fill-current" /> Run Traffic Simulation
        </button>
      </div>

      {/* TOPOLOGY CANVAS STAGE */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between">
          <h3 className="font-extrabold text-cyan-300 text-base">{statusBanner.title}</h3>
          <p className="text-xs text-slate-300">{statusBanner.subtitle}</p>
        </div>

        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-2xl border border-slate-800 h-[480px] relative overflow-hidden bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-slate-950/90 select-none"
        >
          {/* CABLES SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {links.map(link => {
              const n1 = nodes.find(n => n.id === link.from);
              const n2 = nodes.find(n => n.id === link.to);
              if (!n1 || !n2) return null;

              const strokeColor = link.cableType === 'fiber' ? '#38bdf8' : link.cableType === 'crossover' ? '#f59e0b' : '#06b6d4';
              return (
                <line
                  key={link.id}
                  x1={n1.x + 60}
                  y1={n1.y + 45}
                  x2={n2.x + 60}
                  y2={n2.y + 45}
                  stroke={strokeColor}
                  strokeWidth="4"
                  strokeOpacity="0.8"
                  className="animate-wire-dash"
                />
              );
            })}
          </svg>

          {/* ANIMATED PACKET OVERLAY */}
          {simPacketPos && (
            <div
              style={{ left: `${simPacketPos.x + 60}px`, top: `${simPacketPos.y + 45}px` }}
              className="absolute w-8 h-8 rounded-full bg-cyan-400 border-2 border-white shadow-2xl shadow-cyan-400 animate-pulse pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-slate-950"
            >
              ⚡
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
                <Trash2 className="w-3.5 h-3.5" /> Remove
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
              
              {selectedNode.type === 'server' && (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setEditingServerId(selectedNode.id)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <Settings className="w-4 h-4" />
                    Configure OS & Roles ⚙️
                  </button>
                </div>
              )}
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
