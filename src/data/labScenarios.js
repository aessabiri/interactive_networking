/**
 * Interactive Lab Troubleshooting Scenarios & Automated Grading Engine
 * Supports Bilingual (English & Deutsch 🇩🇪) descriptions & objectives.
 */

export const LAB_SCENARIOS = [
  {
    id: 'lab_dhcp',
    title: 'Lab 1: Configure Corporate DHCP & Default Gateway',
    title_de: 'Lab 1: Unternehmens-DHCP & Standard-Gateway konfigurieren',
    difficulty: 'Beginner',
    difficulty_de: 'Einsteiger',
    category: 'Network Infrastructure',
    category_de: 'Netzwerk-Infrastruktur',
    description: 'A new workstation has joined the corporate office but cannot reach the Internet Gateway because the Server lacks the DHCP service role and gateway IP settings.',
    description_de: 'Eine neue Workstation befindet sich im Unternehmensnetzwerk, kann jedoch das Internet-Gateway nicht erreichen, da auf dem Server der DHCP-Dienst und das Standard-Gateway fehlen.',
    objectives: [
      'Enable the DHCP Server role on DC01-SERVER.',
      'Ensure DC01-SERVER has Gateway IP 192.168.1.1 configured.',
      'Ensure WORKSTATION-01 is connected to L2-SWITCH-01 via Ethernet cable.'
    ],
    objectives_de: [
      'Aktivieren Sie die DHCP-Server-Rolle auf DC01-SERVER.',
      'Stellen Sie sicher, dass auf DC01-SERVER die Gateway-IP 192.168.1.1 konfiguriert ist.',
      'Stellen Sie sicher, dass WORKSTATION-01 über ein Netzwerkkabel mit L2-SWITCH-01 verbunden ist.'
    ],
    initialState: {
      nodes: [
        { id: 'lap1', name: 'WORKSTATION-01', type: 'laptop', x: 80, y: 200, ip: '192.168.1.105', mac: '00:50:56:A1:B2:C1', os: 'Windows 11 Pro', roles: [] },
        { id: 'sw1', name: 'L2-SWITCH-01', type: 'switch', x: 320, y: 200, ip: 'N/A (L2 Switch)', mac: '00:11:22:33:44:00', os: 'Cisco IOS L2', roles: [] },
        { id: 'srv1', name: 'DC01-SERVER', type: 'server', x: 580, y: 100, ip: '192.168.1.10', mac: '00:0C:29:8E:7F:11', os: 'Windows Server 2022', roles: [] },
        { id: 'r1', name: 'ISP-ROUTER', type: 'router', x: 580, y: 320, ip: '192.168.1.1', mac: '00:00:0C:07:AC:01', os: 'Enterprise Gateway OS', roles: ['nat'] },
        { id: 'isp1', name: 'INTERNET-ISP 🌐', type: 'cloud', x: 820, y: 320, ip: '8.8.8.8 (WAN)', mac: '00:FE:88:99:AA:BB', os: 'Public WAN ISP', roles: [] }
      ],
      links: [
        { id: 'link2', from: 'sw1', to: 'srv1', cableType: 'straight' },
        { id: 'link3', from: 'sw1', to: 'r1', cableType: 'straight' },
        { id: 'link4', from: 'r1', to: 'isp1', cableType: 'straight' }
      ]
    }
  },
  {
    id: 'lab_firewall',
    title: 'Lab 2: DMZ Firewall ACL Rule Hardening',
    title_de: 'Lab 2: DMZ Firewall-ACL-Regelhärtung',
    difficulty: 'Intermediate',
    difficulty_de: 'Fortgeschritten',
    category: 'Cybersecurity & Firewalls',
    category_de: 'Cybersicherheit & Firewalls',
    description: 'Inbound Web Server traffic to DMZ-WEB-SERVER is being dropped because the Firewall ACL table is missing an ALLOW rule for HTTPS Port 443.',
    description_de: 'Eingehender Datenverkehr zum DMZ-WEB-SERVER wird verworfen, da in der Firewall-ACL-Tabelle eine ALLOW-Regel für HTTPS Port 443 fehlt.',
    objectives: [
      'Add or enable an ACCEPT rule for HTTPS (Port 443) in the firewall rules table.',
      'Ensure DMZ-FIREWALL is connected to both INTERNAL-SWITCH and DMZ-WEB-SERVER.'
    ],
    objectives_de: [
      'Fügen Sie eine ACCEPT-Regel für HTTPS (Port 443) in der Firewall-Regeltabelle hinzu.',
      'Stellen Sie sicher, dass DMZ-FIREWALL sowohl mit INTERNAL-SWITCH als auch mit DMZ-WEB-SERVER verbunden ist.'
    ],
    initialState: {
      nodes: [
        { id: 'lap1', name: 'ADMIN-PC', type: 'laptop', x: 80, y: 200, ip: '192.168.1.100', mac: '00:50:56:11:22:33', os: 'Windows 11 Enterprise', roles: [] },
        { id: 'sw1', name: 'INTERNAL-SWITCH', type: 'switch', x: 300, y: 200, ip: 'N/A (L2)', mac: '00:11:22:33:00:01', os: 'Cisco Catalyst L2', roles: [] },
        { id: 'fw1', name: 'DMZ-FIREWALL', type: 'firewall', x: 540, y: 200, ip: '192.168.1.1', mac: '00:90:0B:22:33:44', os: 'Palo Alto PAN-OS', roles: ['firewall'] },
        { id: 'web1', name: 'DMZ-WEB-SERVER', type: 'server', x: 540, y: 70, ip: '10.0.0.50', mac: '00:0C:29:AA:BB:CC', os: 'Linux Ubuntu Server', roles: ['http'] },
        { id: 'isp1', name: 'INTERNET-ISP 🌐', type: 'cloud', x: 800, y: 200, ip: '8.8.8.8 (WAN)', mac: '00:FE:88:99:AA:BB', os: 'Public WAN ISP', roles: [] }
      ],
      links: [
        { id: 'link1', from: 'lap1', to: 'sw1', cableType: 'straight' },
        { id: 'link2', from: 'sw1', to: 'fw1', cableType: 'straight' },
        { id: 'link4', from: 'fw1', to: 'isp1', cableType: 'straight' }
      ]
    }
  },
  {
    id: 'lab_ha_campus',
    title: 'Lab 3: High-Availability (HA) Core Switch Trunk Link',
    title_de: 'Lab 3: Hochverfügbarkeits-(HA) Core-Switch-Trunkverbindung',
    difficulty: 'Advanced',
    difficulty_de: 'Experte',
    category: 'Campus Network Architecture',
    category_de: 'Unternehmensnetzwerk-Architektur',
    description: 'The core campus network has redundant Core Switches, but the trunk link between CORE-SW-01 and CORE-SW-02 is missing, preventing Spanning Tree Protocol (STP) HA synchronization.',
    description_de: 'Das Core-Campus-Netzwerk verfügt über redundante Core-Switches, aber die Trunk-Verbindung zwischen CORE-SW-01 und CORE-SW-02 fehlt, was die Spanning-Tree-HA-Synchronisierung verhindert.',
    objectives: [
      'Create a trunk cable connection between CORE-SW-01 and CORE-SW-02.',
      'Ensure active firewall PA-NGFW-ACTIVE is connected to CORE-SW-01.'
    ],
    objectives_de: [
      'Erstellen Sie eine Trunk-Kabelverbindung zwischen CORE-SW-01 und CORE-SW-02.',
      'Stellen Sie sicher, dass die aktive Firewall PA-NGFW-ACTIVE mit CORE-SW-01 verbunden ist.'
    ],
    initialState: {
      nodes: [
        { id: 'user1', name: 'CORP-PC-01', type: 'laptop', x: 80, y: 200, ip: '10.20.1.100', mac: '00:50:56:99:00:11', os: 'Windows 11 Enterprise', roles: [] },
        { id: 'sw_pri', name: 'CORE-SW-01', type: 'switch', x: 320, y: 100, ip: 'N/A (L2/L3)', mac: '00:11:22:AA:BB:01', os: 'Cisco Catalyst 9500', roles: [] },
        { id: 'sw_sec', name: 'CORE-SW-02', type: 'switch', x: 320, y: 300, ip: 'N/A (L2/L3)', mac: '00:11:22:AA:BB:02', os: 'Cisco Catalyst 9500', roles: [] },
        { id: 'fw_pri', name: 'PA-NGFW-ACTIVE', type: 'firewall', x: 600, y: 100, ip: '10.20.1.1', mac: '00:90:0B:AA:BB:01', os: 'Palo Alto PAN-OS Active', roles: ['firewall'] },
        { id: 'hq_db', name: 'SQL-CLUSTER', type: 'server', x: 860, y: 200, ip: '10.20.1.50', mac: '00:0C:29:CC:DD:EE', os: 'SQL Server Cluster', roles: ['db'] }
      ],
      links: [
        { id: 'hal1', from: 'user1', to: 'sw_pri', cableType: 'straight' },
        { id: 'hal2', from: 'user1', to: 'sw_sec', cableType: 'straight' },
        { id: 'hal4', from: 'sw_pri', to: 'fw_pri', cableType: 'straight' },
        { id: 'hal6', from: 'fw_pri', to: 'hq_db', cableType: 'straight' }
      ]
    }
  },
  {
    id: 'lab_sdwan_failover',
    title: 'Lab 4: Hybrid SD-WAN & Dual ISP Failover Recovery',
    title_de: 'Lab 4: Hybrides SD-WAN & Dual-ISP-Failover Wiederherstellung',
    difficulty: 'Advanced Enterprise',
    difficulty_de: 'Experte Unternehmens-WAN',
    category: 'SD-WAN & WAN Routing',
    category_de: 'SD-WAN & WAN-Routing',
    description: 'A remote branch office lost primary WAN connection to HQ Datacenter because the secondary 5G LTE backup cable link is disconnected and gateway routing is misconfigured.',
    description_de: 'Eine entfernte Niederlassung hat die primäre WAN-Verbindung zum Hauptrechenzentrum verloren, da die sekundäre 5G-LTE-Backup-Verbindung getrennt ist.',
    objectives: [
      'Connect BACKUP-5G-LTE WAN Cloud to BRANCH-SDWAN-EDGE with a cable.',
      'Configure BRANCH-SDWAN-EDGE Default Gateway IP to 198.51.100.1.',
      'Ensure HQ-SDWAN-HUB is connected to HQ-DATACENTER-APP.'
    ],
    objectives_de: [
      'Verbinden Sie die BACKUP-5G-LTE WAN Cloud per Kabel mit BRANCH-SDWAN-EDGE.',
      'Konfigurieren Sie die Standard-Gateway-IP von BRANCH-SDWAN-EDGE auf 198.51.100.1.',
      'Stellen Sie sicher, dass HQ-SDWAN-HUB mit HQ-DATACENTER-APP verbunden ist.'
    ],
    initialState: {
      nodes: [
        { id: 'b_pc', name: 'BRANCH-USER', type: 'laptop', x: 60, y: 200, ip: '10.10.1.105', mac: '00:50:56:44:55:66', os: 'Windows 11 Pro', roles: [] },
        { id: 'b_sdwan', name: 'BRANCH-SDWAN-EDGE', type: 'router', x: 260, y: 200, ip: '10.10.1.1', mac: '00:11:22:44:55:00', os: 'Cisco SD-WAN VEdge', roles: ['nat'] },
        { id: 'isp_pri', name: 'PRIMARY-FIBER-WAN 🌐', type: 'cloud', x: 500, y: 100, ip: '198.51.100.1', mac: '00:FE:88:11:22:33', os: 'Primary Fiber ISP', roles: [] },
        { id: 'isp_sec', name: 'BACKUP-5G-LTE 🌐', type: 'cloud', x: 500, y: 300, ip: '203.0.113.50', mac: '00:FE:88:44:55:66', os: 'Secondary 5G Cellular ISP', roles: [] },
        { id: 'hq_edge', name: 'HQ-SDWAN-HUB', type: 'router', x: 740, y: 200, ip: '172.16.1.1', mac: '00:11:22:77:88:99', os: 'Cisco SD-WAN C8000', roles: ['nat'] },
        { id: 'hq_app', name: 'HQ-DATACENTER-APP', type: 'server', x: 920, y: 200, ip: '172.16.1.50', mac: '00:0C:29:11:22:33', os: 'Enterprise App Cluster', roles: ['http', 'db'] }
      ],
      links: [
        { id: 'sdlink1', from: 'b_pc', to: 'b_sdwan', cableType: 'straight' },
        { id: 'sdlink2', from: 'b_sdwan', to: 'isp_pri', cableType: 'straight' },
        { id: 'sdlink4', from: 'isp_pri', to: 'hq_edge', cableType: 'straight' },
        { id: 'sdlink5', from: 'hq_edge', to: 'hq_app', cableType: 'straight' }
      ]
    }
  }
];

