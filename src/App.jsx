import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EnterpriseModule from './components/enterprise/EnterpriseModule';
import DTSCockpitModule from './components/dts/DTSCockpitModule';
import DHCPModule from './components/dhcp/DHCPModule';
import DNSModule from './components/dns/DNSModule';
import ADModule from './components/active-directory/ADModule';
import LANModule from './components/lan/LANModule';
import MailModule from './components/mail/MailModule';
import FirewallVPNModule from './components/firewall/FirewallVPNModule';
import NetworkSandbox from './components/sandbox/NetworkSandbox';
import LabNotebook from './components/notebook/LabNotebook';
import LabScenarioModule from './components/labs/LabScenarioModule';
import ConfigureModule from './components/configure/ConfigureModule';
import HardwareModule from './components/hardware/HardwareModule';
import TopologyModule from './components/topology/TopologyModule';
import OSITCPIPModule from './components/osi/OSITCPIPModule';
import ProtocolsModule from './components/protocols/ProtocolsModule';
import RoutingProtocolModule from './components/routing/RoutingProtocolModule';
import SubnettingModule from './components/subnetting/SubnettingModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('enterprise');
  const [appMode, setAppMode] = useState('clean'); // 'clean' or 'detailed'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} appMode={appMode} setAppMode={setAppMode} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'enterprise' && <EnterpriseModule appMode={appMode} />}
        {activeTab === 'dts' && <DTSCockpitModule appMode={appMode} />}
        {activeTab === 'hardware' && <HardwareModule appMode={appMode} />}
        {activeTab === 'topology' && <TopologyModule appMode={appMode} />}
        {activeTab === 'osi' && <OSITCPIPModule appMode={appMode} />}
        {activeTab === 'protocols' && <ProtocolsModule appMode={appMode} />}
        {activeTab === 'routing' && <RoutingProtocolModule appMode={appMode} />}
        {activeTab === 'subnetting' && <SubnettingModule appMode={appMode} />}
        {activeTab === 'labs' && <LabScenarioModule appMode={appMode} />}
        {activeTab === 'configure' && <ConfigureModule appMode={appMode} />}
        {activeTab === 'dhcp' && <DHCPModule appMode={appMode} />}
        {activeTab === 'dns' && <DNSModule appMode={appMode} />}
        {activeTab === 'ad' && <ADModule appMode={appMode} />}
        {activeTab === 'lan' && <LANModule appMode={appMode} />}
        {activeTab === 'mail' && <MailModule appMode={appMode} />}
        {activeTab === 'firewall' && <FirewallVPNModule appMode={appMode} />}
        {activeTab === 'sandbox' && <NetworkSandbox appMode={appMode} />}
        {activeTab === 'notebook' && <LabNotebook appMode={appMode} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NetPulse Enterprise Network Infra Visualizer & Sandbox</span>
          <span className="text-slate-600">DTS Herford Enterprise Training • Standalone Zero-Install HTML/JS</span>
        </div>
      </footer>
    </div>
  );
}
