import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Globe, Server, Laptop, Router, Zap, ChevronDown, ChevronUp, Sliders, Activity, MonitorPlay, Play, Pause, RotateCcw, SkipForward, Gauge } from 'lucide-react';

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

// UNIFIED ULTRA-COMPACT CLEAN MODE WIDGET (SUPER COMPACT SINGLE-ROW BAR)
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
  isPlaying = false,
  onPlay,
  onStep,
  onReset,
  speed = 1,
  setSpeed,
  showAnimation = true,
  setShowAnimation
}) {
  return (
    <div className="glass-panel px-4 py-2.5 rounded-2xl border border-emerald-500/30 bg-slate-900/95 shadow-xl font-sans relative overflow-hidden flex flex-wrap items-center justify-between gap-3">
      
      {/* LEFT: ICON & TITLE */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-100 tracking-tight leading-none">{title}</h2>
            {status && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/80">
                {status}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-1 line-clamp-1 max-w-xl">{subtitle}</p>
          )}
        </div>
      </div>

      {/* CENTER: INLINE METADATA BADGES */}
      <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
        {protocol && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-purple-300 border border-purple-800/80 font-bold flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-purple-400" />
            {protocol}
          </span>
        )}
        {ip && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-cyan-800/80 font-bold flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-cyan-400" />
            {ip}
          </span>
        )}
      </div>

      {/* RIGHT: CIRCULAR CONTROL BUTTONS */}
      <div className="flex items-center gap-1.5 font-mono">
        
        {/* SPEED SELECTOR */}
        {setSpeed && (
          <button
            onClick={() => {
              const nextSpeed = speed === 0.25 ? 0.5 : speed === 0.5 ? 1 : 0.25;
              setSpeed(nextSpeed);
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer flex items-center justify-center font-mono text-[10px] font-black"
            title={`Speed: ${speed}x (Click to cycle 0.25x ➔ 0.5x ➔ 1x)`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
          </button>
        )}

        {/* PLAY / PAUSE */}
        {onPlay && (
          <button
            onClick={onPlay}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow border hover:scale-105 active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30'
                : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 shadow-cyan-500/30'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        )}

        {/* NEXT STEP */}
        {onStep && (
          <button
            onClick={onStep}
            disabled={isPlaying}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title={stepNumber !== undefined && totalSteps ? `Next Step (${stepNumber + 1}/${totalSteps})` : "Next Step"}
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {/* RESET */}
        {onReset && (
          <button
            onClick={onReset}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-950/80 text-rose-400 border border-slate-700 hover:border-rose-700 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer flex items-center justify-center"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* CANVAS ANIMATION HIDE/SHOW TOGGLE */}
        {setShowAnimation && (
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow border hover:scale-105 active:scale-95 ${
              showAnimation
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={showAnimation ? 'Hide Canvas' : 'Show Canvas'}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
          </button>
        )}
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
