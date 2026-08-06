import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DTSCockpitModule from '../components/dts/DTSCockpitModule';

describe('DTSCockpitModule Component', () => {
  it('renders DTS Cockpit SOC platform', () => {
    render(<DTSCockpitModule appMode="detailed" />);
    expect(screen.getAllByText(/DTS/i).length).toBeGreaterThan(0);
  });
});
