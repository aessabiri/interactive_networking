# 🤖 PROJECT ARCHITECTURE & FUTURE AI AGENT GUIDELINES

> **Authoritative Handbook for AI Agents & Developers Working on NetPulse**  
> *Last Updated: August 2026*

---

## 📌 Executive Summary & Purpose

**NetPulse** is an interactive, enterprise-grade network infrastructure visualizer, storage workbench, and training sandbox built for **DTS Herford Enterprise Training**. 

This document serves as the **uncompromising blueprint and set of rules** for any AI Agent or developer taking over or contributing to this codebase.

---

## 🚫 CRITICAL AI AGENT DIRECTIVES (MUST OBEY AT ALL TIMES)

1. **NO IN-APP PDF LIBRARIES**:
   - **Rule**: Do NOT install or add PDF parsing/rendering libraries (e.g. `pdf-parse`, `pdfjs-dist`) inside the web application codebase (`src/` or `package.json`).
   - **Context**: Study PDFs are located in `what we study/` for developer reference only. All text extractions must be executed strictly in isolated scratch space (`.gemini/.../scratch`). Keep the main web app codebase 100% clean of PDF parsers.

2. **STRICT GIT BRANCHING (DO NOT SAVE ON `main`)**:
   - **Rule**: NEVER push changes directly to the `main` branch.
   - **Workflow**: Always commit and push updates to the designated active feature branch (e.g. `second`) using the Node.js GitHub REST API script (`scratch/push_to_github.cjs`). Leave `main` pristine.

3. **MANDATORY TESTING REQUIREMENT**:
   - **Rule**: NEVER declare a task complete or submit code without adding or updating unit tests in `src/test/` AND running `cmd /c "npm test"`.
   - **Coverage Standard**: Every single component module in `src/components/` MUST have a corresponding `.test.jsx` file in `src/test/`. All tests MUST pass 100%.

4. **BUILD VERIFICATION**:
   - **Rule**: Always run `cmd /c "npm run build"` to verify that the Vite singlefile production bundle compiles cleanly with zero errors before concluding your turn.

