import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConfigureModule from '../components/configure/ConfigureModule';

describe('ConfigureModule Component', () => {
  it('renders module title and topic cards', () => {
    render(<ConfigureModule appMode="detailed" />);

    expect(screen.getByText(/Hands-On Configuration & Step Sequence Builder/i)).toBeInTheDocument();
    expect(screen.getAllByText(/DHCP Server Scope & Option Deployment/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/VLAN & 802.1Q IEEE Trunk Link Setup/i)).toBeInTheDocument();
  });

  it('opens sub-steps modal when a step is clicked', () => {
    render(<ConfigureModule appMode="detailed" />);

    const stepCard = screen.getByText(/Step 1: Install & Enable DHCP Service Daemon/i);
    fireEvent.click(stepCard);

    expect(screen.getByText(/Detailed Technical Sub-Steps & Commands/i)).toBeInTheDocument();
    expect(screen.getByText(/Install DHCP Server role package/i)).toBeInTheDocument();
  });
});
