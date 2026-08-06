import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  HardDrive,
  Cpu,
  Zap,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Layers,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Box,
  Sliders,
  Database,
  Cloud,
  HelpCircle,
  Play,
  RotateCcw,
  ArrowRight,
  Radio,
  Sparkles,
  FileText
} from 'lucide-react';
import { EasyCard } from '../common/EasyCard';

export default function HardwareModule({ appMode = 'clean' }) {
  const { lang, t } = useLanguage();
  // --- RAID SIMULATOR STATE ---
  const [raidLevel, setRaidLevel] = useState('5'); // '0', '1', '5', '6', '10'
  const [diskSize, setDiskSize] = useState(2); // TB per disk
  const [diskCount, setDiskCount] = useState(4); // Physical disks
  const [hotSpares, setHotSpares] = useState(0); // Hot spare disks

  // Disk statuses: 'healthy', 'failed', 'rebuilding', 'hotspare'
  const [disks, setDisks] = useState([]);
  const [rebuildProgress, setRebuildProgress] = useState(0);
  const [isRebuilding, setIsRebuilding] = useState(false);

  // --- DATA FLOW ANIMATION STATE ---
  const [isWritingData, setIsWritingData] = useState(false);
  const [activeDataBlock, setActiveDataBlock] = useState(0);

  // --- SCENARIO EXPLORER STATE ---
  const [activeScenarioRaid, setActiveScenarioRaid] = useState('5');

  // Enforce minimum disks per RAID level
  useEffect(() => {
    let minDisks = 2;
    if (raidLevel === '5') minDisks = 3;
    if (raidLevel === '6' || raidLevel === '10') minDisks = 4;

    if (diskCount < minDisks) {
      setDiskCount(minDisks);
    }
  }, [raidLevel]);

  // Reset disks array when diskCount, raidLevel, or hotSpares change
  useEffect(() => {
    const newDisks = [];
    const activeCount = diskCount - hotSpares;

    for (let i = 0; i < diskCount; i++) {
      if (i < activeCount) {
        newDisks.push({ id: i + 1, status: 'healthy', role: 'active' });
      } else {
        newDisks.push({ id: i + 1, status: 'hotspare', role: 'hotspare' });
      }
    }
    setDisks(newDisks);
    setRebuildProgress(0);
    setIsRebuilding(false);
  }, [diskCount, hotSpares, raidLevel]);

  // Handle rebuilding interval
  useEffect(() => {
    let timer;
    if (isRebuilding) {
      timer = setInterval(() => {
        setRebuildProgress((prev) => {
          if (prev >= 100) {
            setIsRebuilding(false);
            // Convert rebuilding disks to healthy active
            setDisks((currDisks) =>
              currDisks.map((d) =>
                d.status === 'rebuilding'
                  ? { ...d, status: 'healthy', role: 'active' }
                  : d
              )
            );
            return 100;
          }
          return prev + 10;
        });
      }, 400);
    }
    return () => clearInterval(timer);
  }, [isRebuilding]);

  // Handle Data Write Animation
  useEffect(() => {
    let timer;
    if (isWritingData) {
      timer = setInterval(() => {
        setActiveDataBlock((prev) => (prev + 1) % 4);
      }, 600);
    } else {
      setActiveDataBlock(0);
    }
    return () => clearInterval(timer);
  }, [isWritingData]);

  // Dynamic RAID Calculations
  const activeDiskCount = diskCount - hotSpares;
  const rawCapacity = diskCount * diskSize;

  let usableCapacity = 0;
  let faultTolerance = 0;
  let raidDescription = '';
  let readSpeed = '1x';
  let writeSpeed = '1x';

  switch (raidLevel) {
    case '0':
      usableCapacity = activeDiskCount * diskSize;
      faultTolerance = 0;
      raidDescription = lang === 'de' ? 'Daten werden gleichmäßig auf alle Festplatten verteilt (Striping). Maximale Geschwindigkeit, aber KEINE Fehlertoleranz.' : 'Data is split (striped) evenly across all disks. Maximum speed, but ZERO fault tolerance.';
      readSpeed = lang === 'de' ? `${activeDiskCount}x (Am schnellsten)` : `${activeDiskCount}x (Fastest)`;
      writeSpeed = lang === 'de' ? `${activeDiskCount}x (Am schnellsten)` : `${activeDiskCount}x (Fastest)`;
      break;

    case '1':
      usableCapacity = (activeDiskCount / 2) * diskSize;
      faultTolerance = Math.floor(activeDiskCount / 2);
      raidDescription = lang === 'de' ? 'Daten werden auf Laufwerkspaare gespiegelt (dupliziert). 100% Redundanz, 50% nutzbarer Speicher.' : 'Data is mirrored (duplicated) across drive pairs. 100% redundancy, 50% usable space.';
      readSpeed = lang === 'de' ? `${activeDiskCount}x (Schnell)` : `${activeDiskCount}x (Fast)`;
      writeSpeed = lang === 'de' ? '1x (Standard)' : '1x (Standard)';
      break;

    case '5':
      usableCapacity = (activeDiskCount - 1) * diskSize;
      faultTolerance = 1;
      raidDescription = lang === 'de' ? 'Block-Striping mit einfacher verteilter Parität. Übersteht 1 Laufwerksausfall mit min. 3 Festplatten.' : 'Block striping with single distributed parity. Sustains 1 drive failure with min 3 disks.';
      readSpeed = lang === 'de' ? `${activeDiskCount - 1}x (Hoch)` : `${activeDiskCount - 1}x (High)`;
      writeSpeed = lang === 'de' ? 'Paritätsaufwand' : 'Parity Overhead';
      break;

    case '6':
      usableCapacity = (activeDiskCount - 2) * diskSize;
      faultTolerance = 2;
      raidDescription = lang === 'de' ? 'Block-Striping mit doppelter verteilter Parität (P+Q). Übersteht 2 gleichzeitige Laufwerksausfälle.' : 'Block striping with dual distributed parity (P+Q). Sustains 2 simultaneous drive failures.';
      readSpeed = lang === 'de' ? `${activeDiskCount - 2}x (Hoch)` : `${activeDiskCount - 2}x (High)`;
      writeSpeed = lang === 'de' ? 'Doppelter Paritätsaufwand' : 'Dual Parity Overhead';
      break;

    case '10':
      usableCapacity = (activeDiskCount / 2) * diskSize;
      faultTolerance = Math.floor(activeDiskCount / 2);
      raidDescription = lang === 'de' ? 'RAID 1+0 (Gespiegelte Stripes). Hohe Geschwindigkeit und Zuverlässigkeit für Unternehmensdatenbanken.' : 'RAID 1+0 (Striped Mirror). High speed and high reliability for enterprise databases.';
      readSpeed = lang === 'de' ? `${activeDiskCount}x (Hoch)` : `${activeDiskCount}x (High)`;
      writeSpeed = lang === 'de' ? `${activeDiskCount / 2}x (Hoch)` : `${activeDiskCount / 2}x (High)`;
      break;

    default:
      break;
  }

  const efficiencyPercent = rawCapacity > 0 ? Math.round((usableCapacity / rawCapacity) * 100) : 0;
  const parityCapacity = rawCapacity - usableCapacity;

  // Array Health Logic
  const failedActiveDisks = disks.filter((d) => d.role === 'active' && d.status === 'failed').length;
  const hasHotSpare = disks.some((d) => d.status === 'hotspare');

  let arrayStatus = 'OPTIMAL';
  let arrayStatusColor = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400';

  if (failedActiveDisks > 0) {
    if (failedActiveDisks > faultTolerance) {
      arrayStatus = lang === 'de' ? 'FEHLGESCHLAGEN (KRITISCHER DATENVERLUST)' : 'FAILED (CRITICAL DATA LOSS)';
      arrayStatusColor = 'border-rose-500/50 bg-rose-950/40 text-rose-400 animate-pulse';
    } else {
      arrayStatus = isRebuilding ? (lang === 'de' ? 'WIEDERHERSTELLUNG' : 'REBUILDING') : (lang === 'de' ? 'DEGRADIERT (FEHLERTOLERANT)' : 'DEGRADED (FAULT TOLERANT)');
      arrayStatusColor = isRebuilding
        ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400'
        : 'border-amber-500/50 bg-amber-950/40 text-amber-400';
    }
  }

  // Toggle disk failure
  const toggleFailDisk = (id) => {
    setDisks((currDisks) => {
      return currDisks.map((d) => {
        if (d.id === id) {
          if (d.status === 'healthy' || d.status === 'hotspare') {
            return { ...d, status: 'failed' };
          } else if (d.status === 'failed') {
            return { ...d, status: d.role === 'hotspare' ? 'hotspare' : 'healthy' };
          }
        }
        return d;
      });
    });
  };

  // Fail 1st active disk for 1-drive failure scenario
  const failOneActiveDisk = () => {
    const firstActive = disks.find((d) => d.role === 'active' && d.status === 'healthy');
    if (firstActive) {
      toggleFailDisk(firstActive.id);
    }
  };

  // Trigger Hot-Spare Rebuild
  const triggerRebuild = () => {
    const spare = disks.find((d) => d.status === 'hotspare');
    const failed = disks.find((d) => d.role === 'active' && d.status === 'failed');

    if (spare && failed && !isRebuilding) {
      setDisks((currDisks) =>
        currDisks.map((d) => {
          if (d.id === spare.id) return { ...d, status: 'rebuilding', role: 'active' };
          if (d.id === failed.id) return { ...d, role: 'decommissioned' };
          return d;
        })
      );
      setRebuildProgress(0);
      setIsRebuilding(true);
    }
  };

  // Replace all failed drives
  const replaceAllFailedDisks = () => {
    setDisks((currDisks) =>
      currDisks.map((d) =>
        d.status === 'failed' || d.role === 'decommissioned'
          ? { ...d, status: d.id > activeDiskCount ? 'hotspare' : 'healthy', role: d.id > activeDiskCount ? 'hotspare' : 'active' }
          : d
      )
    );
    setRebuildProgress(0);
    setIsRebuilding(false);
  };

  // Scenario Descriptions per RAID Type
  const scenariosInfo = {
    '0': {
      title: lang === 'de' ? 'RAID 0 — 1 Festplattenausfall Szenario' : 'RAID 0 — 1 Drive Failure Scenario',
      statusType: lang === 'de' ? 'KRITISCHER VERLUST' : 'CRITICAL LOSS',
      statusColor: 'text-rose-400 bg-rose-950/50 border-rose-800',
      dataIntact: false,
      summary: lang === 'de' ? 'Totaler Array-Zusammenbruch. Alle Daten auf ALLEN Festplatten sind dauerhaft verloren.' : 'Total Array Collapse. All data across ALL drives is permanently lost.',
      details: lang === 'de' ? [
        'Daten werden sequenziell verteilt (Block A1 auf Disk 1, Block A2 auf Disk 2).',
        'Wenn Disk 1 ausfällt, fehlt die Hälfte jeder Datei ohne Parität oder Backup.',
        'Array-Zustand wird UNWIEDERHERSTELLBAR. Vollständige Wiederherstellung aus externen Backups erforderlich.'
      ] : [
        'Data is stripped sequentially (Block A1 on Disk 1, Block A2 on Disk 2).',
        'If Disk 1 fails, half of every file is missing with NO parity or backup to reconstruct it.',
        'Array state becomes UNRECOVERABLE. Full restore from external backups is required.'
      ],
      action: lang === 'de' ? 'Wiederherstellung aus Off-Site / Cloud-Backups.' : 'Restore from off-site / cloud backups.'
    },
    '1': {
      title: 'RAID 1 — 1 Drive Failure Scenario',
      statusType: '100% DATA INTACT',
      statusColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800',
      dataIntact: true,
      summary: 'Zero Data Loss. The mirror drive immediately handles all read & write requests.',
      details: [
        'Disk 1 and Disk 2 hold identical 1:1 copies of all data.',
        'If Disk 1 fails, Disk 2 continues operating with zero downtime.',
        'Array switches to DEGRADED state until the broken drive is replaced and re-mirrored.'
      ],
      action: 'Hot-swap broken drive and initiate mirror sync.'
    },
    '5': {
      title: 'RAID 5 — 1 Drive Failure Scenario',
      statusType: '100% DATA INTACT',
      statusColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800',
      dataIntact: true,
      summary: 'Zero Data Loss. Missing blocks are reconstructed on-the-fly using Parity (XOR).',
      details: [
        'Parity blocks are distributed evenly across all drives (Disk 1: A1, Disk 2: A2, Disk 3: Parity A).',
        'If Disk 2 fails, the RAID controller computes: A2 = A1 XOR Parity(A).',
        'Read performance drops slightly due to CPU XOR math overhead until rebuilt.'
      ],
      action: 'Hot-swap disk and rebuild array using parity.'
    },
    '6': {
      title: 'RAID 6 — 1 Drive Failure Scenario',
      statusType: '100% DATA INTACT (STILL CAN SURVIVE 2nd FAILURE!)',
      statusColor: 'text-cyan-400 bg-cyan-950/50 border-cyan-800',
      dataIntact: true,
      summary: 'Zero Data Loss. Dual Parity (P+Q) keeps array completely safe.',
      details: [
        'Uses two independent parity polynomial algorithms (P and Q parity blocks).',
        'If 1 drive fails, the second parity stream continues protecting against a secondary drive crash.',
        'Ideal for massive enterprise storage arrays (8+ drives).'
      ],
      action: 'Replace failed drive at convenience while safety buffer remains intact.'
    },
    '10': {
      title: 'RAID 10 — 1 Drive Failure Scenario',
      statusType: '100% DATA INTACT',
      statusColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800',
      dataIntact: true,
      summary: 'Zero Data Loss. High-speed recovery with minimal rebuild time.',
      details: [
        'Combines RAID 1 (Mirroring) and RAID 0 (Striping).',
        'If 1 drive in Pair 1 fails, its mirrored twin in Pair 1 takes over 100% of read traffic.',
        'Rebuild only copies data from the twin drive without heavy parity calculation math.'
      ],
      action: 'Hot-swap drive and perform fast 1-to-1 mirror copy.'
    }
  };

  const currentScenario = scenariosInfo[activeScenarioRaid];

  return (
    <div className="space-y-6">
      {/* MODULE HEADER */}
      <div className="glass-panel p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/20">
              <HardDrive className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {lang === 'de' ? 'Server RAID-Speicher & Datenfluss-Workbench' : 'Server RAID Storage & Data Flow Workbench'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {lang === 'de' ? 'Datenfluss & 1-Laufwerk-Ausfälle' : 'Data Flow & 1-Drive Failures'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'de' ? 'Visualisierung von Daten-Striping, Paritätsverteilung und Szenarien für den Ausfall einzelner Festplatten über RAID 0, 1, 5, 6 & 10.' : 'Visualizing data block striping, parity distribution, and single hard drive failure scenarios across RAID 0, 1, 5, 6 & 10.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EASY / CLEAN MODE EDUCATIONAL HIGHLIGHT */}
      {appMode === 'clean' && (
        <EasyCard
          title="💡 How RAID Handles Data & Drive Failures"
          description="RAID splits your files across multiple hard drives. Parity data works like a mathematical puzzle: if 1 drive breaks, the computer recalculates the missing numbers automatically!"
          badge="Enterprise Storage Concept"
          tips={[
            "RAID 0 = Fast, but 1 broken disk destroys ALL data.",
            "RAID 1 = Creates an exact 1:1 backup copy on a twin drive.",
            "RAID 5 = Calculates 1 Parity block (survives 1 failed drive).",
            "RAID 6 = Calculates 2 Parity blocks (survives 2 failed drives).",
            "RAID 10 = Combines speed (Striping) and safety (Mirroring)."
          ]}
        />
      )}

      {/* MAIN RAID CALCULATOR & DRIVE CONTROLS */}
      <div className="glass-panel p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">RAID Array Configurator</h2>
              <p className="text-xs text-slate-400">Select RAID level, disk count, and test drive failure scenarios.</p>
            </div>
          </div>

          {/* Array Health Status Banner */}
          <div className={`px-4 py-2 rounded-2xl border text-xs font-mono font-black flex items-center gap-2 ${arrayStatusColor}`}>
            <Activity className="w-4 h-4" />
            <span>ARRAY STATE: {arrayStatus}</span>
          </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* RAID Level Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>RAID Level</span>
            </label>
            <select
              value={raidLevel}
              onChange={(e) => {
                setRaidLevel(e.target.value);
                setActiveScenarioRaid(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            >
              <option value="0">RAID 0 (Striping - Speed)</option>
              <option value="1">RAID 1 (Mirroring - Redundancy)</option>
              <option value="5">RAID 5 (Distributed Parity)</option>
              <option value="6">RAID 6 (Dual Parity - High Safety)</option>
              <option value="10">RAID 10 (Striped Mirror)</option>
            </select>
          </div>

          {/* Disk Size Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drive Capacity</span>
            </label>
            <select
              value={diskSize}
              onChange={(e) => setDiskSize(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>1 TB per drive</option>
              <option value={2}>2 TB per drive</option>
              <option value={4}>4 TB per drive</option>
              <option value={8}>8 TB per drive</option>
            </select>
          </div>

          {/* Disk Count Range */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>Physical Disks</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">{diskCount} Drives</span>
            </div>
            <input
              type="range"
              min={raidLevel === '5' ? 3 : (raidLevel === '6' || raidLevel === '10' ? 4 : 2)}
              max={8}
              value={diskCount}
              onChange={(e) => setDiskCount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Hot Spare Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hot Spares</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">{hotSpares} Spare</span>
            </div>
            <select
              value={hotSpares}
              onChange={(e) => setHotSpares(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            >
              <option value={0}>0 Hot Spares</option>
              <option value={1}>1 Hot Spare Drive</option>
            </select>
          </div>
        </div>

        {/* METRICS & CAPACITY SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-mono">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Raw Storage</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">{rawCapacity} TB</div>
            <div className="text-[10px] text-slate-500">{diskCount} × {diskSize} TB</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-900/50 text-center">
            <div className="text-[10px] font-mono text-emerald-400 uppercase">Usable Capacity</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{usableCapacity} TB</div>
            <div className="text-[10px] text-emerald-500">{efficiencyPercent}% Efficiency</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-900/50 text-center">
            <div className="text-[10px] font-mono text-purple-400 uppercase">Parity / Overhead</div>
            <div className="text-xl font-black text-purple-400 font-mono mt-0.5">{parityCapacity} TB</div>
            <div className="text-[10px] text-purple-500">Protection Storage</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-900/50 text-center">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Fault Tolerance</div>
            <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">{faultTolerance} Drive{faultTolerance !== 1 ? 's' : ''}</div>
            <div className="text-[10px] text-cyan-500">Allowed Failures</div>
          </div>
        </div>

        {/* INTERACTIVE DRIVE BAYS & DISK CRASH SIMULATOR */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Physical Disk Bays</span>
              </h3>
              <p className="text-xs text-slate-400">Click any disk bay to simulate an individual hard drive crash!</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={failOneActiveDisk}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Fail 1 Drive (Test Scenario)</span>
              </button>

              {failedActiveDisks > 0 && hasHotSpare && !isRebuilding && (
                <button
                  onClick={triggerRebuild}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Start Hot-Spare Rebuild</span>
                </button>
              )}

              {failedActiveDisks > 0 && (
                <button
                  onClick={replaceAllFailedDisks}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Swap & Replace Failed Disks</span>
                </button>
              )}
            </div>
          </div>

          {/* Rebuild Progress Bar */}
          {isRebuilding && (
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Rebuilding Missing Blocks onto Hot Spare...</span>
                </span>
                <span>{rebuildProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  style={{ width: `${rebuildProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* DRIVE BAYS DISPLAY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {disks.map((disk) => {
              let isHealthy = disk.status === 'healthy';
              let isFailed = disk.status === 'failed';
              let isRebuildingDisk = disk.status === 'rebuilding';
              let isSpare = disk.status === 'hotspare';

              let borderColor = 'border-slate-800 bg-slate-900';
              let ledColor = 'bg-emerald-500 shadow-emerald-500/50';

              if (isFailed) {
                borderColor = 'border-rose-600/80 bg-rose-950/40 animate-pulse';
                ledColor = 'bg-rose-500 shadow-rose-500/80 animate-ping';
              } else if (isRebuildingDisk) {
                borderColor = 'border-cyan-500 bg-cyan-950/40';
                ledColor = 'bg-cyan-400 shadow-cyan-400/80 animate-bounce';
              } else if (isSpare) {
                borderColor = 'border-blue-800/60 bg-blue-950/30';
                ledColor = 'bg-blue-400 shadow-blue-400/50';
              }

              return (
                <button
                  key={disk.id}
                  onClick={() => toggleFailDisk(disk.id)}
                  className={`p-3 rounded-2xl border ${borderColor} flex flex-col items-center justify-between gap-2.5 transition-all hover:scale-105 cursor-pointer text-left relative group`}
                  title="Click to simulate drive failure/recovery"
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">BAY {disk.id}</span>
                    <div className={`w-2 h-2 rounded-full ${ledColor} shadow-md`} />
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/60 text-slate-300">
                    <HardDrive className={`w-6 h-6 ${isFailed ? 'text-rose-400' : isRebuildingDisk ? 'text-cyan-400' : isSpare ? 'text-blue-400' : 'text-emerald-400'}`} />
                  </div>

                  <div className="text-center">
                    <div className="text-xs font-mono font-bold text-white">{diskSize} TB</div>
                    <div className="text-[9px] font-mono uppercase font-bold mt-0.5">
                      {isFailed && <span className="text-rose-400">FAILED</span>}
                      {isRebuildingDisk && <span className="text-cyan-400">REBUILD</span>}
                      {isSpare && <span className="text-blue-400">HOT SPARE</span>}
                      {isHealthy && <span className="text-emerald-400">ACTIVE</span>}
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-2xl bg-slate-950/90 opacity-0 group-hover:opacity-100 flex items-center justify-center p-1 transition-all text-center">
                    <span className="text-[10px] font-bold text-cyan-400">
                      {isFailed ? 'Click to Repair' : 'Click to Fail'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: REAL-TIME RAID DATA FLOW VISUALIZATION */}
      <div className="glass-panel p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Interactive RAID Data Flow & Block Writing Stream</h2>
              <p className="text-xs text-slate-400">Watch incoming files get split into Data Blocks and Parity Blocks across physical drives.</p>
            </div>
          </div>

          <button
            onClick={() => setIsWritingData(!isWritingData)}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isWritingData
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20 hover:scale-102'
            }`}
          >
            {isWritingData ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Pause Write Pulse</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Simulate Data Write Stream</span>
              </>
            )}
          </button>
        </div>

        {/* ANIMATED DATA FLOW CONTROLLER PIPELINE */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          
          {/* SOURCE FILE STREAM */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-white">Incoming File: Enterprise_Database_Backup.iso</div>
              <div className="text-[10px] text-slate-400">RAID Controller splitting file into 64KB Data Blocks & Parity Blocks...</div>
            </div>
            {isWritingData && (
              <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                WRITING...
              </span>
            )}
          </div>

          {/* VISUAL BLOCK STRIPING PER RAID LEVEL */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Data & Parity Block Allocation Table:</div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              {disks.slice(0, activeDiskCount).map((disk, idx) => {
                let blockContent = '';
                let blockType = 'data';

                if (raidLevel === '0') {
                  blockContent = `Data A${idx + 1}`;
                } else if (raidLevel === '1') {
                  const pairIdx = Math.floor(idx / 2) + 1;
                  blockContent = `Data Block A${pairIdx} ${idx % 2 === 1 ? '(Mirror)' : '(Primary)'}`;
                  blockType = idx % 2 === 1 ? 'mirror' : 'data';
                } else if (raidLevel === '5') {
                  if (idx === (activeDataBlock % activeDiskCount)) {
                    blockContent = `Parity P(A)`;
                    blockType = 'parity';
                  } else {
                    blockContent = `Data A${idx + 1}`;
                  }
                } else if (raidLevel === '6') {
                  if (idx === (activeDataBlock % activeDiskCount)) {
                    blockContent = `Parity P(A)`;
                    blockType = 'parity';
                  } else if (idx === ((activeDataBlock + 1) % activeDiskCount)) {
                    blockContent = `Parity Q(A)`;
                    blockType = 'parity';
                  } else {
                    blockContent = `Data A${idx + 1}`;
                  }
                } else if (raidLevel === '10') {
                  const span = idx < 2 ? 'Span 1' : 'Span 2';
                  blockContent = `Block A (${span})`;
                }

                let badgeColor = 'bg-cyan-950 text-cyan-400 border-cyan-800';
                if (blockType === 'parity') badgeColor = 'bg-purple-950 text-purple-400 border-purple-800';
                if (blockType === 'mirror') badgeColor = 'bg-blue-950 text-blue-400 border-blue-800';
                if (disk.status === 'failed') badgeColor = 'bg-rose-950 text-rose-400 border-rose-800';

                return (
                  <div key={disk.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">Disk {disk.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${badgeColor}`}>
                        {disk.status === 'failed' ? 'FAILED' : blockType.toUpperCase()}
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-lg text-center font-bold border transition-all ${
                      isWritingData && activeDataBlock === idx
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 scale-102 shadow-lg shadow-cyan-500/20'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}>
                      {disk.status === 'failed' ? 'BLOCK UNREADABLE' : blockContent}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: 1-HARDDRIVE FAILURE SCENARIO EXPLORER FOR EVERY RAID TYPE */}
      <div className="glass-panel p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">1-HardDrive Failure Scenarios Explorer</h2>
              <p className="text-xs text-slate-400">Detailed breakdown of single drive failures for EVERY RAID type (RAID 0, 1, 5, 6, 10).</p>
            </div>
          </div>
        </div>

        {/* SCENARIO TAB BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
          {['0', '1', '5', '6', '10'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveScenarioRaid(type);
                setRaidLevel(type);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                activeScenarioRaid === type
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/20 scale-102 font-black'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              RAID {type} Scenario
            </button>
          ))}
        </div>

        {/* SCENARIO DETAILS CARD */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>{currentScenario.title}</span>
            </h3>

            <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${currentScenario.statusColor}`}>
              {currentScenario.statusType}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
            <strong className="text-white block font-bold mb-1">Impact Summary:</strong>
            {currentScenario.summary}
          </div>

          {/* STEP BY STEP DETAILS */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 font-mono">Detailed Drive Failure Event Sequence:</div>
            <ul className="space-y-2">
              {currentScenario.details.map((detail, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* REQUIRED ADMIN RECOVERY ACTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-800/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span><strong>SysAdmin Recovery Action:</strong> {currentScenario.action}</span>
            </div>

            <button
              onClick={failOneActiveDisk}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-600/20 shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Test This Failure Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
