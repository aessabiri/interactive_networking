# 🌐 NetPulse — Enterprise Network Infrastructure Visualizer & Sandbox

> **DTS Herford Enterprise Training Platform**  
> A high-performance, interactive Web Application designed to simulate, visualize, and troubleshoot enterprise networks, server infrastructure, Active Directory, RAID storage, firewalls, and protocol traffic.

---

## ⚡ Overview & Key Highlights

**NetPulse** is built with **React 19**, **Vite**, and **TailwindCSS v4**. It runs as a zero-install, browser-based sandbox that provides hands-on interactive simulations aligned with enterprise IT infrastructure standards and technical certification curricula.

### 🎨 Dual UI Operating Modes (`appMode`)
NetPulse features a built-in toggle in the top navbar to switch between two user experience modes across all modules:

1. **🌱 Clean Mode (`clean`)**:
   - Minimalist interface focused on high-level visual diagrams, simplified packet animations, and core concepts.
   - Ideal for quick overviews and initial learning.
2. **🔍 Detailed Mode (`detailed`)**:
   - High-density technical interface revealing deep protocol headers, live packet payload inspectors, OSI layer breakdowns, CLI command equivalents, and live wire logs.
   - Ideal for deep-dive troubleshooting and advanced administration training.

---

## 🧭 Modules & Features Inventory

NetPulse is organized into **13 interactive modules** accessible via the top navigation bar:

| Module Icon & Name | Description | Key Features |
| :--- | :--- | :--- |
| 🏢 **Enterprise Infra** | Enterprise Topology Map | HQ Data Center vs. Branch Office WAN connectivity & packet flow. |
| 🛡️ **DTS Cockpit** | SOC Security Platform | Server rack status, WAN bandwidth gauges, and incident alert feeds. |
| 💾 **Hardware & RAID** | Storage & Hardware Workbench | RAID 0, 1, 5, 6, 10 configurator, real-time data block flow, 1-drive failure scenarios, dual PSU failover, and ECC RAM error correction. |
| 🏆 **Lab Scenarios** | Hands-On Troubleshooting | Guided scenarios (IP conflicts, VLAN isolation, routing failures, DNS misconfigurations). |
| 🛠️ **Configure** | Network Configurator | Step-by-step step ordering and config generator for Cisco IOS and Linux. |
| ⚡ **DHCP** | DHCP & DORA Analyzer | Single-subnet broadcast vs. L3 Relay Agent (Option 82), DORA sequence animation, scope properties, and live packet inspector. |
| 🌐 **DNS** | DNS Resolver & ISP Traversal | Forward/Reverse lookup zones, `A`, `CNAME`, `MX`, `PTR` records, and root-to-authoritative DNS query traversal. |
| 🏰 **Active Directory** | AD DS & Domain Controller | Domain tree hierarchy (`corp.dts.de`), OUs, Users, Groups, and GPO policies. |
| 🔌 **LAN & Routing** | Switching & VLAN Tagging | VLAN 802.1Q trunking, MAC address CAM tables, ARP resolution, and inter-VLAN routing. |
| ✉️ **Mail Server** | SMTP / IMAP / POP3 Flow | End-to-end email transmission pipeline, MX record lookups, and spam filter rules engine. |
| 🔒 **Firewall & VPN** | Stateful Firewall & VPN | IPsec tunnel setup, NAT rules, stateful connection tracking, and packet filtering engine. |
| 🎨 **Sandbox Canvas** | Freeform Topology Builder | Drag-and-drop network topology canvas with integrated Cisco IOS CLI Terminal. |
| 💻 **CLI Notebook** | Terminal Tutor | Interactive Windows PowerShell and Linux Bash command reference with executable examples. |

---

## 🚀 Getting Started & CLI Commands

### Prerequisites
- **Node.js**: v18.0+ (Tested on Node v24)
- **npm**: v9.0+

