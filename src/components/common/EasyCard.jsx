import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Globe, Server, Laptop, Router, Zap, ChevronDown, ChevronUp, Sliders, Activity, MonitorPlay } from 'lucide-react';

// UNIFIED SUPER-COMPACT CLEAN MODE WIDGET (ZERO SCROLL, SINGLE CARD)
export function CleanWidget({ 
  title, 
  subtitle, 
  icon: Icon = Sparkles,
  ip, 
  protocol, 
  port, 
  status, 
  actionTitle, 
  actionDesc, 
  stepNumber, 
  totalSteps,
  showAnimation = true,
  setShowAnimation
}) {
  return (
    <div className="glass-panel p-4.5 rounded-3xl border border-emerald-500/30 bg-slate-900/95 space-y-3.5 shadow-2xl font-sans relative overflow-hidden">
      
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP ROW: TITLE & COLORFUL BADGES */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        
        {/* Module Title & Clean Mode Tag */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-sm">
                🌱 Clean Mode
              </span>
              <h2 className="text-lg font-black text-slate-100 tracking-tight">{title}</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
          </div>
        </div>

        {/* COLORFUL HIGH-CONTRAST BASIC INFO BADGES */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {ip && (
            <div className="px-3 py-1.5 rounded-xl bg-cyan-950/90 text-cyan-300 border border-cyan-600/80 shadow flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">IP:</span>
              <span className="text-xs font-black text-cyan-200">{ip}</span>
            </div>
          )}

          {protocol && (
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/90 text-purple-300 border border-purple-600/80 shadow flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Proto:</span>
              <span className="text-xs font-black text-purple-200">{protocol}</span>
            </div>
          )}

          {port !== undefined && port !== null && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/90 text-amber-300 border border-amber-600/80 shadow flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Port:</span>
              <span className="text-xs font-black text-amber-200">{port}</span>
            </div>
          )}

          {status && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 shadow flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
              <span className="text-xs font-black text-emerald-200">{status}</span>
            </div>
          )}

          {/* ANIMATION TOGGLE BUTTON AS AN ICON */}
          {setShowAnimation && (
            <button
              onClick={() => setShowAnimation(!showAnimation)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                showAnimation
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle Topology Animation Canvas"
            >
              <MonitorPlay className="w-4 h-4 fill-current" />
              <span>{showAnimation ? 'Hide Canvas 🎬' : 'Show Canvas 🎬'}</span>
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: STAGE PILL & ACTION DESCRIPTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-inner">
        <div className="flex items-center gap-2.5">
          {stepNumber !== undefined && stepNumber > 0 ? (
            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 border border-emerald-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Stage {stepNumber}/{totalSteps}</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-emerald-300 font-bold text-xs shadow flex items-center gap-1 border border-slate-700 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready</span>
            </span>
          )}

          <h3 className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionTitle}</span>
          </h3>
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
          {actionDesc}
        </p>
      </div>
    </div>
  );
}

// Backward compatibility exports
export function CleanHeader({ title, subtitle, icon }) {
  return <CleanWidget title={title} subtitle={subtitle} icon={icon} />;
}
export const EasyHeader = CleanHeader;

export function CleanInfoBanner(props) {
  return <CleanWidget {...props} />;
}
export const EasyInfoBanner = CleanInfoBanner;

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
