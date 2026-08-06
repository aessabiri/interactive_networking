import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Eye, 
  GraduationCap, 
  Palette, 
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
  ArrowRight,
  Search,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'visualize',
      title: t('catVisualize'),
      subtitle: t('catVisualizeDesc'),
      icon: Eye,
      color: 'text-[#f59e0b]',
      badgeBg: 'bg-[#00f0ff]/10 text-[#0284c7] dark:text-[#00f0ff] border border-[#00f0ff]/20',
      items: [
        { id: 'osi', title: t('modOsi'), desc: '7-Layer, 5-Layer & 4-Layer models', icon: Layers, tag: 'Layers' },
        { id: 'subnetting', title: t('modSubnetting'), desc: 'Step-by-step IP workbench', icon: Calculator, tag: 'IP Math' },
        { id: 'hardware', title: t('modHardware'), desc: 'RAID 0/1/5/6/10 & redundant PSUs', icon: HardDrive, tag: 'Hardware' },
        { id: 'topology', title: t('modTopology'), desc: 'Star, Mesh, Tree, Ring & Bus', icon: Share2, tag: 'Topologies' },
        { id: 'enterprise', title: t('modEnterprise'), desc: 'HQ Data Center vs WAN map', icon: Building2, tag: 'Multi-Hop' },
        { id: 'dhcp', title: t('modDhcp'), desc: '4-step DORA & L3 Relay Agent', icon: Zap, tag: 'DHCP' },
        { id: 'dns', title: t('modDns'), desc: 'Forward/Reverse & root lookup', icon: Globe, tag: 'DNS' },
        { id: 'ad', title: t('modAd'), desc: 'Forest, Domain Controllers & OUs', icon: ShieldCheck, tag: 'Identity' },
        { id: 'lan', title: t('modLan'), desc: 'VLAN 802.1Q, CAM Table & ARP', icon: Layers, tag: 'L2 Switch' },
        { id: 'mail', title: t('modMail'), desc: 'SMTP relaying & IMAP delivery', icon: Mail, tag: 'Mail' },
        { id: 'firewall', title: t('modFirewall'), desc: 'Stateful SPI, NAT & TLS 1.3', icon: ShieldAlert, tag: 'NGFW' },
        { id: 'routing', title: t('modRouting'), desc: 'OSPF vs RIP link-state multi-path', icon: Share2, tag: 'L3 Routing' },
      ]
    },
    {
      id: 'learn_test',
      title: t('catLearn'),
      icon: GraduationCap,
      subtitle: t('catLearnDesc'),
      color: 'text-[#f59e0b]',
      badgeBg: 'bg-[#f59e0b]/10 text-[#d97706] dark:text-[#f59e0b] border border-[#f59e0b]/20',
      items: [
        { id: 'protocols', title: t('modProtocols'), desc: 'Field-by-field packet reference', icon: BookOpen, tag: 'Catalog' },
        { id: 'notebook', title: t('modNotebook'), desc: 'Linux Bash & PowerShell guide', icon: Terminal, tag: 'CLI' },
        { id: 'labs', title: t('modLabs'), desc: 'Troubleshooting challenges', icon: Trophy, tag: 'Challenges' },
        { id: 'dts', title: t('modDts'), desc: 'Managed SOC & SOAR playbooks', icon: ShieldCheck, tag: 'DTS SOC' },
        { id: 'configure', title: t('modConfigure'), desc: 'Cisco IOS script exporter', icon: Settings, tag: 'Cisco IOS' },
      ]
    },
    {
      id: 'sandbox',
      title: t('catSandbox'),
      icon: Palette,
      subtitle: t('catSandboxDesc'),
      color: 'text-[#7c4dff]',
      badgeBg: 'bg-[#7c4dff]/10 text-[#7c4dff] border border-[#7c4dff]/20',
      items: [
        { id: 'sandbox', title: t('modSandbox'), desc: 'Drag-and-drop builder & terminal', icon: Network, tag: 'Sandbox' },
      ]
    }
  ];

  // Filter items by search query
  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-7 max-w-7xl mx-auto font-sans text-slate-900 dark:text-slate-100 pb-10 pt-4">
      
      {/* BRAND BADGE & RECESSED SEARCH BAR WITH THEME & LANGUAGE SWITCHER */}
      <div className="max-w-xl mx-auto space-y-3 text-center">
        
        {/* DTS Herford Brand Pill & Theme / Language Toggles */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full neumorphic-card text-xs font-mono text-[#f59e0b] font-semibold border border-[#00f0ff]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#00f0ff]" />
            <span>{t('suiteTitle')}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-full neumorphic-card text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:border-[#f59e0b]/40 transition-all text-slate-800 dark:text-white"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 rounded-full neumorphic-card text-xs font-mono font-bold flex items-center gap-1 cursor-pointer hover:border-[#f59e0b]/40 transition-all text-slate-800 dark:text-white"
            title={t('switchLangTip')}
          >
            <span>{lang === 'en' ? '🇬🇧 EN' : '🇩🇪 DE'}</span>
          </button>
        </div>

        {/* Search Title & Input */}
        <div className="space-y-2">
          <label className="text-base font-bold text-slate-900 dark:text-white/95 tracking-tight block">{t('searchLabel')}</label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#0284c7] dark:text-[#00f0ff]/70 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3.5 neumorphic-input font-sans text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 text-slate-900 dark:text-white font-medium focus:border-[#0284c7] dark:focus:border-[#00f0ff]/40"
            />
          </div>
        </div>
      </div>

      {/* CATEGORIES & TACTILE NEUMORPHIC CARDS GRID */}
      {filteredCategories.map((cat) => {
        const CategoryIcon = cat.icon;
        return (
          <section key={cat.id} className="space-y-3.5">
            
            {/* Category Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.04] pb-2 px-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg neumorphic-card">
                  <CategoryIcon className={`w-4 h-4 ${cat.color}`} />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white/90 tracking-tight">{cat.title}</h2>
                <span className="text-[11px] font-mono text-slate-400 dark:text-white/40">({cat.items.length})</span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-white/40 hidden sm:inline font-sans">{cat.subtitle}</span>
            </div>

            {/* HIGH-DENSITY TACTILE NEUMORPHIC GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {cat.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="neumorphic-card p-3.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-2.5 active:scale-[0.98] hover:border-[#0284c7] dark:hover:border-[#00f0ff]/30"
                  >
                    <div className="space-y-2">
                      {/* Top Row: Tactile Icon Container & Tag */}
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-slate-200 dark:bg-black/40 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15),_inset_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.65),_inset_-2px_-2px_5px_rgba(255,255,255,0.035)] text-[#f59e0b] group-hover:text-[#0284c7] dark:group-hover:text-[#00f0ff] transition-colors">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium ${cat.badgeBg}`}>
                          {item.tag}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white/90 group-hover:text-[#f59e0b] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-white/40 mt-0.5 leading-snug line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* OPEN LAB ACTION IN SECONDARY ACCENT (ELECTRIC CYAN #0284c7 / #00f0ff) */}
                    <div className="pt-2 border-t border-slate-200 dark:border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-[#0284c7] dark:text-[#00f0ff] font-bold tracking-wide group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
                      <span>{t('openLab')}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-[#0284c7] dark:text-[#00f0ff]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

    </div>
  );
}