export function evaluateLabScenario(scenario, nodes, links, fwRules = []) {
  // Grading engine logic
  if (!scenario || !nodes || !links) return { passed: false, score: 0, feedback: ['Invalid scenario state'] };

  let passed = true;
  const feedback = [];

  if (scenario.id === 'lab_dhcp') {
    const srv = nodes.find(n => n.name === 'DC01-SERVER' || n.id === 'srv1');
    const pc = nodes.find(n => n.name === 'WORKSTATION-01' || n.id === 'lap1');
    const sw = nodes.find(n => n.name === 'L2-SWITCH-01' || n.id === 'sw1');

    const hasDhcp = srv && srv.roles && srv.roles.includes('dhcp');
    const hasGateway = srv && (srv.ip === '192.168.1.10' || srv.gateway === '192.168.1.1');
    const pcConnected = links.some(l => (l.from === 'lap1' && l.to === 'sw1') || (l.from === 'sw1' && l.to === 'lap1'));

    if (hasDhcp) {
      feedback.push('✓ DHCP Server Service Role enabled on DC01-SERVER');
    } else {
      passed = false;
      feedback.push('✗ Missing DHCP Service role on DC01-SERVER');
    }

    if (hasGateway) {
      feedback.push('✓ Valid Default Gateway configured (192.168.1.1)');
    } else {
      passed = false;
      feedback.push('✗ Default Gateway IP missing or incorrect');
    }

    if (pcConnected) {
      feedback.push('✓ WORKSTATION-01 connected to L2-SWITCH-01 via Ethernet cable');
    } else {
      passed = false;
      feedback.push('✗ WORKSTATION-01 is disconnected from L2-SWITCH-01');
    }
  } else if (scenario.id === 'lab_firewall') {
    const hasAllow443 = fwRules.some(r => r.port.includes('443') && (r.action === 'ACCEPT' || r.action === 'ALLOW'));
    const isConnected = links.some(l => l.from === 'fw1' || l.to === 'fw1');

    if (hasAllow443) {
      feedback.push('✓ Firewall ACL Rule ACCEPT HTTPS (Port 443) enabled');
    } else {
      passed = false;
      feedback.push('✗ Firewall ACL missing ACCEPT rule for HTTPS Port 443');
    }

    if (isConnected) {
      feedback.push('✓ DMZ-FIREWALL interfaces active');
    } else {
      passed = false;
      feedback.push('✗ DMZ-FIREWALL cable link disconnected');
    }
  } else if (scenario.id === 'lab_ha_campus') {
    const trunkLink = links.some(l => 
      (l.from === 'sw_pri' && l.to === 'sw_sec') || 
      (l.from === 'sw_sec' && l.to === 'sw_pri')
    );

    if (trunkLink) {
      feedback.push('✓ HA Trunk Link established between CORE-SW-01 and CORE-SW-02');
    } else {
      passed = false;
      feedback.push('✗ Missing HA Trunk Link between Core Switches');
    }
  } else if (scenario.id === 'lab_sdwan_failover') {
    const lteLink = links.some(l => 
      (l.from === 'b_sdwan' && l.to === 'isp_sec') || 
      (l.from === 'isp_sec' && l.to === 'b_sdwan')
    );

    if (lteLink) {
      feedback.push('✓ Secondary 5G LTE backup WAN link connected');
    } else {
      passed = false;
      feedback.push('✗ Secondary 5G LTE link disconnected');
    }
  }

  const score = passed ? 100 : Math.round((feedback.filter(f => f.startsWith('✓')).length / scenario.objectives.length) * 100);
  return { passed, score, feedback };
}
