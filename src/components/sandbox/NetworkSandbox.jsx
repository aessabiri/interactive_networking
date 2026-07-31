import React, { useState, useRef } from 'react';
import { Network, Laptop, Server, Router, Shield, Globe, Play, Trash2, Plus, Zap, Gauge, CheckCircle2 } from 'lucide-react';
import TerminalLog from '../common/TerminalLog';

export default function NetworkSandbox() {
  // Preset Nodes on Canvas
  const [nodes, setNodes] = useState([
    { id: 'pc1', name: 'WORKSTATION-01', type: 'pc', x: 100, y: 150, ip: '192.168.1.105', mac: '00:50:56:A1:B2:C1' },
    { id: 'sw1', name: 'L2-SWITCH-01', type: 'switch', x: 380, y: 200, ip: 'N/A (L2)', mac: '00:11:22:33:44:00' },
    { id: 'dc1', name: 'DC01-SERVER', type: 'dc', x: 660, y: 100, ip: '192.168.1.10', mac: '00:0C:29:8E:7F:11' },
    { id: 'r1', name: 'ROUTER-GATEWAY', type: 'router', x: 660, y: 300, ip: '192.168.1.1', mac: '00:00:0C:07:AC:01' },
  ]);

  // Network Links
  const [links, setLinks] = useState([
    { id: 'link1', from: 'pc1', to: 'sw1' },
    { id: 'link2', from: 'sw1', to: 'dc1' },
    { id: 'link3', from: 'sw1', to: 'r1' },
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFromId, setConnectingFromId] = useState(null);

  // Simulation Controls & Speed
  const [simSource, setSimSource] = useState('pc1');
  const [simTarget, setSimTarget] = useState('dc1');
  const [simType, setSimType] = useState('dhcp');
  const [speed, setSpeed] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simPacketPos, setSimPacketPos] = useState(null);
  const [statusBanner, setStatusBanner] = useState({ title: 'Sandbox Ready', subtitle: 'Select devices and click "Run Traffic Simulation" to watch packets cross your network!' });

  const [logs, setLogs] = useState([
    { time: '19:55:00', tag: 'SANDBOX', message: 'Interactive Network Topology Sandbox ready.' }
  ]);

  const canvasRef = useRef(null);

  const handleAddNode = (type) => {
    const id = `node_${Date.now()}`;
    const labels = { pc: 'WORKSTATION', switch: 'SWITCH', router: 'ROUTER', dc: 'DOMAIN-CONTROLLER' };
    const newNode = {
      id,
      name: `${labels[type] || 'NODE'}-${nodes.length + 1}`,
      type,
      x: 180 + (nodes.length * 40) % 300,
      y: 150 + (nodes.length * 30) % 200,
      ip: `192.168.1.${120 + nodes.length}`,
      mac: `00:50:56:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`
    };
    setNodes([...nodes, newNode]);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Added ${newNode.name} to topology.` }]);
  };

  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    if (connectingFromId) {
      if (connectingFromId !== nodeId) {
        setLinks([...links, { id: `link_${Date.now()}`, from: connectingFromId, to: nodeId }]);
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), tag: 'SANDBOX', message: `Connected cable between ${connectingFromId} and ${nodeId}.` }]);
      }
      setConnectingFromId(null);
      return;
    }

    const n = nodes.find(item => item.id === nodeId);
    setSelectedNode(n);
    setDraggingNodeId(nodeId);
    setDragOffset({ x: e.clientX - n.x, y: e.clientY - n.y });
  };

  const handleMouseMove = (e) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(20, Math.min(rect.width - 120, e.clientX - dragOffset.x));
      const newY = Math.max(20, Math.min(rect.height - 100, e.clientY - dragOffset.y));
      setNodes(nodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
    }
  };

  const handleMouseUp = () => setDraggingNodeId(null);

  const handleRunSimulation = () => {
    if (simSource === simTarget) return;
    setIsSimulating(true);
    const srcNode = nodes.find(n => n.id === simSource);
    const dstNode = nodes.find(n => n.id === simTarget);

    const typeNames = { dhcp: 'DHCP DISCOVER', dns: 'DNS QUERY', kerberos: 'KERBEROS AUTH', ping: 'ICMP PING' };
    setStatusBanner({
      title: `⚡ TRANSMITTING ${typeNames[simType]}...`,
      subtitle: `${srcNode?.name} (${srcNode?.ip}) → ${dstNode?.name} (${dstNode?.ip})`
    });

    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), tag: simType.toUpperCase(), message: `Transmitting ${typeNames[simType]} from ${srcNode?.name} to ${dstNode?.name}` }
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05 * speed;
      if (progress <= 1) {
        const curX = srcNode.x + (dstNode.x - srcNode.x) * progress;
        const curY = srcNode.y + (dstNode.y - srcNode.y) * progress;
        setSimPacketPos({ x: curX, y: curY });
      } else {
        clearInterval(interval);
        setSimPacketPos(null);
        setIsSimulating(false);
        setStatusBanner({
          title: `✅ ${typeNames[simType]} COMPLETED!`,
          subtitle: `Response delivered back to ${srcNode?.name}`
        });
        setLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), tag: simType.toUpperCase(), message: `SUCCESS: Delivered to ${dstNode?.name}!` }
        ]);
      }
    }, 50);
  };

  const getNodeIcon = (type) => {
    switch(type) {
      case 'pc': return <Laptop className="w-10 h-10 text-cyan-400" />;
      case 'switch': return <Network className="w-10 h-10 text-blue-400" />;
      case 'router': return <Router className="w-10 h-10 text-purple-400" />;
      case 'dc': return <Shield className="w-10 h-10 text-amber-400" />;
      default: return <Server className="w-10 h-10 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Node Creation Toolbar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">Drag & Drop Network Sandbox</h2>
            <p className="text-xs text-slate-400">Design custom network topologies and simulate live traffic</p>
          </div>
        </div>

        {/* Node Creation Palette */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          <button onClick={() => handleAddNode('pc')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + Workstation PC
          </button>
          <button onClick={() => handleAddNode('switch')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + L2 Switch
          </button>
          <button onClick={() => handleAddNode('router')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + Router
          </button>
          <button onClick={() => handleAddNode('dc')} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4" /> + DC Server
          </button>
        </div>
      </div>

      {/* Simulation Controls & Speed Selector */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Traffic Operation</label>
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-cyan-300 font-bold"
            >
              <option value="dhcp">DHCP DORA Request</option>
              <option value="dns">DNS Domain Lookup</option>
              <option value="kerberos">Kerberos Authentication</option>
              <option value="ping">ICMP Echo Request (Ping)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Source Device</label>
            <select
              value={simSource}
              onChange={(e) => setSimSource(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
            >
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Destination Device</label>
            <select
              value={simTarget}
              onChange={(e) => setSimTarget(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
            >
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800">
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
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer transition-all"
        >
          <Play className="w-4 h-4 fill-current" /> Run Traffic Simulation
        </button>
      </div>

      {/* BIG CANVAS STAGE */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between">
          <h3 className="font-extrabold text-cyan-300 text-base">{statusBanner.title}</h3>
          <p className="text-xs text-slate-300">{statusBanner.subtitle}</p>
        </div>

        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-2xl border border-slate-800 h-[440px] relative overflow-hidden bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-slate-950/90 select-none"
        >
          {/* Cables SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {links.map(link => {
              const n1 = nodes.find(n => n.id === link.from);
              const n2 = nodes.find(n => n.id === link.to);
              if (!n1 || !n2) return null;
              return (
                <line
                  key={link.id}
                  x1={n1.x + 50}
                  y1={n1.y + 40}
                  x2={n2.x + 50}
                  y2={n2.y + 40}
                  stroke="#06b6d4"
                  strokeWidth="4"
                  strokeOpacity="0.7"
                  className="animate-wire-dash"
                />
              );
            })}
          </svg>

          {/* Animated Packet Indicator */}
          {simPacketPos && (
            <div
              style={{ left: `${simPacketPos.x + 50}px`, top: `${simPacketPos.y + 40}px` }}
              className="absolute w-8 h-8 rounded-full bg-cyan-400 border-2 border-white shadow-2xl shadow-cyan-400 animate-pulse pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold text-slate-950"
            >
              ⚡
            </div>
          )}

          {/* Large Network Device Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
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
                {getNodeIcon(node.type)}
                <span className="font-extrabold text-slate-100 text-xs truncate max-w-[130px]">{node.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">{node.ip}</span>
              </div>
            );
          })}
        </div>
      </div>

      <TerminalLog logs={logs} onClear={() => setLogs([])} />
    </div>
  );
}
