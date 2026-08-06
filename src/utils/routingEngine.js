/**
 * Dynamic Routing Engine — OSPF SPF (Dijkstra) & BGP Path Attributes
 */

export function calculateOspfSpf(nodes = [], links = [], sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) {
    return { path: [sourceId], totalCost: 0, spfSteps: [] };
  }

  // Cable metric cost map based on link type
  const cableCosts = {
    fiber: 1,       // 10 Gbps Fiber Link (Cost = 1)
    straight: 10,   // 1 Gbps Ethernet Link (Cost = 10)
    crossover: 10,  // 1 Gbps Ethernet Link (Cost = 10)
    serial: 100     // 1.544 Mbps Serial Link (Cost = 100)
  };

  // Build adjacency list
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });

  links.forEach(l => {
    const cost = cableCosts[l.cableType] || 10;
    if (adj[l.from] && adj[l.to]) {
      adj[l.from].push({ node: l.to, cost, linkId: l.id });
      adj[l.to].push({ node: l.from, cost, linkId: l.id });
    }
  });

  const distances = {};
  const previous = {};
  const spfSteps = [];
  const unvisited = new Set(nodes.map(n => n.id));

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });
  distances[sourceId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let current = null;
    for (const nodeId of unvisited) {
      if (current === null || distances[nodeId] < distances[current]) {
        current = nodeId;
      }
    }

    if (distances[current] === Infinity || current === targetId) break;

    unvisited.delete(current);

    const neighbors = adj[current] || [];
    for (const neighbor of neighbors) {
      if (unvisited.has(neighbor.node)) {
        const alt = distances[current] + neighbor.cost;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = current;
          spfSteps.push({
            from: current,
            to: neighbor.node,
            cost: alt,
            linkId: neighbor.linkId
          });
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let curr = targetId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const validPath = path.length > 0 && path[0] === sourceId ? path : null;

  return {
    path: validPath,
    totalCost: validPath ? distances[targetId] : Infinity,
    spfSteps
  };
}

export function evaluateBgpBestPath(routes = []) {
  if (routes.length === 0) return null;

  // BGP Decision Decision Matrix:
  // 1. Highest LOCAL_PREF
  // 2. Shortest AS_PATH length
  // 3. Lowest MED (Multi-Exit Discriminator)
  const sorted = [...routes].sort((a, b) => {
    const prefA = a.localPref ?? 100;
    const prefB = b.localPref ?? 100;
    if (prefA !== prefB) return prefB - prefA; // Descending

    const asPathA = (a.asPath || []).length;
    const asPathB = (b.asPath || []).length;
    if (asPathA !== asPathB) return asPathA - asPathB; // Ascending

    const medA = a.med ?? 0;
    const medB = b.med ?? 0;
    return medA - medB; // Ascending
  });

  return {
    bestRoute: sorted[0],
    allRoutesEvaluated: sorted
  };
}
