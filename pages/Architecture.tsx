import React from 'react';
import { Layers, Server, Database, ShieldCheck, Box } from 'lucide-react';
import { ARCHITECTURE_DOCS } from '../services/mockData';

const Architecture: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Layers className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className="text-4xl font-bold text-white">System Architecture</h1>
        <p className="text-xl text-slate-400">DevSecOps Design & Engineering Specifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Box className="w-5 h-5 text-blue-500"/></div>
          <div><h4 className="font-bold text-white">Dockerized</h4><p className="text-xs text-slate-500">Full Isolation</p></div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><Server className="w-5 h-5 text-emerald-500"/></div>
          <div><h4 className="font-bold text-white">Event Driven</h4><p className="text-xs text-slate-500">RabbitMQ Queues</p></div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className="p-2 bg-purple-500/10 rounded-lg"><Database className="w-5 h-5 text-purple-500"/></div>
          <div><h4 className="font-bold text-white">Polyglot DB</h4><p className="text-xs text-slate-500">Postgres + Mongo</p></div>
        </div>
      </div>

      {ARCHITECTURE_DOCS.map((doc, idx) => (
        <section key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-950/50">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2 block">{doc.section}</span>
            <h2 className="text-2xl font-bold text-white">{doc.title}</h2>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-slate-300 leading-relaxed">{doc.content}</p>
            {doc.codeBlock && (
              <div className="bg-black rounded-lg p-4 border border-slate-800 overflow-x-auto">
                <pre className="text-xs md:text-sm font-mono text-emerald-500">
                  <code>{doc.codeBlock}</code>
                </pre>
              </div>
            )}
          </div>
        </section>
      ))}

      <section className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-xl p-8 text-center">
        <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Security Considerations</h3>
        <p className="text-slate-400 max-w-2xl mx-auto mb-6">
          The pipeline implements strict sandboxing. Recon workers run as non-root users with read-only file system access (except for tmp). Tool outputs are sanitized before ingestion to prevent log injection or XSS in this dashboard.
        </p>
        <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
          View Security Audit Log &rarr;
        </button>
      </section>
    </div>
  );
};

export default Architecture;