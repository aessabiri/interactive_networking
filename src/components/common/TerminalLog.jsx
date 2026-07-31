import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function TerminalLog({ logs = [], onClear }) {
  const containerRef = useRef(null);

  // Scroll ONLY the internal console log container to bottom without scrolling main browser window
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getTagColor = (tag) => {
    switch (tag?.toUpperCase()) {
      case 'DHCP': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'DNS': return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      case 'KERBEROS': return 'bg-purple-950 text-purple-400 border-purple-800';
      case 'ARP': return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'ROUTER': return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'DC': return 'bg-red-950 text-red-400 border-red-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden flex flex-col h-48">
      {/* Header */}
      <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Network Event Console Log</span>
          <span className="text-[10px] text-slate-500 font-mono">({logs.length} events)</span>
        </div>
        {onClear && (
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
            title="Clear Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Log Entries Container (Internal Scroll Only) */}
      <div ref={containerRef} className="p-3 overflow-y-auto font-mono text-xs space-y-1.5 flex-1 bg-slate-950/80">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-4 text-[11px]">
            Ready. Execute a simulation step to view real-time wire logs.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 text-slate-300 hover:bg-slate-900/50 p-1 rounded transition-colors">
              <span className="text-slate-500 text-[10px] select-none">{log.time || '12:00:00'}</span>
              {log.tag && (
                <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${getTagColor(log.tag)} select-none`}>
                  {log.tag}
                </span>
              )}
              <span className="flex-1 text-[11px] leading-relaxed">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
