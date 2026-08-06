import { describe, it, expect } from 'vitest';
import { calculateSubnet } from '../utils/subnetCalculator';

describe('subnetCalculator Utility', () => {
  it('calculates subnet parameters for standard /24 network', () => {
    const result = calculateSubnet('192.168.1.100', 24);
    expect(result.netmask).toBe('255.255.255.0');
    expect(result.networkIp).toBe('192.168.1.0');
    expect(result.broadcastIp).toBe('192.168.1.255');
    expect(result.usableHostRange).toBe('192.168.1.1 - 192.168.1.254');
    expect(result.totalUsableHosts).toBe(254);
  });

  it('calculates subnet parameters for /28 subnet', () => {
    const result = calculateSubnet('10.0.0.18', 28);
    expect(result.netmask).toBe('255.255.255.240');
    expect(result.networkIp).toBe('10.0.0.16');
    expect(result.broadcastIp).toBe('10.0.0.31');
    expect(result.totalUsableHosts).toBe(14);
  });
});
