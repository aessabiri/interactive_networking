import { describe, it, expect } from 'vitest';
import { buildPcapBuffer } from '../utils/pcapExporter';

describe('pcapExporter Utility', () => {
  it('generates a valid PCAP global header with magic number 0xa1b2c3d4', () => {
    const buffer = buildPcapBuffer([]);
    expect(buffer.length).toBeGreaterThan(24);

    const view = new DataView(buffer.buffer);
    const magic = view.getUint32(0, true);
    expect(magic).toBe(0xa1b2c3d4); // PCAP Magic Number

    const linkType = view.getUint32(20, true);
    expect(linkType).toBe(1); // LINKTYPE_ETHERNET
  });

  it('builds PCAP buffer containing custom TCP and UDP packet frames', () => {
    const testPackets = [
      {
        srcMac: '00:50:56:11:22:33',
        dstMac: '00:11:22:33:44:55',
        srcIp: '192.168.1.10',
        dstIp: '192.168.1.1',
        srcPort: 12345,
        dstPort: 80,
        protocol: 'TCP',
        payloadText: 'GET /index.html HTTP/1.1'
      },
      {
        srcMac: '00:50:56:11:22:33',
        dstMac: '00:11:22:33:44:55',
        srcIp: '192.168.1.10',
        dstIp: '8.8.8.8',
        srcPort: 5353,
        dstPort: 53,
        protocol: 'UDP',
        payloadText: 'DNS QUERY example.com'
      }
    ];

    const buffer = buildPcapBuffer(testPackets);
    expect(buffer.length).toBeGreaterThan(100);

    const view = new DataView(buffer.buffer);
    // Packet 1 Header starts at byte offset 24
    const pkt1Len = view.getUint32(32, true);
    expect(pkt1Len).toBeGreaterThan(50);
  });
});
