import { describe, it, expect } from 'vitest';
import { LAB_SCENARIOS, evaluateLabScenario } from '../data/labScenarios';

describe('labScenarios Evaluation Engine', () => {
  it('contains valid lab scenarios with objectives and initial states', () => {
    expect(LAB_SCENARIOS.length).toBeGreaterThan(0);
    LAB_SCENARIOS.forEach(scenario => {
      expect(scenario).toHaveProperty('id');
      expect(scenario).toHaveProperty('title');
      expect(scenario.objectives.length).toBeGreaterThan(0);
      expect(scenario.initialState.nodes.length).toBeGreaterThan(0);
    });
  });

  it('evaluates lab_dhcp initial state as incomplete (0% score) with hints', () => {
    const lab = LAB_SCENARIOS.find(s => s.id === 'lab_dhcp');
    const result = evaluateLabScenario('lab_dhcp', lab.initialState.nodes, lab.initialState.links, []);

    expect(result.completed).toBe(false);
    expect(result.score).toBeLessThan(100);
    expect(result.hints.length).toBeGreaterThan(0);
  });

  it('evaluates lab_dhcp as 100% completed when all objectives are met', () => {
    const lab = LAB_SCENARIOS.find(s => s.id === 'lab_dhcp');
    const solvedNodes = lab.initialState.nodes.map(n => 
      n.id === 'srv1' ? { ...n, roles: ['dhcp'], gateway: '192.168.1.1' } : n
    );
    const solvedLinks = [
      ...lab.initialState.links,
      { id: 'link1', from: 'lap1', to: 'sw1', cableType: 'straight' }
    ];

    const result = evaluateLabScenario('lab_dhcp', solvedNodes, solvedLinks, []);
    expect(result.score).toBe(100);
    expect(result.completed).toBe(true);
    expect(result.hints).toHaveLength(0);
  });
});
