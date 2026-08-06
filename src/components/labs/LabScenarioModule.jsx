import React, { useState, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { BookOpen, CheckCircle2, XCircle, Trophy, HelpCircle, ArrowRight, ShieldCheck, Zap, RefreshCw, Settings, Trash2, Plus, Laptop, Server, Router, Shield, Layers, Cable, Globe, Printer } from 'lucide-react';
import { LAB_SCENARIOS, evaluateLabScenario } from '../../data/labScenarios';
import { CleanWidget } from '../common/EasyCard';

export default function LabScenarioModule({ appMode = 'clean' }) {
  const { lang, t } = useLanguage();
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

  const activeTitle = lang === 'de' ? (activeLab.title_de || activeLab.title) : activeLab.title;
  const activeDesc = lang === 'de' ? (activeLab.description_de || activeLab.description) : activeLab.description;
  const activeObjectives = lang === 'de' ? (activeLab.objectives_de || activeLab.objectives) : activeLab.objectives;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Widget */}
      <CleanWidget
        title={lang === 'de' ? '🎓 Enterprise Topologie Lab-Herausforderungen & Interaktive Engine' : '🎓 Enterprise Topology Lab Challenges & Visual Canvas Engine'}
        subtitle={lang === 'de' ? 'Interagieren Sie mit komplexen Unternehmens-Netzwerktopologien. Verkabeln Sie Geräte, konfigurieren Sie Router-Gateways und bestehen Sie reale Ausfallszenarien.' : 'Interact with complex enterprise network topologies on a live graph canvas. Wire devices, configure router gateways, and pass real-world outage assessments.'}
        icon={Trophy}
        protocol={lang === 'de' ? 'VISUELLE LAB-BEWERTUNG' : 'VISUAL LAB ASSESSMENT'}
        status={`${evalResult.score}% ${lang === 'de' ? 'ABGESCHLOSSEN' : 'COMPLETED'}`}
      />

      {/* Lab Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LAB_SCENARIOS.map((lab) => {
          const isSelected = lab.id === selectedLabId;
          const labEval = evaluateLabScenario(lab.id, isSelected ? currentNodes : lab.initialState.nodes, isSelected ? currentLinks : lab.initialState.links, currentFwRules);
          const labTitle = lang === 'de' ? (lab.title_de || lab.title) : lab.title;
          const labDesc = lang === 'de' ? (lab.description_de || lab.description) : lab.description;
          const labCat = lang === 'de' ? (lab.category_de || lab.category) : lab.category;
          const labDiff = lang === 'de' ? (lab.difficulty_de || lab.difficulty) : lab.difficulty;

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
                    lab.difficulty.includes('Beginner') || lab.difficulty.includes('Einsteiger') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    lab.difficulty.includes('Intermediate') || lab.difficulty.includes('Fortgeschritten') ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {labDiff}
                  </span>

                  <span className={`text-[11px] font-black font-mono px-2 py-0.5 rounded-full ${
                    labEval.passed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-400'
                  }`}>
                    {labEval.score}% {lang === 'de' ? 'Punktzahl' : 'Score'}
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-slate-100 tracking-tight leading-snug mb-1">{labTitle}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{labDesc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold text-[10px]">{labCat}</span>
                <span className="text-cyan-400 font-bold text-[10px] flex items-center gap-1">
                  {lang === 'de' ? 'Szenario starten' : 'Start Scenario'} <ArrowRight className="w-3 h-3" />
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
              <h2 className="text-lg font-black text-slate-100">{activeTitle}</h2>
              {evalResult.passed ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {lang === 'de' ? 'GELÖST ✓' : 'PASSED ✓'}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> {lang === 'de' ? 'IN BEARBEITUNG' : 'IN PROGRESS'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-sans mt-1">{activeDesc}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResetLab(activeLab)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {lang === 'de' ? 'Szenario zurücksetzen' : 'Reset Scenario'}
            </button>
          </div>
        </div>

        {/* Objectives Box & Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          
          {/* Objectives Column */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" /> {lang === 'de' ? 'Lab-Ziele & Anforderungen:' : 'Lab Objectives & Task Rules:'}
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              {activeObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Controls Column */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <span className="font-mono text-xs font-bold text-slate-400">{lang === 'de' ? 'Canvas-Werkzeuge:' : 'Interactive Wiring Tools:'}</span>

            <button
              onClick={() => {
                setIsCableMode(!isCableMode);
                setConnectingFromId(null);
              }}
              className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isCableMode
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Cable className="w-4 h-4" />
              <span>
                {isCableMode
                  ? (lang === 'de' ? 'Verkabelung abbrechen' : 'Cancel Wiring Mode')
                  : (lang === 'de' ? 'Kabel verbinden' : 'Connect Ethernet Cable')}
              </span>
            </button>

            {selectedNodeId && (
              <button
                onClick={() => handleDisconnectNode(selectedNodeId)}
                className="w-full py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-mono text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> {lang === 'de' ? 'Kabel von ausgewähltem Gerät trennen' : 'Disconnect Selected Node Cables'}
              </button>
            )}
          </div>
        </div>

        {/* FIREWALL RULES EDITING SUB-PANEL (FOR LAB 2 FIREWALL) */}
        {activeLab.id === 'lab_firewall' && (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" /> {lang === 'de' ? 'DMZ-Firewall Regelanzeige:' : 'DMZ Firewall ACL Rule Table Inspector:'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{lang === 'de' ? 'Klicken Sie auf Aktion zum Umschalten (ACCEPT / DROP)' : 'Click action to toggle ACCEPT / DROP'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {currentFwRules.map(rule => (
                <div key={rule.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-bold block">{rule.port}</span>
                    <span className="text-slate-400 text-[10px]">{rule.desc}</span>
                  </div>
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                      rule.action === 'ACCEPT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {rule.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRAPH CANVAS FOR TOPOLOGY NODES */}
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative w-full h-[420px] rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden cursor-crosshair shadow-inner"
        >
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* SVG Cable Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {currentLinks.map((link) => {
              const fromNode = currentNodes.find(n => n.id === link.from);
              const toNode = currentNodes.find(n => n.id === link.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={link.id}
                  x1={fromNode.x + 40}
                  y1={fromNode.y + 40}
                  x2={toNode.x + 40}
                  y2={toNode.y + 40}
                  stroke="#00f0ff"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {currentNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{ left: node.x, top: node.y }}
                className={`absolute z-20 p-3 rounded-2xl bg-slate-900 border transition-transform cursor-grab active:cursor-grabbing flex flex-col items-center justify-center space-y-1 shadow-xl select-none ${
                  isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {getNodeIcon(node.type)}
                <span className="text-[11px] font-bold text-slate-200">{node.name}</span>
                <span className="text-[9px] font-mono text-cyan-400 font-medium">{node.ip}</span>
              </div>
            );
          })}
        </div>

        {/* EVALUATION RESULTS BANNER */}
        <div className={`p-4 rounded-2xl border font-sans text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          evalResult.passed
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="space-y-1">
            <span className="font-mono font-bold text-xs block">
              {evalResult.passed ? (lang === 'de' ? '🎉 GRATULATION! LAB BESTANDEN' : '🎉 CONGRATULATIONS! LAB PASSED') : (lang === 'de' ? '⚠️ LAB AUSWERTUNG & BEWERTUNG' : '⚠️ LAB EVALUATION & FEEDBACK')}
            </span>
            <ul className="space-y-0.5 text-[11px]">
              {evalResult.feedback.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="font-mono text-right shrink-0">
            <span className="text-2xl font-black">{evalResult.score}%</span>
            <span className="text-[10px] text-slate-400 block">{lang === 'de' ? 'Erreichte Punktzahl' : 'Overall Score'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
