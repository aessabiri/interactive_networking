/**
 * Wireshark Binary PCAP Exporter Utility
 * Generates standard libpcap binary data (.pcap) containing Ethernet II, IPv4, TCP/UDP packets.
 */

// Helper to convert MAC string "00:50:56:A1:B2:C1" to 6-byte Uint8Array
function macToBytes(macStr = '00:00:00:00:00:00') {
  const parts = macStr.split(':').map(hex => parseInt(hex, 16) || 0);
  return new Uint8Array(parts.slice(0, 6));
}

// Helper to convert IPv4 string "192.168.1.100" to 4-byte Uint8Array
function ipToBytes(ipStr = '127.0.0.1') {
  const parts = ipStr.replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
  return new Uint8Array(parts.slice(0, 4));
}

export function buildPcapBuffer(packets = []) {
  const defaultPacket = {
    srcMac: '00:50:56:A1:B2:C1',
    dstMac: '00:11:22:33:44:00',
    srcIp: '192.168.1.105',
    dstIp: '8.8.8.8',
    srcPort: 54321,
    dstPort: 443,
    protocol: 'TCP',
    payloadText: 'GET / HTTP/1.1\r\nHost: netpulse.dts\r\n\r\n'
  };

  const packList = packets.length > 0 ? packets : [defaultPacket];

  // Calculate total buffer length
  let totalSize = 24; // Global header size

  const packetBuffers = packList.map(pkt => {
    const payload = new TextEncoder().encode(pkt.payloadText || 'NetPulse Simulated Packet Data');
    const isTcp = pkt.protocol !== 'UDP' && pkt.protocol !== 'ICMP';
    const isUdp = pkt.protocol === 'UDP';

    const l4Len = isTcp ? 20 : isUdp ? 8 : 8; // ICMP echo 8B
    const ipLen = 20 + l4Len + payload.length;
    const ethLen = 14 + ipLen;

    const frame = new Uint8Array(ethLen);
    const view = new DataView(frame.buffer);

    // 1. Ethernet Header (14 bytes)
    frame.set(macToBytes(pkt.dstMac), 0);
    frame.set(macToBytes(pkt.srcMac), 6);
    view.setUint16(12, 0x0800, false); // IPv4 EtherType

    // 2. IPv4 Header (20 bytes)
    const ipStart = 14;
    frame[ipStart] = 0x45; // Version 4, IHL 5
    frame[ipStart + 1] = 0x00; // DSCP/ECN
    view.setUint16(ipStart + 2, ipLen, false); // Total Length
    view.setUint16(ipStart + 4, 0x1234, false); // Identification
    view.setUint16(ipStart + 6, 0x4000, false); // Flags: Don't Fragment
    frame[ipStart + 8] = 64; // TTL
    frame[ipStart + 9] = isTcp ? 6 : isUdp ? 17 : 1; // Protocol: TCP(6), UDP(17), ICMP(1)
    view.setUint16(ipStart + 10, 0x0000, false); // Header Checksum (dummy)
    frame.set(ipToBytes(pkt.srcIp), ipStart + 12);
    frame.set(ipToBytes(pkt.dstIp), ipStart + 16);

    // 3. Layer 4 Header
    const l4Start = ipStart + 20;
    if (isTcp) {
      view.setUint16(l4Start, pkt.srcPort || 50000, false);
      view.setUint16(l4Start + 2, pkt.dstPort || 80, false);
      view.setUint32(l4Start + 4, 1000, false); // Sequence number
      view.setUint32(l4Start + 8, 0, false); // Ack number
      view.setUint16(l4Start + 12, 0x5018, false); // Header len (5x4=20B) + Flags (ACK, PSH)
      view.setUint16(l4Start + 14, 64240, false); // Window size
      view.setUint16(l4Start + 16, 0x0000, false); // Checksum
      view.setUint16(l4Start + 18, 0x0000, false); // Urgent pointer
    } else if (isUdp) {
      view.setUint16(l4Start, pkt.srcPort || 53, false);
      view.setUint16(l4Start + 2, pkt.dstPort || 53, false);
      view.setUint16(l4Start + 4, 8 + payload.length, false); // UDP Length
      view.setUint16(l4Start + 6, 0x0000, false); // Checksum
    }

    // 4. Payload
    const payloadStart = l4Start + l4Len;
    frame.set(payload, payloadStart);

    return frame;
  });

  // Calculate total file byte size
  packetBuffers.forEach(buf => {
    totalSize += 16 + buf.length; // 16B packet header + buffer length
  });

  const fullBuffer = new Uint8Array(totalSize);
  const view = new DataView(fullBuffer.buffer);

  // Write Libpcap Global Header (24 bytes)
  view.setUint32(0, 0xa1b2c3d4, true); // Magic Number (little-endian)
  view.setUint16(4, 2, true);          // Major Version
  view.setUint16(6, 4, true);          // Minor Version
  view.setUint32(8, 0, true);          // Thiszone
  view.setUint32(12, 0, true);         // Sigfigs
  view.setUint32(16, 65535, true);     // Snaplen
  view.setUint32(20, 1, true);         // Network LinkType = Ethernet (1)

  let offset = 24;
  const nowSec = Math.floor(Date.now() / 1000);

  packetBuffers.forEach((buf, i) => {
    view.setUint32(offset, nowSec + i, true);      // ts_sec
    view.setUint32(offset + 4, 1000 * i, true);   // ts_usec
    view.setUint32(offset + 8, buf.length, true); // incl_len
    view.setUint32(offset + 12, buf.length, true);// orig_len
    offset += 16;

    fullBuffer.set(buf, offset);
    offset += buf.length;
  });

  return fullBuffer;
}

export function downloadPcapFile(packets = [], filename = 'netpulse_traffic.pcap') {
  const buffer = buildPcapBuffer(packets);
  const blob = new Blob([buffer], { type: 'application/vnd.tcpdump.pcap' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
