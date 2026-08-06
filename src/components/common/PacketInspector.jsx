import React from 'react';
import { Eye, Shield, HardDrive, Layers, ArrowRight } from 'lucide-react';

export default function PacketInspector({ activeStep, packetData, stepTitle, stepDescription }) {
  if (!packetData) {
    return (
      <div className="frameless-card p-6 border border-white/[0.06] text-white/50 text-xs flex flex-col items-center justify-center min-h-[160px] text-center space-y-2">
        <Eye className="w-6 h-6 text-white/30 animate-pulse" />
        <p className="font-semibold text-white/80">Packet Payload Inspector</p>
        <p className="text-white/40 max-w-sm">Select a step or start an animation to inspect Ethernet frames & IP packets passing through the wire.</p>
      </div>
    );
  }

  return (
    <div className="frameless-card p-5 border border-white/[0.06] space-y-4">
      {/* Step Banner */}
      <div className="flex items-start justify-between bg-white/[0.03] p-3 rounded-xl border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              STEP {activeStep}
            </span>
            <h4 className="font-semibold text-sm text-cyan-300">{stepTitle}</h4>
          </div>
          <p className="text-xs text-white/70 mt-1 leading-relaxed">{stepDescription}</p>
        </div>
      </div>

      {/* OSI Protocol Stack Layers */}
      <div className="space-y-2 font-mono text-xs">
        {/* Layer 2: Data Link */}
        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-purple-300 font-semibold border-b border-white/[0.05] pb-1.5">
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Layer 2 - Data Link (Ethernet Frame)</span>
            <span className="text-white/40 font-normal">EtherType: {packetData.etherType || '0x0800 (IPv4)'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-white/80 pt-1 text-[11px]">
            <div><span className="text-white/40">Src MAC:</span> {packetData.srcMac || '00:1A:2B:3C:4D:5E'}</div>
            <div><span className="text-white/40">Dst MAC:</span> {packetData.dstMac || 'FF:FF:FF:FF:FF:FF'}</div>
          </div>
        </div>

        {/* Layer 3: Network */}
        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-blue-300 font-semibold border-b border-white/[0.05] pb-1.5">
            <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Layer 3 - Network (IPv4 Packet)</span>
            <span className="text-white/40 font-normal">TTL: {packetData.ttl || 128}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-white/80 pt-1 text-[11px]">
            <div><span className="text-white/40">Src IP:</span> <span className="text-cyan-300 font-medium">{packetData.srcIp}</span></div>
            <div><span className="text-white/40">Dst IP:</span> <span className="text-cyan-300 font-medium">{packetData.dstIp}</span></div>
          </div>
        </div>

        {/* Layer 4: Transport */}
        {packetData.protocol && (
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold border-b border-white/[0.05] pb-1.5">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Layer 4 - Transport ({packetData.protocol})</span>
              <span className="text-white/40 font-normal">Port {packetData.srcPort} → {packetData.dstPort}</span>
            </div>
          </div>
        )}

        {/* Application Payload */}
        {packetData.payload && (
          <div className="bg-cyan-500/[0.05] p-3 rounded-xl border border-cyan-500/20 flex flex-col gap-2">
            <div className="text-[11px] text-amber-300 font-semibold border-b border-cyan-500/10 pb-1.5 flex items-center justify-between">
              <span>Application Payload Data</span>
              <span className="text-white/40 text-[10px]">{packetData.type}</span>
            </div>
            <pre className="text-[10px] text-cyan-200 overflow-x-auto whitespace-pre-wrap font-mono p-2.5 bg-black/40 rounded-lg border border-white/[0.06]">
              {JSON.stringify(packetData.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
