import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TargetList from './pages/TargetList';
import Architecture from './pages/Architecture';
import Vulnerabilities from './pages/Vulnerabilities';
import Reports from './pages/Reports';
import Terminal from './components/Terminal';
import { ScanLog } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeScan, setActiveScan] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]);

  // Simulate scanning logic
  const startScan = (target: string) => {
    setActiveScan(true);
    setLogs([]); // Clear previous
    
    const steps = [
      { msg: `Resolving DNS for ${target}...`, tool: 'dnsx', delay: 500 },
      { msg: `Found 12 subdomains via passive sources`, tool: 'subfinder', delay: 1500, level: 'SUCCESS' },
      { msg: `Active probing started on 12 hosts`, tool: 'httpx', delay: 2500 },
      { msg: `Port scanning top 1000 ports`, tool: 'nmap', delay: 4000 },
      { msg: `Discovered Open Port: 80, 443, 8080`, tool: 'nmap', delay: 5500, level: 'WARNING' },
      { msg: `Fuzzing directories on port 8080...`, tool: 'ffuf', delay: 7000 },
      { msg: `Running template scan (CVE-2023-*)`, tool: 'nuclei', delay: 9000 },
      { msg: `[CRITICAL] Found blind SQLi detected`, tool: 'nuclei', delay: 10500, level: 'ERROR' },
      { msg: `Pipeline completed successfully.`, tool: 'system', delay: 12000, level: 'SUCCESS' },
    ];

    steps.forEach(({ msg, tool, delay, level }) => {
      setTimeout(() => {
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString().split('T')[1].split('.')[0],
          tool,
          message: msg,
          level: (level as any) || 'INFO'
        }]);
        
        if (tool === 'system') setActiveScan(false);
      }, delay);
    });
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'targets': return <TargetList onScanStart={startScan} isScanning={activeScan} />;
      case 'findings': return <Vulnerabilities />;
      case 'reports': return <Reports />;
      case 'architecture': return <Architecture />;
      default: return (
        <div className="flex items-center justify-center h-full text-slate-500">
          Module Under Construction
        </div>
      );
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderContent()}
      <Terminal logs={logs} isActive={activeScan} />
    </Layout>
  );
};

export default App;