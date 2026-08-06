import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DNSModule from '../components/dns/DNSModule';

describe('DNSModule Component', () => {
  it('renders DNS Resolver', () => {
    render(<DNSModule appMode="detailed" />);
    expect(screen.getAllByText(/DNS/i).length).toBeGreaterThan(0);
  });
});
