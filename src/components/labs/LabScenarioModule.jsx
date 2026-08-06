import React, { useState, useRef } from 'react';
import { BookOpen, CheckCircle2, XCircle, Trophy, HelpCircle, ArrowRight, ShieldCheck, Zap, RefreshCw, Settings, Trash2, Plus, Laptop, Server, Router, Shield, Layers, Cable, Globe, Printer } from 'lucide-react';
import { LAB_SCENARIOS, evaluateLabScenario } from '../../data/labScenarios';
import { CleanWidget, SlideOutInspector } from '../common/EasyCard';

export default function LabScenarioModule({ appMode = 'clean' }) {
  const [selectedLabId, setSelectedLabId] = useState('lab_dhcp');
  const activeLab = LAB_SCENARIOS.find(s => s.id === selectedLabId) || LAB_SCENARIOS[0];

  const [currentNodes, setCurrentNodes] = useState(activeLab.initialState.nodes);
  const [currentLinks, setCurrentLinks] = useState(activeLab.initialState.links);
  const [currentFwRules, setCurrentFwRules] = useState([
    { id: 101, port: '443 (HTTPS)', serviceKey: 'https', action: 'DROP', desc: 'Block HTTPS Web' },
    { id: 102, port: '80 (HTTP)', serviceKey: 'http', action: 'ACCEPT', desc: 'Allow HTTP Web' }
  ]);

  const [isCableMode, setIsCableMode] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const editingNode = currentNodes.find(n => n.id === editingNodeId);

  const canvasRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const evalResult = evaluateLabScenario(activeLab.id, currentNodes, currentLinks, currentFwRules);

  const handleResetLab = (lab) => {
    setSelectedLabId(lab.id);
    setCurrentNodes(lab.initialState.nodes);
    setCurrentLinks(lab.initialState.links);
    setCurrentFwRules([
      { id: 101, port: '443 (HTTPS)', serviceKey: 'https', action: 'DROP', desc: 'Block HTTPS Web' },
      { id: 102, port: '80 (HTTP)', serviceKey: 'http', action: 'ACCEPT', desc: 'Allow HTTP Web' }
    ]);
    setIsCableMode(false);
    setConnectingFromId(null);
    setSelectedNodeId(null);
    setEditingNodeId(null);
  };

  // Node Drag & Drop Logic on Canvas
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);

    if (isCableMode) {
      if (!connectingFromId) {
        setConnectingFromId(nodeId);
      } else if (connectingFromId !== nodeId) {
        // Connect cable between 1st and 2nd clicked node
        const linkExists = currentLinks.some(l => 
          (l.from === connectingFromId && l.to === nodeId) || (l.from === nodeId && l.to === connectingFromId)
        );
        if (!linkExists) {
          const newLink = {
            id: `link_${Date.now()}`,
            from: connectingFromId,
            to: nodeId,
            cableType: 'straight'
          };
          setCurrentLinks([...currentLinks, newLink]);
        }
        setConnectingFromId(null);
        setIsCableMode(false);
      }
      return;
    }

    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) return;
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 120, e.clientX - rect.left - 40));
    const newY = Math.max(20, Math.min(rect.height - 90, e.clientY - rect.top - 40));

    setCurrentNodes(currentNodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleDisconnectNode = (nodeId) => {
    if (!nodeId) return;
    setCurrentLinks(currentLinks.filter(l => l.from !== nodeId && l.to !== nodeId));
  };

  const handleToggleRole = (role) => {
    if (!editingNode) return;
    const currentRoles = editingNode.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];

    setCurrentNodes(currentNodes.map(n => n.id === editingNode.id ? { ...n, roles: newRoles } : n));
  };

  const handleUpdateNode = (field, value) => {
    if (!editingNode) return;
    setCurrentNodes(currentNodes.map(n => n.id === editingNode.id ? { ...n, [field]: value } : n));
  };

  const handleToggleRule = (ruleId) => {
    setCurrentFwRules(currentFwRules.map(r => 
      r.id === ruleId ? { ...r, action: r.action === 'ACCEPT' ? 'DROP' : 'ACCEPT' } : r
    ));
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-7 h-7 text-cyan-400" />;
      case 'server': return <Server className="w-7 h-7 text-purple-400" />;
      case 'router': return <Router className="w-7 h-7 text-amber-400" />;
      case 'firewall': return <ShieldCheck className="w-7 h-7 text-rose-400" />;
      case 'switch': return <Layers className="w-7 h-7 text-blue-400" />;
      case 'cloud': return <Globe className="w-7 h-7 text-emerald-400" />;
      default: return <Server className="w-7 h-7 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Widget */}
      <CleanWidget
        title="🎓 Enterprise Topology Lab Challenges & Visual Canvas Engine"
        subtitle="Interact with complex enterprise network topologies on a live graph canvas. Wire devices, configure router gateways, and pass real-world outage assessments."
        icon={Trophy}
        protocol="VISUAL LAB ASSESSMENT"
        status={`${evalResult.score}% COMPLETED`}
      />

      {/* Lab Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LAB_SCENARIOS.map((lab) => {
          const isSelected = lab.id === selectedLabId;
          const labEval = evaluateLabScenario(lab.id, isSelected ? currentNodes : lab.initialState.nodes, isSelected ? currentLinks : lab.initialState.links, currentFwRules);

          return (
            <div
              key={lab.id}
              onClick={() => handleResetLab(lab)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xl font-mono relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-cyan-500/20 scale-102 ring-2 ring-cyan-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    lab.difficulty.includes('Beginner') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    lab.difficulty.includes('Intermediate') ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {lab.difficulty}
                  </span>

                  <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full ${
                    labEval.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-400'
                  }`}>
                    {labEval.score}% Score
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-slate-100 tracking-tight leading-snug mb-1">{lab.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{lab.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold text-[10px]">{lab.category}</span>
                <span className="text-cyan-400 font-bold text-[10px] flex items-center gap-1">
                  Start Scenario <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE LAB WORKSPACE & CANVAS */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6 font-mono">
        
        {/* Scenario Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100">{activeLab.title}</h2>
              {evalResult.completed ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 fill-current" /> PASSED 100%!
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-black text-xs">
                  Progress: {evalResult.score}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">{activeLab.description}</p>
          </div>

          <button
            onClick={() => handleResetLab(activeLab)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Reset Scenario State
          </button>
        </div>

        {/* Tasks Progress & Hints Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Tasks Checklist ({evalResult.passedObjectives.length} / {activeLab.objectives.length} Met)
            </h4>

            <div className="space-y-1.5">
              {activeLab.objectives.map((obj, idx) => {
                const isMet = evalResult.passedObjectives.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 text-xs ${
                      isMet
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isMet ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-500" />}
                    </div>
                    <span className="font-bold flex-1">{obj}</span>
                  </div>
                );
              })}
            </div>

            {evalResult.hints.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1 font-sans">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <HelpCircle className="w-4 h-4" /> Recommendation:
                </div>
                <p className="text-amber-300">{evalResult.hints[0]}</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between items-center text-center">
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Live Scorecard</span>
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-1">
                {evalResult.score}%
              </div>
            </div>

            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 mt-2">
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500" style={{ width: `${evalResult.score}%` }}></div>
            </div>
          </div>
        </div>

        {/* VISUAL TOPOLOGY GRAPH CANVAS STAGE */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Cable className="w-4 h-4 text-amber-400" /> Interactive Enterprise Topology Canvas
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsCableMode(!isCableMode); setConnectingFromId(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCableMode
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
                }`}
              >
                <span>{isCableMode ? (connectingFromId ? '⚡ Click 2nd Device...' : '⚡ Click 1st Device...') : '🔌 Cable Wire Tool'}</span>
              </button>

              <button
                onClick={() => handleDisconnectNode(selectedNodeId)}
                disabled={!selectedNodeId}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                  selectedNodeId
                    ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-700 cursor-pointer'
                    : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
              >
                ✂️ Cut Wires
              </button>
            </div>
          </div>

          {/* Interactive Canvas Canvas Area */}
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="rounded-3xl border border-slate-800 min-h-[460px] h-[480px] relative overflow-hidden bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-slate-950/90 select-none"
          >
            {/* SVG Cable Wires Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {currentLinks.map((link) => {
                const n1 = currentNodes.find(n => n.id === link.from);
                const n2 = currentNodes.find(n => n.id === link.to);
                if (!n1 || !n2) return null;

                return (
                  <line
                    key={link.id}
                    x1={n1.x + 55}
                    y1={n1.y + 40}
                    x2={n2.x + 55}
                    y2={n2.y + 40}
                    stroke={link.cableType === 'fiber' ? '#10b981' : '#3b82f6'}
                    strokeWidth="4"
                    strokeDasharray={link.cableType === 'fiber' ? '8 4' : '6 4'}
                    className="animate-wire-dash"
                  />
                );
              })}
            </svg>

            {/* Interactive Node Elements on Canvas */}
            {currentNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnectingSource = connectingFromId === node.id;
              const isCloudISP = node.type === 'cloud';

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute p-3 rounded-2xl border-2 transition-all cursor-move flex flex-col items-center gap-1.5 shadow-2xl z-10 w-28 text-center ${
                    isConnectingSource
                      ? 'bg-cyan-500 border-cyan-200 text-slate-950 scale-110 animate-bounce'
                      : isSelected
                      ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                      : isCloudISP
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      {getNodeIcon(node.type)}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}
                      className="p-1 rounded-lg bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-700 cursor-pointer"
                      title="Configure Device"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black leading-tight text-slate-100 truncate w-24">{node.name}</h4>
                    <p className="text-[9px] text-cyan-300 font-mono font-bold mt-0.5 truncate w-24">{node.ip || 'N/A'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Firewall ACL Table for Lab 2 */}
          {activeLab.id === 'lab_firewall' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-rose-400 block">🛡️ DMZ Firewall Rule Table (Click Action Badge to Toggle Rule)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentFwRules.map(rule => (
                  <div key={rule.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-amber-300">{rule.port}</span>
                      <p className="text-[10px] text-slate-400">{rule.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-3 py-1 rounded-full font-black text-xs border cursor-pointer ${
                        rule.action === 'ACCEPT' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-rose-950 text-rose-300 border-rose-500'
                      }`}
                    >
                      {rule.action === 'ACCEPT' ? '🟢 ACCEPT' : '🔴 DROP'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIGURATION MODAL POPUP */}
      {editingNode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-700 space-y-4 bg-slate-900/95 font-mono text-xs text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-amber-400">Configure {editingNode.name}</h3>
              <button onClick={() => setEditingNodeId(null)} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Default Gateway IP</label>
                <input
                  type="text"
                  value={editingNode.gateway || ''}
                  onChange={(e) => handleUpdateNode('gateway', e.target.value)}
                  placeholder="e.g. 198.51.100.1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Server Service Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {['dhcp', 'dns', 'ad', 'http'].map(role => {
                    const hasRole = (editingNode.roles || []).includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => handleToggleRole(role)}
                        className={`p-2 rounded-xl border font-bold text-xs flex items-center justify-between cursor-pointer ${
                          hasRole ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span className="uppercase">{role} Server</span>
                        <span>{hasRole ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setEditingNodeId(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs cursor-pointer"
              >
                Save & Update Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      <SlideOutInspector title="Technical Deep Dive — Scenario Evaluation Spec">
        <div className="space-y-2 text-xs text-slate-300">
          <p><span className="text-cyan-400 font-bold">Evaluation Engine:</span> Automated condition validation inspects state tree objects every tick.</p>
          <p><span className="text-amber-400 font-bold">Current Target ID:</span> {activeLab.id}</p>
          <p><span className="text-purple-400 font-bold">Objectives Total:</span> {activeLab.objectives.length}</p>
        </div>
      </SlideOutInspector>
    </div>
  );
}
