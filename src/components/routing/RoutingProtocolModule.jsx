import React, { useState, useEffect } from 'react';
import { 
  Route, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Clock, 
  Sliders, 
  Server, 
  ArrowRight, 
  Radio, 
  Info, 
  Terminal, 
  Layers,
  Globe,
  Cpu,
  ShieldCheck,
  Building2,
  HardDrive,
  Network
} from 'lucide-react';

export default function RoutingProtocolModule({ appMode = 'clean' }) {
  const [activeProtocol, setActiveProtocol] = useState('ospf'); // 'ospf', 'rip', 'bgp', 'eigrp', 'isis'
  const [activeTopology, setActiveTopology] = useState('enterprise_mesh'); // 'enterprise_mesh', 'spine_leaf', 'dual_ring', 'hierarchical_tree'
  const [isPlaying, setIsPlaying] = useState(true);
  const [packetPos, setPacketPos] = useState(0); // 0 to 100% animation progress
  const [severedLink, setSeveredLink] = useState(null); // e.g. 'r3-r4'

  // Famous Routing Protocols Dictionary
  const protocolDetails = {
    ospf: {
      name: 'OSPF',
      fullName: 'Open Shortest Path First',
      type: 'Link-State (Dijkstra SPF)',
      metricName: 'Bandwidth Cost',
      formula: 'Cost = 10^8 / Link Bandwidth',
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/80 border-cyan-500 text-cyan-300',
      badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-cyan-900/50',
      chosenPathName: 'Path B (100G High-Speed Fiber Backbone)',
      reason: 'OSPF chooses Path B (4 Hops over 100G Fiber, Total Cost = 4) because OSPF calculates link cost from bandwidth instead of hop count. It avoids the slow 64 Kbps T1 copper link (Cost = 3,124).'
    },
    rip: {
      name: 'RIP / RIPv2',
      fullName: 'Routing Information Protocol',
      type: 'Distance-Vector (Hop Count)',
      metricName: 'Hop Count Only',
      formula: 'Metric = Total Hop Count (Max 15)',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/80 border-amber-500 text-amber-300',
      badgeBg: 'bg-amber-950 text-amber-300 border-amber-700 shadow-amber-900/50',
      chosenPathName: 'Path A (Legacy 64K T1 Line)',
      reason: 'RIP chooses Path A (2 Hops) because RIP has tunnel vision for hop count! It strictly picks the route with fewer hops (2 vs 4), completely unaware that the 64 Kbps link is 1,500x slower.'
    },
    bgp: {
      name: 'BGP',
      fullName: 'Border Gateway Protocol',
      type: 'Path-Vector (Exterior Gateway)',
      metricName: 'AS-PATH Length & Local Pref',
      formula: 'Metric = Fewest Autonomous Systems Traversed',
      color: 'from-rose-500 to-red-600',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-950/80 border-rose-500 text-rose-300',
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-700 shadow-rose-900/50',
      chosenPathName: 'Path C (Direct Intra-AS Transit)',
      reason: 'BGP selects Path C because it remains within Autonomous System AS100. BGP avoids Path B because Path B crosses external transit Autonomous System AS200 (longer AS-PATH).'
    },
    eigrp: {
      name: 'EIGRP',
      fullName: 'Enhanced Interior Gateway Routing Protocol',
      type: 'Cisco Advanced Distance-Vector (DUAL)',
      metricName: 'Composite Metric (Bandwidth + Delay)',
      formula: 'Metric = 256 * [(10^7 / Min BW) + Sum Delay]',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/80 border-emerald-500 text-emerald-300',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-emerald-900/50',
      chosenPathName: 'Path B (Low Latency 100G Fiber)',
      reason: 'EIGRP calculates a composite metric combining 100G bandwidth and ultra-low fiber propagation delay (DUAL algorithm). It instantly computes a Feasible Successor backup route.'
    },
    isis: {
      name: 'IS-IS',
      fullName: 'Intermediate System to Intermediate System',
      type: 'Link-State (ISO CLNS / Service Provider)',
      metricName: 'Default Interface Metric',
      formula: 'Metric = Sum of TLV Interface Costs',
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-950/80 border-purple-500 text-purple-300',
      badgeBg: 'bg-purple-950 text-purple-300 border-purple-700 shadow-purple-900/50',
      chosenPathName: 'Path B (Core Telecom Fiber Mesh)',
      reason: 'IS-IS is the backbone routing protocol used by major Telecom ISPs. It builds a Link-State database using TLV packets to route IP traffic over high-capacity core fiber backbones.'
    }
  };

  // Topologies Catalog for Routing Visualizer
  const topologyOptions = [
    { id: 'enterprise_mesh', name: '🕸️ Enterprise Multi-Path Mesh', desc: 'Star HQ + Mesh Core + Tree Branch WAN' },
    { id: 'spine_leaf', name: '🏛️ Datacenter Spine-Leaf Clos', desc: 'Equal-Cost Multi-Path (ECMP) Fabric' },
    { id: 'dual_ring', name: '🔄 Telecom Dual-Ring Loop', desc: 'Counter-Rotating Self-Healing Core Ring' },
    { id: 'hierarchical_tree', name: '🌲 Hierarchical WAN Tree', desc: '3-Tier Core -> Distribution -> Access Tree' }
  ];

  // Mixed Network Topology Routers & Nodes dictionary by active topology
  const getTopologyLayout = () => {
    switch (activeTopology) {
      case 'spine_leaf': {
        const nodes = [
          { id: 'hq_srv', label: 'DC Server A', x: 100, y: 140, icon: Server },
          { id: 'hq_sw', label: 'Leaf SW 1', x: 250, y: 220, icon: Server },
          { id: 'r1', label: 'Spine SW 1', x: 500, y: 120, icon: Cpu },
          { id: 'r7', label: 'Spine SW 2', x: 500, y: 320, icon: Cpu },
          { id: 'r2', label: 'Leaf SW 2', x: 750, y: 220, icon: Server },
          { id: 'r5', label: 'Leaf SW 3', x: 950, y: 220, icon: Server },
          { id: 'br_pc1', label: 'DC Server B', x: 1100, y: 220, icon: HardDrive }
        ];
        return {
          nodes,
          pathA: ['hq_srv', 'hq_sw', 'r1', 'r2', 'r5', 'br_pc1'],
          pathB: ['hq_srv', 'hq_sw', 'r1', 'r2', 'r5', 'br_pc1'],
          pathC: ['hq_srv', 'hq_sw', 'r7', 'r2', 'r5', 'br_pc1']
        };
      }
      case 'dual_ring': {
        const nodes = [
          { id: 'hq_srv', label: 'HQ Gateway R1', x: 120, y: 240, icon: Server },
          { id: 'hq_sw', label: 'Ring Node R2', x: 380, y: 120, icon: Server },
          { id: 'r1', label: 'Ring Node R3', x: 680, y: 120, icon: Cpu },
          { id: 'r7', label: 'Ring Node R4', x: 680, y: 400, icon: Cpu },
          { id: 'r2', label: 'Ring Node R5', x: 380, y: 400, icon: Server },
          { id: 'r5', label: 'Branch Gateway R6', x: 950, y: 240, icon: Server },
          { id: 'br_pc1', label: 'Branch PC', x: 1120, y: 240, icon: HardDrive }
        ];
        return {
          nodes,
          pathA: ['hq_srv', 'r2', 'r7', 'r5', 'br_pc1'],
          pathB: ['hq_srv', 'hq_sw', 'r1', 'r5', 'br_pc1'],
          pathC: ['hq_srv', 'hq_sw', 'r1', 'r5', 'br_pc1']
        };
      }
      case 'hierarchical_tree': {
        const nodes = [
          { id: 'hq_srv', label: 'HQ Core R1', x: 100, y: 240, icon: Server },
          { id: 'hq_sw', label: 'HQ Dist SW', x: 300, y: 240, icon: Server },
          { id: 'r1', label: 'Core Router A', x: 520, y: 140, icon: Cpu },
          { id: 'r7', label: 'Core Router B', x: 520, y: 340, icon: Cpu },
          { id: 'r2', label: 'Branch Dist SW', x: 760, y: 240, icon: Server },
          { id: 'r5', label: 'Branch Access SW', x: 960, y: 240, icon: Server },
          { id: 'br_pc1', label: 'Branch PC', x: 1120, y: 240, icon: HardDrive }
        ];
        return {
          nodes,
          pathA: ['hq_srv', 'hq_sw', 'r7', 'r2', 'r5', 'br_pc1'],
          pathB: ['hq_srv', 'hq_sw', 'r1', 'r2', 'r5', 'br_pc1'],
          pathC: ['hq_srv', 'hq_sw', 'r7', 'r2', 'r5', 'br_pc1']
        };
      }
      default: {
        // Enterprise Multi-Path Mesh (Default)
        const nodes = [
          { id: 'hq_srv', label: 'HQ DB Server', x: 60, y: 120, icon: HardDrive },
          { id: 'hq_sw', label: 'HQ Core Switch', x: 60, y: 260, icon: Server },
          { id: 'r1', label: 'R1 — HQ Gateway', x: 200, y: 260, icon: Cpu },
          { id: 'r2', label: 'R2 — T1 Copper', x: 440, y: 100, bandwidth: '64 Kbps (Slow T1)', icon: Server },
          { id: 'r3', label: 'R3 — Core Fiber 1', x: 360, y: 440, bandwidth: '100 Gbps Fiber', icon: Cpu },
          { id: 'r4', label: 'R4 — Core Fiber 2', x: 560, y: 440, bandwidth: '100 Gbps Fiber', icon: Cpu },
          { id: 'r6', label: 'R6 — Metro Fiber 3', x: 740, y: 440, bandwidth: '100 Gbps Fiber', icon: Cpu },
          { id: 'r7', label: 'R7 — Direct Ethernet', x: 500, y: 260, bandwidth: '1 Gbps Ethernet', icon: Server },
          { id: 'r5', label: 'R5 — Branch Gateway', x: 920, y: 260, icon: Cpu },
          { id: 'br_sw', label: 'Branch Tree Switch', x: 1060, y: 260, icon: Server },
          { id: 'br_pc1', label: 'Branch PC 1', x: 1160, y: 140, icon: Server },
          { id: 'br_pc2', label: 'Branch PC 2', x: 1160, y: 380, icon: Server }
        ];
        return {
          nodes,
          pathA: ['hq_srv', 'hq_sw', 'r1', 'r2', 'r5', 'br_sw', 'br_pc1'],
          pathB: ['hq_srv', 'hq_sw', 'r1', 'r3', 'r4', 'r6', 'r5', 'br_sw', 'br_pc1'],
          pathC: ['hq_srv', 'hq_sw', 'r1', 'r7', 'r5', 'br_sw', 'br_pc1']
        };
      }
    }
  };

  const layout = getTopologyLayout();

  // Determine Active Path based on Selected Protocol
  let currentActivePath = layout.pathB; // Default OSPF, EIGRP, IS-IS
  if (activeProtocol === 'rip') {
    currentActivePath = layout.pathA; // RIP picks 2-hop T1 link
  } else if (activeProtocol === 'bgp') {
    currentActivePath = layout.pathC; // BGP picks Intra-AS Path C
  }

  // Handle link severing override
  if (severedLink === 'r3-r4' && (activeProtocol === 'ospf' || activeProtocol === 'eigrp' || activeProtocol === 'isis')) {
    currentActivePath = layout.pathC;
  } else if (severedLink === 'r1-r2' && activeProtocol === 'rip') {
    currentActivePath = layout.pathB;
  }

  // SLOWER ANIMATION LOOP (0.8% step rate for smooth easy-to-follow packet flow)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPacketPos((prev) => (prev >= 100 ? 0 : prev + 0.8));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Interpolate packet position along active path
  const getPacketCoordinates = () => {
    if (!currentActivePath || currentActivePath.length < 2) return { x: 60, y: 120 };
    
    const segmentCount = currentActivePath.length - 1;
    const progressPerSegment = 100 / segmentCount;
    const segmentIndex = Math.min(Math.floor(packetPos / progressPerSegment), segmentCount - 1);
    const segmentProgress = (packetPos - segmentIndex * progressPerSegment) / progressPerSegment;

    const fromNode = layout.nodes.find((r) => r.id === currentActivePath[segmentIndex]);
    const toNode = layout.nodes.find((r) => r.id === currentActivePath[segmentIndex + 1]);

    if (!fromNode || !toNode) return { x: 60, y: 120 };

    const currX = fromNode.x + (toNode.x - fromNode.x) * segmentProgress;
    const currY = fromNode.y + (toNode.y - fromNode.y) * segmentProgress;

    return { x: currX, y: currY };
  };

  const packetCoords = getPacketCoordinates();
  const currentProto = protocolDetails[activeProtocol] || protocolDetails.ospf;

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative font-sans text-slate-100">
      
      {/* TOP HEADER & CONTROL PANEL */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
              <Route className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-950 text-cyan-300 border border-cyan-800">
                  DYNAMIC ROUTING STAGE
                </span>
                <h2 className="text-2xl font-black text-slate-100 tracking-tight">Famous Routing Protocols & Topology Benchmarking</h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Simulating OSPF, RIP, BGP, EIGRP & IS-IS route calculation across multiple multi-path network topologies.
              </p>
            </div>
          </div>

          {/* PLAY / PAUSE CONTROLS */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Animation' : 'Play Flow'}</span>
            </button>

            <button
              onClick={() => {
                setPacketPos(0);
                setSeveredLink(null);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 1. FAMOUS ROUTING PROTOCOL SELECTORS */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" /> Select Routing Protocol:
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {Object.keys(protocolDetails).map((protoKey) => {
              const p = protocolDetails[protoKey];
              const isSelected = activeProtocol === protoKey;

              return (
                <button
                  key={protoKey}
                  onClick={() => {
                    setActiveProtocol(protoKey);
                    setPacketPos(0);
                  }}
                  className={`px-4 py-2 rounded-2xl border font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                    isSelected
                      ? `bg-gradient-to-r ${p.color} text-slate-950 scale-105 ring-2 ring-white/30`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-slate-950 text-white font-bold' : 'bg-slate-900 text-slate-500'}`}>
                    {p.type.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. MORE NETWORK TOPOLOGY SELECTORS IN ROUTING MODULE (AS REQUESTED) */}
        <div className="space-y-2 border-t border-slate-800/80 pt-3">
          <div className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5">
            <Network className="w-4 h-4 text-purple-400" /> Select Multi-Path Network Topology Architecture:
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {topologyOptions.map((topo) => {
              const isSelected = activeTopology === topo.id;
              return (
                <button
                  key={topo.id}
                  onClick={() => {
                    setActiveTopology(topo.id);
                    setPacketPos(0);
                  }}
                  className={`px-3.5 py-2 rounded-2xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-950 border-purple-500 text-purple-200 font-black shadow-lg shadow-purple-900/40 scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{topo.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ENLARGED CANVAS WINDOW (ONLY TOPOLOGY VISUALIZATION, NO ROUTING DECISION WINDOW ON CANVAS AS REQUESTED) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950 relative overflow-hidden font-mono text-xs min-h-[640px]">
        
        <div className="relative w-full h-[580px] bg-slate-950 rounded-2xl border border-slate-900/90 overflow-hidden">
          
          <svg className="w-full h-full absolute inset-0 z-0">
            {/* SVG Link lines between active path nodes */}
            {layout.nodes.map((node, idx) => {
              const nextNodes = layout.nodes.slice(idx + 1);
              return nextNodes.map((targetNode) => {
                const isPathActive = currentActivePath.includes(node.id) && currentActivePath.includes(targetNode.id);
                const isSevered = (node.id === 'r3' && targetNode.id === 'r4') || (node.id === 'r4' && targetNode.id === 'r3');

                if (!isPathActive && !isSevered) return null;

                return (
                  <line
                    key={`${node.id}-${targetNode.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={severedLink === 'r3-r4' && isSevered ? '#f43f5e' : (isPathActive ? '#06b6d4' : '#334155')}
                    strokeWidth={isPathActive ? '4' : '2'}
                    strokeDasharray={severedLink === 'r3-r4' && isSevered ? '6,6' : 'none'}
                  />
                );
              });
            })}
          </svg>

          {/* SLOWER ANIMATED PACKET PULSE (0.8% SMOOTH STEPPING) */}
          {isPlaying && (
            <div
              style={{
                left: `${packetCoords.x}px`,
                top: `${packetCoords.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute w-7 h-7 rounded-full border-2 border-white bg-cyan-400 text-slate-950 shadow-2xl z-30 flex items-center justify-center transition-all duration-100 shadow-cyan-400/80 animate-pulse"
            >
              <span className="text-[10px] font-black">📦</span>
            </div>
          )}

          {/* ALL CANVAS TOPOLOGY NODES */}
          {layout.nodes.map((node) => {
            const isNodeActive = currentActivePath.includes(node.id);
            const IconComp = node.icon || Server;

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px`, transform: 'translate(-50%, -50%)' }}
                className={`absolute z-20 p-3 rounded-2xl border-2 transition-all cursor-pointer shadow-xl flex flex-col items-center justify-center space-y-0.5 ${
                  isNodeActive
                    ? 'bg-slate-900 border-cyan-500 shadow-cyan-500/40 ring-2 ring-cyan-500/20 scale-105'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <IconComp className={`w-4 h-4 ${isNodeActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                  <span className="font-extrabold text-xs text-slate-100 whitespace-nowrap">{node.label}</span>
                </div>

                {node.bandwidth && (
                  <span className={`text-[9px] font-mono font-bold ${node.bandwidth.includes('64 Kbps') ? 'text-amber-400' : 'text-cyan-300'}`}>
                    {node.bandwidth}
                  </span>
                )}
              </div>
            );
          })}

          {/* CUT FIBER LINK SIMULATION BUTTON ON CANVAS */}
          <div className="absolute bottom-4 right-4 z-40">
            <button
              onClick={() => setSeveredLink(severedLink === 'r3-r4' ? null : 'r3-r4')}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all cursor-pointer shadow-xl flex items-center gap-1.5 ${
                severedLink === 'r3-r4'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-rose-600/30 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-rose-300 border-rose-900/60'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{severedLink === 'r3-r4' ? 'Restore R3-R4 Link' : 'Sever R3-R4 Core Fiber Link'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 🧠 DEDICATED ROUTING DECISION ENGINE WINDOW UNDER THE CANVAS (AS REQUESTED) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800">
              <BrainIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-cyan-400 uppercase">
                ROUTING PROTOCOL DECISION ENGINE
              </span>
              <h3 className="text-xl font-black text-slate-100">
                {currentProto.name} ({currentProto.fullName})
              </h3>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border ${currentProto.badgeBg}`}>
            {currentProto.type}
          </span>
        </div>

        {/* DECISION RATIONALE & METRIC FORMULA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" /> Routing Decision Rationale:
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
              {currentProto.reason}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" /> Metric & Formula Specs:
            </h4>
            <div className="space-y-1 text-slate-300">
              <p>Metric Type: <strong className="text-white">{currentProto.metricName}</strong></p>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-bold text-[11px] mt-1">
                <code>{currentProto.formula}</code>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// Icon Helper
function BrainIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
