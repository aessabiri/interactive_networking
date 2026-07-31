import React, { useState } from 'react';
import { BookOpen, Terminal, CheckCircle2, XCircle, HelpCircle, Award, Send } from 'lucide-react';

export default function LabNotebook() {
  const [commandInput, setCommandInput] = useState('');
  const [cliOutput, setCliOutput] = useState([
    'Windows IP Configuration - DTS Herford Lab Environment',
    'Type "help" to see available networking commands (ipconfig, nslookup, dcdiag, nltest, arp, klist, ping).\n'
  ]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      question: 'Which DHCP step is sent as a Broadcast packet by the client to request IP assignment?',
      options: ['DHCP OFFER', 'DHCP DISCOVER & REQUEST', 'DHCP ACK', 'DHCP INFORM'],
      correct: 1,
      explanation: 'DHCP DISCOVER and DHCP REQUEST are both broadcast (255.255.255.255) by the client.'
    },
    {
      id: 2,
      question: 'What DNS Record type is used by Active Directory to locate Domain Controllers and LDAP services?',
      options: ['A Record', 'CNAME Record', 'SRV Record (_ldap._tcp.dc._msdcs)', 'PTR Record'],
      correct: 2,
      explanation: 'SRV records store service location, port (389), and target hostname for AD Domain Controllers.'
    },
    {
      id: 3,
      question: 'Which Kerberos ticket is issued first by the KDC Authentication Service (AS) upon user login?',
      options: ['Service Ticket', 'Ticket Granting Ticket (TGT)', 'NTLM Hash', 'RADIUS Token'],
      correct: 1,
      explanation: 'The KDC AS issues a TGT encrypted with the krbtgt account key during AS-REP.'
    },
    {
      id: 4,
      question: 'Which FSMO role handles immediate password updates and time synchronization across the domain?',
      options: ['Schema Master', 'Domain Naming Master', 'PDC Emulator', 'RID Master'],
      correct: 2,
      explanation: 'The PDC Emulator is responsible for password updates, time sync (NTP), and Group Policy edits.'
    }
  ];

  const handleRunCommand = (e) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    let response = '';

    if (cmd === 'help') {
      response = `Available Commands:
- ipconfig /all : View full IP config (MAC, Gateway, DNS, DHCP)
- ipconfig /renew : Initiate DHCP DORA lease renewal
- ipconfig /flushdns : Clear DNS resolver cache
- nslookup dc01.corp.local : Perform DNS lookup
- dcdiag : Run Active Directory DC Diagnostic tests
- nltest /dsgetdc:corp.local : Locate Domain Controller via DNS SRV
- arp -a : Display ARP address resolution table
- klist : View cached Kerberos TGT and Service Tickets
- ping 192.168.1.10 : Test IP connectivity`;
    } else if (cmd.startsWith('ipconfig /all')) {
      response = `Windows IP Configuration

   Host Name . . . . . . . . . . . . : WS-HERFORD-01
   Primary Dns Suffix  . . . . . . . : corp.local
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No
   DNS Suffix Search List. . . . . . : corp.local

Ethernet adapter Local Area Connection:
   Physical Address. . . . . . . . . : 00-50-56-A1-B2-C3
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.1.105(Preferred) 
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Friday, July 31, 2026 19:44:00
   Default Gateway . . . . . . . . . : 192.168.1.1
   DHCP Server . . . . . . . . . . . : 192.168.1.10
   DNS Servers . . . . . . . . . . . : 192.168.1.10`;
    } else if (cmd.startsWith('ipconfig /renew')) {
      response = `Sending DHCP DISCOVER...
Received DHCP OFFER from 192.168.1.10 (Offered IP: 192.168.1.105)
Sending DHCP REQUEST...
Received DHCP ACK from 192.168.1.10.
Lease renewed successfully!`;
    } else if (cmd.startsWith('ipconfig /flushdns')) {
      response = `Successfully flushed the DNS Resolver Cache.`;
    } else if (cmd.startsWith('nslookup')) {
      response = `Server:  dc01.corp.local
Address:  192.168.1.10

Name:    dc01.corp.local
Address:  192.168.1.10`;
    } else if (cmd.startsWith('dcdiag')) {
      response = `Directory Server Diagnosis

Performing initial setup:
   Trying to find home server...
   Home Server = DC01
   * Identified AD Forest.
   Done gathering initial info.

Doing initial required tests
   Testing server: Default-First-Site-Name\\DC01
      Starting test: Connectivity ......................... Passed
      Starting test: KCC .................................. Passed
      Starting test: NetLogons ............................. Passed
      Starting test: Advertising ........................... Passed
      Starting test: Services .............................. Passed
      Starting test: FSMOCheck ............................. Passed`;
    } else if (cmd.startsWith('arp -a')) {
      response = `Interface: 192.168.1.105 --- 0x3
  Internet Address      Physical Address      Type
  192.168.1.1           00-00-0c-07-ac-01     dynamic
  192.168.1.10          00-0c-29-8e-7f-11     dynamic
  192.168.1.255         ff-ff-ff-ff-ff-ff     static`;
    } else if (cmd.startsWith('klist')) {
      response = `Current LogonId is 0:0x3e7

Cached Tickets: (2)

#1> Client: dts.student @ CORP.LOCAL
    Server: krbtgt/CORP.LOCAL @ CORP.LOCAL
    KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1
    End Time: 8/1/2026 05:44:00

#2> Client: dts.student @ CORP.LOCAL
    Server: cifs/FILESVR01 @ CORP.LOCAL
    KerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1
    End Time: 8/1/2026 05:44:00`;
    } else {
      response = `Command "${cmd}" executed. Type "help" for a list of Windows networking commands.`;
    }

    setCliOutput(prev => [...prev, `C:\\Users\\Student> ${commandInput}`, response]);
    setCommandInput('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-100">DTS Herford CLI Simulator & Knowledge Quiz</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test your command-line skills (`ipconfig`, `dcdiag`, `nltest`, `klist`) and verify your knowledge with the interactive quiz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Windows CLI Simulator */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2 text-cyan-400 font-bold">
              <Terminal className="w-4 h-4" /> Windows Command Prompt (`cmd.exe`)
            </span>
            <span className="text-[10px] text-slate-500">Admin Mode</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-80 overflow-y-auto space-y-2 text-slate-300">
            {cliOutput.map((out, i) => (
              <pre key={i} className="whitespace-pre-wrap leading-relaxed">{out}</pre>
            ))}
          </div>

          <form onSubmit={handleRunCommand} className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">C:\&gt;</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="type ipconfig /all or help..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button type="submit" className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Interactive Knowledge Quiz */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Windows Infrastructure Knowledge Quiz
            </h3>
            <button
              onClick={() => setShowResults(!showResults)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded cursor-pointer"
            >
              {showResults ? 'Hide Answers' : 'Check Answers'}
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-88">
            {quizQuestions.map((q) => (
              <div key={q.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-200">{q.id}. {q.question}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, idx) => {
                    const isSelected = quizAnswers[q.id] === idx;
                    const isCorrect = q.correct === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: idx })}
                        className={`p-2 rounded text-xs font-mono cursor-pointer border transition-colors ${
                          showResults && isCorrect
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                            : isSelected
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>
                {showResults && (
                  <p className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-900/40">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
