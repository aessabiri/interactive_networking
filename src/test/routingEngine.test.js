import { describe, it, expect } from 'vitest';
import { calculateOspfSpf, evaluateBgpBestPath } from '../utils/routingEngine';

describe('routingEngine Utility', () => {
  const nodes = [
    { id: 'r1', name: 'ROUTER-1' },
    { id: 'r2', name: 'ROUTER-2' },
    { id: 'r3', name: 'ROUTER-3' },
  ];

  const links = [
    { id: 'l1', from: 'r1', to: 'r2', cableType: 'serial' },   // Cost = 100
    { id: 'l2', from: 'r1', to: 'r3', cableType: 'fiber' },    // Cost = 1
    { id: 'l3', from: 'r3', to: 'r2', cableType: 'straight' }  // Cost = 10
  ];

  it('calculates OSPF shortest path using Dijkstra algorithm (prefers low-cost fiber path)', () => {
    const result = calculateOspfSpf(nodes, links, 'r1', 'r2');
    expect(result.path).toEqual(['r1', 'r3', 'r2']);
    expect(result.totalCost).toBe(11); // Fiber (1) + Straight (10) = 11 vs Direct Serial (100)
  });

  it('evaluates BGP best path algorithm (prefers higher LOCAL_PREF and shorter AS_PATH)', () => {
    const routes = [
      { id: 'route-isp1', prefix: '10.0.0.0/8', localPref: 100, asPath: [65001, 65002], med: 50 },
      { id: 'route-isp2', prefix: '10.0.0.0/8', localPref: 200, asPath: [65001, 65002, 65003], med: 10 },
      { id: 'route-isp3', prefix: '10.0.0.0/8', localPref: 100, asPath: [65001], med: 50 }
    ];

    const result = evaluateBgpBestPath(routes);
    // route-isp2 has localPref 200 vs 100, so it wins
    expect(result.bestRoute.id).toBe('route-isp2');
  });

  it('evaluates BGP best path tie-breaking via AS_PATH length when LOCAL_PREF is equal', () => {
    const routes = [
      { id: 'route-long', prefix: '10.0.0.0/8', localPref: 100, asPath: [65001, 65002, 65003], med: 0 },
      { id: 'route-short', prefix: '10.0.0.0/8', localPref: 100, asPath: [65001], med: 0 }
    ];

    const result = evaluateBgpBestPath(routes);
    expect(result.bestRoute.id).toBe('route-short');
  });
});
