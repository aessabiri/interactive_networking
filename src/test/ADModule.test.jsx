import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ADModule from '../components/active-directory/ADModule';

describe('ADModule Component', () => {
  it('renders Active Directory DS domain hierarchy', () => {
    render(<ADModule appMode="detailed" />);
    expect(screen.getAllByText(/Active Directory/i).length).toBeGreaterThan(0);
  });
});
