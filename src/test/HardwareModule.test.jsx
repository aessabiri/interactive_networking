import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HardwareModule from '../components/hardware/HardwareModule';

describe('HardwareModule Component', () => {
  it('renders Hardware & RAID Storage Workbench header and title', () => {
    render(<HardwareModule appMode="detailed" />);

    expect(screen.getByText('Server RAID Storage & Data Flow Workbench')).toBeInTheDocument();
    expect(screen.getAllByText(/RAID 5/i).length).toBeGreaterThan(0);
  });

  it('calculates usable capacity and fault tolerance for RAID 5', () => {
    render(<HardwareModule appMode="detailed" />);

    expect(screen.getByText('6 TB')).toBeInTheDocument(); // 3 * 2TB usable
    expect(screen.getByText('1 Drive')).toBeInTheDocument(); // 1 drive fault tolerance
  });

  it('allows switching to RAID 0 and updates capacity and fault tolerance', () => {
    render(<HardwareModule appMode="detailed" />);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '0' } });

    expect(screen.getAllByText('8 TB').length).toBeGreaterThan(0); // 4 * 2TB
    expect(screen.getByText('0 Drives')).toBeInTheDocument();
  }, 10000);

  it('simulates drive failure when clicking Fail 1 Drive button', () => {
    render(<HardwareModule appMode="detailed" />);

    const failBtn = screen.getByText('Fail 1 Drive (Test Scenario)');
    fireEvent.click(failBtn);

    expect(screen.getByText(/ARRAY STATE: DEGRADED \(FAULT TOLERANT\)/i)).toBeInTheDocument();
  });

  it('toggles data write pulse simulation', () => {
    render(<HardwareModule appMode="detailed" />);

    const pulseBtn = screen.getByRole('button', { name: /Simulate Data Write Stream/i });
    fireEvent.click(pulseBtn);

    expect(screen.getByText(/Pause Write Pulse/i)).toBeInTheDocument();
  });

  it('switches between 1-harddrive failure scenarios for every RAID type', () => {
    render(<HardwareModule appMode="detailed" />);

    // Click RAID 0 scenario
    const raid0ScenarioBtn = screen.getByRole('button', { name: /RAID 0 Scenario/i });
    fireEvent.click(raid0ScenarioBtn);
    expect(screen.getByText(/RAID 0 — 1 Drive Failure Scenario/i)).toBeInTheDocument();

    // Click RAID 1 scenario
    const raid1ScenarioBtn = screen.getByRole('button', { name: /RAID 1 Scenario/i });
    fireEvent.click(raid1ScenarioBtn);
    expect(screen.getByText(/RAID 1 — 1 Drive Failure Scenario/i)).toBeInTheDocument();
  }, 10000);
});
