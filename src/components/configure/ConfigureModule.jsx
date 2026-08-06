import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Settings, Layers, ChevronRight, CheckCircle2, ArrowRight, ArrowUp, ArrowDown, FileCode, Terminal, HelpCircle, RefreshCw, Sliders, Shield, Zap, Server, Router, Globe, Lock } from 'lucide-react';
import { CleanWidget, SlideOutInspector } from '../common/EasyCard';

// Configuration Scenarios & Step Data Registry
const CONFIG_TOPICS = [
  {
    id: 'dhcp_server',
    title: 'DHCP Server Scope & Option Deployment',
    category: 'Network Infrastructure',
    icon: Server,
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
    description: 'Configure an enterprise DHCP Server scope, IP address ranges, Default Gateway (Option 3), DNS Servers (Option 6), and static reservations.',
    steps: [
      {
        id: 'dhcp_step_1',
        title: 'Step 1: Install & Enable DHCP Service Daemon',
        badge: 'SERVICE INSTALL',
        shortDesc: 'Initialize DHCP Server service and bind to active network interface.',
        subSteps: [
          { title: 'Install DHCP Server role package', winCmd: 'Install-WindowsFeature -Name DHCP -IncludeManagementTools', linCmd: 'sudo apt install isc-dhcp-server' },
          { title: 'Authorize DHCP Server in Active Directory / Domain', winCmd: 'Add-DhcpServerInDC -DnsName dhcp01.corp.local', linCmd: 'N/A (Standalone Daemon)' },
          { title: 'Start service daemon and enable auto-start on boot', winCmd: 'Start-Service -Name DHCPServer; Set-Service -Name DHCPServer -StartupType Automatic', linCmd: 'sudo systemctl enable --now isc-dhcp-server' }
        ]
      },
      {
        id: 'dhcp_step_2',
        title: 'Step 2: Define Subnet Scope & Address Pool Range',
        badge: 'SCOPE DEFINITION',
        shortDesc: 'Specify IPv4 network CIDR subnet (192.168.1.0/24) and leaseable IP range.',
        subSteps: [
          { title: 'Create new IPv4 Scope', winCmd: 'Add-DhcpServerv4Scope -Name "HQ-VLAN10" -StartRange 192.168.1.100 -EndRange 192.168.1.200 -SubnetMask 255.255.255.0', linCmd: 'subnet 192.168.1.0 netmask 255.255.255.0 { range 192.168.1.100 192.168.1.200; }' },
          { title: 'Set Subnet Netmask', winCmd: 'Option 1: 255.255.255.0', linCmd: 'option subnet-mask 255.255.255.0;' }
        ]
      },
      {
        id: 'dhcp_step_3',
        title: 'Step 3: Configure Mandatory DHCP Options (Gateway & DNS)',
        badge: 'OPTION TAGS',
        shortDesc: 'Attach Option 3 (Router Gateway) and Option 6 (DNS Servers) to the scope.',
        subSteps: [
          { title: 'Set Option 3: Default Gateway Router IP', winCmd: 'Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -OptionId 3 -Value "192.168.1.1"', linCmd: 'option routers 192.168.1.1;' },
          { title: 'Set Option 6: Primary & Secondary DNS Servers', winCmd: 'Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -OptionId 6 -Value "8.8.8.8","1.1.1.1"', linCmd: 'option domain-name-servers 8.8.8.8, 1.1.1.1;' },
          { title: 'Set Option 15: DNS Domain Name', winCmd: 'Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -OptionId 15 -Value "corp.dts.de"', linCmd: 'option domain-name "corp.dts.de";' }
        ]
      },
      {
        id: 'dhcp_step_4',
        title: 'Step 4: Set IP Exclusions & Static MAC Reservations',
        badge: 'EXCLUSIONS & RESERVATION',
        shortDesc: 'Exclude static IPs (192.168.1.1-20) and bind MAC addresses to fixed IPs.',
        subSteps: [
          { title: 'Add Exclusion Range for static servers & printers', winCmd: 'Add-DhcpServerv4ExclusionRange -ScopeId 192.168.1.0 -StartRange 192.168.1.1 -EndRange 192.168.1.20', linCmd: 'deny unknown-clients;' },
          { title: 'Create Static MAC Reservation for CEO Laptop', winCmd: 'Add-DhcpServerv4Reservation -ScopeId 192.168.1.0 -IPAddress 192.168.1.50 -ClientId "00-50-56-A1-B2-C3"', linCmd: 'host ceo-laptop { hardware ethernet 00:50:56:A1:B2:C3; fixed-address 192.168.1.50; }' }
        ]
      },
      {
        id: 'dhcp_step_5',
        title: 'Step 5: Activate Scope & Verify Client Leases',
        badge: 'ACTIVATION & LEASES',
        shortDesc: 'Activate scope, verify active leases in database, and test DORA requests.',
        subSteps: [
          { title: 'Activate the Scope', winCmd: 'Set-DhcpServerv4Scope -ScopeId 192.168.1.0 -State Active', linCmd: 'sudo systemctl restart isc-dhcp-server' },
          { title: 'Inspect Active Leases in DB', winCmd: 'Get-DhcpServerv4Lease -ScopeId 192.168.1.0', linCmd: 'cat /var/lib/dhcp/dhcpd.leases' }
        ]
      }
    ]
  },
  {
    id: 'vlan_trunking',
    title: 'VLAN & 802.1Q IEEE Trunk Link Setup',
    category: 'Layer 2 Switching',
    icon: Layers,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
    description: 'Configure Virtual LANs (VLAN 10 Sales, VLAN 20 HR) and 802.1Q IEEE inter-switch trunk links.',
    steps: [
      {
        id: 'vlan_step_1',
        title: 'Step 1: Create VLAN Database Entries on Switch',
        badge: 'VLAN CREATION',
        shortDesc: 'Define VLAN 10 (Sales) and VLAN 20 (HR) in switch database.',
        subSteps: [
          { title: 'Create VLAN 10 and assign name Sales', winCmd: 'vlan 10 -> name Sales', linCmd: 'vlan 10 -> name Sales' },
          { title: 'Create VLAN 20 and assign name HR', winCmd: 'vlan 20 -> name HR', linCmd: 'vlan 20 -> name HR' }
        ]
      },
      {
        id: 'vlan_step_2',
        title: 'Step 2: Assign Access Ports to Respective VLANs',
        badge: 'ACCESS PORTS',
        shortDesc: 'Configure GigabitEthernet0/1 to Access Mode and bind to VLAN 10.',
        subSteps: [
          { title: 'Configure interface to switchport mode access', winCmd: 'interface Gi0/1 -> switchport mode access', linCmd: 'interface Gi0/1 -> switchport mode access' },
          { title: 'Assign port to VLAN 10', winCmd: 'switchport access vlan 10', linCmd: 'switchport access vlan 10' }
        ]
      },
      {
        id: 'vlan_step_3',
        title: 'Step 3: Configure 802.1Q Trunk Link Interface',
        badge: 'TRUNK INTERFACE',
        shortDesc: 'Configure inter-switch uplink interface Gi0/48 to 802.1Q Trunking Mode.',
        subSteps: [
          { title: 'Set trunk encapsulation to 802.1Q', winCmd: 'interface Gi0/48 -> switchport trunk encapsulation dot1q', linCmd: 'switchport mode trunk' },
          { title: 'Allow VLAN 10 and VLAN 20 on trunk link', winCmd: 'switchport trunk allowed vlan 10,20', linCmd: 'switchport trunk allowed vlan 10,20' }
        ]
      }
    ]
  }
];

