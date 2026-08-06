import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProtocolsModule from '../components/protocols/ProtocolsModule';

describe('ProtocolsModule Component', () => {
  it('renders Protocols Catalog header and search bar', () => {
    render(<ProtocolsModule appMode="detailed" />);

    expect(screen.getByText('Network Protocols Catalog & Field Inspector')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search protocols/i)).toBeInTheDocument();
  });

  it('lists protocols across Network, Transport, Application, and Data Link layers', () => {
    render(<ProtocolsModule appMode="detailed" />);

    expect(screen.getAllByText('IPv4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TCP').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HTTP / HTTPS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ethernet').length).toBeGreaterThan(0);
  });

  it('opens protocol details modal when clicking a protocol card', () => {
    render(<ProtocolsModule appMode="detailed" />);

    const ipv4Card = screen.getByText('Internet Protocol version 4');
    fireEvent.click(ipv4Card);

    expect(screen.getByText('Protocol Overview & Operating Description')).toBeInTheDocument();
    expect(screen.getByText(/For What It Is Used/i)).toBeInTheDocument();
    expect(screen.getByText('Close Inspector')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('Close Inspector'));
    expect(screen.queryByText('Protocol Overview & Operating Description')).not.toBeInTheDocument();
  });

  it('filters protocol cards when entering a search query', () => {
    render(<ProtocolsModule appMode="detailed" />);

    const searchInput = screen.getByPlaceholderText(/Search protocols/i);
    fireEvent.change(searchInput, { target: { value: 'QUIC' } });

    expect(screen.getAllByText('QUIC').length).toBeGreaterThan(0);
    expect(screen.queryByText('Internet Protocol version 4')).not.toBeInTheDocument();
  });
});
