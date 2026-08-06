/**
 * Interactive Lab Troubleshooting Scenarios & Automated Grading Engine
 */

export const LAB_SCENARIOS = [
  {
    id: 'lab_dhcp',
    title: 'Lab 1: Configure Corporate DHCP & Default Gateway',
    difficulty: 'Beginner',
    category: 'Network Infrastructure',
    description: 'A new workstation has joined the corporate office but cannot reach the Internet Gateway because the Server lacks the DHCP service role and gateway IP settings.',
    objectives: [
      'Enable the DHCP Server role on DC01-SERVER.',
      'Ensure DC01-SERVER has Gateway IP 192.168.1.1 configured.',
      'Ensure WORKSTATION-01 is connected to L2-SWITCH-01 via Ethernet cable.'
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
    difficulty: 'Intermediate',
    category: 'Cybersecurity & Firewalls',
    description: 'Inbound Web Server traffic to DMZ-WEB-SERVER is being dropped because the Firewall ACL table is missing an ALLOW rule for HTTPS Port 443.',
    objectives: [
      'Add or enable an ACCEPT rule for HTTPS (Port 443) in the firewall rules table.',
      'Ensure DMZ-FIREWALL is connected to both INTERNAL-SWITCH and DMZ-WEB-SERVER.'
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
    difficulty: 'Advanced',
    category: 'Campus Network Architecture',
    description: 'The core campus network has redundant Core Switches, but the trunk link between CORE-SW-01 and CORE-SW-02 is missing, preventing Spanning Tree Protocol (STP) HA synchronization.',
    objectives: [
      'Create a trunk cable connection between CORE-SW-01 and CORE-SW-02.',
      'Ensure active firewall PA-NGFW-ACTIVE is connected to CORE-SW-01.'
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
    difficulty: 'Advanced Enterprise',
    category: 'SD-WAN & WAN Routing',
    description: 'A remote branch office lost primary WAN connection to HQ Datacenter because the secondary 5G LTE backup cable link is disconnected and gateway routing is misconfigured.',
    objectives: [
      'Connect BACKUP-5G-LTE WAN Cloud to BRANCH-SDWAN-EDGE with a cable.',
      'Configure BRANCH-SDWAN-EDGE Default Gateway IP to 198.51.100.1.',
      'Ensure HQ-SDWAN-HUB is connected to HQ-DATACENTER-APP.'
    ],
    initialState: {
      nodes: [
        { id: 'b_pc', name: 'BRANCH-USER', type: 'laptop', x: 60, y: 200, ip: '10.10.1.105', mac: '00:50:56:44:55:66', os: 'Windows 11 Pro', roles: [] },
        { id: 'b_sdwan', name: 'BRANCH-SDWAN-EDGE', type: 'router', x: 260, y: 200, ip: '10.10.1.1', mac: '00:11:22:44:55:00', os: 'Cisco SD-WAN VEdge', roles: ['nat'] },
        { id: 'isp_pri', name: 'PRIMARY-FIBER-WAN 🌐', type: 'cloud', x: 500, y: 100, ip: '198.51.100.1', mac: '00:FE:88:11:22:33', os: 'Primary Fiber ISP', roles: [] },
        { id: 'isp_sec', name: 'BACKUP-5G-LTE 🌐', type: 'cloud', x: 500, y: 300, ip: '203.0.113.50', mac: '00:FE:88:44:55:66', os: 'Secondary 5G Cellular ISP', roles: [] },
        { id: 'hq_edge', name: 'HQ-SDWAN-HUB', type: 'router', x: 740, y: 200, ip: '172.16.1.1', mac: '00:11:22:77:88:99', os: 'Cisco SD-WAN C8000', roles: ['nat'] },
        { id: 'hq_app', name: 'HQ-DATACENTER-APP', type: 'server', x: 940, y: 200, ip: '172.16.1.10', mac: '00:0C:29:99:88:77', os: 'Linux Enterprise Server', roles: ['http'] }
      ],
      links: [
        { id: 'hl1', from: 'b_pc', to: 'b_sdwan', cableType: 'straight' },
        { id: 'hl2', from: 'b_sdwan', to: 'isp_pri', cableType: 'fiber' },
        { id: 'hl4', from: 'isp_pri', to: 'hq_edge', cableType: 'fiber' },
        { id: 'hl6', from: 'hq_edge', to: 'hq_app', cableType: 'straight' }
      ]
    }
  }
];

export function evaluateLabScenario(scenarioId, nodes = [], links = [], firewallRules = []) {
  const scenario = LAB_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return { score: 0, completed: false, passedObjectives: [], hints: [] };

  const passedObjectives = [];
  const hints = [];

  if (scenarioId === 'lab_dhcp') {
    const serverNode = nodes.find(n => n.type === 'server' || n.name.includes('SERVER'));
    if (serverNode && (serverNode.roles || []).includes('dhcp')) {
      passedObjectives.push(0);
    } else {
      hints.push('Open the gear ⚙️ config menu on DC01-SERVER and enable the DHCP Server role checkbox.');
    }

    if (serverNode && (serverNode.gateway === '192.168.1.1' || serverNode.ip === '192.168.1.10')) {
      passedObjectives.push(1);
    } else {
      hints.push('Set DC01-SERVER Default Gateway to 192.168.1.1.');
    }

    const workstation = nodes.find(n => n.name.includes('WORKSTATION') || n.id === 'lap1');
    const isConnected = links.some(l => 
      (l.from === workstation?.id || l.to === workstation?.id)
    );
    if (isConnected) {
      passedObjectives.push(2);
    } else {
      hints.push('Use the cable tool to connect WORKSTATION-01 to L2-SWITCH-01.');
    }
  } else if (scenarioId === 'lab_firewall') {
    const hasHttpsAllow = firewallRules.some(r => 
      (r.port.includes('443') || r.serviceKey === 'https') && r.action === 'ACCEPT'
    );
    if (hasHttpsAllow) {
      passedObjectives.push(0);
    } else {
      hints.push('Ensure ACL Rule #101 (Port 443 HTTPS) has action set to ACCEPT.');
    }

    const fwNode = nodes.find(n => n.type === 'firewall');
    const webNode = nodes.find(n => n.name.includes('WEB-SERVER'));
    const isFwConnected = links.some(l => 
      (l.from === fwNode?.id && l.to === webNode?.id) || (l.from === webNode?.id && l.to === fwNode?.id)
    );
    if (isFwConnected) {
      passedObjectives.push(1);
    } else {
      hints.push('Connect a cable from DMZ-FIREWALL directly to DMZ-WEB-SERVER.');
    }
  } else if (scenarioId === 'lab_ha_campus') {
    const swPri = nodes.find(n => n.name.includes('CORE-SW-01'));
    const swSec = nodes.find(n => n.name.includes('CORE-SW-02'));
    const hasTrunkLink = links.some(l => 
      (l.from === swPri?.id && l.to === swSec?.id) || (l.from === swSec?.id && l.to === swPri?.id)
    );
    if (hasTrunkLink) {
      passedObjectives.push(0);
    } else {
      hints.push('Connect a cable between CORE-SW-01 and CORE-SW-02.');
    }

    const fwPri = nodes.find(n => n.name.includes('PA-NGFW-ACTIVE'));
    const isFwConnected = links.some(l => 
      (l.from === swPri?.id && l.to === fwPri?.id) || (l.from === fwPri?.id && l.to === swPri?.id)
    );
    if (isFwConnected) {
      passedObjectives.push(1);
    } else {
      hints.push('Connect PA-NGFW-ACTIVE to CORE-SW-01.');
    }
  } else if (scenarioId === 'lab_sdwan_failover') {
    const bSdwan = nodes.find(n => n.name.includes('BRANCH-SDWAN'));
    const isp5g = nodes.find(n => n.name.includes('5G'));
    const has5gLink = links.some(l => 
      (l.from === bSdwan?.id && l.to === isp5g?.id) || (l.from === isp5g?.id && l.to === bSdwan?.id)
    );
    if (has5gLink) {
      passedObjectives.push(0);
    } else {
      hints.push('Connect BACKUP-5G-LTE WAN Cloud to BRANCH-SDWAN-EDGE with a cable.');
    }

    if (bSdwan && (bSdwan.gateway === '198.51.100.1' || bSdwan.ip === '10.10.1.1')) {
      passedObjectives.push(1);
    } else {
      hints.push('Set BRANCH-SDWAN-EDGE Gateway IP to 198.51.100.1.');
    }

    const hqEdge = nodes.find(n => n.name.includes('HQ-SDWAN'));
    const hqApp = nodes.find(n => n.name.includes('HQ-DATACENTER'));
    const hasHqLink = links.some(l => 
      (l.from === hqEdge?.id && l.to === hqApp?.id) || (l.from === hqApp?.id && l.to === hqEdge?.id)
    );
    if (hasHqLink) {
      passedObjectives.push(2);
    } else {
      hints.push('Ensure HQ-SDWAN-HUB is connected to HQ-DATACENTER-APP.');
    }
  }

  const score = Math.round((passedObjectives.length / scenario.objectives.length) * 100);

  return {
    score,
    completed: score === 100,
    passedObjectives,
    hints
  };
}
