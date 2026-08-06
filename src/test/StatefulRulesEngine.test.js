import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_FIREWALL_RULES, 
  evaluateFirewallRule, 
  toggleRuleAction, 
  deleteRule, 
  moveRule, 
  addRule 
} from '../components/firewall/StatefulRulesEngine';

describe('StatefulRulesEngine', () => {
  it('evaluates HTTPS outbound traffic as ACCEPT', () => {
    const result = evaluateFirewallRule(DEFAULT_FIREWALL_RULES, 'outbound', 'https');
    expect(result.action).toBe('ACCEPT');
    expect(result.reason).toContain('Rule #101');
  });

  it('evaluates RDP inbound traffic as DROP', () => {
    const result = evaluateFirewallRule(DEFAULT_FIREWALL_RULES, 'inbound', 'rdp');
    expect(result.action).toBe('DROP');
    expect(result.reason).toContain('Rule #104');
  });

  it('toggles rule action between ACCEPT and DROP', () => {
    const updated = toggleRuleAction(DEFAULT_FIREWALL_RULES, 101);
    const rule101 = updated.find(r => r.id === 101);
    expect(rule101.action).toBe('DROP');

    const toggledBack = toggleRuleAction(updated, 101);
    expect(toggledBack.find(r => r.id === 101).action).toBe('ACCEPT');
  });

  it('deletes rule by id', () => {
    const updated = deleteRule(DEFAULT_FIREWALL_RULES, 105);
    expect(updated.find(r => r.id === 105)).toBeUndefined();
    expect(updated.length).toBe(DEFAULT_FIREWALL_RULES.length - 1);
  });

  it('moves rule up and down', () => {
    const movedDown = moveRule(DEFAULT_FIREWALL_RULES, 0, 1);
    expect(movedDown[0].id).toBe(102);
    expect(movedDown[1].id).toBe(101);
  });

  it('adds a new rule with auto-incremented ID', () => {
    const newRule = {
      src: '10.0.0.0/8',
      dst: 'ANY',
      port: '8080 (ALT-HTTP)',
      protocol: 'TCP',
      state: 'NEW',
      action: 'ACCEPT',
      desc: 'Allow Alt HTTP'
    };
    const updated = addRule(DEFAULT_FIREWALL_RULES, newRule);
    const lastRule = updated[updated.length - 1];
    expect(lastRule.id).toBe(107);
    expect(lastRule.desc).toBe('Allow Alt HTTP');
  });
});
