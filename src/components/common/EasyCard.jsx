import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Globe, Server, Laptop, Router, Zap, ChevronDown, ChevronUp, Sliders, Activity, MonitorPlay, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

// ROUNDED CIRCLE ICON CONTROL BUTTON FOR CLEAN MODE
export function CleanControlButton({
  icon: Icon = Play,
  label,
  description,
  onClick,
  active = false,
  disabled = false,
  color = 'cyan' // 'emerald', 'cyan', 'amber', 'purple', 'rose'
}) {
  const colorMap = {
    emerald: active ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/30' : 'bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border-slate-700',
    cyan: active ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/30' : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-slate-700',
    amber: active ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30' : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-slate-700',
    purple: active ? 'bg-purple-500 text-slate-950 border-purple-300 shadow-purple-500/30' : 'bg-slate-900/90 hover:bg-slate-800 text-purple-300 border-slate-700',
    rose: active ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30' : 'bg-slate-900/90 hover:bg-slate-800 text-rose-300 border-slate-700'
  };

  const iconBgMap = {
    emerald: active ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60',
    cyan: active ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/60',
    amber: active ? 'bg-slate-950 text-amber-400' : 'bg-amber-950/80 text-amber-400 border border-amber-700/60',
    purple: active ? 'bg-slate-950 text-purple-400' : 'bg-purple-950/80 text-purple-400 border border-purple-700/60',
    rose: active ? 'bg-slate-950 text-rose-400' : 'bg-rose-950/80 text-rose-400 border border-rose-700/60'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer border shadow-lg ${colorMap[color] || colorMap.cyan} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-102 active:scale-98'
      }`}
      title={description ? `${label}: ${description}` : label}
    >
      {/* ROUNDED CIRCLE ICON BADGE */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:rotate-6 ${iconBgMap[color] || iconBgMap.cyan}`}>
        <Icon className="w-4 h-4 fill-current" />
      </div>

      {/* TEXT LABEL & DESCRIPTION */}
      <div className="flex flex-col text-left font-sans pr-1">
        <span className="text-xs font-black tracking-tight leading-tight">{label}</span>
        {description && (
          <span className="text-[9px] font-mono opacity-80 leading-none mt-0.5">{description}</span>
        )}
      </div>
    </button>
  );
}

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
          <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
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

        {/* COLORFUL HIGH-CONTRAST BASIC INFO BUTTONS WITH 2-WORD SUMMARY */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {ip && (
            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950 to-slate-900 text-cyan-300 border border-cyan-500/60 shadow-lg flex items-center gap-2 hover:border-cyan-400 transition-all cursor-default">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 shrink-0">
                <Globe className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">IP Address</span>
                <span className="text-xs font-black text-cyan-200 mt-0.5">{ip}</span>
              </div>
            </div>
          )}

          {protocol && (
            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-950 to-slate-900 text-purple-300 border border-purple-500/60 shadow-lg flex items-center gap-2 hover:border-purple-400 transition-all cursor-default">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-400/40 shrink-0">
                <Zap className="w-3 h-3 text-purple-400" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Protocol</span>
                <span className="text-xs font-black text-purple-200 mt-0.5">{protocol}</span>
              </div>
            </div>
          )}

          {port !== undefined && port !== null && (
            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950 to-slate-900 text-amber-300 border border-amber-500/60 shadow-lg flex items-center gap-2 hover:border-amber-400 transition-all cursor-default">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/40 shrink-0">
                <Server className="w-3 h-3 text-amber-400" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Port</span>
                <span className="text-xs font-black text-amber-200 mt-0.5">{port}</span>
              </div>
            </div>
          )}

          {status && (
            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-950 to-slate-900 text-emerald-300 border border-emerald-500/60 shadow-lg flex items-center gap-2 hover:border-emerald-400 transition-all cursor-default">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40 shrink-0">
                <Shield className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">State Info</span>
                <span className="text-xs font-black text-emerald-200 mt-0.5">{status}</span>
              </div>
            </div>
          )}

          {/* ANIMATION TOGGLE BUTTON AS A ROUNDED ICON BUTTON */}
          {setShowAnimation && (
            <CleanControlButton
              icon={MonitorPlay}
              label={showAnimation ? 'Hide Canvas 🎬' : 'Show Canvas 🎬'}
              description={showAnimation ? 'Hide Topology Animation' : 'Show Topology Animation'}
              onClick={() => setShowAnimation(!showAnimation)}
              active={showAnimation}
              color="emerald"
            />
          )}
        </div>
      </div>

      {/* BOTTOM ROW: STAGE PILL & ACTION DESCRIPTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-inner">
        <div className="flex items-center gap-2.5">
          {stepNumber !== undefined && stepNumber > 0 ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 border border-emerald-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Stage {stepNumber}/{totalSteps}</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-slate-800 text-emerald-300 font-bold text-xs shadow flex items-center gap-1 border border-slate-700 shrink-0">
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
