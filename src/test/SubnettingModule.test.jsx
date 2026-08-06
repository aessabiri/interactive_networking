import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SubnettingModule from '../components/subnetting/SubnettingModule';
import { calculateVlsm, calculateFlsm } from '../utils/subnetCalculator';

describe('SubnettingModule & VLSM/FLSM Engine', () => {
  const baseIp = '172.160.0.0';
  const baseCidr = 18;
  const subnets = [
    { id: 1, name: 'LAN 1', hosts: 900 },
    { id: 2, name: 'LAN 2', hosts: 450 },
    { id: 3, name: 'LAN 3', hosts: 300 },
    { id: 4, name: 'LAN 4', hosts: 200 }
  ];

  it('correctly calculates VLSM parameters for classroom exercise example (172.160.0.0/18)', () => {
    const vlsm = calculateVlsm(baseIp, baseCidr, subnets);
    expect(vlsm.subnets.length).toBe(4);

    // LAN 1: 900 hosts => /22 (1024 IPs, 1022 Usable)
    const lan1 = vlsm.subnets.find(s => s.name === 'LAN 1');
    expect(lan1.prefix).toBe('/22');
    expect(lan1.subnetMask).toBe('255.255.252.0');
    expect(lan1.wildcardMask).toBe('0.0.3.255');
    expect(lan1.networkAddress).toBe('172.160.0.0');
    expect(lan1.broadcastAddress).toBe('172.160.3.255');
    expect(lan1.firstUsable).toBe('172.160.0.1');
    expect(lan1.lastUsable).toBe('172.160.3.254');
    expect(lan1.totalUsable).toBe(1022);

    // LAN 2: 450 hosts => /23 (512 IPs, 510 Usable)
    const lan2 = vlsm.subnets.find(s => s.name === 'LAN 2');
    expect(lan2.prefix).toBe('/23');
    expect(lan2.subnetMask).toBe('255.255.254.0');
    expect(lan2.wildcardMask).toBe('0.0.1.255');
    expect(lan2.networkAddress).toBe('172.160.4.0');
    expect(lan2.broadcastAddress).toBe('172.160.5.255');
  });

  it('correctly calculates FLSM parameters for classroom exercise example', () => {
    const flsm = calculateFlsm(baseIp, baseCidr, subnets);
    expect(flsm.subnets.length).toBe(4);

    // In FLSM, all subnets are given /22 equal block size based on max requirement (900h)
    flsm.subnets.forEach(s => {
      expect(s.prefix).toBe('/22');
      expect(s.subnetMask).toBe('255.255.252.0');
    });
  });

  it('renders SubnettingModule component with visual block map and step calculation cards', () => {
    render(<SubnettingModule appMode="clean" />);

    expect(screen.getByText('FLSM & VLSM Calculator Engine')).toBeInTheDocument();
    expect(screen.getAllByText(/LAN 1/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/255.255.252.0/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/0.0.3.255/i)[0]).toBeInTheDocument();
  });

  it('allows toggling between VLSM and FLSM modes', () => {
    render(<SubnettingModule appMode="clean" />);

    const flsmBtn = screen.getByText('FLSM (Fixed Length)');
    fireEvent.click(flsmBtn);

    expect(screen.getByText(/FLSM Calculation Results Matrix/i)).toBeInTheDocument();
  });
});
