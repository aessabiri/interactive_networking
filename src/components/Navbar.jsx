import React from 'react';
import { 
  Network, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Zap,
  Mail,
  ShieldAlert,
  Sparkles,
  Sliders,
  Building2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, appMode = 'clean', setAppMode }) {
  const tabs = [
    { id: 'enterprise', label: 'Enterprise Infra', fullName: 'Enterprise Infrastructure Workflow', icon: Building2 },
    { id: 'dts', label: 'DTS Cockpit', fullName: 'DTS Cockpit — SOC Security Platform', icon: ShieldCheck },
    { id: 'dhcp', label: 'DHCP', fullName: 'DHCP Protocol', icon: Zap },
    { id: 'dns', label: 'DNS', fullName: 'DNS Resolver', icon: Globe },
    { id: 'ad', label: 'Active Directory', fullName: 'Active Directory & DC', icon: ShieldCheck },
    { id: 'lan', label: 'LAN & Routing', fullName: 'LAN Switching & ARP', icon: Layers },
    { id: 'mail', label: 'Mail Server', fullName: 'Mail SMTP/IMAP', icon: Mail },
    { id: 'firewall', label: 'Firewall & VPN', fullName: 'Stateful Firewall & VPN', icon: ShieldAlert },
    { id: 'sandbox', label: 'Sandbox Canvas', fullName: 'Topology Sandbox', icon: Network },
    { id: 'notebook', label: 'CLI & Quiz', fullName: 'Lab Notebook', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto space-y-2.5">
        
        {/* TOP ROW: BRAND LOGO & MODE TOGGLE SWITCH */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shadow-lg shadow-cyan-500/20 text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NetPulse
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  DTS Herford
                </span>
              </div>
            </div>
          </div>

          {/* MODE TOGGLE SEGMENTED SWITCH */}
          {setAppMode && (
            <div className="flex items-center p-1 rounded-full bg-slate-900 border border-slate-800 shadow-inner font-sans text-xs">
              <button
                onClick={() => setAppMode('clean')}
                className={`px-3.5 py-1.5 rounded-full font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  appMode === 'clean' || appMode === 'easy'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-102 border border-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>🌱 Clean Mode</span>
              </button>

              <button
                onClick={() => setAppMode('detailed')}
                className={`px-3.5 py-1.5 rounded-full font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  appMode === 'detailed' || appMode === 'expert'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-102 border border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>🔍 Detailed Mode</span>
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM ROW: CLEAN SEGMENTED NAVIGATION TABS */}
        <nav className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 scale-102 border border-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent'
                }`}
                title={tab.fullName}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
