import React, { useState } from 'react';
import { 
  calculateVlsm, 
  calculateFlsm, 
  ipToNum, 
  numToIp, 
  cidrToSubnetMask, 
  cidrToWildcardMask,
  getRequiredBitsForHosts 
} from '../../utils/subnetCalculator';
import { Network, Layers, BarChart3, Calculator, RotateCcw, CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';

export default function SubnettingModule({ appMode = 'clean' }) {
  // Default classroom exercise values as requested by user
  const initialBaseIp = '172.160.0.0';
  const initialBaseCidr = 18;
  const initialSubnets = [
    { id: 1, name: 'LAN 1', hosts: 900, color: 'border-cyan-500 bg-cyan-950/60 text-cyan-300' },
    { id: 2, name: 'LAN 2', hosts: 450, color: 'border-indigo-500 bg-indigo-950/60 text-indigo-300' },
    { id: 3, name: 'LAN 3', hosts: 300, color: 'border-purple-500 bg-purple-950/60 text-purple-300' },
    { id: 4, name: 'LAN 4', hosts: 200, color: 'border-emerald-500 bg-emerald-950/60 text-emerald-300' },
  ];

  const [calcMode, setCalcMode] = useState('vlsm'); // 'vlsm' or 'flsm'
  const [baseIp, setBaseIp] = useState(initialBaseIp);
  const [baseCidr, setBaseCidr] = useState(initialBaseCidr);
  const [subnets, setSubnets] = useState(initialSubnets);
  const [selectedSubnetId, setSelectedSubnetId] = useState(1);

  // Perform calculation depending on mode
  const calcResults = calcMode === 'vlsm' 
    ? calculateVlsm(baseIp, baseCidr, subnets)
    : calculateFlsm(baseIp, baseCidr, subnets);

  // Reset to default classroom exercise
  const handleReset = () => {
    setBaseIp(initialBaseIp);
    setBaseCidr(initialBaseCidr);
    setSubnets(initialSubnets);
    setSelectedSubnetId(1);
  };

  const selectedSubnetResult = calcResults.subnets.find(s => s.id === selectedSubnetId) || calcResults.subnets[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
      
      {/* 🚀 HEADER & MODE TOGGLE */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-950 text-cyan-300 border border-cyan-800">
                IP SUBNETTING WORKBENCH
              </span>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">
                FLSM & VLSM Calculator Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Classroom Exercise: Partitioning {baseIp}/{baseCidr} across LAN 1 (900h), LAN 2 (450h), LAN 3 (300h), LAN 4 (200h).
            </p>
          </div>
        </div>

        {/* CONTROLS & MODE TABS */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setCalcMode('vlsm')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                calcMode === 'vlsm'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VLSM (Variable Length)
            </button>
            <button
              onClick={() => setCalcMode('flsm')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                calcMode === 'flsm'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FLSM (Fixed Length)
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset to Exercise Defaults"
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 📊 VISUAL IP BLOCK SPACE PARTITIONING BAR */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-slate-200 uppercase tracking-wider">
              {calcMode.toUpperCase()} Visual Address Block Map ({calcResults.baseIp}{calcResults.baseCidr})
            </span>
          </div>
          <div className="text-slate-400 flex items-center gap-3">
            <span>Total Block: <strong className="text-slate-100">{calcResults.totalBlockIps.toLocaleString()} IPs</strong></span>
            <span>Allocated: <strong className="text-cyan-400">{calcResults.totalAllocatedIps.toLocaleString()} IPs</strong></span>
            <span>Free: <strong className="text-emerald-400">{calcResults.freeIps.toLocaleString()} IPs</strong></span>
          </div>
        </div>

        {/* BAR CHART GRAPHIC */}
        <div className="h-10 w-full bg-slate-950 rounded-2xl border border-slate-800 p-1 flex items-center gap-1 overflow-hidden shadow-inner">
          {calcResults.subnets.map((sub, idx) => {
            const pct = (sub.blockSize / calcResults.totalBlockIps) * 100;
            const isSelected = sub.id === selectedSubnetResult?.id;

            return (
              <div
                key={sub.id || idx}
                onClick={() => setSelectedSubnetId(sub.id)}
                style={{ width: `${Math.max(pct, 4)}%` }}
                className={`h-full rounded-xl transition-all cursor-pointer flex items-center justify-center relative group px-2 font-mono text-[10px] font-black truncate border ${
                  idx === 0 ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200' :
                  idx === 1 ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200' :
                  idx === 2 ? 'bg-purple-600/30 border-purple-400 text-purple-200' :
                  'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                } ${isSelected ? 'ring-2 ring-white shadow-lg' : 'opacity-80 hover:opacity-100'}`}
              >
                <span>{sub.name} ({sub.prefix})</span>
              </div>
            );
          })}

          {/* UNALLOCATED / FREE SPACE BAR */}
          {calcResults.freeIps > 0 && (
            <div
              style={{ width: `${(calcResults.freeIps / calcResults.totalBlockIps) * 100}%` }}
              className="h-full rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-500 font-mono text-[10px] font-bold flex items-center justify-center truncate px-2"
            >
              Unallocated Pool ({calcResults.freeIps.toLocaleString()} IPs)
            </div>
          )}
        </div>

        {/* COMPARISON METRIC FOOTNOTE */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            {calcMode === 'vlsm' ? (
              <span><strong>VLSM Mode:</strong> Subnets are sized variable-length ({calcResults.subnets.map(s => `${s.name}: ${s.prefix}`).join(', ')}). High IP efficiency!</span>
            ) : (
              <span><strong>FLSM Mode:</strong> All subnets forced to fixed size ({calcResults.subnets[0]?.prefix} based on max requirement {subnets[0]?.hosts}h). Wastes space!</span>
            )}
          </span>
          <span className="text-amber-400">
            Wasted Subnet Overhead: <strong>{calcResults.totalWastedIps.toLocaleString()} IPs</strong>
          </span>
        </div>
      </div>

      {/* 📐 STEP-BY-STEP MATHEMATICAL CALCULATION BREAKDOWN */}
      {selectedSubnetResult && (
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                MATHEMATICAL FORMULA & CALCULATION STEPS
              </span>
              <span className="text-slate-300 font-black text-base">{selectedSubnetResult.name} ({selectedSubnetResult.requestedHosts} Hosts Needed)</span>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              Allocated Block: <strong>{selectedSubnetResult.networkAddress}{selectedSubnetResult.prefix}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {/* STEP 1 */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
                <span>STEP 1: HOST BITS (H)</span>
                <span className="text-cyan-400">2^H ≥ Req + 2</span>
              </div>
              <div className="text-slate-200 space-y-1">
                <p>Hosts Needed: <strong>{selectedSubnetResult.requestedHosts}</strong></p>
                <p>Total Addresses: <strong>{selectedSubnetResult.requestedHosts} + 2 = {selectedSubnetResult.requestedHosts + 2}</strong></p>
                <p className="text-cyan-300">Minimum 2^{selectedSubnetResult.hostBits} = {selectedSubnetResult.blockSize} ≥ {selectedSubnetResult.requestedHosts + 2}</p>
                <p className="text-emerald-400 font-bold">⇒ H = {selectedSubnetResult.hostBits} Host Bits</p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
                <span>STEP 2: PREFIX & MASK</span>
                <span className="text-cyan-400">CIDR = 32 - H</span>
              </div>
              <div className="text-slate-200 space-y-1">
                <p>CIDR Prefix: 32 - {selectedSubnetResult.hostBits} = <strong className="text-cyan-300">/{selectedSubnetResult.cidr}</strong></p>
                <p>Subnet Mask: <strong className="text-emerald-400">{selectedSubnetResult.subnetMask}</strong></p>
                <p>Wildcard Mask: <strong className="text-amber-300">{selectedSubnetResult.wildcardMask}</strong></p>
                <p className="text-slate-400">Block Size: {selectedSubnetResult.blockSize} IPs</p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
                <span>STEP 3: NETWORK & BCAST</span>
                <span className="text-cyan-400">Boundary IPs</span>
              </div>
              <div className="text-slate-200 space-y-1">
                <p>Network Address:</p>
                <p className="font-bold text-cyan-300 text-sm">{selectedSubnetResult.networkAddress}</p>
                <p>Broadcast Address:</p>
                <p className="font-bold text-indigo-300 text-sm">{selectedSubnetResult.broadcastAddress}</p>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold flex items-center justify-between text-[11px]">
                <span>STEP 4: USABLE RANGE</span>
                <span className="text-cyan-400">First to Last Usable</span>
              </div>
              <div className="text-slate-200 space-y-1">
                <p>First Usable IP: <strong className="text-emerald-300">{selectedSubnetResult.firstUsable}</strong></p>
                <p>Last Usable IP: <strong className="text-emerald-300">{selectedSubnetResult.lastUsable}</strong></p>
                <p className="text-cyan-400 font-bold">Total Usable IPs: {selectedSubnetResult.totalUsable}</p>
                <p className="text-slate-400">Wasted IPs: {selectedSubnetResult.wastedIps}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 DETAILED RESULTS TABLE FOR ALL SUBNETS */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-slate-200 uppercase tracking-wider">
              {calcMode.toUpperCase()} Calculation Results Matrix
            </span>
          </div>
          <span className="text-slate-400">
            Click any row to view full step-by-step formula breakdown
          </span>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-4">Subnet / LAN</th>
                <th className="py-3 px-4 text-right">Req. Hosts</th>
                <th className="py-3 px-4">CIDR Prefix</th>
                <th className="py-3 px-4">Subnet Mask</th>
                <th className="py-3 px-4">Wildcard Mask</th>
                <th className="py-3 px-4">Network Address</th>
                <th className="py-3 px-4">Broadcast Address</th>
                <th className="py-3 px-4">Usable Host Range</th>
                <th className="py-3 px-4 text-right">Total Usable IPs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {calcResults.subnets.map((sub, idx) => {
                const isSelected = sub.id === selectedSubnetResult?.id;

                return (
                  <tr
                    key={sub.id || idx}
                    onClick={() => setSelectedSubnetId(sub.id)}
                    className={`transition-colors cursor-pointer hover:bg-slate-800/60 ${
                      isSelected ? 'bg-cyan-950/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        idx === 0 ? 'bg-cyan-400' :
                        idx === 1 ? 'bg-indigo-400' :
                        idx === 2 ? 'bg-purple-400' :
                        'bg-emerald-400'
                      }`} />
                      <span className="text-slate-100">{sub.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-300">{sub.requestedHosts}</td>
                    <td className="py-3 px-4 text-cyan-400 font-extrabold">{sub.prefix}</td>
                    <td className="py-3 px-4 text-slate-200">{sub.subnetMask}</td>
                    <td className="py-3 px-4 text-amber-300/90">{sub.wildcardMask}</td>
                    <td className="py-3 px-4 text-cyan-300 font-mono">{sub.networkAddress}</td>
                    <td className="py-3 px-4 text-indigo-300 font-mono">{sub.broadcastAddress}</td>
                    <td className="py-3 px-4 text-emerald-300/90">{sub.usableRange}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-100">{sub.totalUsable}</td>
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
