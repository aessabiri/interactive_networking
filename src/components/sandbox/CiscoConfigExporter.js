/**
 * Cisco IOS Configuration Exporter & Parser Utility
 */

export function generateCiscoConfig(nodes = [], links = []) {
  let script = `! ==========================================\n`;
  script += `! NETPULSE LAB - CISCO IOS RUNNING CONFIGURATION\n`;
  script += `! Generated on: ${new Date().toLocaleString()}\n`;
  script += `! ==========================================\n\n`;

  nodes.forEach(node => {
    script += `! ------------------------------------------\n`;
    script += `! DEVICE: ${node.name} (${(node.type || 'DEVICE').toUpperCase()})\n`;
    script += `! OS: ${node.os || 'Generic OS'}\n`;
    script += `! ------------------------------------------\n`;
    script += `hostname ${node.name.replace(/[^a-zA-Z0-9_-]/g, '_')}\n!\n`;

    if (node.type === 'switch') {
      script += `vlan 10\n name MANAGEMENT\n!\n`;
      script += `vlan 20\n name DATA_USERS\n!\n`;
      const connected = links.filter(l => l.from === node.id || l.to === node.id);
      connected.forEach((link, idx) => {
        const otherId = link.from === node.id ? link.to : link.from;
        const otherNode = nodes.find(n => n.id === otherId);
        script += `interface GigabitEthernet0/${idx + 1}\n`;
        script += ` description Link to ${otherNode ? otherNode.name : 'Device'}\n`;
        script += ` switchport mode ${link.cableType === 'trunk' ? 'trunk' : 'access'}\n`;
        script += ` no shutdown\n!\n`;
      });
    } else if (node.type === 'router' || node.type === 'firewall') {
      script += `interface GigabitEthernet0/0\n`;
      script += ` description LAN Gateway\n`;
      script += ` ip address ${node.ip !== 'N/A (L2)' ? node.ip : '192.168.1.1'} ${node.subnetMask || '255.255.255.0'}\n`;
      script += ` no shutdown\n!\n`;
      if (node.roles?.includes('nat')) {
        script += `ip nat inside source list 1 interface GigabitEthernet0/1 overload\n!\n`;
      }
    } else if (node.type === 'server') {
      script += `! Server IP Address: ${node.ip}\n`;
      if (node.roles?.includes('dhcp')) {
        script += `ip dhcp pool CORPORATE_LAN\n`;
        script += ` network 192.168.1.0 255.255.255.0\n`;
        script += ` default-router 192.168.1.1\n`;
        script += ` dns-server 192.168.1.10\n!\n`;
      }
    }
    script += `\n`;
  });

  return script;
}

export function parseCiscoConfig(content) {
  const lines = content.split('\n');
  const importedNodes = [];
  let currentDevice = null;
  let xPos = 100;
  let yPos = 160;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('hostname')) {
      const name = trimmed.split(' ')[1] || 'CISCO-DEVICE';
      const lowerName = name.toLowerCase();
      const isSwitch = lowerName.includes('sw') || lowerName.includes('switch');
      const isRouter = lowerName.includes('rt') || lowerName.includes('router');
      const isFw = lowerName.includes('fw') || lowerName.includes('firewall');
      const type = isSwitch ? 'switch' : isRouter ? 'router' : isFw ? 'firewall' : 'server';

      currentDevice = {
        id: `imported-${Date.now()}-${importedNodes.length}`,
        name,
        type,
        x: xPos,
        y: yPos,
        ip: isSwitch ? 'N/A (L2)' : '192.168.1.1',
        mac: '00:1A:2B:3C:4D:' + (10 + importedNodes.length),
        os: isSwitch ? 'Cisco IOS L2 Switch' : isRouter ? 'Cisco IOS Router' : 'Palo Alto PAN-OS',
        roles: isSwitch ? [] : isRouter ? ['nat'] : ['firewall'],
        subnetMask: '255.255.255.0'
      };
      importedNodes.push(currentDevice);
      xPos = (xPos + 220) % 800;
      if (xPos < 120) yPos += 150;
    } else if (currentDevice && trimmed.startsWith('ip address')) {
      const parts = trimmed.split(' ');
      if (parts.length >= 4) {
        currentDevice.ip = parts[2];
        currentDevice.subnetMask = parts[3];
      }
    }
  });

  return importedNodes;
}
