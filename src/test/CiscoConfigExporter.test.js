import { describe, it, expect } from 'vitest';
import { generateCiscoConfig, parseCiscoConfig } from '../components/sandbox/CiscoConfigExporter';

describe('CiscoConfigExporter Utility', () => {
  const mockNodes = [
    {
      id: 'sw1',
      name: 'CORE-SWITCH-01',
      type: 'switch',
      ip: 'N/A (L2)',
      os: 'Cisco IOS L2 Switch'
    },
    {
      id: 'r1',
      name: 'BORDER-ROUTER',
      type: 'router',
      ip: '192.168.1.1',
      subnetMask: '255.255.255.0',
      roles: ['nat'],
      os: 'Cisco IOS Router'
    }
  ];

  const mockLinks = [
    { id: 'link1', from: 'sw1', to: 'r1', cableType: 'trunk' }
  ];

  it('generates valid Cisco IOS running config script containing hostnames and interfaces', () => {
    const config = generateCiscoConfig(mockNodes, mockLinks);
    
    expect(config).toContain('hostname CORE-SWITCH-01');
    expect(config).toContain('hostname BORDER-ROUTER');
    expect(config).toContain('switchport mode trunk');
    expect(config).toContain('ip address 192.168.1.1 255.255.255.0');
    expect(config).toContain('ip nat inside source list 1 interface GigabitEthernet0/1 overload');
  });

  it('parses Cisco IOS config content into device node objects', () => {
    const rawConfig = `
      hostname HQ_SWITCH_01
      !
      hostname EDGE_ROUTER_01
      ip address 10.0.0.1 255.255.255.0
    `;

    const nodes = parseCiscoConfig(rawConfig);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].name).toBe('HQ_SWITCH_01');
    expect(nodes[0].type).toBe('switch');
    expect(nodes[1].name).toBe('EDGE_ROUTER_01');
    expect(nodes[1].type).toBe('router');
    expect(nodes[1].ip).toBe('10.0.0.1');
    expect(nodes[1].subnetMask).toBe('255.255.255.0');
  });
});
