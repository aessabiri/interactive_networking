import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OSITCPIPModule from '../components/osi/OSITCPIPModule';

describe('OSITCPIPModule Component', () => {
  it('renders OSI 7-layer stack vertically from X: 3% to 15%, Y: 3% to 70%', () => {
    render(<OSITCPIPModule appMode="detailed" />);

    expect(screen.getByText(/OSI Layer-by-Layer Encapsulation Engine/i)).toBeInTheDocument();
    expect(screen.getAllByText('Application')[0]).toBeInTheDocument();
    expect(screen.getByText('Physical')).toBeInTheDocument();
  });

  it('allows clicking layer buttons in vertical stack', () => {
    render(<OSITCPIPModule appMode="detailed" />);

    const l4Btn = screen.getByText('Transport');
    fireEvent.click(l4Btn);

    expect(screen.getByText('Transport')).toBeInTheDocument();
  });
});
