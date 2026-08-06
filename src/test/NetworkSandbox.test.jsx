import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NetworkSandbox from '../components/sandbox/NetworkSandbox';

describe('NetworkSandbox Component', () => {
  it('renders Topology Sandbox canvas', () => {
    render(<NetworkSandbox appMode="detailed" />);
    expect(screen.getAllByText(/Topology/i).length).toBeGreaterThan(0);
  });
});
