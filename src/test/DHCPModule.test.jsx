import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DHCPModule from '../components/dhcp/DHCPModule';

describe('DHCPModule Component', () => {
  it('renders DHCP scope title and mode buttons', () => {
    render(<DHCPModule appMode="detailed" />);

    expect(screen.getByText(/DHCP Scope Configurator & DORA Analyzer/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Single-Subnet L2 Switch/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Multi-Subnet L3 Relay Agent/i).length).toBeGreaterThan(0);
  });

  it('toggles scope config drawer and updates scope name', () => {
    render(<DHCPModule appMode="detailed" />);

    const openConfigBtn = screen.getByRole('button', { name: /Configure DHCP Scope/i });
    fireEvent.click(openConfigBtn);

    expect(screen.getByText(/Enterprise DHCP Server Scope Properties/i)).toBeInTheDocument();
  });
});