### Installation & Execution
```bash
# 1. Clone the repository
git clone https://github.com/aessabiri/interactive_networking.git
cd interactive_networking

# 2. Install dependencies
npm install

# 3. Launch local Vite development server
npm run dev

# 4. Run full Vitest unit test suite (100% module coverage)
npm test

# 5. Build production bundle (Standalone singlefile HTML output)
npm run build
```

---

## 🧪 Testing Suite & Quality Assurance

NetPulse enforces strict unit testing across **all 13 application modules** using **Vitest** and **React Testing Library**.

```bash
# Run tests in watch mode
npx vitest

# Run tests once
npm test
```

### Test Directory Structure (`src/test/`)
- `HardwareModule.test.jsx`: Validates RAID calculations, disk failure scenarios, PSU failover, and ECC RAM.
- `DHCPModule.test.jsx`: Validates DORA sequence, scope parameter drawers, and Packet Inspector.
- `DNSModule.test.jsx`, `ADModule.test.jsx`, `LANModule.test.jsx`, `MailModule.test.jsx`, `FirewallVPNModule.test.jsx`, `EnterpriseModule.test.jsx`, `DTSCockpitModule.test.jsx`, `NetworkSandbox.test.jsx`, `LabNotebook.test.jsx`: Validate module rendering and interactions across all views.
- `CiscoConfigExporter.test.js`, `routingEngine.test.js`, `StatefulRulesEngine.test.js`, `subnetCalculator.test.js`: Validate underlying networking engines and parsers.

---

## 📂 Project Directory Architecture

```
interactive_networking/
 ├── src/
 │    ├── components/
 │    │    ├── active-directory/ # AD DS & Domain Controller components
 │    │    ├── common/           # Shared UI widgets (EasyCard, PacketInspector, TerminalLog)
 │    │    ├── configure/        # Step configurator
 │    │    ├── dhcp/             # DHCP DORA & Packet Inspector
 │    │    ├── dns/              # DNS lookup & zone management
 │    │    ├── dts/              # DTS Cockpit SOC platform
 │    │    ├── enterprise/       # Enterprise infrastructure map
 │    │    ├── firewall/         # Stateful Firewall & VPN tunnel engine
 │    │    ├── hardware/         # RAID Storage Workbench & Data Flow
 │    │    ├── labs/             # Interactive troubleshooting challenges
 │    │    ├── lan/              # VLAN 802.1Q switching & ARP
 │    │    ├── mail/             # Mail SMTP/IMAP pipeline
 │    │    ├── notebook/         # CLI Terminal Tutor
 │    │    └── sandbox/          # Canvas builder & Cisco CLI terminal modal
 │    ├── data/                  # Lab scenarios & pre-configured topologies
 │    ├── test/                  # Vitest unit test files for ALL modules
 │    ├── App.jsx                # App root & Tab Router
 │    ├── main.jsx               # React entry point
 │    └── index.css              # Core Design System & Tailwind v4 styles
 ├── dist/                       # Output directory for production build
 ├── PROJECT_ARCHITECTURE.md     # Authoritative Guide for Future AI Agents & Developers
 ├── package.json
 └── vite.config.js
```

---

## 📘 Curriculum Alignment

NetPulse is directly aligned with the technical curriculum in `what we study`:
- **`File System.pdf`**: Digital Library analogy, Access Control Lists (ACLs), EFS, NTFS Compression.
- **`7. Tech_Notes.pdf`**: Type 1 vs Type 2 Hypervisors, ESXi, vCenter, RAID Storage Arrays.
- **`Apprentices_Server_Infrastructure_Notes.pdf`**: Hardware redundancy, ECC RAM, Dual PSUs, Hosting Models.
- **`Windows OS.pdf`**: Windows NT architecture, NTFS vs Share permissions.
- **`Windows Server Configuration_Final.pdf`**: AD DS Forest promotion, DNS zones, Workstation domain join.
- **`Tech_Notes 1.pdf` & `Tech_Notes 2-1.pdf`**: IT department structure, Helpdesk ticketing, BIOS vs UEFI, OS process vs thread memory spaces.

---

## 📜 License
Privately developed for **DTS Herford Enterprise Training**. Standalone Zero-Install Web Application.
