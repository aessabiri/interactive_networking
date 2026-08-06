import { describe, it, expect } from 'vitest';
import { TOPOLOGY_PRESETS } from '../components/sandbox/TopologyPresets';

describe('TopologyPresets', () => {
  it('contains expected presets', () => {
    expect(TOPOLOGY_PRESETS).toHaveProperty('office');
    expect(TOPOLOGY_PRESETS).toHaveProperty('corporate');
    expect(TOPOLOGY_PRESETS).toHaveProperty('dmz');
    expect(TOPOLOGY_PRESETS).toHaveProperty('hybrid_wan');
    expect(TOPOLOGY_PRESETS).toHaveProperty('vpn');
    expect(TOPOLOGY_PRESETS).toHaveProperty('enterprise_ha');
  });

  it('validates node and link references in all presets', () => {
    Object.keys(TOPOLOGY_PRESETS).forEach(key => {
      const preset = TOPOLOGY_PRESETS[key];
      expect(preset.nodes.length).toBeGreaterThan(0);
      expect(preset.links.length).toBeGreaterThan(0);

      const nodeIds = new Set(preset.nodes.map(n => n.id));
      preset.links.forEach(link => {
        expect(nodeIds.has(link.from)).toBe(true);
        expect(nodeIds.has(link.to)).toBe(true);
      });
    });
  });
});
