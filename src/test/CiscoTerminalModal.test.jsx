import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CiscoTerminalModal from '../components/sandbox/CiscoTerminalModal';

describe('CiscoTerminalModal Component', () => {
  it('renders Cisco CLI terminal modal with hostname header', () => {
    const node = { id: 'r1', name: 'CORE-ROUTER-01', os: 'Cisco IOS-XE' };
    render(<CiscoTerminalModal node={node} onClose={() => {}} onUpdateNode={() => {}} />);

    expect(screen.getByText(/Cisco IOS CLI Emulator — CORE-ROUTER-01/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type command/i)).toBeInTheDocument();
  });

  it('executes enable and configure terminal commands', () => {
    const node = { id: 'r1', name: 'CORE-ROUTER-01' };
    render(<CiscoTerminalModal node={node} onClose={() => {}} onUpdateNode={() => {}} />);

    const input = screen.getByPlaceholderText(/Type command/i);
    const executeBtn = screen.getByRole('button', { name: /Execute/i });

    fireEvent.change(input, { target: { value: 'conf t' } });
    fireEvent.click(executeBtn);

    expect(screen.getByText(/Enter configuration commands/i)).toBeInTheDocument();
  });
});
