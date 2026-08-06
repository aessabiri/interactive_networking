/**
 * Comprehensive NetPulse Bilingual Dictionary (English & Deutsch 🇩🇪)
 * Covers every visible UI label, input, button, table column, step-by-step tutorial, and module text.
 */

export const translations = {
  en: {
    // Brand & Header
    brandName: "NetPulse",
    suiteTitle: "NetPulse • DTS Herford Enterprise Suite",
    hubTitle: "Hub",
    returnToHub: "Return to Main Landing Page Hub",
    activeLab: "Active Lab",
    modeClean: "Clean Mode",
    modeDetailed: "Detailed Mode",
    footerTitle: "NetPulse • Architecture & Security Suite",
    footerSub: "DTS Herford Enterprise Training",
    switchLangTip: "Switch Language / Sprache wechseln",

    // Landing Page Hub
    searchLabel: "What do you want to learn?",
    searchPlaceholder: "Search OSI, Subnetting, DHCP, Firewall, Routing...",
    openLab: "Open Lab",
    totalModules: "18 Interactive Labs",

    // Categories
    catVisualize: "Visualize",
    catVisualizeDesc: "Protocol animations, packet tracing & architecture maps",
    catLearn: "Learn & Test",
    catLearnDesc: "Hands-on troubleshooting, CLI tutor & SOC playbooks",
    catSandbox: "Sandbox",
    catSandboxDesc: "Multi-device topology builder",

    // Module Titles
    modOsi: "OSI & TCP/IP Reference",
    modSubnetting: "FLSM & VLSM Subnetting",
    modHardware: "Hardware & RAID",
    modTopology: "Network Topologies",
    modEnterprise: "Enterprise Infra",
    modDhcp: "DHCP Protocol",
    modDns: "DNS Resolver",
    modAd: "Active Directory",
    modLan: "LAN & VLAN Trunking",
    modMail: "Mail Server",
    modFirewall: "Firewall & IPsec VPN",
    modRouting: "Routing Protocols",
    modProtocols: "Protocol Catalog",
    modNotebook: "CLI Terminal Tutor",
    modLabs: "Lab Scenarios",
    modDts: "DTS Cockpit SOC",
    modConfigure: "Cisco Configurator",
    modSandbox: "Freeform Topology Sandbox",

    // Subnetting Module
    baseNetworkLabel: "Base Network Address & Prefix",
    baseNetworkPlaceholder: "172.16.0.0/18 or 192.168.1.0/24",
    modeVlsm: "VLSM",
    modeFlsm: "FLSM",
    addSubnetLabel: "Add Subnet Requirement:",
    subnetNamePlaceholder: "Subnet Name (e.g. Sales)",
    subnetHostsPlaceholder: "Hosts (e.g. 500)",
    addSubnetBtn: "Add Subnet",
    configuredSubnets: "Configured Subnets:",
    
    // Subnetting Educational Tutorial
    startLesson: "Start Step-by-Step Lesson",
    nextStep: "Next Step",
    lessonCompleted: "Lesson Completed ✓",
    resetLesson: "Start Lesson Over",
    guideTitle: "Interactive Subnetting Student Guide",
    guideDesc: "Add your subnets above and click 'Start Step-by-Step Lesson' to reveal calculations showing exactly how Host Bits, Subnet Masks (SM), Network Addresses (NA), and Broadcast Addresses (BA) are derived step by step.",

    step1Title: "Understand Base Network Pool & Strategy",
    cidrPrefix: "CIDR Prefix",
    hostBits: "Host Bits",
    totalPool: "Total IP Address Pool",
    vlsmRule: "VLSM Strategy Rule: We MUST sort all VLAN requirements by host count in descending order (Largest ➔ Smallest). This guarantees subnets fit tightly without overlapping or leaving fragmented gaps!",
    flsmRule: "FLSM Strategy Rule: In Fixed Length Subnet Masking, every subnet is forced to match the size of the largest VLAN requirement.",
    
    partA: "A. FIND HOST BITS (H)",
    hostsNeeded: "Hosts Needed",
    totalWithBoundaries: "Total (+2 for NA & BA)",
    smallestPower: "Smallest Power",

    partB: "B. CALCULATE MASKS (SM & WM)",
    subnetMask: "Subnet Mask (SM)",
    wildcardMask: "Wildcard Mask (WM)",

    partC: "C. BOUNDARIES (NA & BA)",
    networkAddress: "Network Address (NA)",
    broadcastAddress: "Broadcast Address (BA)",
    blockSize: "Block Size",

    partD: "D. USABLE RANGE & GATEWAY",
    gatewayIp: "Gateway IP (First)",
    lastUsableIp: "Last Usable IP",
    usableHosts: "Usable Hosts",

    summaryTitle: "Final Lesson Summary",
    congratsMessage: "Congratulations! You have successfully calculated all subnets for your network:",
    totalAllocated: "Total Allocated IPs",
    freeRemaining: "Free Remaining IP Pool",

    // Enterprise Module
    entTitle: "Enterprise Multi-Hop Data Flow",
    entHQ: "Headquarters Data Center",
    entBranch: "Branch Office WAN",
    playTrace: "Play Packet Trace",
    pauseTrace: "Pause Trace",
    resetTrace: "Reset Topology",

    // DHCP Module
    dhcpTitle: "DHCP 4-Step DORA Process & Option 82 Relay",
    doraDiscover: "1. DISCOVER (Client ➔ Broadcast)",
    doraOffer: "2. OFFER (Server ➔ Client)",
    doraRequest: "3. REQUEST (Client ➔ Server)",
    doraAck: "4. ACKNOWLEDGEMENT (Server ➔ Client)",
    startDora: "Start DORA Sequence",

    // DNS Module
    dnsTitle: "DNS Recursive & Iterative Resolution Workbench",
    dnsInputLabel: "Query Domain Name (FQDN):",
    dnsRecordType: "Record Type:",
    startDnsLookup: "Start DNS Resolution",
    rootHints: "Root Hints Server (.root)",
    tldServer: "TLD Name Server (.de / .com)",
    authServer: "Authoritative Name Server",

    // Active Directory Module
    adTitle: "Active Directory DS & Kerberos Ticket Authentication",
    adForest: "AD Forest Domain: corp.dts.de",
    adDC: "Primary Domain Controller: DTS-DC-01",
    kerberosAsReq: "1. AS_REQ (Authentication Service Request)",
    kerberosAsRep: "2. AS_REP (TGT Ticket Granting Ticket Issued)",
    kerberosTgsReq: "3. TGS_REQ (Service Ticket Request)",
    kerberosTgsRep: "4. TGS_REP (ST Service Ticket Granted)",
    startKerberos: "Simulate Kerberos Login",

    // LAN Module
    lanTitle: "LAN Layer-2 Switching & 802.1Q VLAN Tagging",
    camTable: "Switch CAM (MAC Address) Table",
    arpCache: "Workstation ARP Cache",
    sendPing: "Send VLAN Ping Packet",

    // Mail Module
    mailTitle: "Mail Server Infrastructure (SMTP & IMAP)",
    smtpHandshake: "SMTP Transaction Sequence",
    sendMailBtn: "Send Email",

    // Firewall & VPN Module
    fwTitle: "Stateful Packet Inspection & IPsec VPN Tunnel",
    spiTable: "Stateful Connection Tracking Table",
    ipsecTunnel: "IPsec IKEv2 Phase 1 & 2 SA Status",
    testFwRule: "Test Firewall Policy",

    // Routing Module
    routingTitle: "Dynamic Routing Protocols (OSPF Dijkstra vs RIP)",
    spfCalc: "Calculate OSPF Shortest Path",
    ripCalc: "Evaluate RIP Hop Count",

    // Hardware Module
    hwTitle: "Enterprise Hardware Architecture & RAID Parity Calculator",
    raidMode: "Select RAID Level:",

    // Topology Module
    topTitle: "Network Topologies (Star, Mesh, Tree, Ring, Bus)",
    nodeCount: "Connected Nodes:",

    // OSI Module
    osiTitle: "7-Layer OSI & 4-Layer TCP/IP Reference Stack",
    layer7: "7. Application Layer",
    layer6: "6. Presentation Layer",
    layer5: "5. Session Layer",
    layer4: "4. Transport Layer",
    layer3: "3. Network Layer",
    layer2: "2. Data Link Layer",
    layer1: "1. Physical Layer",

    // DTS Cockpit SOC Module
    dtsTitle: "DTS Cockpit SOC Managed Security Operations Center",
    siemAlerts: "Real-time SIEM Alert Stream",
    soarPlaybook: "SOAR Automated Remediation Playbooks",
    runRemediation: "Execute SOAR Remediation",

    // Cisco Configurator Module
    cfgTitle: "Cisco IOS CLI Script Generator",
    exportScript: "Export Cisco IOS Configuration (.cfg)",

    // CLI Notebook Module
    notebookTitle: "Linux Bash & Windows PowerShell CLI Tutor",

    // Lab Scenarios Module
    labsTitle: "Interactive Troubleshooting Lab Scenarios",
    verifyFix: "Verify Troubleshooting Solution",

    // Sandbox Module
    sandboxTitle: "Freeform Multi-Device Topology Sandbox",
    addDevice: "Add Device",
    connectCable: "Connect Cable",
    downloadPcap: "Download PCAP File",
    ciscoCli: "Cisco IOS Terminal"
  },

  de: {
    // Brand & Header
    brandName: "NetPulse",
    suiteTitle: "NetPulse • DTS Herford Unternehmens-Plattform",
    hubTitle: "Zentrale",
    returnToHub: "Zurück zur Hauptseite",
    activeLab: "Aktives Labor",
    modeClean: "Kompakt-Modus",
    modeDetailed: "Detail-Modus",
    footerTitle: "NetPulse • Architektur & Sicherheits-Plattform",
    footerSub: "DTS Herford Enterprise Training",
    switchLangTip: "Sprache wechseln / Switch Language",

    // Landing Page Hub
    searchLabel: "Was möchtest du lernen?",
    searchPlaceholder: "Durchsuche OSI, Subnetting, DHCP, Firewall, Routing...",
    openLab: "Lab öffnen",
    totalModules: "18 Interaktive Labore",

    // Categories
    catVisualize: "Visualisieren",
    catVisualizeDesc: "Protokoll-Animationen, Paketverfolgung & Architekturkarten",
    catLearn: "Lernen & Testen",
    catLearnDesc: "Praktische Fehlersuche, CLI-Tutor & SOC-Leitfäden",
    catSandbox: "Sandbox",
    catSandboxDesc: "Freier Topologie-Builder für mehrere Geräte",

    // Module Titles
    modOsi: "OSI & TCP/IP Referenzmodell",
    modSubnetting: "FLSM & VLSM Subnetting",
    modHardware: "Hardware & RAID-Systeme",
    modTopology: "Netzwerk-Topologien",
    modEnterprise: "Unternehmens-Infrastruktur",
    modDhcp: "DHCP-Protokoll",
    modDns: "DNS-Namensauflösung",
    modAd: "Active Directory",
    modLan: "LAN & VLAN-Trunking",
    modMail: "E-Mail-Server Infrastruktur",
    modFirewall: "Firewall & IPsec VPN",
    modRouting: "Routing-Protokolle",
    modProtocols: "Protokoll-Katalog",
    modNotebook: "CLI-Terminal Tutor",
    modLabs: "Lab-Fehlersuche Szenarien",
    modDts: "DTS Cockpit SOC Dashboard",
    modConfigure: "Cisco IOS Konfigurator",
    modSandbox: "Freie Topologie Sandbox",

    // Subnetting Module
    baseNetworkLabel: "Basis-Netzwerkadresse & Präfix",
    baseNetworkPlaceholder: "172.16.0.0/18 oder 192.168.1.0/24",
    modeVlsm: "VLSM",
    modeFlsm: "FLSM",
    addSubnetLabel: "Subnetz-Anforderung hinzufügen:",
    subnetNamePlaceholder: "Subnetz-Name (z.B. Vertrieb)",
    subnetHostsPlaceholder: "Hosts (z.B. 500)",
    addSubnetBtn: "Subnetz hinzufügen",
    configuredSubnets: "Konfigurierte Subnetze:",
    
    // Subnetting Educational Tutorial
    startLesson: "Schritt-für-Schritt Lektion starten",
    nextStep: "Nächster Schritt",
    lessonCompleted: "Lektion abgeschlossen ✓",
    resetLesson: "Lektion neu starten",
    guideTitle: "Interaktiver Subnetting-Leitfaden für Lernende",
    guideDesc: "Füge oben deine Subnetze hinzu und klicke auf 'Schritt-für-Schritt Lektion starten', um nachzuvollziehen, wie Host-Bits, Subnetzmasken (SM), Netzwerkadressen (NA) und Broadcastadressen (BA) schrittweise berechnet werden.",

    step1Title: "Basis-Netzwerk-Pool & Strategie verstehen",
    cidrPrefix: "CIDR-Präfix",
    hostBits: "Host-Bits",
    totalPool: "Gesamter IP-Adress-Pool",
    vlsmRule: "VLSM-Strategieregel: Wir MÜSSEN alle VLAN-Anforderungen absteigend nach Host-Anzahl sortieren (Größtes ➔ Kleinstes). Dies garantiert eine lückenlose Adressierung ohne Überlappungen!",
    flsmRule: "FLSM-Strategieregel: Bei der festen Subnetzmaskierung wird jedes Subnetz auf die Größe des größten VLANs erzwungen.",
    
    partA: "A. HOST-BITS (H) BESTIMMEN",
    hostsNeeded: "Benötigte Hosts",
    totalWithBoundaries: "Gesamt (+2 für NA & BA)",
    smallestPower: "Kleinste Zweierpotenz",

    partB: "B. MASKEN BERECHNEN (SM & WM)",
    subnetMask: "Subnetzmaske (SM)",
    wildcardMask: "Wildcard-Maske (WM)",

    partC: "C. GRENZEN (NA & BA)",
    networkAddress: "Netzwerkadresse (NA)",
    broadcastAddress: "Broadcastadresse (BA)",
    blockSize: "Blockgröße",

    partD: "D. NUTZBARER BEREICH & GATEWAY",
    gatewayIp: "Gateway-IP (Erste)",
    lastUsableIp: "Letzte nutzbare IP",
    usableHosts: "Nutzbare Hosts",

    summaryTitle: "Abschließende Lektionszusammenfassung",
    congratsMessage: "Herzlichen Glückwunsch! Du hast alle Subnetze für dein Netzwerk erfolgreich berechnet:",
    totalAllocated: "Zugewiesene IPs gesamt",
    freeRemaining: "Freier verbleibender IP-Pool",

    // Enterprise Module
    entTitle: "Unternehmensweiter Mehrstufiger Datenfluss",
    entHQ: "Zentrale Rechenzentrum (HQ)",
    entBranch: "Niederlassung WAN (Branch)",
    playTrace: "Paketverfolgung starten",
    pauseTrace: "Pause",
    resetTrace: "Topologie zurücksetzen",

    // DHCP Module
    dhcpTitle: "DHCP 4-Schritt DORA-Ablauf & Option 82 Relay",
    doraDiscover: "1. DISCOVER (Client ➔ Broadcast)",
    doraOffer: "2. OFFER (Server ➔ Client)",
    doraRequest: "3. REQUEST (Client ➔ Server)",
    doraAck: "4. ACKNOWLEDGEMENT (Server ➔ Client)",
    startDora: "DORA-Ablauf starten",

    // DNS Module
    dnsTitle: "DNS Rekursive & Iterative Namensauflösung",
    dnsInputLabel: "Domainname abfragen (FQDN):",
    dnsRecordType: "Eintragstyp:",
    startDnsLookup: "DNS-Abfrage starten",
    rootHints: "Stammserver / Root-Server (.root)",
    tldServer: "Top-Level-Domain Server (.de / .com)",
    authServer: "Autoritativer Nameserver",

    // Active Directory Module
    adTitle: "Active Directory DS & Kerberos-Ticket Authentifizierung",
    adForest: "AD-Gesamtstruktur: corp.dts.de",
    adDC: "Primärer Domänencontroller: DTS-DC-01",
    kerberosAsReq: "1. AS_REQ (Authentifizierungs-Anforderung)",
    kerberosAsRep: "2. AS_REP (TGT-Ticket Ausgestellt)",
    kerberosTgsReq: "3. TGS_REQ (Dienst-Ticket Anforderung)",
    kerberosTgsRep: "4. TGS_REP (Service-Ticket Gewährt)",
    startKerberos: "Kerberos-Anmeldung simulieren",

    // LAN Module
    lanTitle: "LAN Layer-2 Switching & 802.1Q VLAN-Trunking",
    camTable: "Switch CAM (MAC-Adressen) Tabelle",
    arpCache: "Workstation ARP-Cache",
    sendPing: "VLAN-Ping senden",

    // Mail Module
    mailTitle: "E-Mail-Server Infrastruktur (SMTP & IMAP)",
    smtpHandshake: "SMTP-Übertragungssequenz",
    sendMailBtn: "E-Mail senden",

    // Firewall & VPN Module
    fwTitle: "Zustandsbehaftete Firewall (SPI) & IPsec-VPN Tunnel",
    spiTable: "Stateful Verbindungstabelle",
    ipsecTunnel: "IPsec IKEv2 Phase 1 & 2 SA-Status",
    testFwRule: "Firewall-Regel testen",

    // Routing Module
    routingTitle: "Dynamische Routing-Protokolle (OSPF Dijkstra vs RIP)",
    spfCalc: "OSPF Kürzesten Pfad Berechnen (SPF)",
    ripCalc: "RIP Hop-Count Bewerten",

    // Hardware Module
    hwTitle: "Enterprise Hardware-Architektur & RAID-Paritäts-Rechner",
    raidMode: "RAID-Level auswählen:",

    // Topology Module
    topTitle: "Netzwerk-Topologien (Stern, Vermascht, Baum, Ring, Bus)",
    nodeCount: "Verbundene Knoten:",

    // OSI Module
    osiTitle: "7-Schichten OSI & 4-Schichten TCP/IP Referenzmodell",
    layer7: "7. Anwendungsschicht (Application)",
    layer6: "6. Darstellungsschicht (Presentation)",
    layer5: "5. Sitzungsschicht (Session)",
    layer4: "4. Transportschicht (Transport)",
    layer3: "3. Vermittlungsschicht (Network)",
    layer2: "2. Sicherungsschicht (Data Link)",
    layer1: "1. Bitübertragungsschicht (Physical)",

    // DTS Cockpit SOC Module
    dtsTitle: "DTS Cockpit SOC Security Operations Center",
    siemAlerts: "Echtzeit SIEM-Alarm-Feed",
    soarPlaybook: "Automatisierte SOAR-Leitfäden",
    runRemediation: "SOAR-Bereinigung ausführen",

    // Cisco Configurator Module
    cfgTitle: "Cisco IOS CLI-Skript Generator",
    exportScript: "Cisco IOS Konfiguration Exportieren (.cfg)",

    // CLI Notebook Module
    notebookTitle: "Linux Bash & Windows PowerShell CLI-Tutor",

    // Lab Scenarios Module
    labsTitle: "Interaktive Fehlersuche Lab-Szenarien",
    verifyFix: "Lösung überprüfen",

    // Sandbox Module
    sandboxTitle: "Freie Geräte Topologie Sandbox",
    addDevice: "Gerät hinzufügen",
    connectCable: "Kabel verbinden",
    downloadPcap: "PCAP-Datei herunterladen",
    ciscoCli: "Cisco IOS Terminal"
  }
};
