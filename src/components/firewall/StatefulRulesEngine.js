/**
 * Stateful Firewall ACL & SPI Rules Engine
 */

export const DEFAULT_FIREWALL_RULES = [
  { id: 101, src: '192.168.1.0/24', dst: 'ANY', port: '443 (HTTPS)', serviceKey: 'https', protocol: 'TCP', state: 'NEW, ESTABLISHED', action: 'ACCEPT', desc: 'Allow Secure Web Browsing' },
  { id: 102, src: '192.168.1.0/24', dst: '203.0.113.10', port: '22 (SSH)', serviceKey: 'ssh', protocol: 'TCP', state: 'NEW, ESTABLISHED', action: 'ACCEPT', desc: 'Allow IT Admin Management SSH' },
  { id: 103, src: '192.168.1.0/24', dst: 'ANY', port: '80 (HTTP)', serviceKey: 'http', protocol: 'TCP', state: 'NEW, ESTABLISHED', action: 'ACCEPT', desc: 'Allow Web Traffic' },
  { id: 104, src: 'ANY', dst: 'ANY', port: '3389 (RDP)', serviceKey: 'rdp', protocol: 'TCP', state: 'ANY', action: 'DROP', desc: 'Block Insecure Remote Desktop (RDP)' },
  { id: 105, src: 'ANY', dst: 'ANY', port: '23 (TELNET)', serviceKey: 'telnet', protocol: 'TCP', state: 'ANY', action: 'DROP', desc: 'Block Unencrypted Telnet Traffic' },
  { id: 106, src: '192.168.1.0/24', dst: '8.8.8.8', port: 'ICMP (PING)', serviceKey: 'icmp', protocol: 'ICMP', state: 'NEW', action: 'ACCEPT', desc: 'Allow Outbound Ping Diagnostics' },
];

export function evaluateFirewallRule(rules = DEFAULT_FIREWALL_RULES, direction = 'inbound', serviceKey = 'https') {
  // Inbound WAN->LAN uninitiated connections are dropped by default unless explicitly allowed
  if (direction === 'inbound' && serviceKey === 'rdp') {
    return {
      action: 'DROP',
      reason: 'Rule #104: Block Insecure Remote Desktop (RDP) from untrusted WAN network.'
    };
  }

  if (direction === 'inbound' && serviceKey === 'telnet') {
    return {
      action: 'DROP',
      reason: 'Rule #105: Block Unencrypted Telnet Traffic from untrusted WAN network.'
    };
  }

  const matchingRule = rules.find(r => r.serviceKey === serviceKey || r.port.toLowerCase().includes(serviceKey));

  if (matchingRule) {
    return {
      action: matchingRule.action,
      ruleId: matchingRule.id,
      reason: matchingRule.action === 'ACCEPT' 
        ? `Allowed by Rule #${matchingRule.id} (${matchingRule.desc})`
        : `Blocked by Rule #${matchingRule.id} (${matchingRule.desc})`
    };
  }

  return {
    action: direction === 'outbound' ? 'ACCEPT' : 'DROP',
    reason: direction === 'outbound' ? 'Implicit Default Allow for Outbound LAN Sessions' : 'Implicit Default Drop for Unsolicited Inbound WAN Traffic'
  };
}

export function toggleRuleAction(rules, id) {
  return rules.map(r => r.id === id ? { ...r, action: r.action === 'ACCEPT' ? 'DROP' : 'ACCEPT' } : r);
}

export function deleteRule(rules, id) {
  return rules.filter(r => r.id !== id);
}

export function moveRule(rules, index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= rules.length) return rules;
  const updated = [...rules];
  const temp = updated[index];
  updated[index] = updated[targetIndex];
  updated[targetIndex] = temp;
  return updated;
}

export function addRule(rules, newRule) {
  const nextId = rules.length > 0 ? Math.max(...rules.map(r => r.id)) + 1 : 101;
  return [...rules, { id: nextId, ...newRule }];
}
