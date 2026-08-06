import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RoutingProtocolModule from '../components/routing/RoutingProtocolModule';

describe('RoutingProtocolModule Component', () => {
  it('renders Routing Protocols header, protocol selectors, and topology selectors', () => {
    render(<RoutingProtocolModule appMode="detailed" />);

    expect(screen.getByText('Famous Routing Protocols & Topology Benchmarking')).toBeInTheDocument();
    expect(screen.getByText('OSPF')).toBeInTheDocument();
    expect(screen.getByText('RIP / RIPv2')).toBeInTheDocument();
    expect(screen.getByText(/Enterprise Multi-Path Mesh/i)).toBeInTheDocument();
    expect(screen.getByText(/Datacenter Spine-Leaf Clos/i)).toBeInTheDocument();
  });

  it('renders separate Routing Protocol Decision Engine window under the canvas', () => {
    render(<RoutingProtocolModule appMode="detailed" />);

    expect(screen.getByText('ROUTING PROTOCOL DECISION ENGINE')).toBeInTheDocument();
    expect(screen.getByText(/Routing Decision Rationale:/i)).toBeInTheDocument();
  });

  it('switches network topology and routing protocols', () => {
    render(<RoutingProtocolModule appMode="detailed" />);

    // Click BGP protocol button
    const bgpBtn = screen.getByText('BGP');
    fireEvent.click(bgpBtn);

    expect(screen.getByText(/Border Gateway Protocol/i)).toBeInTheDocument();

    // Click Spine-Leaf topology option
    const spineLeafOption = screen.getByText(/Datacenter Spine-Leaf Clos/i);
    fireEvent.click(spineLeafOption);

    expect(screen.getByText('Spine SW 1')).toBeInTheDocument();
  });
});
