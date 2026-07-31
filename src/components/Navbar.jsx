import React from 'react';
import { 
  Network, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Zap,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dhcp', label: 'DHCP Protocol', icon: Zap, badge: 'DORA' },
    { id: 'dns', label: 'DNS Resolver', icon: Globe, badge: 'Recursive/Iterative' },
    { id: 'ad', label: 'Active Directory & DC', icon: ShieldCheck, badge: 'Kerberos & LDAP' },
    { id: 'lan', label: 'LAN & Routing', icon: Layers, badge: 'ARP & OSI' },
    { id: 'sandbox', label: 'Topology Sandbox', icon: Network, badge: 'Drag & Drop Canvas' },
    { id: 'notebook', label: 'DTS CLI & Quiz', icon: BookOpen, badge: 'Trainer' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 shadow-lg shadow-cyan-500/20 text-white animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                NetPulse
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                DTS Herford Infra
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Windows Network Architecture Visualizer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
