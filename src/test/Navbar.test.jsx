import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  it('renders NetPulse brand title and 3 category dropdown menus', () => {
    const setActiveTab = vi.fn();
    const setAppMode = vi.fn();

    render(
      <Navbar
        activeTab="enterprise"
        setActiveTab={setActiveTab}
        appMode="clean"
        setAppMode={setAppMode}
      />
    );

    expect(screen.getByText('NetPulse')).toBeInTheDocument();
    expect(screen.getByText('Visualize')).toBeInTheDocument();
    expect(screen.getByText('Learn & Test')).toBeInTheDocument();
    expect(screen.getByText('Sandbox')).toBeInTheDocument();
  });

  it('opens Visualize dropdown and triggers setActiveTab when OSI & TCP/IP or RAID is selected', () => {
    const setActiveTab = vi.fn();
    const setAppMode = vi.fn();

    render(
      <Navbar
        activeTab="enterprise"
        setActiveTab={setActiveTab}
        appMode="clean"
        setAppMode={setAppMode}
      />
    );

    const visualizeCategoryBtn = screen.getByText('Visualize');
    fireEvent.click(visualizeCategoryBtn);

    const osiModuleBtn = screen.getByText(/OSI & TCP\/IP Reference/i);
    fireEvent.click(osiModuleBtn);

    expect(setActiveTab).toHaveBeenCalledWith('osi');
  });

  it('opens Learn & Test dropdown and selects Protocol Catalog module', () => {
    const setActiveTab = vi.fn();
    const setAppMode = vi.fn();

    render(
      <Navbar
        activeTab="enterprise"
        setActiveTab={setActiveTab}
        appMode="clean"
        setAppMode={setAppMode}
      />
    );

    const learnTestCategoryBtn = screen.getByText('Learn & Test');
    fireEvent.click(learnTestCategoryBtn);

    const protocolCatalogBtn = screen.getByText(/Protocol Catalog 📖/i);
    fireEvent.click(protocolCatalogBtn);

    expect(setActiveTab).toHaveBeenCalledWith('protocols');
  });
});
