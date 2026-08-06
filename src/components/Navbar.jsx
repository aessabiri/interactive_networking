import React, { useState, useRef, useEffect } from 'react';
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
  Building2,
  Terminal,
  Trophy,
  Settings,
  HardDrive,
  Share2,
  ChevronDown,
  GraduationCap,
  Eye,
  TestTube,
  Palette,
  Award,
  Calculator
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, appMode = 'clean', setAppMode }) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'learn_test', 'visualize', 'sandbox' or null
  const navRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3 Category Group Definitions
  const categories = [
    {
      id: 'visualize',
      label: 'Visualize',
      icon: Eye,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-cyan-500/20',
      items: [
        { id: 'osi', label: 'OSI & TCP/IP Reference 🥞', desc: '7-Layer, Modern 5-Layer & Original 4-Layer models', icon: Layers },
        { id: 'subnetting', label: 'FLSM & VLSM Subnetting 📐', desc: 'IP block partitioning, subnet masks & wildcard masks', icon: Calculator },
        { id: 'hardware', label: 'Hardware & RAID 💾', desc: 'RAID 0/1/5/6/10, ECC RAM, Redundant PSUs', icon: HardDrive },
        { id: 'topology', label: 'Network Topologies 🕸️', desc: 'Star, Tree, Mesh, Ring, Bus & Mixed Builder', icon: Share2 },
        { id: 'enterprise', label: 'Enterprise Infra 🏢', desc: 'HQ Data Center vs Branch Office WAN map', icon: Building2 },
        { id: 'dhcp', label: 'DHCP Protocol ⚡', desc: 'DORA sequence & L3 Relay Agent Option 82', icon: Zap },
        { id: 'dns', label: 'DNS Resolver 🌐', desc: 'Forward/Reverse zones & root-to-authoritative lookup', icon: Globe },
        { id: 'ad', label: 'Active Directory 🏰', desc: 'Forest, Domain Controllers, OUs & Users', icon: ShieldCheck },
        { id: 'lan', label: 'LAN & Routing 🔌', desc: 'VLAN 802.1Q trunking, CAM Table & ARP', icon: Layers },
        { id: 'mail', label: 'Mail Server ✉️', desc: 'SMTP/IMAP transmission & MX lookups', icon: Mail },
        { id: 'firewall', label: 'Firewall & VPN 🔒', desc: 'Stateful Firewall, IPsec Tunnel & NAT rules', icon: ShieldAlert },
        { id: 'routing', label: 'Routing Protocols (OSPF vs RIP) 🛣️', desc: 'Link-State Cost vs Hop Count multi-path routing & convergence', icon: Share2 },
      ]
    },
    {
      id: 'learn_test',
      label: 'Learn & Test',
      icon: GraduationCap,
      color: 'text-amber-400',
      activeBg: 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-amber-500/20',
      items: [
        { id: 'protocols', label: 'Protocol Catalog 📖', desc: 'Network Protocols Reference & Detailed Field Inspector', icon: BookOpen },
        { id: 'notebook', label: 'CLI Terminal Tutor 💻', desc: 'Linux Bash & Windows PowerShell reference', icon: Terminal },
        { id: 'labs', label: 'Lab Scenarios 🏆', desc: 'Interactive troubleshooting challenges', icon: Trophy },
        { id: 'dts', label: 'DTS Cockpit 🛡️', desc: 'SOC Security Platform & Server Rack status', icon: ShieldCheck },
        { id: 'configure', label: 'Configurator 🛠️', desc: 'Hands-on step ordering & Cisco CLI generator', icon: Settings },
      ]
    },
    {
      id: 'sandbox',
      label: 'Sandbox',
      icon: Palette,
      color: 'text-purple-400',
      activeBg: 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-purple-500/20',
      items: [
        { id: 'sandbox', label: 'Freeform Topology Sandbox 🎨', desc: 'Drag-and-drop builder & Cisco IOS Terminal', icon: Network },
      ]
    }
  ];

  // Determine active category based on activeTab
  const getActiveCategory = () => {
    for (const cat of categories) {
      if (cat.items.some(item => item.id === activeTab)) {
        return cat.id;
      }
    }
    return 'visualize';
  };

  const activeCategory = getActiveCategory();
  const currentActiveItem = categories.flatMap(c => c.items).find(i => i.id === activeTab);

  return (
    <header ref={navRef} className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto space-y-2.5">
        
        {/* TOP ROW: BRAND LOGO, ACTIVE MODULE DISPLAY, & MODE TOGGLE */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
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

          {/* ACTIVE TAB BREADCRUMB BADGE */}
          {currentActiveItem && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Active Module:</span>
              <span className="text-cyan-300 font-black flex items-center gap-1.5">
                {currentActiveItem.label}
              </span>
            </div>
          )}

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

        {/* BOTTOM ROW: 3 REGROUPED CATEGORY DROPDOWN MENUS */}
        <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 font-mono text-xs relative">
          {categories.map((cat) => {
            const CategoryIcon = cat.icon;
            const isCatActive = activeCategory === cat.id;
            const isOpen = openDropdown === cat.id;

            return (
              <div key={cat.id} className="relative">
                
                {/* CATEGORY BUTTON */}
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    isCatActive
                      ? `${cat.activeBg} border-current scale-102`
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <CategoryIcon className={`w-4 h-4 ${cat.color}`} />
                  <span>{cat.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                </button>

                {/* DROPDOWN MENU PANEL */}
                {isOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 p-2 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>SELECT MODULE ({cat.label.toUpperCase()})</span>
                      <span className={cat.color}>{cat.items.length} Modules</span>
                    </div>

                    <div className="space-y-1 pt-1 max-h-[380px] overflow-y-auto scrollbar-none">
                      {cat.items.map(item => {
                        const ItemIcon = item.icon;
                        const isItemSelected = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                              isItemSelected
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 border-cyan-300 font-extrabold shadow-md'
                                : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                            }`}
                          >
                            <ItemIcon className={`w-4 h-4 shrink-0 mt-0.5 ${isItemSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                            <div>
                              <p className="text-xs font-bold leading-tight">{item.label}</p>
                              <p className={`text-[10px] leading-snug mt-0.5 font-sans ${isItemSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
