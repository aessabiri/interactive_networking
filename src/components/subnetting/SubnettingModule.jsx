import React, { useState } from 'react';
import { 
  calculateVlsm, 
  calculateFlsm 
} from '../../utils/subnetCalculator';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Globe, 
  Layers, 
  Sliders, 
  Info,
  CheckCircle2
} from 'lucide-react';

export default function SubnettingModule() {
  // Base Network Input (e.g., 172.16.0.0/18 or 192.168.1.0/24)
  const [networkInput, setNetworkInput] = useState('172.16.0.0/18');
  const [calcMode, setCalcMode] = useState('vlsm'); // 'vlsm' or 'flsm'
  const [selectedSubnetId, setSelectedSubnetId] = useState(1);

  // Dynamic VLAN / Subnet Requirements List
  const [subnets, setSubnets] = useState([
    { id: 1, name: 'VLAN 10 - Sales', hosts: 900 },
    { id: 2, name: 'VLAN 20 - Engineering', hosts: 450 },
    { id: 3, name: 'VLAN 30 - Management', hosts: 300 },
    { id: 4, name: 'VLAN 40 - Guest WiFi', hosts: 200 },
  ]);

  // Parse IP and CIDR prefix
  const parseNetworkInput = () => {
    const parts = networkInput.trim().split('/');
    let ip = parts[0] || '192.168.1.0';
    let cidr = parseInt(parts[1], 10);

    if (isNaN(cidr) || cidr < 0 || cidr > 30) {
      cidr = 24;
    }

    const ipParts = ip.split('.').map(n => parseInt(n, 10));
    if (ipParts.length !== 4 || ipParts.some(n => isNaN(n) || n < 0 || n > 255)) {
      ip = '192.168.1.0';
    }

    return { ip, cidr };
  };

  const { ip: baseIp, cidr: baseCidr } = parseNetworkInput();

  // Calculate results for VLSM or FLSM
  const calcResults = calcMode === 'vlsm' 
    ? calculateVlsm(baseIp, baseCidr, subnets)
    : calculateFlsm(baseIp, baseCidr, subnets);

  // Subnet management
  const handleAddVlan = () => {
    const nextId = subnets.length > 0 ? Math.max(...subnets.map(s => s.id)) + 1 : 1;
    setSubnets([...subnets, { id: nextId, name: `VLAN ${nextId * 10}`, hosts: 50 }]);
  };

  const handleRemoveVlan = (id) => {
    if (subnets.length <= 1) return;
    setSubnets(subnets.filter(s => s.id !== id));
  };

  const handleUpdateVlan = (id, field, value) => {
    setSubnets(subnets.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          [field]: field === 'hosts' ? Math.max(1, parseInt(value, 10) || 1) : value 
        };
      }
      return s;
    }));
  };

  // Preset exercises
  const applyPreset = (type) => {
    if (type === 'classroom') {
      setNetworkInput('172.16.0.0/18');
      setSubnets([
        { id: 1, name: 'VLAN 10 - Sales', hosts: 900 },
        { id: 2, name: 'VLAN 20 - Engineering', hosts: 450 },
        { id: 3, name: 'VLAN 30 - Management', hosts: 300 },
        { id: 4, name: 'VLAN 40 - Guest WiFi', hosts: 200 },
      ]);
    } else if (type === 'office') {
      setNetworkInput('192.168.1.0/24');
      setSubnets([
        { id: 1, name: 'VLAN 10 - Desktops', hosts: 100 },
        { id: 2, name: 'VLAN 20 - VoIP Phones', hosts: 50 },
        { id: 3, name: 'VLAN 30 - Servers', hosts: 14 },
        { id: 4, name: 'VLAN 99 - Mgmt', hosts: 6 },
      ]);
    } else if (type === 'campus') {
      setNetworkInput('10.0.0.0/16');
      setSubnets([
        { id: 1, name: 'VLAN 100 - HQ Main', hosts: 2000 },
        { id: 2, name: 'VLAN 200 - Data Center', hosts: 1000 },
        { id: 3, name: 'VLAN 300 - Branch WAN', hosts: 250 },
        { id: 4, name: 'VLAN 400 - DMZ', hosts: 60 },
      ]);
    }
  };

  const selectedSubnetResult = calcResults.subnets.find(s => s.id === selectedSubnetId) || calcResults.subnets[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
      
      {/* 🚀 TOP HEADER & PRESETS */}
      <div className="frameless-card p-5 border border-white/[0.06] bg-[#0c1019]/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                SUBNETTING WORKBENCH
              </span>
              <h2 className="text-base font-semibold text-white/90 tracking-tight">
                FLSM & VLSM Step-by-Step Calculator
              </h2>
            </div>
            <p className="text-xs text-white/40 font-sans mt-0.5">
              Enter your base IP & prefix, add your VLAN host requirements, and view step-by-step calculations (NA, BA, SM, Usable Range).
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-white/40 text-[11px] mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('classroom')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-cyan-300 border border-white/[0.06] transition-all cursor-pointer"
          >
            Classroom (/18)
          </button>
          <button
            onClick={() => applyPreset('office')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-emerald-300 border border-white/[0.06] transition-all cursor-pointer"
          >
            Office (/24)
          </button>
          <button
            onClick={() => applyPreset('campus')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-purple-300 border border-white/[0.06] transition-all cursor-pointer"
          >
            Campus (/16)
          </button>
        </div>
      </div>

      {/* ⚙️ NETWORK INPUT & VLAN REQUIREMENT BUILDER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT (5 COLS): BASE IP & MODE TOGGLE */}
        <div className="lg:col-span-5 frameless-card p-5 border border-white/[0.06] bg-[#0c1019]/70 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              1. Base Network Input
            </h3>
            
            {/* VLSM / FLSM Toggle */}
            <div className="apple-segmented-control text-xs">
              <button
                onClick={() => setCalcMode('vlsm')}
                className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  calcMode === 'vlsm'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                VLSM
              </button>
              <button
                onClick={() => setCalcMode('flsm')}
                className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  calcMode === 'flsm'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                FLSM
              </button>
            </div>
          </div>

          {/* Network IP / CIDR Input */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/60 font-medium">Base Network Address / CIDR Prefix</label>
            <input
              type="text"
              value={networkInput}
              onChange={(e) => setNetworkInput(e.target.value)}
              placeholder="e.g. 172.16.0.0/18 or 192.168.1.0/24"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <p className="text-[11px] text-white/40 font-mono">
              Total Block Size: <strong className="text-white/90">{calcResults.totalBlockIps.toLocaleString()} IPs</strong> ({baseIp}/{baseCidr})
            </p>
          </div>

          {/* Info Card */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white/60 space-y-1">
            <p className="font-semibold text-white/80 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              {calcMode === 'vlsm' ? 'VLSM Mode (Variable Length)' : 'FLSM Mode (Fixed Length)'}
            </p>
            <p className="text-[11px] leading-relaxed">
              {calcMode === 'vlsm'
                ? 'Subnets are sized dynamically from largest to smallest host count to eliminate IP waste.'
                : 'All subnets share a fixed mask based on the largest host requirement.'}
            </p>
          </div>
        </div>

        {/* RIGHT (7 COLS): VLAN & HOST LIST */}
        <div className="lg:col-span-7 frameless-card p-5 border border-white/[0.06] bg-[#0c1019]/70 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              2. VLAN Host Requirements ({subnets.length} Subnets)
            </h3>

            <button
              onClick={handleAddVlan}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add VLAN</span>
            </button>
          </div>

          {/* Subnet Input Rows */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {subnets.map((sub, idx) => (
              <div 
                key={sub.id} 
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-white/[0.05] text-white/50 text-xs font-mono flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>

                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => handleUpdateVlan(sub.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] text-white/90 text-xs font-medium focus:outline-none focus:border-cyan-500/40"
                  placeholder="VLAN Name"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/40 font-mono">Hosts:</span>
                  <input
                    type="number"
                    min="1"
                    value={sub.hosts}
                    onChange={(e) => handleUpdateVlan(sub.id, 'hosts', e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] text-cyan-300 font-mono text-xs text-right font-semibold focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <button
                  onClick={() => handleRemoveVlan(sub.id)}
                  disabled={subnets.length <= 1}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Remove Subnet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 VISUAL BLOCK PARTITION BAR */}
      <div className="frameless-card p-5 border border-white/[0.06] bg-[#0c1019]/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono">
          <span className="font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            3. Address Space Partitioning ({calcResults.baseIp}{calcResults.baseCidr})
          </span>
          <div className="text-white/50 flex items-center gap-4 text-[11px]">
            <span>Total: <strong className="text-white">{calcResults.totalBlockIps.toLocaleString()} IPs</strong></span>
            <span>Allocated: <strong className="text-cyan-300">{calcResults.totalAllocatedIps.toLocaleString()} IPs</strong></span>
            <span>Free: <strong className="text-emerald-300">{calcResults.freeIps.toLocaleString()} IPs</strong></span>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="h-9 w-full bg-black/40 rounded-xl border border-white/[0.06] p-1 flex items-center gap-1 overflow-hidden font-mono text-[10px]">
          {calcResults.subnets.map((sub, idx) => {
            const pct = (sub.blockSize / calcResults.totalBlockIps) * 100;
            const isSelected = sub.id === selectedSubnetResult?.id;

            return (
              <button
                key={sub.id || idx}
                onClick={() => setSelectedSubnetId(sub.id)}
                style={{ width: `${Math.max(pct, 4)}%` }}
                className={`h-full rounded-lg transition-all cursor-pointer flex items-center justify-center px-2 truncate border font-medium ${
                  idx % 4 === 0 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200' :
                  idx % 4 === 1 ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200' :
                  idx % 4 === 2 ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' :
                  'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                } ${isSelected ? 'ring-2 ring-white/80 shadow-md font-semibold' : 'opacity-70 hover:opacity-100'}`}
              >
                <span>{sub.name} ({sub.prefix})</span>
              </button>
            );
          })}

          {/* Unallocated Space */}
          {calcResults.freeIps > 0 && (
            <div
              style={{ width: `${(calcResults.freeIps / calcResults.totalBlockIps) * 100}%` }}
              className="h-full rounded-lg bg-white/[0.02] border border-white/[0.04] text-white/40 font-mono text-[10px] flex items-center justify-center truncate px-2"
            >
              Unallocated ({calcResults.freeIps.toLocaleString()} IPs)
            </div>
          )}
        </div>
      </div>

      {/* 🛠️ STEP-BY-STEP CALCULATION GUIDE (NA, BA, SM, USABLE RANGE) */}
      {selectedSubnetResult && (
        <div className="frameless-card p-6 border border-white/[0.06] bg-[#0c1019]/80 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                4. STEP-BY-STEP CALCULATION GUIDE
              </span>
              <span className="text-white/90 font-semibold text-sm">{selectedSubnetResult.name} ({selectedSubnetResult.requestedHosts} Hosts)</span>
            </div>
            <div className="text-xs font-mono text-cyan-300 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.06]">
              Subnet Block: <strong>{selectedSubnetResult.networkAddress}{selectedSubnetResult.prefix}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {/* STEP 1: HOST BITS (H) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <div className="text-white/40 font-medium flex items-center justify-between text-[10px]">
                <span>STEP 1: HOST BITS (H)</span>
                <span className="text-cyan-400">2^H - 2 ≥ Hosts</span>
              </div>
              <div className="text-white/80 space-y-1">
                <p>Req. Hosts: <strong className="text-white">{selectedSubnetResult.requestedHosts}</strong></p>
                <p>Total needed (+2): <strong className="text-white">{selectedSubnetResult.requestedHosts + 2}</strong> IPs</p>
                <p className="text-cyan-300">2^{selectedSubnetResult.hostBits} = {selectedSubnetResult.blockSize} ≥ {selectedSubnetResult.requestedHosts + 2}</p>
                <p className="text-emerald-400 font-semibold pt-1 border-t border-white/[0.05]">⇒ H = {selectedSubnetResult.hostBits} Host Bits</p>
              </div>
            </div>

            {/* STEP 2: SUBNET MASK (SM) & WILDCARD MASK (WM) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <div className="text-white/40 font-medium flex items-center justify-between text-[10px]">
                <span>STEP 2: MASKS (SM & WM)</span>
                <span className="text-cyan-400">CIDR = 32 - H</span>
              </div>
              <div className="text-white/80 space-y-1">
                <p>CIDR Prefix: 32 - {selectedSubnetResult.hostBits} = <strong className="text-cyan-300">/{selectedSubnetResult.cidr}</strong></p>
                <p>Subnet Mask (SM):</p>
                <p className="font-semibold text-emerald-300 text-xs">{selectedSubnetResult.subnetMask}</p>
                <p>Wildcard Mask (WM):</p>
                <p className="font-semibold text-amber-300 text-xs">{selectedSubnetResult.wildcardMask}</p>
              </div>
            </div>

            {/* STEP 3: NETWORK ADDRESS (NA) & BROADCAST ADDRESS (BA) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <div className="text-white/40 font-medium flex items-center justify-between text-[10px]">
                <span>STEP 3: BOUNDARIES (NA & BA)</span>
                <span className="text-cyan-400">Block Sizing</span>
              </div>
              <div className="text-white/80 space-y-1">
                <p>Network Address (NA):</p>
                <p className="font-semibold text-cyan-300 text-xs">{selectedSubnetResult.networkAddress}</p>
                <p>Broadcast Address (BA):</p>
                <p className="font-semibold text-indigo-300 text-xs">{selectedSubnetResult.broadcastAddress}</p>
                <p className="text-white/40 text-[10px]">Block Size: {selectedSubnetResult.blockSize} IPs</p>
              </div>
            </div>

            {/* STEP 4: USABLE HOST RANGE & DEFAULT GATEWAY (GW) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <div className="text-white/40 font-medium flex items-center justify-between text-[10px]">
                <span>STEP 4: USABLE RANGE & GW</span>
                <span className="text-cyan-400">First to Last</span>
              </div>
              <div className="text-white/80 space-y-1">
                <p>Gateway IP (GW): <strong className="text-emerald-300">{selectedSubnetResult.firstUsable}</strong></p>
                <p>Last Usable IP: <strong className="text-emerald-300">{selectedSubnetResult.lastUsable}</strong></p>
                <p className="text-cyan-300 font-semibold pt-1 border-t border-white/[0.05]">Usable Hosts: {selectedSubnetResult.totalUsable}</p>
                <p className="text-amber-300/80 text-[10px]">Wasted Overhead: {selectedSubnetResult.wastedIps} IPs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 CALCULATION MATRIX TABLE */}
      <div className="frameless-card p-6 border border-white/[0.06] bg-[#0c1019]/80 space-y-4">
        <div className="flex items-center justify-between font-mono text-xs border-b border-white/[0.06] pb-3">
          <span className="font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            5. Subnet Calculation Matrix ({calcMode.toUpperCase()})
          </span>
          <span className="text-white/40 text-[11px]">
            Click any row to view step-by-step formula breakdown
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06] text-white/40 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">VLAN / Subnet</th>
                <th className="py-3 px-4 text-right">Req. Hosts</th>
                <th className="py-3 px-4">CIDR</th>
                <th className="py-3 px-4">Subnet Mask (SM)</th>
                <th className="py-3 px-4">Wildcard Mask (WM)</th>
                <th className="py-3 px-4">Network Address (NA)</th>
                <th className="py-3 px-4">Broadcast Address (BA)</th>
                <th className="py-3 px-4">Usable Host Range</th>
                <th className="py-3 px-4 text-right">Usable IPs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] bg-transparent">
              {calcResults.subnets.map((sub, idx) => {
                const isSelected = sub.id === selectedSubnetResult?.id;

                return (
                  <tr
                    key={sub.id || idx}
                    onClick={() => setSelectedSubnetId(sub.id)}
                    className={`transition-colors cursor-pointer hover:bg-white/[0.04] ${
                      isSelected ? 'bg-cyan-500/10 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        idx % 4 === 0 ? 'bg-cyan-400' :
                        idx % 4 === 1 ? 'bg-indigo-400' :
                        idx % 4 === 2 ? 'bg-purple-400' :
                        'bg-emerald-400'
                      }`} />
                      <span className="text-white/90">{sub.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-300">{sub.requestedHosts}</td>
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{sub.prefix}</td>
                    <td className="py-3 px-4 text-white/80">{sub.subnetMask}</td>
                    <td className="py-3 px-4 text-amber-300/80">{sub.wildcardMask}</td>
                    <td className="py-3 px-4 text-cyan-300 font-mono">{sub.networkAddress}</td>
                    <td className="py-3 px-4 text-indigo-300 font-mono">{sub.broadcastAddress}</td>
                    <td className="py-3 px-4 text-emerald-300/80">{sub.usableRange}</td>
                    <td className="py-3 px-4 text-right font-semibold text-white/90">{sub.totalUsable}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
