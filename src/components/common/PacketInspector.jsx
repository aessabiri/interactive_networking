import React from 'react';
import { Eye, Shield, HardDrive, Layers, ArrowRight } from 'lucide-react';

export default function PacketInspector({ activeStep, packetData, stepTitle, stepDescription }) {
  if (!packetData) {
    return (
      <div className="glass-panel p-4 rounded-xl border border-slate-800 text-slate-400 text-xs flex flex-col items-center justify-center min-h-[160px] text-center">
        <Eye className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
        <p className="font-semibold text-slate-300">Packet Payload Inspector</p>
        <p className="text-slate-500 mt-1">Select a step or start an animation to inspect Ethernet frames & IP packets passing through the wire.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
      {/* Step Banner */}
      <div className="flex items-start justify-between bg-slate-900/90 p-3 rounded-lg border border-cyan-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              STEP {activeStep}
            </span>
            <h4 className="font-semibold text-sm text-cyan-300">{stepTitle}</h4>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{stepDescription}</p>
        </div>
      </div>

      {/* OSI Protocol Stack Layers */}
      <div className="space-y-2 font-mono text-xs">
        {/* Layer 2: Data Link */}
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-purple-400 font-semibold border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Layer 2 - Data Link (Ethernet Frame)</span>
            <span className="text-slate-500">EtherType: {packetData.etherType || '0x0800 (IPv4)'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1 text-[11px]">
            <div><span className="text-slate-500">Src MAC:</span> {packetData.srcMac || '00:1A:2B:3C:4D:5E'}</div>
            <div><span className="text-slate-500">Dst MAC:</span> {packetData.dstMac || 'FF:FF:FF:FF:FF:FF'}</div>
          </div>
        </div>

        {/* Layer 3: Network */}
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-blue-400 font-semibold border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Layer 3 - Network (IPv4 Packet)</span>
            <span className="text-slate-500">TTL: {packetData.ttl || 128}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1 text-[11px]">
            <div><span className="text-slate-500">Src IP:</span> <span className="text-cyan-300 font-bold">{packetData.srcIp}</span></div>
            <div><span className="text-slate-500">Dst IP:</span> <span className="text-cyan-300 font-bold">{packetData.dstIp}</span></div>
          </div>
        </div>

        {/* Layer 4: Transport */}
        {packetData.protocol && (
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Layer 4 - Transport ({packetData.protocol})</span>
              <span className="text-slate-500">Src Port: {packetData.srcPort} → Dst Port: {packetData.dstPort}</span>
            </div>
          </div>
        )}

        {/* Application Payload */}
        {packetData.payload && (
          <div className="bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/40 flex flex-col gap-1.5">
            <div className="text-[11px] text-amber-400 font-semibold border-b border-cyan-900/40 pb-1 flex items-center justify-between">
              <span>Application Payload Data</span>
              <span className="text-slate-400 text-[10px]">{packetData.type}</span>
            </div>
            <pre className="text-[10px] text-cyan-200 overflow-x-auto whitespace-pre-wrap font-mono p-2 bg-slate-950/80 rounded border border-slate-800">
              {JSON.stringify(packetData.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
