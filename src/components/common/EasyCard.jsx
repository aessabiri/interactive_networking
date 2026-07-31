import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Globe, Server, Laptop, Router, Zap, ChevronDown, ChevronUp, Sliders, Activity } from 'lucide-react';

export function CleanHeader({ title, subtitle, icon: Icon = Sparkles }) {
  return (
    <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 flex items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-sm">
              🌱 Clean Mode
            </span>
            <h2 className="text-xl font-black text-slate-100">{title}</h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias for EasyHeader
export const EasyHeader = CleanHeader;

export function CleanInfoBanner({ ip, protocol, port, status, actionTitle, actionDesc, stepNumber, totalSteps }) {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-slate-900/90 space-y-4 shadow-2xl font-sans relative overflow-hidden">
      
      {/* GLOW DECORATION */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* COLORFUL BASIC INFO BADGES (IP, PROTOCOL, PORT, STATUS) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        
        {/* Step Badge */}
        {stepNumber !== undefined && stepNumber > 0 && (
          <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 border border-emerald-300 animate-pulse">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Stage {stepNumber} of {totalSteps}</span>
          </span>
        )}
        {stepNumber === 0 && (
          <span className="px-4 py-2 rounded-2xl bg-slate-800 text-emerald-300 font-bold text-sm shadow flex items-center gap-1.5 border border-slate-700">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Ready to Start</span>
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2.5 font-mono">
          {ip && (
            <div className="px-4 py-2 rounded-2xl bg-cyan-950/90 text-cyan-300 border border-cyan-600/80 shadow flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">IP / Host:</span>
              <span className="text-base font-black">{ip}</span>
            </div>
          )}

          {protocol && (
            <div className="px-4 py-2 rounded-2xl bg-purple-950/90 text-purple-300 border border-purple-600/80 shadow flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Protocol:</span>
              <span className="text-base font-black">{protocol}</span>
            </div>
          )}

          {port !== undefined && port !== null && (
            <div className="px-4 py-2 rounded-2xl bg-amber-950/90 text-amber-300 border border-amber-600/80 shadow flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Port:</span>
              <span className="text-base font-black">{port}</span>
            </div>
          )}

          {status && (
            <div className="px-4 py-2 rounded-2xl bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 shadow flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
              <span className="text-base font-black">{status}</span>
            </div>
          )}
        </div>
      </div>

      {/* PLAIN ENGLISH ACTION TITLE & EXPLANATION */}
      <div className="space-y-1.5 p-4.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-inner">
        <h3 className="text-lg font-black text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{actionTitle}</span>
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {actionDesc}
        </p>
      </div>
    </div>
  );
}

// Backward compatibility alias for EasyInfoBanner
export const EasyInfoBanner = CleanInfoBanner;

// STYLISH SLIDE-OUT COLLAPSIBLE TECHNICAL INSPECTOR FOR CLEAN MODE
export function SlideOutInspector({ title = "Slide Out Technical Deep Dive & Wire Logs", children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all duration-300 shadow-xl font-mono">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border-b border-slate-800"
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="font-black text-slate-100">{title}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-extrabold">
            {isOpen ? 'Expanded' : 'Collapsed'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold text-xs">
          <span>{isOpen ? 'Hide Technical Details' : 'Slide Out Technical Details'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 animate-bounce" />}
        </div>
      </button>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1400px] opacity-100 p-5' : 'max-h-0 opacity-0 overflow-hidden p-0'}`}>
        {children}
      </div>
    </div>
  );
}
