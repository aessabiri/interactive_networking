# 🌐 NetPulse Interactive Networking Suite

**NetPulse** is an interactive network architecture, protocol simulation, and security analysis platform designed for enterprise network engineers, systems administrators, and computer science professionals.

---

## ⚡ Technology Stack

* **Core Framework**: React 19 & JavaScript (ESNext)
* **Build System & Dev Server**: Vite 8 with `vite-plugin-singlefile` for production bundle compilation
* **UI & Styling System**: Vanilla CSS with Tailwind CSS utilities & custom glassmorphism design tokens
* **Iconography & Graphics**: Lucide React Icons & Dynamic SVG Path Cable Rendering Engine
* **Animation & Motion**: Custom Waypoint Piecewise Linear Interpolator Engine (`interpolateWaypoints`)
* **State Management**: Local Component State, Custom Ledger Stores, & Dynamic Packet Handlers
* **Configuration Tools**: Cisco IOS CLI Parser & Generator (`.cfg`, `.txt`, `.json`), Palo Alto PAN-OS SPI Engine

---

## 🚀 Key Modules & Capabilities

1. **🧪 Drag-and-Drop Network Sandbox (`NetworkSandbox.jsx`)**:
   * Interactive multi-device topology canvas with drag-and-drop node placement.
   * Supports **Cisco IOS CLI Script Exporter (`.cfg`)** and **Import/Export** for NetPulse JSON (`.json`) and Cisco IOS scripts (`.cfg`, `.txt`, `.ios`).
   * Pre-configured enterprise templates: Standard Office LAN, Corporate HQ, DMZ Palo Alto NGFW, Hybrid SD-WAN, Site-to-Site IPsec VPN, and High-Availability (HA) Core Campus.

2. **🏢 Enterprise Multi-Hop Infrastructure (`EnterpriseModule.jsx`)**:
   * Simulates real-world multi-hop cable wire traversal across workstations, floor switches, distribution/edge routers, and 8-node Data Center server racks (DHCP, AD KDC, DNS, App Server, Mail, SQL Database, SAN Storage Array, Backup Vault).
   * Live Packet Header & Frame Inspector displaying Layer 2 MAC addresses, Layer 3 IPv4 headers, Layer 4 TCP/UDP ports, and protocol payloads.

3. **🛸 DTS Cockpit Security Operations & Cyber Defense (`DTSCockpitModule.jsx`)**:
   * Simulates the proprietary **DTS Cockpit** platform developed by **DTS Systeme GmbH (Herford, Germany)**.
   * Centralized 24/7 Managed Security Operations Center (SOC) dashboard tracking Security Health Score, Palo Alto NGFWs, EDR Agents (Cortex XDR), and DTS OT Insights.
   * **Purple Teaming & SOAR Playbook Engine**: Live interactive execution of attack scenarios (Ransomware Outbreak, SSH Brute-Force, Phishing Campaign, DNS Tunneling Exfiltration, OT Industrial Intrusion) with 1-click SOC remediation actions.

4. **🛡️ Palo Alto Next-Gen Firewall & VPN (`FirewallVPNModule.jsx`)**:
   * Stateful Inspection (SPI) engine enforcing bidirectional inbound/outbound security rules.
   * Includes interactive ACL rule setter, NAT Port Address Translation, IPsec VPN tunnel phase negotiation, and TLS v1.3 handshakes.

5. **⚡ Core Protocol Modules**:
   * **DHCP Protocol Module**: Interactive 4-step DORA (Discover, Offer, Request, Ack) simulation with OS CLI inspector.
   * **DNS Resolver Module**: Recursive vs Iterative resolution engine with real-time NAT address rewriting inspection.
   * **Active Directory & Kerberos**: Kerberos AS/TGS ticket-granting exchange, LSA ticket cache inspector, and FreeIPA/OpenLDAP ecosystem toggle.
   * **LAN & Switch CAM Module**: L2 Ethernet framing, ARP broadcast resolution, and switch CAM table MAC learning.
   * **Enterprise Mail Module**: SMTP message submission, MTA relaying, Dovecot IMAP4 delivery, and email header inspector.

---

## 🛠️ Development & Build Instructions

### Installation
```bash
npm install
```

### Local Dev Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
