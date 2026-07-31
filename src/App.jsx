import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DHCPModule from './components/dhcp/DHCPModule';
import DNSModule from './components/dns/DNSModule';
import ADModule from './components/active-directory/ADModule';
import LANModule from './components/lan/LANModule';
import MailModule from './components/mail/MailModule';
import FirewallVPNModule from './components/firewall/FirewallVPNModule';
import NetworkSandbox from './components/sandbox/NetworkSandbox';
import LabNotebook from './components/notebook/LabNotebook';

export default function App() {
  const [activeTab, setActiveTab] = useState('dhcp');
  const [appMode, setAppMode] = useState('clean'); // 'clean' or 'detailed'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} appMode={appMode} setAppMode={setAppMode} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
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
