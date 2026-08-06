import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EnterpriseModule from '../components/enterprise/EnterpriseModule';

describe('EnterpriseModule Component', () => {
  it('renders enterprise infrastructure overview', () => {
    render(<EnterpriseModule appMode="detailed" />);
    expect(screen.getAllByText(/Enterprise/i).length).toBeGreaterThan(0);
  });
});
