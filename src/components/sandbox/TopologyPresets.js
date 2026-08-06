/**
 * Pre-configured Topology Presets for NetPulse Network Sandbox
 * Supports Bilingual (English & Deutsch 🇩🇪) labels.
 */

export const TOPOLOGY_PRESETS = {
  office: {
    label: 'Standard Office LAN',
    label_de: 'Standard-Büro LAN',
    nodes: [
      { id: 'pc1', name: 'OFFICE-PC-01', type: 'desktop', x: 60, y: 120, ip: '192.168.1.101', mac: '00:50:56:11:22:33', os: 'Windows 11 Pro', roles: [], subnetMask: '255.255.255.0', vlan: '10', gateway: '192.168.1.1' },
      { id: 'pc2', name: 'OFFICE-PC-02', type: 'laptop', x: 60, y: 240, ip: '192.168.1.102', mac: '00:50:56:44:55:66', os: 'Windows 11 Pro', roles: [], subnetMask: '255.255.255.0', vlan: '10', gateway: '192.168.1.1' },
      { id: 'prn1', name: 'OFFICE-PRINTER', type: 'printer', x: 60, y: 360, ip: '192.168.1.200', mac: '00:11:22:77:88:99', os: 'Network Print OS', roles: [], subnetMask: '255.255.255.0', gateway: '192.168.1.1' },
      { id: 'sw1', name: 'FLOOR-SWITCH-01', type: 'switch', x: 300, y: 240, ip: 'N/A (L2)', mac: '00:11:22:AA:BB:CC', os: 'Cisco Catalyst L2', roles: [], vlan: 'TRUNK' },
      { id: 'srv1', name: 'OFFICE-SERVER', type: 'server', x: 580, y: 120, ip: '192.168.1.10', mac: '00:0C:29:12:34:56', os: 'Windows Server 2022', roles: ['dhcp', 'dns', 'ad'], subnetMask: '255.255.255.0', gateway: '192.168.1.1' },
      { id: 'r1', name: 'OFFICE-GATEWAY', type: 'router', x: 580, y: 360, ip: '192.168.1.1', mac: '00:00:0C:99:88:77', os: 'Cisco ISR Router', roles: ['nat'], subnetMask: '255.255.255.0' },
      { id: 'isp1', name: 'INTERNET-ISP 🌐', type: 'cloud', x: 840, y: 360, ip: '8.8.8.8 (WAN)', mac: '00:FE:88:99:AA:BB', os: 'Public WAN ISP', roles: [] }
    ],
    links: [
      { id: 'l1', from: 'pc1', to: 'sw1', cableType: 'straight' },
      { id: 'l2', from: 'pc2', to: 'sw1', cableType: 'straight' },
      { id: 'l3', from: 'prn1', to: 'sw1', cableType: 'straight' },
      { id: 'l4', from: 'sw1', to: 'srv1', cableType: 'straight' },
      { id: 'l5', from: 'sw1', to: 'r1', cableType: 'straight' },
      { id: 'l6', from: 'r1', to: 'isp1', cableType: 'straight' }
    ]
  },
  corporate: {
    label: 'Corporate HQ',
    label_de: 'Unternehmens-Zentrale (HQ)',
    nodes: [
      { id: 'lap1', name: 'WORKSTATION-01', type: 'laptop', x: 80, y: 160, ip: '192.168.1.105', mac: '00:50:56:A1:B2:C1', os: 'Windows 11 Pro', roles: [], subnetMask: '255.255.255.0', vlan: '10 (DATA)', gateway: '192.168.1.1' },
      { id: 'sw1', name: 'CORE-SWITCH-01', type: 'switch', x: 320, y: 200, ip: 'N/A (L2 Switch)', mac: '00:11:22:33:44:00', os: 'Cisco IOS L2', roles: [], vlan: 'TRUNK' },
      { id: 'srv1', name: 'DC01-AD-SERVER', type: 'server', x: 580, y: 100, ip: '192.168.1.10', mac: '00:0C:29:8E:7F:11', os: 'Windows Server 2022 Datacenter', roles: ['dhcp', 'ad', 'dns'], subnetMask: '255.255.255.0', gateway: '192.168.1.1' },
      { id: 'r1', name: 'EDGE-ROUTER', type: 'router', x: 580, y: 320, ip: '192.168.1.1', mac: '00:00:0C:07:AC:01', os: 'Enterprise Gateway OS', roles: ['nat'], subnetMask: '255.255.255.0' },
      { id: 'isp1', name: 'INTERNET-ISP 🌐', type: 'cloud', x: 820, y: 320, ip: '8.8.8.8 (WAN)', mac: '00:FE:88:99:AA:BB', os: 'Public WAN Gateway ISP', roles: [] }
    ],
    links: [
      { id: 'link1', from: 'lap1', to: 'sw1', cableType: 'straight' },
      { id: 'link2', from: 'sw1', to: 'srv1', cableType: 'straight' },
      { id: 'link3', from: 'sw1', to: 'r1', cableType: 'straight' },
      { id: 'link4', from: 'r1', to: 'isp1', cableType: 'straight' }
    ]
  },
  dmz: {
    label: 'DMZ Palo Alto NGFW',
    label_de: 'DMZ Palo Alto NGFW Firewall',
    nodes: [
      { id: 'lap1', name: 'ADMIN-PC', type: 'laptop', x: 80, y: 160, ip: '192.168.1.100', mac: '00:50:56:11:22:33', os: 'Windows 11 Enterprise', roles: [], subnetMask: '255.255.255.0', vlan: '10 (MGMT)', gateway: '192.168.1.1' },
      { id: 'sw1', name: 'INTERNAL-SWITCH', type: 'switch', x: 300, y: 160, ip: 'N/A (L2)', mac: '00:11:22:33:00:01', os: 'Cisco Catalyst L2', roles: [], vlan: 'TRUNK' },
      { id: 'fw1', name: 'DMZ-FIREWALL', type: 'firewall', x: 520, y: 220, ip: '192.168.1.1', mac: '00:90:0B:22:33:44', os: 'Palo Alto PAN-OS Firewall', roles: ['firewall'], subnetMask: '255.255.255.0' },
      { id: 'web1', name: 'DMZ-WEB-SERVER', type: 'server', x: 520, y: 80, ip: '10.0.0.50', mac: '00:0C:29:AA:BB:CC', os: 'Linux Ubuntu Server', roles: ['http'], subnetMask: '255.255.255.0', vlan: '50 (DMZ)', gateway: '10.0.0.1' },
      { id: 'isp1', name: 'INTERNET-ISP 🌐', type: 'cloud', x: 780, y: 220, ip: '8.8.8.8 (WAN)', mac: '00:FE:88:99:AA:BB', os: 'Public WAN ISP', roles: [] }
    ],
    links: [
      { id: 'link1', from: 'lap1', to: 'sw1', cableType: 'straight' },
      { id: 'link2', from: 'sw1', to: 'fw1', cableType: 'straight' },
      { id: 'link3', from: 'fw1', to: 'web1', cableType: 'straight' },
      { id: 'link4', from: 'fw1', to: 'isp1', cableType: 'straight' }
    ]
  },
  hybrid_wan: {
    label: 'Hybrid SD-WAN',
    label_de: 'Hybrides SD-WAN',
    nodes: [
      { id: 'b_pc', name: 'BRANCH-USER', type: 'laptop', x: 60, y: 220, ip: '10.10.1.105', mac: '00:50:56:44:55:66', os: 'Windows 11 Pro', roles: [], subnetMask: '255.255.255.0', gateway: '10.10.1.1' },
      { id: 'b_sdwan', name: 'BRANCH-SDWAN-EDGE', type: 'router', x: 260, y: 220, ip: '10.10.1.1', mac: '00:11:22:44:55:00', os: 'Cisco SD-WAN VEdge', roles: ['nat'], subnetMask: '255.255.255.0' },
      { id: 'isp_pri', name: 'PRIMARY-FIBER-WAN 🌐', type: 'cloud', x: 500, y: 120, ip: '198.51.100.1', mac: '00:FE:88:11:22:33', os: 'Primary Fiber ISP Provider', roles: [] },
      { id: 'isp_sec', name: 'BACKUP-5G-LTE 🌐', type: 'cloud', x: 500, y: 320, ip: '203.0.113.50', mac: '00:FE:88:44:55:66', os: 'Secondary 5G Cellular ISP', roles: [] },
      { id: 'hq_edge', name: 'HQ-SDWAN-HUB', type: 'router', x: 740, y: 220, ip: '172.16.1.1', mac: '00:11:22:77:88:99', os: 'Cisco SD-WAN C8000', roles: ['nat'], subnetMask: '255.255.0.0' },
      { id: 'hq_app', name: 'HQ-DATACENTER-APP', type: 'server', x: 940, y: 220, ip: '172.16.1.10', mac: '00:0C:29:99:88:77', os: 'Linux Enterprise Server', roles: ['http', 'db'], subnetMask: '255.255.0.0', gateway: '172.16.1.1' }
    ],
    links: [
      { id: 'hl1', from: 'b_pc', to: 'b_sdwan', cableType: 'straight' },
      { id: 'hl2', from: 'b_sdwan', to: 'isp_pri', cableType: 'fiber' },
      { id: 'hl3', from: 'b_sdwan', to: 'isp_sec', cableType: 'serial' },
      { id: 'hl4', from: 'isp_pri', to: 'hq_edge', cableType: 'fiber' },
      { id: 'hl5', from: 'isp_sec', to: 'hq_edge', cableType: 'serial' },
      { id: 'hl6', from: 'hq_edge', to: 'hq_app', cableType: 'straight' }
    ]
  },
  vpn: {
    label: 'Site-to-Site IPsec VPN',
    label_de: 'Standort-zu-Standort IPsec-VPN',
    nodes: [
      { id: 'pc1', name: 'BRANCH-PC', type: 'laptop', x: 80, y: 200, ip: '192.168.10.50', mac: '00:50:56:77:88:99', os: 'Windows 11 Pro', roles: [], subnetMask: '255.255.255.0', vlan: '100', gateway: '192.168.10.1' },
      { id: 'r_branch', name: 'BRANCH-VPN-GW', type: 'router', x: 320, y: 200, ip: '192.168.10.1', mac: '00:11:22:88:99:00', os: 'IPsec Gateway OS', roles: ['nat'], subnetMask: '255.255.255.0' },
      { id: 'isp1', name: 'PUBLIC-WAN 🌐', type: 'cloud', x: 550, y: 200, ip: '203.0.113.1', mac: '00:FE:88:99:AA:BB', os: 'Public WAN Gateway', roles: [] },
      { id: 'r_hq', name: 'HQ-VPN-GW', type: 'router', x: 750, y: 200, ip: '172.16.0.1', mac: '00:11:22:99:00:11', os: 'IPsec Gateway OS', roles: ['nat'], subnetMask: '255.255.0.0' },
      { id: 'hq_srv', name: 'HQ-APP-SERVER', type: 'server', x: 920, y: 200, ip: '172.16.0.50', mac: '00:0C:29:11:22:33', os: 'Windows Server 2022', roles: ['smb', 'dns'], subnetMask: '255.255.0.0', gateway: '172.16.0.1' }
    ],
    links: [
      { id: 'l1', from: 'pc1', to: 'r_branch', cableType: 'straight' },
      { id: 'l2', from: 'r_branch', to: 'isp1', cableType: 'fiber' },
      { id: 'l3', from: 'isp1', to: 'r_hq', cableType: 'fiber' },
      { id: 'l4', from: 'r_hq', to: 'hq_srv', cableType: 'straight' }
    ]
  },
  enterprise_ha: {
    label: 'HA Core Campus',
    label_de: 'Hochverfügbares (HA) Campus-Netzwerk',
    nodes: [
      { id: 'user1', name: 'CORP-PC-01', type: 'laptop', x: 80, y: 220, ip: '10.20.1.100', mac: '00:50:56:99:00:11', os: 'Windows 11 Enterprise', roles: [], subnetMask: '255.255.255.0', gateway: '10.20.1.1' },
      { id: 'sw_pri', name: 'CORE-SW-01 (HA)', type: 'switch', x: 300, y: 120, ip: 'N/A (L2/L3)', mac: '00:11:22:AA:BB:01', os: 'Cisco Catalyst 9500', roles: [], vlan: 'TRUNK' },
      { id: 'sw_sec', name: 'CORE-SW-02 (HA)', type: 'switch', x: 300, y: 320, ip: 'N/A (L2/L3)', mac: '00:11:22:AA:BB:02', os: 'Cisco Catalyst 9500', roles: [], vlan: 'TRUNK' },
      { id: 'fw_pri', name: 'PA-NGFW-ACTIVE', type: 'firewall', x: 580, y: 120, ip: '10.20.1.1', mac: '00:90:0B:AA:BB:01', os: 'Palo Alto PAN-OS Active', roles: ['firewall'], subnetMask: '255.255.255.0' },
      { id: 'fw_sec', name: 'PA-NGFW-STANDBY', type: 'firewall', x: 580, y: 320, ip: '10.20.1.2', mac: '00:90:0B:AA:BB:02', os: 'Palo Alto PAN-OS Passive', roles: ['firewall'], subnetMask: '255.255.255.0' },
      { id: 'hq_db', name: 'SQL-CLUSTER', type: 'server', x: 860, y: 220, ip: '10.20.1.50', mac: '00:0C:29:CC:DD:EE', os: 'SQL Server Cluster', roles: ['db'], subnetMask: '255.255.255.0', gateway: '10.20.1.1' }
    ],
    links: [
      { id: 'hal1', from: 'user1', to: 'sw_pri', cableType: 'straight' },
      { id: 'hal2', from: 'user1', to: 'sw_sec', cableType: 'straight' },
      { id: 'hal3', from: 'sw_pri', to: 'sw_sec', cableType: 'straight' },
      { id: 'hal4', from: 'sw_pri', to: 'fw_pri', cableType: 'straight' },
      { id: 'hal5', from: 'sw_sec', to: 'fw_sec', cableType: 'straight' },
      { id: 'hal6', from: 'fw_pri', to: 'hq_db', cableType: 'straight' },
      { id: 'hal7', from: 'fw_sec', to: 'hq_db', cableType: 'straight' }
    ]
  }
};
