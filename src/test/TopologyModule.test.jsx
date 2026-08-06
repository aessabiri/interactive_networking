import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TopologyModule from '../components/topology/TopologyModule';

describe('TopologyModule Component', () => {
  it('renders Enterprise Network Topology Visualizer header and clear canvas state', () => {
    render(<TopologyModule appMode="detailed" />);

    expect(screen.getByText('Enterprise Network Topology Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Canvas Stage Ready')).toBeInTheDocument();
    expect(screen.getByText('Clear Canvas')).toBeInTheDocument();
  });

  it('allows switching between 11 network topologies (Star, Tree, Full Mesh, Spine-Leaf, etc.)', () => {
    render(<TopologyModule appMode="detailed" />);

    // Click Star topology
    const starBtn = screen.getByText('Star');
    fireEvent.click(starBtn);

    expect(screen.getByText('Star Topology')).toBeInTheDocument();
    expect(screen.getByText('CENTRAL SWITCH')).toBeInTheDocument();

    // Click Spine-Leaf topology
    const spineBtn = screen.getByText('Spine-Leaf');
    fireEvent.click(spineBtn);

    expect(screen.getByText('Spine-Leaf Data Center Topology')).toBeInTheDocument();
    expect(screen.getByText('SPINE-SW-01')).toBeInTheDocument();
  });

  it('clears canvas stage when clicking Clear Canvas button', () => {
    render(<TopologyModule appMode="detailed" />);

    // Click Star topology first
    fireEvent.click(screen.getByText('Star'));
    expect(screen.getByText('CENTRAL SWITCH')).toBeInTheDocument();

    // Click Clear Canvas
    fireEvent.click(screen.getByText('Clear Canvas'));
    expect(screen.getByText('Canvas Stage Ready')).toBeInTheDocument();
    expect(screen.queryByText('CENTRAL SWITCH')).not.toBeInTheDocument();
  });
});
