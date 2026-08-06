import React, { useState, useRef, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Calculator, 
  HardDrive, 
  Share2, 
  Building2, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Mail, 
  ShieldAlert, 
  BookOpen, 
  Terminal, 
  Trophy, 
  Settings, 
  Network, 
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, appMode, setAppMode }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navCategories = [
    {
      id: 'visualize',
      label: 'Visualize',
      items: [
        { id: 'osi', label: 'OSI & TCP/IP Reference', icon: Layers },
        { id: 'subnetting', label: 'FLSM & VLSM Subnetting', icon: Calculator },
        { id: 'hardware', label: 'Hardware & RAID', icon: HardDrive },
        { id: 'topology', label: 'Network Topologies', icon: Share2 },
        { id: 'enterprise', label: 'Enterprise Infra', icon: Building2 },
        { id: 'dhcp', label: 'DHCP Protocol', icon: Zap },
        { id: 'dns', label: 'DNS Resolver', icon: Globe },
        { id: 'ad', label: 'Active Directory', icon: ShieldCheck },
        { id: 'lan', label: 'LAN & VLAN Trunking', icon: Layers },
        { id: 'mail', label: 'Mail Server', icon: Mail },
        { id: 'firewall', label: 'Firewall & IPsec VPN', icon: ShieldAlert },
        { id: 'routing', label: 'Routing Protocols', icon: Share2 },
      ]
    },
    {
      id: 'learn',
      label: 'Learn & Test',
      items: [
        { id: 'protocols', label: 'Protocol Catalog', icon: BookOpen },
        { id: 'notebook', label: 'CLI Terminal Tutor', icon: Terminal },
        { id: 'labs', label: 'Lab Scenarios', icon: Trophy },
        { id: 'dts', label: 'DTS Cockpit SOC', icon: ShieldCheck },
        { id: 'configure', label: 'Cisco Configurator', icon: Settings },
      ]
    },
    {
      id: 'sandbox',
      label: 'Sandbox',
      items: [
        { id: 'sandbox', label: 'Freeform Topology Sandbox', icon: Network },
      ]
    }
  ];

  const getActiveTabTitle = () => {
    for (const cat of navCategories) {
      const found = cat.items.find(i => i.id === activeTab);
      if (found) return found.label;
    }
    return 'Dashboard';
  };

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-[#12151e] border-b border-white/[0.04] px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* TOP ROW: BRAND LOGO & MODE SWITCH */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Logo & Hub Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity"
              title="Return to Main Landing Page Hub"
            >
              <div className="p-2 rounded-xl bg-[#0e1017] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.65),_inset_-2px_-2px_5px_rgba(255,255,255,0.035)] text-[#f59e0b]">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white/95 group-hover:text-[#f59e0b] transition-colors">
                  NetPulse
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full neumorphic-card text-[#f59e0b] font-bold">
                  Hub 🏠
                </span>
              </div>
            </button>
          </div>

          {/* ACTIVE TAB BREADCRUMB BADGE */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full neumorphic-card text-xs font-mono text-white/70">
            <span className="text-[#f59e0b] font-semibold">Active Lab:</span>
            <span className="text-white font-semibold">{getActiveTabTitle()}</span>
          </div>

          {/* MODE SEGMENTED CONTROL */}
          <div className="apple-segmented-control text-xs">
            <button
              onClick={() => setAppMode('clean')}
              className={`px-3.5 py-1 rounded-full font-semibold transition-all ${
                appMode === 'clean'
                  ? 'bg-[#f59e0b] text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Clean Mode
            </button>
            <button
              onClick={() => setAppMode('detailed')}
              className={`px-3.5 py-1 rounded-full font-semibold transition-all ${
                appMode === 'detailed'
                  ? 'bg-[#7c4dff] text-white shadow-[0_0_12px_rgba(124,77,255,0.4)]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Detailed Mode
            </button>
          </div>
        </div>

        {/* BOTTOM NAVIGATION DROPDOWNS BAR */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
          {navCategories.map(cat => (
            <div key={cat.id} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === cat.id ? null : cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  openDropdown === cat.id || cat.items.some(i => i.id === activeTab)
                    ? 'neumorphic-card text-[#f59e0b]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === cat.id ? 'rotate-180 text-[#f59e0b]' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {openDropdown === cat.id && (
                <div className="absolute left-0 mt-2 w-56 neumorphic-card p-2 z-50 animate-in fade-in duration-150 space-y-1">
                  {cat.items.map(item => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 font-medium transition-all ${
                          activeTab === item.id
                            ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 font-semibold'
                            : 'text-white/80 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 text-[#f59e0b]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </header>
  );
}
