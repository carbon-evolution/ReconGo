import React, { useState } from 'react';
import { FileText, Plus, Download, Clock, CheckCircle, FileCheck, Loader2, Target, Eye } from 'lucide-react';
import { MOCK_REPORTS, MOCK_TARGETS, MOCK_FINDINGS } from '../services/mockData';
import { Report } from '../types';
import { generateRiskReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Reports: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'VIEW'>('LIST');
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Creation State
  const [selectedTargetId, setSelectedTargetId] = useState(MOCK_TARGETS[0].id);
  const [reportType, setReportType] = useState<'EXECUTIVE' | 'TECHNICAL' | 'COMPLIANCE'>('EXECUTIVE');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateReport = async () => {
    setIsGenerating(true);
    const target = MOCK_TARGETS.find(t => t.id === selectedTargetId);
    if (!target) return;

    // Filter findings for this target
    const targetFindings = MOCK_FINDINGS.filter(f => f.targetId === target.id);

    // Call AI Service
    const content = await generateRiskReport(target, targetFindings, reportType);

    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      targetId: target.id,
      title: `${target.domain} - ${reportType.charAt(0) + reportType.slice(1).toLowerCase()} Report`,
      type: reportType,
      generatedAt: new Date().toISOString(),
      status: 'READY',
      content: content || "Failed to generate report content."
    };

    setReports([newReport, ...reports]);
    setIsGenerating(false);
    setView('LIST');
  };

  const viewReport = (report: Report) => {
    setSelectedReport(report);
    setView('VIEW');
  };

  const getTargetDomain = (id: string) => MOCK_TARGETS.find(t => t.id === id)?.domain;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-500" />
            Reporting Engine
          </h2>
          <p className="text-slate-400">Generate executive and technical security documentation</p>
        </div>
        {view === 'LIST' && (
          <button 
            onClick={() => setView('CREATE')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> New Report
          </button>
        )}
        {view !== 'LIST' && (
          <button 
            onClick={() => setView('LIST')}
            className="text-slate-400 hover:text-white px-4 py-2 text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      {view === 'LIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Report Title</th>
                <th className="px-6 py-4">Target Scope</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Generated Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    {report.title}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{getTargetDomain(report.targetId)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-300">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{new Date(report.generatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      Ready
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => viewReport(report)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title="Download PDF">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'CREATE' && (
        <div className="max-w-2xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-xl p-8 animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-6">Generate New Report</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Target Scope</label>
              <div className="grid gap-3">
                {MOCK_TARGETS.map(target => (
                  <div 
                    key={target.id}
                    onClick={() => setSelectedTargetId(target.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                      ${selectedTargetId === target.id 
                        ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Target className={`w-5 h-5 ${selectedTargetId === target.id ? 'text-indigo-500' : 'text-slate-500'}`} />
                      <span className="font-medium text-white">{target.domain}</span>
                    </div>
                    {selectedTargetId === target.id && <CheckCircle className="w-5 h-5 text-indigo-500" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Report Template</label>
              <div className="grid grid-cols-3 gap-3">
                {(['EXECUTIVE', 'TECHNICAL', 'COMPLIANCE'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all
                      ${reportType === type 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={handleCreateReport}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating with Gemini 3...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'VIEW' && selectedReport && (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col animate-fade-in-right">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div>
              <h3 className="font-bold text-white">{selectedReport.title}</h3>
              <p className="text-xs text-slate-400">Generated on {new Date(selectedReport.generatedAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> JSON
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{selectedReport.content || ''}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;