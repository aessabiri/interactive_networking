import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FirewallVPNModule from '../components/firewall/FirewallVPNModule';

describe('FirewallVPNModule Component', () => {
  it('renders Stateful Firewall & IPsec VPN title', () => {
    render(<FirewallVPNModule appMode="detailed" />);
    expect(screen.getAllByText(/Firewall/i).length).toBeGreaterThan(0);
  });
});
