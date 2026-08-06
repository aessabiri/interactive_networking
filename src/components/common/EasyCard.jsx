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
    emerald: active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' : 'bg-white/[0.03] hover:bg-white/[0.06] text-emerald-300 border-white/[0.06]',
    cyan: active ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' : 'bg-white/[0.03] hover:bg-white/[0.06] text-cyan-300 border-white/[0.06]',
    amber: active ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' : 'bg-white/[0.03] hover:bg-white/[0.06] text-amber-300 border-white/[0.06]',
    purple: active ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm' : 'bg-white/[0.03] hover:bg-white/[0.06] text-purple-300 border-white/[0.06]',
    rose: active ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm' : 'bg-white/[0.03] hover:bg-white/[0.06] text-rose-300 border-white/[0.06]'
  };

  const iconBgMap = {
    emerald: active ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    cyan: active ? 'bg-cyan-500/30 text-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    amber: active ? 'bg-amber-500/30 text-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    purple: active ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    rose: active ? 'bg-rose-500/30 text-rose-200' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer border shadow-sm ${colorMap[color] || colorMap.cyan} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
      }`}
      title={description ? `${label}: ${description}` : label}
    >
      {/* ROUNDED CIRCLE ICON BADGE */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6 ${iconBgMap[color] || iconBgMap.cyan}`}>
        <Icon className="w-3.5 h-3.5 fill-current" />
      </div>

      {/* TEXT LABEL & DESCRIPTION */}
      <div className="flex flex-col text-left font-sans pr-1">
        <span className="text-xs font-semibold tracking-tight leading-tight">{label}</span>
        {description && (
          <span className="text-[9px] font-mono opacity-60 leading-none mt-0.5">{description}</span>
        )}
      </div>
    </button>
  );
}

// UNIFIED ULTRA-COMPACT CLEAN MODE WIDGET (FRAMESLESS APPLE WIDGET)
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
    <div className="frameless-card px-4 py-3 border border-white/[0.06] bg-[#0c1019]/70 shadow-xl font-sans relative overflow-hidden flex flex-wrap items-center justify-between gap-3">
      
      {/* LEFT: ICON & TITLE */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white/90 tracking-tight leading-none">{title}</h2>
            {status && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {status}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-white/40 font-normal leading-tight mt-1 line-clamp-1 max-w-xl">{subtitle}</p>
          )}
        </div>
      </div>

      {/* CENTER: INLINE METADATA BADGES */}
      <div className="hidden lg:flex items-center gap-2 font-mono text-[11px]">
        {protocol && (
          <span className="px-2.5 py-1 rounded-full bg-white/[0.03] text-purple-300 border border-white/[0.06] font-medium flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-purple-400" />
            {protocol}
          </span>
        )}
        {ip && (
          <span className="px-2.5 py-1 rounded-full bg-white/[0.03] text-cyan-300 border border-white/[0.06] font-medium flex items-center gap-1.5">
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
              const nextSpeed = speed === 0.5 ? 1 : speed === 1 ? 2 : 0.5;
              setSpeed(nextSpeed);
            }}
            className={`h-7 px-2.5 rounded-full font-mono text-[10px] font-medium border transition-all duration-300 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
              speed === 0.5
                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                : speed === 1
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
            title={`Speed: ${speed}x`}
          >
            <Gauge className={`w-3 h-3 ${
              speed === 0.5 ? 'text-blue-400' : speed === 1 ? 'text-amber-400' : 'text-rose-400'
            }`} />
            <span>{speed}x</span>
          </button>
        )}

        {/* PLAY / PAUSE */}
        {onPlay && (
          <button
            onClick={onPlay}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border hover:scale-105 active:scale-95 ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </button>
        )}

        {/* NEXT STEP */}
        {onStep && (
          <button
            onClick={onStep}
            disabled={isPlaying}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-cyan-400 border border-white/[0.06] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            title={stepNumber !== undefined && totalSteps ? `Next (${stepNumber + 1}/${totalSteps})` : "Next"}
          >
            <SkipForward className="w-3 h-3 fill-current" />
          </button>
        )}

        {/* RESET */}
        {onReset && (
          <button
            onClick={onReset}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-rose-500/20 text-rose-400 border border-white/[0.06] hover:border-rose-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
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

export function SlideOutInspector({ title = "Technical Deep Dive & Live Wire Logs", children }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#090d16]/80 backdrop-blur-2xl overflow-hidden transition-all duration-300 shadow-xl font-mono">
      <div className="w-full px-4 py-2.5 bg-white/[0.02] text-white/70 text-xs font-semibold flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white/90">{title}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE WIRE LOGS
          </span>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function EasyCard({ title, description, badge, tips = [] }) {
  return (
    <div className="p-5 rounded-2xl bg-[#0d121c]/60 border border-white/[0.06] shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{title}</span>
        </div>
        {badge && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-white/70 leading-relaxed font-normal">{description}</p>
      {tips.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-white/[0.05] text-[11px] text-white/60 font-mono">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <span className="text-cyan-400">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EasyCard;
