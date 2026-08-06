import React, { useState } from 'react';
import { calculateVlsm, calculateFlsm, cidrToSubnetMask } from '../../utils/subnetCalculator';
import { Globe, Plus, Trash2, RotateCcw, CheckCircle2, BookOpen, Sparkles, X } from 'lucide-react';

export default function SubnettingModule() {
  // Base Network Input & Mode
  const [networkInput, setNetworkInput] = useState('172.16.0.0/18');
  const [calcMode, setCalcMode] = useState('vlsm'); // 'vlsm' or 'flsm'

  // Input Fields for Adding New Subnet Requirement
  const [newSubnetName, setNewSubnetName] = useState('');
  const [newSubnetHosts, setNewSubnetHosts] = useState('');

  // Student Tutorial Step Progress (0 = Not started, 1+ = Revealing steps)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Active Subnets / VLAN Requirements List
  const [subnets, setSubnets] = useState([
    { id: 1, name: 'VLAN 10 - Sales', hosts: 900 },
    { id: 2, name: 'VLAN 20 - Engineering', hosts: 450 },
    { id: 3, name: 'VLAN 30 - Management', hosts: 300 },
    { id: 4, name: 'VLAN 40 - Guests', hosts: 200 },
  ]);

  // Parse IP & CIDR
  const parseInput = () => {
    const [rawIp, rawCidr] = networkInput.trim().split('/');
    let ip = rawIp || '192.168.1.0';
    let cidr = parseInt(rawCidr, 10);
    if (isNaN(cidr) || cidr < 0 || cidr > 30) cidr = 24;

    const parts = ip.split('.').map(n => parseInt(n, 10));
    if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) {
      ip = '192.168.1.0';
    }
    return { ip, cidr };
  };

  const { ip: baseIp, cidr: baseCidr } = parseInput();

  // Run Subnet Engine
  const results = calcMode === 'vlsm'
    ? calculateVlsm(baseIp, baseCidr, subnets)
    : calculateFlsm(baseIp, baseCidr, subnets);

  // Add new subnet requirement
  const handleAddSubnet = (e) => {
    e.preventDefault();
    const name = newSubnetName.trim() || `VLAN ${(subnets.length + 1) * 10}`;
    const hosts = Math.max(1, parseInt(newSubnetHosts, 10) || 50);

    const nextId = subnets.length > 0 ? Math.max(...subnets.map(s => s.id)) + 1 : 1;
    setSubnets([...subnets, { id: nextId, name, hosts }]);
    setNewSubnetName('');
    setNewSubnetHosts('');
    setCurrentStepIndex(0);
  };

  // Remove subnet requirement
  const handleRemoveSubnet = (id) => {
    if (subnets.length <= 1) return;
    setSubnets(subnets.filter(s => s.id !== id));
    setCurrentStepIndex(0);
  };

  // Total steps = Step 1 (Strategy) + 1 step per Subnet + Step Final (Summary)
  const totalSteps = 2 + results.subnets.length;

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleResetLesson = () => {
    setCurrentStepIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-100 pb-8">
      
      {/* TACTILE NEUMORPHIC CONTROL PANEL WITH DTS AMBER YELLOW STYLING */}
      <div className="neumorphic-card p-6 space-y-5">
        
        {/* ROW 1: BASE IP, MODE SWITCH & LESSON CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Base IP Input */}
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="p-2 rounded-xl bg-[#0e1017] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.65),_inset_-2px_-2px_5px_rgba(255,255,255,0.035)] text-[#f59e0b]">
              <Globe className="w-5 h-5 shrink-0" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-mono text-white/50 block leading-none">Base Network Address & Prefix</label>
              <input
                type="text"
                value={networkInput}
                onChange={(e) => {
                  setNetworkInput(e.target.value);
                  setCurrentStepIndex(0);
                }}
                placeholder="172.16.0.0/18 or 192.168.1.0/24"
                className="w-full max-w-xs px-3.5 py-2 neumorphic-input font-mono text-xs text-[#f59e0b] font-bold"
              />
            </div>
          </div>

          {/* Mode Switch (VLSM / FLSM) */}
          <div className="apple-segmented-control text-xs">
            <button
              onClick={() => {
                setCalcMode('vlsm');
                setCurrentStepIndex(0);
              }}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                calcMode === 'vlsm'
                  ? 'bg-[#f59e0b] text-white font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              VLSM
            </button>
            <button
              onClick={() => {
                setCalcMode('flsm');
                setCurrentStepIndex(0);
              }}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                calcMode === 'flsm'
                  ? 'bg-[#d97706] text-white font-bold shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              FLSM
            </button>
          </div>

          {/* LESSON CONTROL BUTTON */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handleResetLesson}
                className="p-2.5 rounded-full neumorphic-button text-white/60 hover:text-white"
                title="Start Lesson Over"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex >= totalSteps}
              className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 ${
                currentStepIndex === 0
                  ? 'neumorphic-button-primary'
                  : currentStepIndex < totalSteps
                  ? 'bg-[#30d158] text-white rounded-full shadow-[0_0_16px_rgba(48,209,88,0.4)] hover:scale-[1.02] cursor-pointer'
                  : 'neumorphic-card opacity-50 cursor-not-allowed text-white/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {currentStepIndex === 0
                  ? 'Start Step-by-Step Lesson'
                  : currentStepIndex < totalSteps
                  ? `Next Step (${currentStepIndex}/${totalSteps}) ➔`
                  : 'Lesson Completed ✓'}
              </span>
            </button>
          </div>
        </div>

        {/* ROW 2: ADD SUBNET REQUIREMENT INPUT FIELD & BUTTON */}
        <form onSubmit={handleAddSubnet} className="pt-4 border-t border-white/[0.04] flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-white/60 font-sans text-xs font-medium mr-1">Add Subnet Requirement:</span>
          
          <input
            type="text"
            value={newSubnetName}
            onChange={(e) => setNewSubnetName(e.target.value)}
            placeholder="Subnet Name (e.g. Sales)"
            className="flex-1 min-w-[160px] px-3.5 py-2 neumorphic-input font-sans text-xs text-white"
          />

          <input
            type="number"
            min="1"
            value={newSubnetHosts}
            onChange={(e) => setNewSubnetHosts(e.target.value)}
            placeholder="Hosts (e.g. 500)"
            className="w-28 px-3 py-2 neumorphic-input font-mono text-xs text-[#f59e0b] text-right font-bold"
          />

          <button
            type="submit"
            className="px-4 py-2 neumorphic-button-primary text-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subnet</span>
          </button>
        </form>

        {/* ROW 3: DISMISSIBLE SUBNET PILL TAGS */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-white/40 text-[11px]">Configured Subnets:</span>
          {subnets.map((s) => (
            <div 
              key={s.id}
              className="px-3 py-1 rounded-full neumorphic-card text-white/80 flex items-center gap-1.5 text-[11px]"
            >
              <span>{s.name}</span>
              <strong className="text-[#f59e0b]">({s.hosts}h)</strong>
              {subnets.length > 1 && (
                <button
                  onClick={() => handleRemoveSubnet(s.id)}
                  className="hover:text-[#ff3b30] cursor-pointer ml-0.5 text-white/40 transition-colors"
                  title="Remove Subnet"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* INTRO INSTRUCTION WHEN LESSON NOT YET STARTED */}
      {currentStepIndex === 0 && (
        <div className="neumorphic-card p-6 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#f59e0b] mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-white/90">Interactive Subnetting Student Guide</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed font-sans">
            Add your subnets above and click <strong className="text-[#f59e0b]">"Start Step-by-Step Lesson"</strong> to reveal calculations showing exactly how Host Bits, Subnet Masks (SM), Network Addresses (NA), and Broadcast Addresses (BA) are derived step by step.
          </p>
        </div>
      )}

      {/* STEP-BY-STEP REVEALED LESSON CARDS (REVEALED ONE BY ONE UNDER TOP BAR) */}
      <div className="space-y-4 font-mono text-xs">
        
        {/* STEP 1: UNDERSTAND THE GOAL & BASE NETWORK */}
        {currentStepIndex >= 1 && (
          <div className="neumorphic-card p-5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[#f59e0b] font-semibold flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-[10px]">STEP 1</span>
                Understand Base Network Pool & Strategy
              </span>
              <span className="text-white/40 text-[10px] font-bold">{calcMode.toUpperCase()} Mode</span>
            </div>

            <div className="space-y-2.5 text-white/80 leading-relaxed font-sans text-xs">
              <p>
                First, we examine our allocated base network: <strong className="text-[#f59e0b] font-mono">{results.baseIp}{results.baseCidr}</strong>.
              </p>
              <div className="p-3.5 rounded-xl neumorphic-card-inset font-mono text-[11px] space-y-1.5">
                <p>• CIDR Prefix: <strong className="text-white">{results.baseCidr}</strong> (Subnet Mask = {cidrToSubnetMask(baseCidr)})</p>
                <p>• Host Bits: 32 - {baseCidr} = <strong className="text-[#30d158]">{32 - baseCidr} bits</strong></p>
                <p>• Total IP Address Pool: 2^({32 - baseCidr}) = <strong className="text-[#f59e0b]">{results.totalBlockIps.toLocaleString()} IPs</strong></p>
              </div>

              {calcMode === 'vlsm' ? (
                <p className="text-[#f59e0b] text-[11px] pt-1">
                  💡 <strong>VLSM Strategy Rule:</strong> We MUST sort all VLAN requirements by host count in <strong>descending order</strong> (Largest ➔ Smallest). This guarantees subnets fit tightly without overlapping or leaving fragmented gaps!
                </p>
              ) : (
                <p className="text-[#f59e0b] text-[11px] pt-1">
                  💡 <strong>FLSM Strategy Rule:</strong> In Fixed Length Subnet Masking, every subnet is forced to match the size of the <strong>largest VLAN requirement ({Math.max(...subnets.map(v=>v.hosts))} hosts)</strong>.
                </p>
              )}
            </div>
          </div>
        )}

        {/* REVEAL EACH SUBNET CALCULATION STEP DYNAMICALLY */}
        {results.subnets.map((sub, idx) => {
          const stepNum = idx + 2; // Step 2, Step 3, Step 4, etc.
          if (currentStepIndex < stepNum) return null;

          return (
            <div 
              key={sub.id || idx}
              className="neumorphic-card p-5 space-y-3 animate-in fade-in duration-300"
            >
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-[#f59e0b] font-semibold flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#30d158]/10 text-[#30d158] text-[10px]">STEP {stepNum}</span>
                  Subnetting {sub.name} ({sub.requestedHosts} Hosts Needed)
                </span>
                <span className="text-[#30d158] font-mono text-[11px] font-bold">
                  Assigned: {sub.networkAddress}{sub.prefix}
                </span>
              </div>

              <div className="space-y-3 font-sans text-xs text-white/80">
                <p>Here is how we calculate the exact subnet parameters for <strong className="text-white">{sub.name}</strong>:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                  
                  {/* Part A: Host Bits Formula */}
                  <div className="p-3.5 rounded-xl neumorphic-card-inset space-y-1">
                    <span className="text-white/40 font-semibold text-[10px] block">A. FIND HOST BITS (H)</span>
                    <p>Hosts Needed: {sub.requestedHosts}</p>
                    <p>Total (+2 for NA & BA): {sub.requestedHosts + 2} IPs</p>
                    <p className="text-[#f59e0b]">Smallest Power: 2^{sub.hostBits} = {sub.blockSize} IPs</p>
                    <p className="text-[#30d158] font-bold pt-1 border-t border-white/[0.05]">⇒ H = {sub.hostBits} Host Bits</p>
                  </div>

                  {/* Part B: CIDR & Subnet Mask */}
                  <div className="p-3.5 rounded-xl neumorphic-card-inset space-y-1">
                    <span className="text-white/40 font-semibold text-[10px] block">B. CALCULATE MASKS (SM & WM)</span>
                    <p>CIDR Prefix: 32 - {sub.hostBits} = <strong className="text-[#f59e0b]">/{sub.cidr}</strong></p>
                    <p>Subnet Mask (SM): <strong className="text-[#30d158]">{sub.subnetMask}</strong></p>
                    <p>Wildcard Mask (WM): <strong className="text-[#f59e0b]">{sub.wildcardMask}</strong></p>
                  </div>

                  {/* Part C: Network & Broadcast Addresses */}
                  <div className="p-3.5 rounded-xl neumorphic-card-inset space-y-1">
                    <span className="text-white/40 font-semibold text-[10px] block">C. BOUNDARIES (NA & BA)</span>
                    <p>Network Address (NA): <strong className="text-[#f59e0b]">{sub.networkAddress}</strong></p>
                    <p>Broadcast Address (BA): <strong className="text-[#7c4dff]">{sub.broadcastAddress}</strong></p>
                    <p className="text-white/40 text-[10px]">Block Size: {sub.blockSize} IPs</p>
                  </div>

                  {/* Part D: Usable Range & Gateway */}
                  <div className="p-3.5 rounded-xl neumorphic-card-inset space-y-1">
                    <span className="text-white/40 font-semibold text-[10px] block">D. USABLE RANGE & GATEWAY</span>
                    <p>Gateway IP (First): <strong className="text-[#30d158]">{sub.firstUsable}</strong></p>
                    <p>Last Usable IP: <strong className="text-[#30d158]">{sub.lastUsable}</strong></p>
                    <p className="text-[#f59e0b] font-bold pt-1 border-t border-white/[0.05]">Usable Hosts: {sub.totalUsable}</p>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* FINAL STEP: SUMMARY & OVERVIEW */}
        {currentStepIndex >= totalSteps && (
          <div className="neumorphic-card p-5 border border-[#30d158]/30 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-[#30d158] font-semibold text-sm border-b border-white/[0.04] pb-2">
              <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
              <span>Final Lesson Summary ({calcMode.toUpperCase()} Subnetting Complete)</span>
            </div>

            <div className="space-y-2.5 text-white/80 font-sans text-xs leading-relaxed">
              <p>
                Congratulations! You have successfully calculated all subnets for your network:
              </p>

              <div className="p-3.5 rounded-xl neumorphic-card-inset font-mono text-[11px] space-y-1">
                {results.subnets.map(s => (
                  <p key={s.id}>
                    • <strong>{s.name}</strong>: NA = <span className="text-[#f59e0b]">{s.networkAddress}{s.prefix}</span> | SM = <span className="text-[#30d158]">{s.subnetMask}</span> | Usable = {s.usableRange}
                  </p>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/20 text-[#30d158] text-[11px] font-mono">
                Total Allocated IPs: {results.totalAllocatedIps.toLocaleString()} IPs | Free Remaining IP Pool: {results.freeIps.toLocaleString()} IPs
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
