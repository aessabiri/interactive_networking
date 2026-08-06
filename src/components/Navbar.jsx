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

  // 3 Category Group Definitions (Clean, elegant labels without heavy emojis)
  const categories = [
    {
      id: 'visualize',
      label: 'Visualize',
      icon: Eye,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      items: [
        { id: 'osi', label: 'OSI & TCP/IP Reference', desc: '7-Layer, Modern 5-Layer & Original 4-Layer models', icon: Layers },
        { id: 'subnetting', label: 'FLSM & VLSM Subnetting', desc: 'IP block partitioning, subnet masks & wildcard masks', icon: Calculator },
        { id: 'hardware', label: 'Hardware & RAID', desc: 'RAID 0/1/5/6/10, ECC RAM, Redundant PSUs', icon: HardDrive },
        { id: 'topology', label: 'Network Topologies', desc: 'Star, Tree, Mesh, Ring, Bus & Mixed Builder', icon: Share2 },
        { id: 'enterprise', label: 'Enterprise Infra', desc: 'HQ Data Center vs Branch Office WAN map', icon: Building2 },
        { id: 'dhcp', label: 'DHCP Protocol', desc: 'DORA sequence & L3 Relay Agent Option 82', icon: Zap },
        { id: 'dns', label: 'DNS Resolver', desc: 'Forward/Reverse zones & root-to-authoritative lookup', icon: Globe },
        { id: 'ad', label: 'Active Directory', desc: 'Forest, Domain Controllers, OUs & Users', icon: ShieldCheck },
        { id: 'lan', label: 'LAN & Routing', desc: 'VLAN 802.1Q trunking, CAM Table & ARP', icon: Layers },
        { id: 'mail', label: 'Mail Server', desc: 'SMTP/IMAP transmission & MX lookups', icon: Mail },
        { id: 'firewall', label: 'Firewall & VPN', desc: 'Stateful Firewall, IPsec Tunnel & NAT rules', icon: ShieldAlert },
        { id: 'routing', label: 'Routing Protocols (OSPF vs RIP)', desc: 'Link-State Cost vs Hop Count multi-path routing & convergence', icon: Share2 },
      ]
    },
    {
      id: 'learn_test',
      label: 'Learn & Test',
      icon: GraduationCap,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      items: [
        { id: 'protocols', label: 'Protocol Catalog', desc: 'Network Protocols Reference & Detailed Field Inspector', icon: BookOpen },
        { id: 'notebook', label: 'CLI Terminal Tutor', desc: 'Linux Bash & Windows PowerShell reference', icon: Terminal },
        { id: 'labs', label: 'Lab Scenarios', desc: 'Interactive troubleshooting challenges', icon: Trophy },
        { id: 'dts', label: 'DTS Cockpit', desc: 'SOC Security Platform & Server Rack status', icon: ShieldCheck },
        { id: 'configure', label: 'Configurator', desc: 'Hands-on step ordering & Cisco CLI generator', icon: Settings },
      ]
    },
    {
      id: 'sandbox',
      label: 'Sandbox',
      icon: Palette,
      color: 'text-purple-400',
      activeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      items: [
        { id: 'sandbox', label: 'Freeform Topology Sandbox', desc: 'Drag-and-drop builder & Cisco IOS Terminal', icon: Network },
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
    <header ref={navRef} className="sticky top-0 z-50 bg-[#080a10]/75 backdrop-blur-2xl border-b border-white/[0.05] px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* TOP ROW: MACOS WINDOW CONTROLS, BRAND LOGO, ACTIVE MODULE & MODE SWITCH */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* macOS Dot Window Controls & Brand Logo */}
          <div className="flex items-center gap-4">
            {/* macOS Dot Controls */}
            <div className="hidden sm:flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40"></div>
            </div>

            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>

            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-white/10 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-white/95">
                  NetPulse
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-white/50 border border-white/[0.06]">
                  DTS Herford
                </span>
              </div>
            </div>
          </div>

          {/* ACTIVE TAB BREADCRUMB BADGE */}
          {currentActiveItem && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs">
              <span className="text-white/40 font-medium text-[11px]">Active:</span>
              <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                {currentActiveItem.label}
              </span>
            </div>
          )}

          {/* MODE TOGGLE APPLE SEGMENTED SWITCH */}
          {setAppMode && (
            <div className="apple-segmented-control text-xs">
              <button
                onClick={() => setAppMode('clean')}
                className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  appMode === 'clean' || appMode === 'easy'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Clean</span>
              </button>

              <button
                onClick={() => setAppMode('detailed')}
                className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  appMode === 'detailed' || appMode === 'expert'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Detailed</span>
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM ROW: 3 REGROUPED CATEGORY DROPDOWN MENUS */}
        <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-xs relative">
          {categories.map((cat) => {
            const CategoryIcon = cat.icon;
            const isCatActive = activeCategory === cat.id;
            const isOpen = openDropdown === cat.id;

            return (
              <div key={cat.id} className="relative">
                
                {/* CATEGORY BUTTON */}
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    isCatActive
                      ? `${cat.activeBg} shadow-sm`
                      : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <CategoryIcon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span>{cat.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-white/30'}`} />
                </button>

                {/* DROPDOWN MENU PANEL */}
                {isOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 p-2 rounded-2xl bg-[#0d121c]/95 border border-white/10 shadow-2xl backdrop-blur-3xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-[10px] font-semibold text-white/40">
                      <span>MODULES — {cat.label.toUpperCase()}</span>
                      <span className={cat.color}>{cat.items.length} items</span>
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
                                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-sm font-semibold'
                                : 'bg-transparent border-transparent hover:bg-white/[0.04] text-white/80'
                            }`}
                          >
                            <ItemIcon className={`w-4 h-4 shrink-0 mt-0.5 ${isItemSelected ? 'text-cyan-300' : 'text-white/40'}`} />
                            <div>
                              <p className="text-xs font-semibold leading-tight">{item.label}</p>
                              <p className={`text-[10px] leading-snug mt-0.5 ${isItemSelected ? 'text-cyan-300/80' : 'text-white/40'}`}>
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