export default function ConfigureModule({ appMode = 'clean' }) {
  const [selectedTopicId, setSelectedTopicId] = useState('dhcp_server');
  const activeTopic = CONFIG_TOPICS.find(t => t.id === selectedTopicId) || CONFIG_TOPICS[0];

  const [steps, setSteps] = useState(activeTopic.steps);
  const [activeStepModal, setActiveStepModal] = useState(null);
  const [activeOsTab, setActiveOsTab] = useState('cisco'); // 'cisco' or 'win'

  const handleSelectTopic = (topicId) => {
    setSelectedTopicId(topicId);
    const sel = CONFIG_TOPICS.find(t => t.id === topicId);
    if (sel) setSteps(sel.steps);
    setActiveStepModal(null);
  };

  // Move step up or down in workflow sequence
  const handleMoveStep = (index, direction) => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setSteps(newSteps);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Widget */}
      <CleanWidget
        title="🛠️ Hands-On Configuration & Step Sequence Builder"
        subtitle="Select a network service protocol, arrange configuration steps in proper sequence, and click any step to inspect sub-steps and CLI commands!"
        icon={Settings}
        protocol="WORKFLOW BUILDER"
        status={`${steps.length} STEPS IN SEQUENCE`}
      />

      {/* Topic Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
        {CONFIG_TOPICS.map((topic) => {
          const isSelected = topic.id === selectedTopicId;
          const IconComponent = topic.icon;

          return (
            <div
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xl relative overflow-hidden flex items-start gap-4 ${
                isSelected
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/50 scale-102'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className={`p-3 rounded-2xl border ${topic.color}`}>
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">{topic.category}</span>
                  <span className="text-xs font-bold text-slate-400">{topic.steps.length} Steps</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-100 tracking-tight leading-snug">{topic.title}</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans line-clamp-2">{topic.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE STEP WORKFLOW SEQUENCE BUILDER */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-100">{activeTopic.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">Reorder general steps using ⬆ / ⬇ buttons. Click any step to inspect sub-steps & commands.</p>
          </div>

          <button
            onClick={() => setSteps(activeTopic.steps)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Reset Step Sequence
          </button>
        </div>

        {/* STEP SEQUENCE CARDS LIST */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => setActiveStepModal(step)}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-amber-500/60 hover:bg-slate-950 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-950 text-amber-300 border border-amber-800">
                      {step.badge}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">{step.shortDesc}</p>
                </div>
              </div>

              {/* Action Buttons: Move Up/Down & Inspect Sub-Steps */}
              <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                <button
                  disabled={idx === 0}
                  onClick={() => handleMoveStep(idx, 'up')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    idx === 0
                      ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700 cursor-pointer'
                  }`}
                  title="Move Step Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  disabled={idx === steps.length - 1}
                  onClick={() => handleMoveStep(idx, 'down')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    idx === steps.length - 1
                      ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700 cursor-pointer'
                  }`}
                  title="Move Step Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setActiveStepModal(step)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Inspect Sub-Steps ({step.subSteps.length})</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUB-STEPS DETAIL WINDOW MODAL */}
      {activeStepModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-3xl border border-slate-700 bg-slate-900/95 font-mono text-xs text-slate-100 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">{activeStepModal.badge}</span>
                <h3 className="text-base font-black text-slate-100">{activeStepModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveStepModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* OS Tab Selector */}
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <span className="text-slate-400 font-bold">Command Platform:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveOsTab('cisco')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeOsTab === 'cisco' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ Cisco IOS CLI / PowerShell
                </button>
                <button
                  onClick={() => setActiveOsTab('linux')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeOsTab === 'linux' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🐧 Linux / Config File
                </button>
              </div>
            </div>

            {/* Sub-Steps List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">Detailed Technical Sub-Steps & Commands:</h4>
              {activeStepModal.subSteps.map((sub, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-200 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{i + 1}. {sub.title}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono font-bold text-xs overflow-x-auto select-text">
                    <code>{activeOsTab === 'cisco' ? sub.winCmd : sub.linCmd}</code>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveStepModal(null)}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Done Inspecting Step
              </button>
            </div>
          </div>
        </div>
      )}

      <SlideOutInspector title="Technical Deep Dive — Configuration Builder Architecture">
        <div className="space-y-2 text-xs text-slate-300 font-mono">
          <p><span className="text-amber-400 font-bold">Active Topic:</span> {activeTopic.title}</p>
          <p><span className="text-cyan-400 font-bold">Total Sequence Steps:</span> {steps.length}</p>
          <p><span className="text-purple-400 font-bold">Ordering Engine:</span> Dynamic index mutation with array re-ordering.</p>
        </div>
      </SlideOutInspector>
    </div>
  );
}
