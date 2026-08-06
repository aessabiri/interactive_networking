import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LabNotebook from '../components/notebook/LabNotebook';

describe('LabNotebook Component', () => {
  it('renders CLI Terminal Tutor header', () => {
    render(<LabNotebook appMode="detailed" />);
    expect(screen.getAllByText(/Terminal/i).length).toBeGreaterThan(0);
  });
});