5. **DUAL UI OPERATING MODES (`appMode`)**:
   - **Rule**: All UI components must honor the `appMode` prop (`'clean'` vs `'detailed'`).
   - **Clean Mode (`clean`)**: Displays minimal, sleek visual diagrams, simple cards, and lightweight controls.
   - **Detailed Mode (`detailed`)**: Displays high-density technical info, packet inspectors, scope configuration parameters, CLI commands, OSI stack layers, and live wire logs.

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 with `@vitejs/plugin-react` and `vite-plugin-singlefile`
- **Styling**: TailwindCSS v4 with Vanilla CSS custom design system in `src/index.css`
- **Icons**: Lucide React (`lucide-react`)
- **Testing Engine**: Vitest (`vitest`) + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`

---

## 📂 Module Inventory & File Map

| Module Name | File Location | Key Component | Test File |
| :--- | :--- | :--- | :--- |
| **Enterprise Infra** | `src/components/enterprise/EnterpriseModule.jsx` | `EnterpriseModule` | `src/test/EnterpriseModule.test.jsx` |
| **DTS Cockpit** | `src/components/dts/DTSCockpitModule.jsx` | `DTSCockpitModule` | `src/test/DTSCockpitModule.test.jsx` |
| **Hardware & RAID** | `src/components/hardware/HardwareModule.jsx` | `HardwareModule` | `src/test/HardwareModule.test.jsx` |
| **DHCP & DORA** | `src/components/dhcp/DHCPModule.jsx` | `DHCPModule` | `src/test/DHCPModule.test.jsx` |
| **DNS Resolver** | `src/components/dns/DNSModule.jsx` | `DNSModule` | `src/test/DNSModule.test.jsx` |
| **Active Directory** | `src/components/active-directory/ADModule.jsx` | `ADModule` | `src/test/ADModule.test.jsx` |
| **LAN & Switching** | `src/components/lan/LANModule.jsx` | `LANModule` | `src/test/LANModule.test.jsx` |
| **Mail Server** | `src/components/mail/MailModule.jsx` | `MailModule` | `src/test/MailModule.test.jsx` |
| **Firewall & VPN** | `src/components/firewall/FirewallVPNModule.jsx` | `FirewallVPNModule` | `src/test/FirewallVPNModule.test.jsx` |
| **Sandbox Canvas** | `src/components/sandbox/NetworkSandbox.jsx` | `NetworkSandbox` | `src/test/NetworkSandbox.test.jsx` |
| **Lab Scenarios** | `src/components/labs/LabScenarioModule.jsx` | `LabScenarioModule` | `src/test/labScenarios.test.js` |
| **Configurator** | `src/components/configure/ConfigureModule.jsx` | `ConfigureModule` | `src/test/ConfigureModule.test.jsx` |
| **CLI Notebook** | `src/components/notebook/LabNotebook.jsx` | `LabNotebook` | `src/test/LabNotebook.test.jsx` |

---

## 🎨 UI Component Conventions & Shared Widgets

When building or updating modules, re-use existing UI abstractions in `src/components/common/`:

1. **`EasyCard.jsx`**:
   - `CleanWidget`: Encapsulates minimal mode cards with clean borders and icons.
   - `CleanControlButton`: Standardized interactive button styling.
   - `SlideOutInspector`: Slide-out panel for technical deep-dives and logs.
   - `EasyCard`: Standard clean-mode educational card component.

2. **`PacketInspector.jsx`**:
   - Standard OSI 4-Layer packet inspection component.
   - Accepts `activeStep`, `packetData`, `stepTitle`, and `stepDescription`.

3. **`TerminalLog.jsx`**:
   - Live terminal wire log output component with timestamped entries and clear action.

4. **`CiscoTerminalModal.jsx`**:
   - Interactive Cisco IOS CLI modal supporting `enable`, `configure terminal`, `show ip interface brief`, `show mac address-table`, `show ip route`, etc.

---

## 🗺️ Curriculum Alignment Map (`what we study`)

NetPulse implements real-world technical concepts directly extracted from 7 core training PDFs:

1. **`7. Tech_Notes.pdf`**:
   - Hypervisor Types (Type 1 Bare-Metal ESXi vs. Type 2 Workstation).
   - Server Storage Arrays (RAID 0, 1, 5, 6, 10).
2. **`Apprentices_Server_Infrastructure_Notes.pdf`**:
   - Dual 1+1 Hot-Swap Redundant PSUs, ECC RAM Bit-Flip Auto-Correction, Hot-Swappable Drive Bays.
   - Hosting Model Responsibility Matrix (On-Premises vs. IaaS vs. PaaS vs. SaaS).
3. **`File System.pdf`**:
   - Access Control Lists (ACLs), Share vs. NTFS permissions, EFS Encryption, NTFS Compression.
   - Digital Library Analogy (Files = Books, Folders = Shelves, Space Manager = Librarian).
4. **`Windows OS.pdf`**:
   - Windows NT architecture, kernel mode vs user mode space.
5. **`Windows Server Configuration_Final.pdf`**:
   - Active Directory DS Forest promotion (`DTS-DC-01`), Forward/Reverse DNS zones, Workstation Domain Join.
6. **`Tech_Notes 1.pdf` & `Tech_Notes 2-1.pdf`**:
   - Helpdesk IT Operations (Incidents vs. Service Requests).
   - "The IT Football Team" Role Map (Defense, Midfield, Forwards, Goalkeeper).
   - Process Address Space Isolation vs. Thread Shared Memory ("City & Buildings" analogy).

---

## 🔮 Roadmap & Planned Module Expansion for Future AI Agents

Future AI agents working on this project should implement the remaining queued modules:

### 1. VMware vSphere & ESXi Hypervisor Module (`VirtualizationModule.jsx`)
- **vCenter Web Console Simulator**: Mimicking vCenter (`10.172.60.3`) resource monitoring dashboard.
- **New VM Wizard**: Guided wizard to configure vCPU, RAM, Datastore ISO mounting, and OS type.
- **vMotion & High Availability (HA)**: Interactive simulation of host failure with zero-downtime VM migration.

### 2. File Systems & Effective Permissions Matrix (`FileSystemModule.jsx`)
- **Effective Permissions Calculator**: Compare Share Rights (Read/Change/Full) vs. NTFS Rights (Read/Write/Modify/Full) to compute the net "Most Restrictive Permission".
- **Attribute Toggles**: Interactive EFS Encryption, NTFS Compression, and Indexing flags.
- **Digital Library Analogy Visualizer**: Interactive translation graphic.

### 3. IT Operations & Helpdesk Ticketing (`ITOpsModule.jsx`)
- **Jira-Style Helpdesk Board**: Incident vs. Service Request queue with resolution workflow.
- **IT Football Team Role Map**: Interactive department roles visualization.
- **Process vs. Thread Memory Visualizer**: Interactive memory space diagram.

---

## 🧪 Testing & Verification Workflow Commands

Before concluding any work, run the following verification steps:

```bash
# 1. Run full unit test suite (Must have 100% passing tests)
cmd /c "npm test"

# 2. Test production build singlefile bundle compilation
cmd /c "npm run build"

# 3. Push to active feature branch (e.g. second)
node C:\Users\aessabiri\.gemini\antigravity-cli\brain\585a3d29-5fcf-4565-920c-b48011e0a7fa\scratch\push_to_github.cjs
```
