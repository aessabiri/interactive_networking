import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CleanControlButton, CleanWidget, SlideOutInspector } from '../components/common/EasyCard';

describe('CleanControlButton Component', () => {
  it('renders button label and triggers onClick', () => {
    const handleClick = vi.fn();
    render(
      <CleanControlButton
        label="Start Simulation"
        description="Run test flow"
        onClick={handleClick}
      />
    );

    const buttonText = screen.getByText('Start Simulation');
    expect(buttonText).toBeInTheDocument();
    expect(screen.getByText('Run test flow')).toBeInTheDocument();

    fireEvent.click(buttonText);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('CleanWidget Component', () => {
  it('renders widget title, protocol badge, and control buttons', () => {
    const handlePlay = vi.fn();
    const handleReset = vi.fn();

    render(
      <CleanWidget
        title="DHCP Lease Simulator"
        subtitle="DORA Protocol Execution"
        protocol="DHCP / UDP 67"
        ip="192.168.1.100"
        isPlaying={false}
        onPlay={handlePlay}
        onReset={handleReset}
      />
    );

    expect(screen.getByText('DHCP Lease Simulator')).toBeInTheDocument();
    expect(screen.getByText('DORA Protocol Execution')).toBeInTheDocument();
    expect(screen.getByText('DHCP / UDP 67')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();

    const playBtn = screen.getByTitle('Play');
    fireEvent.click(playBtn);
    expect(handlePlay).toHaveBeenCalledTimes(1);

    const resetBtn = screen.getByTitle('Reset');
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});

describe('SlideOutInspector Component', () => {
  it('renders children content', () => {
    render(
      <SlideOutInspector title="Test Technical Inspector">
        <div data-testid="child-content">Packet Log Data</div>
      </SlideOutInspector>
    );

    expect(screen.getByText('Test Technical Inspector')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent('Packet Log Data');
  });
});
