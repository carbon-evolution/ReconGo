import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react';
import { ScanLog } from '../types';

interface TerminalProps {
  logs: ScanLog[];
  isActive: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, isActive }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isActive && logs.length === 0) return null;

  return (
    <div className={`
      fixed bottom-0 right-0 z-40 transition-all duration-300 ease-in-out bg-slate-950 border-t border-l border-slate-700 shadow-2xl
      ${expanded ? 'w-full h-[60vh]' : 'w-full lg:w-[600px] h-64'}
    `}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300">
          <TerminalIcon className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-mono font-bold">RECON_PIPELINE :: WORKER_01</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white">
          {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="p-4 h-[calc(100%-40px)] overflow-y-auto font-mono text-xs space-y-1 bg-black/90">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 animate-fade-in">
            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
            <span className={`shrink-0 font-bold w-20 ${
              log.level === 'INFO' ? 'text-blue-400' :
              log.level === 'SUCCESS' ? 'text-emerald-400' :
              log.level === 'WARNING' ? 'text-amber-400' :
              'text-rose-500'
            }`}>
              {log.tool.toUpperCase()}
            </span>
            <span className="text-slate-300 break-all">{log.message}</span>
          </div>
        ))}
        {isActive && (
          <div className="flex gap-2 text-emerald-500 animate-pulse mt-2">
            <span>root@worker-01:~/ops#</span>
            <span className="w-2 h-4 bg-emerald-500 block"></span>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;