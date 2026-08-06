/**
 * Enterprise IPv4 Subnetting & CIDR Address Calculator Utility
 */

export function ipToNum(ip) {
  const parts = String(ip).trim().split('.').map(n => parseInt(n, 10));
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) {
    return 0;
  }
  return ((parts[0] * 16777216) + (parts[1] * 65536) + (parts[2] * 256) + parts[3]) >>> 0;
}

export function numToIp(num) {
  const n = num >>> 0;
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255
  ].join('.');
}

export function cidrToSubnetMask(cidr) {
  const c = Math.min(32, Math.max(0, parseInt(cidr, 10) || 0));
  if (c === 0) return '0.0.0.0';
  const maskNum = (~0 << (32 - c)) >>> 0;
  return numToIp(maskNum);
}

export function cidrToWildcardMask(cidr) {
  const c = Math.min(32, Math.max(0, parseInt(cidr, 10) || 0));
  if (c === 0) return '255.255.255.255';
  const maskNum = (~0 << (32 - c)) >>> 0;
  const wildcardNum = (~maskNum) >>> 0;
  return numToIp(wildcardNum);
}

export function getRequiredBitsForHosts(hostsNeeded) {
  const totalNeeded = hostsNeeded + 2; // +2 for Network and Broadcast addresses
  let hostBits = 1;
  while ((1 << hostBits) >>> 0 < totalNeeded && hostBits < 30) {
    hostBits++;
  }
  return hostBits;
}

export function calculateSubnet(ip = '192.168.1.100', cidr = 24) {
  let rawIp = typeof ip === 'string' ? ip.replace(/[^0-9.]/g, '') : '';
  const parts = rawIp.split('.').map(n => parseInt(n, 10));
  
  // Fallback to standard 192.168.1.100 if invalid IP format
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) {
    rawIp = '192.168.1.100';
  }

  const ipParts = rawIp.split('.').map(n => parseInt(n, 10));
  const ipNum = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0;
  const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;

  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | ~maskNum) >>> 0;

  const netmask = numToIp(maskNum);
  const networkIp = numToIp(networkNum);
  const broadcastIp = numToIp(broadcastNum);

  const totalHosts = Math.max(0, (1 << (32 - cidr)) - 2);
  const firstHost = totalHosts > 0 ? numToIp(networkNum + 1) : networkIp;
  const lastHost = totalHosts > 0 ? numToIp(broadcastNum - 1) : broadcastIp;

  return {
    ip: rawIp,
    cidr: `/${cidr}`,
    netmask,
    wildcardMask: cidrToWildcardMask(cidr),
    networkIp,
    broadcastIp,
    usableHostRange: `${firstHost} - ${lastHost}`,
    totalUsableHosts: totalHosts
  };
}

export function calculateVlsm(baseIp = '172.160.0.0', baseCidr = 18, subnets = []) {
  const baseNum = ipToNum(baseIp);
  const totalBlockIps = Math.pow(2, 32 - baseCidr);
  
  // Sort subnets descending by host requirement for VLSM efficiency
  const sortedSubnets = [...subnets].sort((a, b) => b.hosts - a.hosts);
  
  let currentNum = baseNum;
  const results = [];
  let totalAllocatedIps = 0;
  let totalWastedIps = 0;

  for (const item of sortedSubnets) {
    const hostsNeeded = Math.max(1, parseInt(item.hosts, 10) || 1);
    const hostBits = getRequiredBitsForHosts(hostsNeeded);
    const prefix = 32 - hostBits;
    const blockSize = Math.pow(2, hostBits);
    const totalUsable = Math.max(0, blockSize - 2);

    const netNum = currentNum;
    const broadcastNum = (netNum + blockSize - 1) >>> 0;
    const firstUsableNum = netNum + 1;
    const lastUsableNum = broadcastNum - 1;

    const wasted = totalUsable - hostsNeeded;
    totalAllocatedIps += blockSize;
    totalWastedIps += Math.max(0, wasted);

    results.push({
      id: item.id || item.name,
      name: item.name,
      requestedHosts: hostsNeeded,
      hostBits,
      prefix: `/${prefix}`,
      cidr: prefix,
      subnetMask: cidrToSubnetMask(prefix),
      wildcardMask: cidrToWildcardMask(prefix),
      networkAddress: numToIp(netNum),
      broadcastAddress: numToIp(broadcastNum),
      firstUsable: numToIp(firstUsableNum),
      lastUsable: numToIp(lastUsableNum),
      usableRange: `${numToIp(firstUsableNum)} - ${numToIp(lastUsableNum)}`,
      totalUsable,
      blockSize,
      wastedIps: Math.max(0, wasted),
      startNum: netNum,
      endNum: broadcastNum
    });

    currentNum = (broadcastNum + 1) >>> 0;
  }

  const freeIps = Math.max(0, totalBlockIps - totalAllocatedIps);

  return {
    baseIp,
    baseCidr: `/${baseCidr}`,
    totalBlockIps,
    totalAllocatedIps,
    totalWastedIps,
    freeIps,
    subnets: results
  };
}

export function calculateFlsm(baseIp = '172.160.0.0', baseCidr = 18, subnets = []) {
  const baseNum = ipToNum(baseIp);
  const totalBlockIps = Math.pow(2, 32 - baseCidr);

  // In FLSM, every subnet is sized equally based on the LARGEST host requirement
  const maxHostsNeeded = Math.max(...subnets.map(s => Math.max(1, parseInt(s.hosts, 10) || 1)), 1);
  const hostBits = getRequiredBitsForHosts(maxHostsNeeded);
  const prefix = 32 - hostBits;
  const blockSize = Math.pow(2, hostBits);
  const totalUsable = Math.max(0, blockSize - 2);

  let currentNum = baseNum;
  const results = [];
  let totalAllocatedIps = 0;
  let totalWastedIps = 0;

  for (const item of subnets) {
    const hostsNeeded = Math.max(1, parseInt(item.hosts, 10) || 1);
    const netNum = currentNum;
    const broadcastNum = (netNum + blockSize - 1) >>> 0;
    const firstUsableNum = netNum + 1;
    const lastUsableNum = broadcastNum - 1;

    const wasted = totalUsable - hostsNeeded;
    totalAllocatedIps += blockSize;
    totalWastedIps += Math.max(0, wasted);

    results.push({
      id: item.id || item.name,
      name: item.name,
      requestedHosts: hostsNeeded,
      hostBits,
      prefix: `/${prefix}`,
      cidr: prefix,
      subnetMask: cidrToSubnetMask(prefix),
      wildcardMask: cidrToWildcardMask(prefix),
      networkAddress: numToIp(netNum),
      broadcastAddress: numToIp(broadcastNum),
      firstUsable: numToIp(firstUsableNum),
      lastUsable: numToIp(lastUsableNum),
      usableRange: `${numToIp(firstUsableNum)} - ${numToIp(lastUsableNum)}`,
      totalUsable,
      blockSize,
      wastedIps: Math.max(0, wasted),
      startNum: netNum,
      endNum: broadcastNum
    });

    currentNum = (broadcastNum + 1) >>> 0;
  }

  const freeIps = Math.max(0, totalBlockIps - totalAllocatedIps);

  return {
    baseIp,
    baseCidr: `/${baseCidr}`,
    totalBlockIps,
    totalAllocatedIps,
    totalWastedIps,
    freeIps,
    subnets: results
  };
}

