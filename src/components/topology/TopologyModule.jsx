import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Share2, 
  Layers, 
  Cpu, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Terminal, 
  FileCode, 
  CheckSquare, 
  Square, 
  Layers3,
  Server,
  Radio,
  Building2,
  HardDrive,
  Globe
} from 'lucide-react';
import TerminalLog from '../common/TerminalLog';
import PacketInspector from '../common/PacketInspector';
import { CleanWidget, CleanControlButton, SlideOutInspector } from '../common/EasyCard';
import { useLanguage } from '../../i18n/LanguageContext';

export default function TopologyModule({ appMode = 'clean' }) {
  const { lang, t } = useLanguage();
  // Start with clean empty canvas (null selected topology as requested)
  const [selectedTopology, setSelectedTopology] = useState(null); 
  const [hybridSelections, setHybridSelections] = useState(['star', 'tree']);
  const [isHybridMode, setIsHybridMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);
  const [failedNodes, setFailedNodes] = useState([]);
  const [failedLinks, setFailedLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), tag: 'TOPOLOGY', message: lang === 'de' ? 'Topologie-Visualisierer initialisiert. Wählen Sie eine Netzwerktopologie, um die Leinwand zu rendern.' : 'Topology Visualizer initialized. Select a network topology to render canvas.' }
  ]);

  // Comprehensive Topologies Metadata Dictionary (11 Topologies)
  const topologyInfo = {
    star: {
      name: 'Star Topology',
      category: 'Centralized',
      icon: '⭐',
      description: 'All nodes connect directly to a central hub/switch. Most common LAN layout in modern enterprise networks.',
      spof: 'Central Switch / Hub',
      cablingCost: 'Medium',
      scalability: 'High (Easy to add/remove nodes)',
      faultTolerance: 'High for client failures; Low for central switch failure',
      pros: ['Easy to install and wire', 'Failure of one cable does not affect others', 'Centralized management'],
      cons: ['Central switch is a Single Point of Failure', 'Requires more cable than Bus topology']
    },
    tree: {
      name: 'Tree (Hierarchical) Topology',
      category: 'Hierarchical',
      icon: '🌲',
      description: 'Combines multiple Star topologies connected to a Core/Distribution root switch. Used in multi-story enterprise buildings.',
      spof: 'Core Root Switch',
      cablingCost: 'High',
      scalability: 'Very High (Hierarchical tree expansion)',
      faultTolerance: 'High within sub-branches; Core failure isolates entire branches',
      pros: ['Hierarchical data flow (Core -> Distribution -> Access)', 'Easy troubleshooting per branch', 'Scalable'],
      cons: ['Root switch bottleneck', 'Complex cabling infrastructure']
    },
    mesh_full: {
      name: 'Full Mesh Topology',
      category: 'Redundant',
      icon: '🕸️',
      description: 'Every node is directly connected to every other node (Links = N(N-1)/2). Used in high-availability WANs & Core Datacenters.',
      spof: 'None (Total Redundancy)',
      cablingCost: 'Very High [N(N-1)/2 Links]',
      scalability: 'Low (Cable count grows quadratically)',
      faultTolerance: 'Maximum (Reroutes around multiple link failures)',
      pros: ['No single point of failure', 'Simultaneous data transmission', 'Maximum security & uptime'],
      cons: ['Extremely expensive cabling & ports', 'Complex setup and maintenance']
    },
    mesh_partial: {
      name: 'Partial Mesh Topology',
      category: 'Hybrid Redundant',
      icon: '🌐',
      description: 'Critical nodes are redundantly connected, while secondary nodes have fewer links. Industry standard for cost-effective enterprise WANs.',
      spof: 'Minimal (Only non-redundant leaf nodes)',
      cablingCost: 'Moderate - High',
      scalability: 'High',
      faultTolerance: 'High for core components',
      pros: ['Balanced cost vs redundancy', 'Optimal path routing', 'High availability'],
      cons: ['More complex routing protocols (OSPF/BGP)', 'Higher hardware port cost than Star']
    },
    ring: {
      name: 'Ring Topology',
      category: 'Sequential / Token',
      icon: '⭕',
      description: 'Nodes are connected in a closed circular loop. Data travels in one direction (or dual ring for redundancy).',
      spof: 'Any single node/cable break (unless Dual Ring)',
      cablingCost: 'Low',
      scalability: 'Medium (Interrupted during additions)',
      faultTolerance: 'Low (Single Ring)',
      pros: ['No packet collisions (Token passing)', 'Equal access for all nodes'],
      cons: ['Single broken cable breaks entire ring', 'Adding nodes interrupts network']
    },
    dual_ring: {
      name: 'Dual-Ring Counter-Rotating Topology',
      category: 'Redundant Loop',
      icon: '🔄',
      description: 'Features two concentric rings transmitting data in opposite directions (FDDI / SONET / SDH standards).',
      spof: 'Simultaneous failure of both primary and secondary rings',
      cablingCost: 'High (Double Cabling)',
      scalability: 'High',
      faultTolerance: 'Very High (Automatic loopback reconfiguration upon link cut)',
      pros: ['Counter-rotating backup ring', 'Self-healing topology', 'High bandwidth throughput'],
      cons: ['High hardware transceiver cost', 'Requires dual-port NICs']
    },
    bus: {
      name: 'Bus Topology',
      category: 'Legacy Shared Media',
      icon: '🚌',
      description: 'All nodes attach to a single central coaxial cable (backbone) with terminators at both ends. Legacy 10BASE2 Standard.',
      spof: 'Central Coaxial Cable & Terminators',
      cablingCost: 'Very Low',
      scalability: 'Low (Causes heavy CSMA/CD collisions)',
      faultTolerance: 'Very Low (Break in main cable downs entire network)',
      pros: ['Minimal cabling required', 'Simple for legacy setups'],
      cons: ['High collision rate (CSMA/CD required)', 'Single main cable break brings down entire network']
    },
    point_to_point: {
      name: 'Point-to-Point (P2P) Topology',
      category: 'Direct Connection',
      icon: '🎯',
      description: 'Dedicated physical or logical direct connection between exactly two network endpoints or WAN routers.',
      spof: 'The single point-to-point link cable',
      cablingCost: 'Low (Single Cable)',
      scalability: 'N/A (Strictly 2 Nodes)',
      faultTolerance: 'Low (No backup path unless redundant link added)',
      pros: ['Maximum dedicated bandwidth', 'Zero contention or collisions', 'Simple configuration'],
      cons: ['Limited to 2 endpoints', 'Cannot scale without additional interfaces']
    },
    spine_leaf: {
      name: 'Spine-Leaf Data Center Topology',
      category: 'Modern Datacenter',
      icon: '🏛️',
      description: 'Modern 2-tier Clos Architecture where every Leaf switch connects to every Spine switch. Eliminates STP blocking in datacenters.',
      spof: 'None (Fully meshed 2-tier fabric)',
      cablingCost: 'High',
      scalability: 'Extremely High (Add Spine or Leaf switches seamlessly)',
      faultTolerance: 'Maximum (Equal Cost Multi-Path ECMP load balancing)',
      pros: ['Predictable 1-hop latency between any servers', 'No Spanning Tree loops', 'High throughput'],
      cons: ['Requires large number of optical cables', 'Requires ECMP Layer 3 routing']
    },
    wlan_mesh: {
      name: 'Wireless Mesh (WLAN Mesh) Topology',
      category: 'Wireless Self-Healing',
      icon: '📡',
      description: 'Access Points connect wirelessly to one another using IEEE 802.11s mesh backhaul without running cables to every AP.',
      spof: 'Gateway AP connected to internet wire',
      cablingCost: 'Very Low (No ethernet wiring to mesh APs)',
      scalability: 'High',
      faultTolerance: 'High (Dynamic wireless mesh rerouting)',
      pros: ['Easy installation in outdoor/large venues', 'Self-healing RF links', 'Flexible coverage expansion'],
      cons: ['Wireless interference', 'Throughput degrades with multiple wireless hops']
    },
    daisy_chain: {
      name: 'Daisy Chain Linear Topology',
      category: 'Series Connection',
      icon: '🔗',
      description: 'Nodes are connected in a linear series chain from one to the next (Node 1 -> Node 2 -> Node 3 -> Node 4).',
      spof: 'Any intermediate switch in the chain',
      cablingCost: 'Low',
      scalability: 'Medium',
      faultTolerance: 'Low (Failure of middle node disconnects downstream nodes)',
      pros: ['Simple wiring along physical hallways', 'Minimal cable runs'],
      cons: ['Data must traverse every switch in sequence', 'Latency increases with chain length']
    }
  };

  // Node & Link calculation helper based on selected topology
  const getTopologyNodesAndLinks = () => {
    if (!selectedTopology && !isHybridMode) {
      return { nodes: [], links: [] }; // CLEAN EMPTY CANVAS AS REQUESTED
    }

    if (isHybridMode) {
      const nodes = [
        { id: 1, label: 'CORE-SW-01', type: 'core', x: 50, y: 50, zone: 'CORE' },
        { id: 2, label: 'DIST-SW-01', type: 'switch', x: 30, y: 35, zone: 'HQ' },
        { id: 3, label: 'DIST-SW-02', type: 'switch', x: 70, y: 35, zone: 'BRANCH' }
      ];
      const links = [
        { from: 1, to: 2 },
        { from: 1, to: 3 }
      ];

      if (hybridSelections.includes('star')) {
        nodes.push({ id: 4, label: 'STAR-PC1', type: 'pc', x: 15, y: 20, zone: 'STAR ZONE' });
        nodes.push({ id: 5, label: 'STAR-PC2', type: 'pc', x: 25, y: 15, zone: 'STAR ZONE' });
        links.push({ from: 2, to: 4 }, { from: 2, to: 5 });
      }

      if (hybridSelections.includes('tree')) {
        nodes.push({ id: 7, label: 'TREE-ACC1', type: 'switch', x: 75, y: 65, zone: 'TREE ZONE' });
        nodes.push({ id: 8, label: 'TREE-PC1', type: 'pc', x: 82, y: 85, zone: 'TREE ZONE' });
        links.push({ from: 3, to: 7 }, { from: 7, to: 8 });
      }

      if (hybridSelections.includes('mesh_full') || hybridSelections.includes('mesh_partial')) {
        nodes.push({ id: 10, label: 'MESH-DC1', type: 'server', x: 40, y: 75, zone: 'MESH DATACENTER' });
        nodes.push({ id: 11, label: 'MESH-DC2', type: 'server', x: 60, y: 75, zone: 'MESH DATACENTER' });
        links.push({ from: 1, to: 10 }, { from: 1, to: 11 }, { from: 10, to: 11 });
      }

      return { nodes, links };
    }

    switch (selectedTopology) {
      case 'star': {
        const nodes = [
          { id: 1, label: 'CENTRAL SWITCH', type: 'switch', x: 50, y: 50 },
          { id: 2, label: 'WORKSTATION 1', type: 'pc', x: 20, y: 25 },
          { id: 3, label: 'WORKSTATION 2', type: 'pc', x: 80, y: 25 },
          { id: 4, label: 'WORKSTATION 3', type: 'pc', x: 85, y: 75 },
          { id: 5, label: 'WORKSTATION 4', type: 'pc', x: 15, y: 75 },
          { id: 6, label: 'FILE SERVER', type: 'server', x: 50, y: 15 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 }, { from: 1, to: 5 }, { from: 1, to: 6 }
        ];
        return { nodes, links };
      }
      case 'tree': {
        const nodes = [
          { id: 1, label: 'CORE ROOT SWITCH', type: 'core', x: 50, y: 18 },
          { id: 2, label: 'DISTRIBUTION SW-A', type: 'switch', x: 28, y: 45 },
          { id: 3, label: 'DISTRIBUTION SW-B', type: 'switch', x: 72, y: 45 },
          { id: 4, label: 'ACCESS PC-01', type: 'pc', x: 15, y: 78 },
          { id: 5, label: 'ACCESS PC-02', type: 'pc', x: 40, y: 78 },
          { id: 6, label: 'ACCESS PC-03', type: 'pc', x: 60, y: 78 },
          { id: 7, label: 'ACCESS PC-04', type: 'pc', x: 85, y: 78 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 1, to: 3 },
          { from: 2, to: 4 }, { from: 2, to: 5 },
          { from: 3, to: 6 }, { from: 3, to: 7 }
        ];
        return { nodes, links };
      }
      case 'mesh_full': {
        const nodes = [
          { id: 1, label: 'NODE A (ROUTER 1)', type: 'router', x: 50, y: 18 },
          { id: 2, label: 'NODE B (ROUTER 2)', type: 'router', x: 82, y: 42 },
          { id: 3, label: 'NODE C (ROUTER 3)', type: 'router', x: 70, y: 82 },
          { id: 4, label: 'NODE D (ROUTER 4)', type: 'router', x: 30, y: 82 },
          { id: 5, label: 'NODE E (ROUTER 5)', type: 'router', x: 18, y: 42 },
        ];
        const links = [];
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            links.push({ from: nodes[i].id, to: nodes[j].id });
          }
        }
        return { nodes, links };
      }
      case 'mesh_partial': {
        const nodes = [
          { id: 1, label: 'CORE R1', type: 'router', x: 35, y: 30 },
          { id: 2, label: 'CORE R2', type: 'router', x: 65, y: 30 },
          { id: 3, label: 'EDGE SW1', type: 'switch', x: 20, y: 75 },
          { id: 4, label: 'EDGE SW2', type: 'switch', x: 50, y: 75 },
          { id: 5, label: 'EDGE SW3', type: 'switch', x: 80, y: 75 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 },
          { from: 2, to: 4 }, { from: 2, to: 5 }, { from: 3, to: 4 }
        ];
        return { nodes, links };
      }
      case 'ring': {
        const nodes = [
          { id: 1, label: 'RING NODE 1', type: 'router', x: 50, y: 18 },
          { id: 2, label: 'RING NODE 2', type: 'router', x: 82, y: 42 },
          { id: 3, label: 'RING NODE 3', type: 'router', x: 70, y: 82 },
          { id: 4, label: 'RING NODE 4', type: 'router', x: 30, y: 82 },
          { id: 5, label: 'RING NODE 5', type: 'router', x: 18, y: 42 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 1 }
        ];
        return { nodes, links };
      }
      case 'dual_ring': {
        const nodes = [
          { id: 1, label: 'SONET R1', type: 'router', x: 50, y: 18 },
          { id: 2, label: 'SONET R2', type: 'router', x: 82, y: 42 },
          { id: 3, label: 'SONET R3', type: 'router', x: 70, y: 82 },
          { id: 4, label: 'SONET R4', type: 'router', x: 30, y: 82 },
          { id: 5, label: 'SONET R5', type: 'router', x: 18, y: 42 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 1 },
          // Counter-rotating inner ring links
          { from: 2, to: 1 }, { from: 3, to: 2 }, { from: 4, to: 3 }, { from: 5, to: 4 }, { from: 1, to: 5 }
        ];
        return { nodes, links };
      }
      case 'bus': {
        const nodes = [
          { id: 1, label: 'BUS TAP 1', type: 'pc', x: 20, y: 40 },
          { id: 2, label: 'BUS TAP 2', type: 'pc', x: 40, y: 40 },
          { id: 3, label: 'BUS TAP 3', type: 'pc', x: 60, y: 40 },
          { id: 4, label: 'BUS TAP 4', type: 'server', x: 80, y: 40 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }
        ];
        return { nodes, links };
      }
      case 'point_to_point': {
        const nodes = [
          { id: 1, label: 'ROUTER ALPHA (HQ)', type: 'router', x: 30, y: 50 },
          { id: 2, label: 'ROUTER BETA (BRANCH)', type: 'router', x: 70, y: 50 },
        ];
        const links = [{ from: 1, to: 2 }];
        return { nodes, links };
      }
      case 'spine_leaf': {
        const nodes = [
          // Spine Layer
          { id: 1, label: 'SPINE-SW-01', type: 'core', x: 35, y: 25 },
          { id: 2, label: 'SPINE-SW-02', type: 'core', x: 65, y: 25 },
          // Leaf Layer
          { id: 3, label: 'LEAF-SW-01', type: 'switch', x: 20, y: 65 },
          { id: 4, label: 'LEAF-SW-02', type: 'switch', x: 50, y: 65 },
          { id: 5, label: 'LEAF-SW-03', type: 'switch', x: 80, y: 65 },
        ];
        // Clos 2-Tier: Every Leaf switch connects to every Spine switch
        const links = [
          { from: 3, to: 1 }, { from: 3, to: 2 },
          { from: 4, to: 1 }, { from: 4, to: 2 },
          { from: 5, to: 1 }, { from: 5, to: 2 },
        ];
        return { nodes, links };
      }
      case 'wlan_mesh': {
        const nodes = [
          { id: 1, label: 'GATEWAY AP (WIRED)', type: 'router', x: 50, y: 20 },
          { id: 2, label: 'MESH AP 1', type: 'switch', x: 25, y: 55 },
          { id: 3, label: 'MESH AP 2', type: 'switch', x: 75, y: 55 },
          { id: 4, label: 'MESH AP 3', type: 'switch', x: 50, y: 80 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 3, to: 4 }, { from: 2, to: 3 }
        ];
        return { nodes, links };
      }
      case 'daisy_chain': {
        const nodes = [
          { id: 1, label: 'SWITCH 1', type: 'switch', x: 15, y: 50 },
          { id: 2, label: 'SWITCH 2', type: 'switch', x: 38, y: 50 },
          { id: 3, label: 'SWITCH 3', type: 'switch', x: 62, y: 50 },
          { id: 4, label: 'SWITCH 4', type: 'switch', x: 85, y: 50 },
        ];
        const links = [
          { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }
        ];
        return { nodes, links };
      }
      default:
        return { nodes: [], links: [] };
    }
  };

  const { nodes, links } = getTopologyNodesAndLinks();
  const currentInfo = selectedTopology ? topologyInfo[selectedTopology] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative font-sans text-slate-100">
      
      {/* HEADER & TOPOLOGY SELECTOR BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
              <Network className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {lang === 'de' ? 'TOPOLOGIE-ENGINE' : 'TOPOLOGY ENGINE'}
                </span>
                <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                  {lang === 'de' ? 'Enterprise Netzwerk-Topologie Visualisierer' : 'Enterprise Network Topology Visualizer'}
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'de' ? 'Wählen Sie eine Topologie aus den 11 Optionen unten, um Netzwerkarchitekturen zu rendern und zu analysieren.' : 'Select a topology from the 11 options below to render and analyze network architectures.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => {
                setSelectedTopology(null);
                setIsHybridMode(false);
                setFailedNodes([]);
                setFailedLinks([]);
              }}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'de' ? 'Leinwand löschen' : 'Clear Canvas'}</span>
            </button>
          </div>
        </div>

        {/* 11 NETWORK TOPOLOGY SELECTOR BUTTONS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-cyan-300">
              <Layers className="w-4 h-4 text-cyan-400" /> {lang === 'de' ? 'Netzwerktopologie auswählen (11 Optionen):' : 'Select Network Topology (11 Options):'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {Object.keys(topologyInfo).map((topoKey) => {
              const info = topologyInfo[topoKey];
              const isSelected = selectedTopology === topoKey && !isHybridMode;

              return (
                <button
                  key={topoKey}
                  onClick={() => {
                    setSelectedTopology(topoKey);
                    setIsHybridMode(false);
                  }}
                  className={`px-3.5 py-2 rounded-2xl border font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 scale-105 ring-2 ring-cyan-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-sm">{info.icon}</span>
                  <span>{info.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ENLARGED FULL-SIZE CANVAS STAGE (MIN-HEIGHT 640px AS REQUESTED) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950 relative overflow-hidden font-mono text-xs min-h-[640px]">
        
        {/* IF NOTHING IS SELECTED ON CANVAS */}
        {!selectedTopology && !isHybridMode ? (
          <div className="w-full h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-950/60 p-8 text-center space-y-4 animate-in fade-in">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-cyan-400 shadow-2xl shadow-cyan-500/10">
              <Network className="w-16 h-16 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-xl font-black text-slate-200">{lang === 'de' ? 'Leinwand bereit' : 'Canvas Stage Ready'}</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {lang === 'de' ? 'Klicken Sie auf eine der 11 Netzwerktopologie-Optionen oben (Stern, Baum, Full Mesh, Spine-Leaf, Dual-Ring, etc.), um die Topologie zu rendern und zu untersuchen!' : 'Click any of the 11 Network Topology selectors above (Star, Tree, Full Mesh, Spine-Leaf, Dual-Ring, etc.) to render and inspect the topology!'}
              </p>
            </div>
          </div>
        ) : (
          /* SVG CANVAS STAGE */
          <div className="relative w-full h-[600px] bg-slate-950 rounded-2xl border border-slate-900/90 overflow-hidden">
            <svg className="w-full h-full absolute inset-0 z-0">
              {links.map((link, idx) => {
                const fromNode = nodes.find(n => n.id === link.from);
                const toNode = nodes.find(n => n.id === link.to);
                if (!fromNode || !toNode) return null;

                const isFailed = failedLinks.includes(`${link.from}-${link.to}`) || failedLinks.includes(`${link.to}-${link.from}`);

                return (
                  <line
                    key={idx}
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke={isFailed ? '#f43f5e' : '#06b6d4'}
                    strokeWidth={isFailed ? '4' : '3'}
                    strokeDasharray={isFailed ? '6,6' : 'none'}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* CANVAS NODES */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isFailed = failedNodes.includes(node.id);

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                  className={`absolute z-20 p-3 rounded-2xl border-2 transition-all cursor-pointer shadow-2xl flex flex-col items-center justify-center space-y-1 ${
                    isFailed
                      ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                      : isSelected
                      ? 'bg-slate-900 border-cyan-400 text-cyan-300 scale-110 ring-4 ring-cyan-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-500/80 hover:scale-105'
                  }`}
                >
                  <Server className="w-5 h-5 text-cyan-400" />
                  <span className="font-extrabold text-[11px] whitespace-nowrap">{node.label}</span>
                </div>
              );
            })}

            {/* FLOATING TOPOLOGY SPECIFICATION CARD ON CANVAS */}
            {currentInfo && (
              <div className="absolute top-4 left-4 z-40 max-w-sm w-full p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-2 font-mono text-xs backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-xs uppercase flex items-center gap-1.5 text-cyan-300">
                    <span>{currentInfo.icon}</span> {currentInfo.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentInfo.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                  {currentInfo.description}
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
