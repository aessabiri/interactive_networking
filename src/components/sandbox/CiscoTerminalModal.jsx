import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Play, Shield, RefreshCw } from 'lucide-react';

export default function CiscoTerminalModal({ node, onClose, onUpdateNode }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    `Cisco IOS Software, C8000 Software (X86_64_LINUX_IOSXE-UNIVERSALK9-M), Version 17.09.01a`,
    `Copyright (c) 1986-2026 by Cisco Systems, Inc.`,
    `Compiled Mon 03-Aug-26 by builder`,
    ``,
    `Press RETURN to get started!`,
    `${node?.name || 'Router'}#`
  ]);

  const [mode, setMode] = useState('exec'); // 'exec', 'priv', 'config', 'config-if'
  const [selectedIf, setSelectedIf] = useState('GigabitEthernet0/1');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const hostname = node?.name || 'Router';
    let promptStr = `${hostname}#`;
    if (mode === 'config') promptStr = `${hostname}(config)#`;
    if (mode === 'config-if') promptStr = `${hostname}(config-if)#`;

    const newHistory = [...history, `${promptStr} ${cmd}`];

    const lower = cmd.toLowerCase();

    if (lower === 'enable' || lower === 'en') {
      setMode('priv');
      newHistory.push(`${hostname}#`);
    } else if (lower === 'configure terminal' || lower === 'conf t') {
      setMode('config');
      newHistory.push(`Enter configuration commands, one per line. End with CNTL/Z.`);
      newHistory.push(`${hostname}(config)#`);
    } else if (lower.startsWith('interface') || lower.startsWith('int')) {
      if (mode === 'config') {
        setMode('config-if');
        const parts = cmd.split(' ');
        const ifName = parts[1] || 'GigabitEthernet0/1';
        setSelectedIf(ifName);
        newHistory.push(`${hostname}(config-if)#`);
      } else {
        newHistory.push(`% Command rejected: Must be in config mode.`);
      }
    } else if (lower.startsWith('ip address') || lower.startsWith('ip addr')) {
      if (mode === 'config-if') {
        const parts = cmd.split(' ');
        const newIp = parts[2];
        if (newIp && onUpdateNode) {
          onUpdateNode(node.id, 'ip', newIp);
          newHistory.push(`% IP address ${newIp} set on ${selectedIf}`);
        } else {
          newHistory.push(`% Incomplete command. Usage: ip address <IP> <NETMASK>`);
        }
      } else {
        newHistory.push(`% Command rejected: Must be in interface config mode.`);
      }
    } else if (lower === 'no shutdown' || lower === 'no shut') {
      newHistory.push(`% Interface ${selectedIf}, changed state to up`);
      newHistory.push(`% LINEPROTO-5-UPDOWN: Line protocol on Interface ${selectedIf}, changed state to up`);
    } else if (lower === 'exit' || lower === 'ex') {
      if (mode === 'config-if') setMode('config');
      else if (mode === 'config') setMode('priv');
      else setMode('exec');
    } else if (lower === 'show ip interface brief' || lower === 'sh ip int br') {
      newHistory.push(`Interface              IP-Address      OK? Method Status                Protocol`);
      newHistory.push(`GigabitEthernet0/0     192.168.1.1     YES manual up                    up      `);
      newHistory.push(`GigabitEthernet0/1     ${node?.ip || 'unassigned'}     YES NVRAM  up                    up      `);
      newHistory.push(`GigabitEthernet0/2     unassigned      YES NVRAM  administratively down down    `);
    } else if (lower === 'show ip route' || lower === 'sh ip route') {
      newHistory.push(`Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP`);
      newHistory.push(`       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area `);
      newHistory.push(``);
      newHistory.push(`Gateway of last resort is 198.51.100.1 to network 0.0.0.0`);
      newHistory.push(``);
      newHistory.push(`S*    0.0.0.0/0 [1/0] via 198.51.100.1`);
      newHistory.push(`C     192.168.1.0/24 is directly connected, GigabitEthernet0/0`);
      newHistory.push(`O     10.0.0.0/8 [110/20] via 10.10.1.1, 00:14:22, GigabitEthernet0/1`);
    } else if (lower.startsWith('ping')) {
      const parts = cmd.split(' ');
      const targetIp = parts[1] || '8.8.8.8';
      newHistory.push(`Type escape sequence to abort.`);
      newHistory.push(`Sending 5, 100-byte ICMP Echos to ${targetIp}, timeout is 2 seconds:`);
      newHistory.push(`!!!!!`);
      newHistory.push(`Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`);
    } else if (lower === 'clear' || lower === 'cls') {
      setHistory([`${hostname}#`]);
      setInput('');
      return;
    } else {
      newHistory.push(`% Unknown command or computer name, or unable to find computer address`);
    }

    setHistory(newHistory);
    setInput('');
  };

  const hostname = node?.name || 'Router';
  let promptStr = `${hostname}#`;
  if (mode === 'config') promptStr = `${hostname}(config)#`;
  if (mode === 'config-if') promptStr = `${hostname}(config-if)#`;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-3xl w-full p-6 rounded-3xl border border-slate-700 bg-slate-950/95 font-mono text-xs text-slate-100 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
            <Terminal className="w-5 h-5" />
            <span>Cisco IOS CLI Emulator — {hostname} ({node?.os || 'Cisco IOS-XE'})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Screen Container */}
        <div className="h-80 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-1 font-mono text-xs text-emerald-400 shadow-inner select-text">
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed">
              {line}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Form Prompt Input */}
        <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-cyan-400 font-bold whitespace-nowrap">{promptStr}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type command (e.g. 'show ip route', 'conf t', 'ping 8.8.8.8')..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow"
          >
            Execute ↵
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
          <span>Commands supported: <code className="text-cyan-400">conf t</code>, <code className="text-cyan-400">int Gi0/1</code>, <code className="text-cyan-400">ip address</code>, <code className="text-cyan-400">no shut</code>, <code className="text-cyan-400">show ip route</code>, <code className="text-cyan-400">show ip int br</code>, <code className="text-cyan-400">ping</code></span>
          <button onClick={() => setHistory([`${hostname}#`])} className="text-rose-400 font-bold hover:underline">
            Clear Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
