import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LANModule from '../components/lan/LANModule';

describe('LANModule Component', () => {
  it('renders LAN Switching & VLAN tagging header', () => {
    render(<LANModule appMode="detailed" />);
    expect(screen.getAllByText(/VLAN/i).length).toBeGreaterThan(0);
  });
});
