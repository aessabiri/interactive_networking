import React, { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './components/landing/LandingPage';
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
  const [activeTab, setActiveTab] = useState('landing');
  const [appMode, setAppMode] = useState('clean'); // 'clean' or 'detailed'

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#10121a] dark:bg-[#10121a] light:bg-[#f1f5f9] text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
          {/* Header Navbar (only visible inside active modules) */}
          {activeTab !== 'landing' && (
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} appMode={appMode} setAppMode={setAppMode} />
          )}

          {/* Main Content Canvas Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
            {activeTab === 'landing' && <LandingPage setActiveTab={setActiveTab} />}
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
          <footer className="border-t border-slate-700/20 dark:border-white/[0.04] bg-[#10121a]/80 dark:bg-[#10121a]/80 light:bg-[#f1f5f9]/80 backdrop-blur-md px-6 py-4 text-xs text-slate-400 font-sans">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-medium">NetPulse • Architecture & Security Suite</span>
              <span className="text-slate-400 text-[11px]">DTS Herford Enterprise Training</span>
            </div>
          </footer>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
