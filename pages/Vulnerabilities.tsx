import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronRight, Loader2, Bug, Sparkles } from 'lucide-react';
import { MOCK_FINDINGS, MOCK_TARGETS } from '../services/mockData';
import { Finding, Severity } from '../types';
import { analyzeToolOutput } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Vulnerabilities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [findingAnalysis, setFindingAnalysis] = useState<string | null>(null);
  const [analyzingFinding, setAnalyzingFinding] = useState(false);

  const getTargetName = (targetId: string) => {
    return MOCK_TARGETS.find(t => t.id === targetId)?.domain || 'Unknown Target';
  };

  const filteredFindings = MOCK_FINDINGS.filter(finding => {
    const matchesSearch = finding.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          finding.tool.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || finding.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleAnalyzeFinding = async (finding: Finding) => {
    if (selectedFindingId === finding.id) {
      setSelectedFindingId(null);
      return;
    }

    setSelectedFindingId(finding.id);
    setAnalyzingFinding(true);
    setFindingAnalysis(null);

    // Simulated raw output injection
    const simulatedRawOutput = `
Tool: ${finding.tool}
Scan ID: VULN-${finding.id.toUpperCase()}
[+] Target: ${getTargetName(finding.targetId)}
[!] Vulnerability Detected: ${finding.title}
[>] Severity: ${finding.severity}
[>] Category: ${finding.category}
    
Description:
${finding.description}
    `;

    const analysis = await analyzeToolOutput(simulatedRawOutput, finding.tool);
    setFindingAnalysis(analysis || "Analysis unavailable.");
    setAnalyzingFinding(false);
  };

  const SeverityBadge = ({ severity }: { severity: Severity }) => {
    const styles = {
      CRITICAL: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      LOW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      INFO: "bg-slate-500/10 text-slate-500 border-slate-500/20"
    };
    return (
      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bug className="w-6 h-6 text-indigo-500" />
            Vulnerabilities
          </h2>
          <p className="text-slate-400">Centralized finding repository and triage</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm border border-slate-700 hover:bg-slate-700 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search findings by CVE, name, or tool..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-medium text-slate-400 uppercase tracking-wider">
          <div className="col-span-1">Severity</div>
          <div className="col-span-4">Vulnerability</div>
          <div className="col-span-3">Target</div>
          <div className="col-span-2">Tool</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-800">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className="group bg-slate-900 hover:bg-slate-800/50 transition-colors">
              <div 
                className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                onClick={() => handleAnalyzeFinding(finding)}
              >
                <div className="col-span-1">
                  <SeverityBadge severity={finding.severity} />
                </div>
                <div className="col-span-4">
                  <div className="font-medium text-slate-200">{finding.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{finding.category}</div>
                </div>
                <div className="col-span-3 text-sm text-slate-400">
                  {getTargetName(finding.targetId)}
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-mono bg-slate-950 border border-slate-700 px-2 py-1 rounded text-slate-400">
                    {finding.tool}
                  </span>
                </div>
                <div className="col-span-2 text-right flex justify-end">
                   {selectedFindingId === finding.id ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedFindingId === finding.id && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 animate-fade-in">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">{finding.title}</h4>
                        <p className="text-slate-400">{finding.description}</p>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-bold text-white">{finding.cvssScore}</div>
                         <div className="text-xs text-slate-500">CVSS Score</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                       <h5 className="font-bold text-indigo-400 mb-3 flex items-center gap-2">
                         <Sparkles className="w-4 h-4" /> AI Analysis & Remediation
                       </h5>
                       
                       {analyzingFinding ? (
                         <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
                           <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                           <p className="text-sm">Consulting Gemini knowledge base...</p>
                         </div>
                       ) : (
                         <div className="prose prose-invert prose-sm max-w-none bg-slate-900 p-4 rounded-lg border border-slate-800">
                           <ReactMarkdown>{findingAnalysis || ''}</ReactMarkdown>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredFindings.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No vulnerabilities found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vulnerabilities;