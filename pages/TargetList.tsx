import React, { useState } from 'react';
import { Target, Play, Pause, Trash2, Search, Plus, Loader2, Sparkles, FileWarning, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { MOCK_TARGETS, MOCK_FINDINGS } from '../services/mockData';
import { Target as TargetType, ScanLog, Finding } from '../types';
import { generateRiskReport, analyzeToolOutput } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface TargetListProps {
  onScanStart: (target: string) => void;
  isScanning: boolean;
}

const TargetList: React.FC<TargetListProps> = ({ onScanStart, isScanning }) => {
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Finding analysis state
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [findingAnalysis, setFindingAnalysis] = useState<string | null>(null);
  const [analyzingFinding, setAnalyzingFinding] = useState(false);

  const targetFindings = selectedTarget 
    ? MOCK_FINDINGS.filter(f => f.targetId === selectedTarget.id)
    : [];

  const handleGenerateReport = async (target: TargetType) => {
    setGeneratingReport(true);
    setAiReport(null);
    const report = await generateRiskReport(target, targetFindings);
    setAiReport(report || "No report generated.");
    setGeneratingReport(false);
  };

  const handleAnalyzeFinding = async (finding: Finding) => {
    if (selectedFindingId === finding.id) {
      setSelectedFindingId(null);
      setFindingAnalysis(null);
      return;
    }

    setSelectedFindingId(finding.id);
    setAnalyzingFinding(true);
    setFindingAnalysis(null);

    // Simulating raw output from the finding data for this demo
    const simulatedRawOutput = `
Tool: ${finding.tool}
Scan ID: ${Math.random().toString(36).substring(7)}
Timestamp: ${finding.timestamp}
[+] Target: ${selectedTarget?.domain}
[!] Vulnerability Detected: ${finding.title}
[>] Severity: ${finding.severity}
[>] CVSS: ${finding.cvssScore}
    
Payload / Description:
${finding.description}
    `;

    const analysis = await analyzeToolOutput(simulatedRawOutput, finding.tool);
    setFindingAnalysis(analysis || "Analysis unavailable.");
    setAnalyzingFinding(false);
  };

  return (
    <div className="space-y-6 h-full flex gap-6">
      {/* Target List Panel */}
      <div className={`flex-1 space-y-6 transition-all ${selectedTarget ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Target Management</h2>
            <p className="text-slate-400">Manage scopes and schedule pipelines</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Scope
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search targets..." 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {MOCK_TARGETS.map((target) => (
              <div 
                key={target.id} 
                onClick={() => setSelectedTarget(target)}
                className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedTarget?.id === target.id ? 'bg-slate-800/80 border-l-2 border-indigo-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-medium text-white">{target.domain}</h3>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-mono
                    ${target.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 
                      target.status === 'SCANNING' ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 
                      'bg-slate-700 text-slate-400'}`}>
                    {target.status}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Last Scan: {target.lastScan || 'Never'}</span>
                  <div className="flex gap-1">
                    {target.tags.map(tag => (
                      <span key={tag} className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTarget && (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[calc(100vh-140px)] overflow-hidden animate-fade-in-right">
          <div className="p-6 border-b border-slate-800 bg-slate-900 z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedTarget.domain}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-slate-400">Production Environment</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTarget(null)}
                className="lg:hidden p-2 text-slate-400"
              >
                Close
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => onScanStart(selectedTarget.domain)}
                disabled={isScanning || selectedTarget.status === 'SCANNING'}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Full Pipeline
              </button>
              <button 
                onClick={() => handleGenerateReport(selectedTarget)}
                disabled={generatingReport}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Risk Assessment
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!aiReport && !generatingReport && (
              <>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-slate-400 text-xs mb-1">Risk Score</p>
                    <div className="text-3xl font-bold text-rose-500">{selectedTarget.riskScore}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <p className="text-slate-400 text-xs mb-1">Total Findings</p>
                    <div className="text-3xl font-bold text-white">
                      {Object.values(selectedTarget.findingsCount).reduce((a: number, b: number) => a + b, 0)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <FileWarning className="w-4 h-4 text-slate-400"/> Vulnerability Breakdown
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-rose-900/30 rounded-lg">
                      <span className="text-rose-400 font-medium">Critical</span>
                      <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-mono text-sm">{selectedTarget.findingsCount.critical}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-orange-900/30 rounded-lg">
                      <span className="text-orange-400 font-medium">High</span>
                      <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded font-mono text-sm">{selectedTarget.findingsCount.high}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-yellow-900/30 rounded-lg">
                      <span className="text-yellow-400 font-medium">Medium</span>
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded font-mono text-sm">{selectedTarget.findingsCount.medium}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400"/> Raw Finding Analysis
                  </h3>
                  <div className="space-y-3">
                    {targetFindings.length === 0 ? (
                        <p className="text-slate-500 text-sm">No findings detected for this target.</p>
                    ) : (
                        targetFindings.map(finding => (
                        <div key={finding.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                            <button 
                            onClick={() => handleAnalyzeFinding(finding)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-left"
                            >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                ${finding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 
                                    finding.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-blue-500/20 text-blue-400'}`}>
                                {finding.severity}
                                </span>
                                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                {finding.category || 'Uncategorized'}
                                </span>
                                <span className="text-sm font-medium text-slate-200 truncate">{finding.title}</span>
                            </div>
                            {selectedFindingId === finding.id ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                            </button>
                            
                            {selectedFindingId === finding.id && (
                            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                                {analyzingFinding ? (
                                <div className="flex items-center gap-2 text-indigo-400 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Analyzing tool output with Gemini 3...</span>
                                </div>
                                ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{findingAnalysis || ''}</ReactMarkdown>
                                </div>
                                )}
                            </div>
                            )}
                        </div>
                        ))
                    )}
                  </div>
                </div>
              </>
            )}

            {generatingReport && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>Analyzing vulnerabilities with Gemini Models...</p>
              </div>
            )}

            {aiReport && (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{aiReport}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetList;