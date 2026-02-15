import React from 'react';
import { Target, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { MOCK_TARGETS, MOCK_FINDINGS } from '../services/mockData';

const Dashboard: React.FC = () => {
  const riskData = [
    { name: 'Critical', value: 6, color: '#f43f5e' }, // Rose 500
    { name: 'High', value: 8, color: '#f97316' },     // Orange 500
    { name: 'Medium', value: 17, color: '#eab308' },  // Yellow 500
    { name: 'Low', value: 28, color: '#3b82f6' },     // Blue 500
  ];

  const activityData = [
    { time: '00:00', events: 12 }, { time: '04:00', events: 5 },
    { time: '08:00', events: 45 }, { time: '12:00', events: 120 },
    { time: '16:00', events: 80 }, { time: '20:00', events: 30 },
  ];

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="relative z-10">
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <p className={`text-xs font-mono ${color.replace('text', 'bg')}/10 inline-block px-2 py-1 rounded ${color}`}>
          {sub}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Operations Overview</h2>
          <p className="text-slate-400">Real-time reconnaissance telemetry</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            Export Summary
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
            + New Operation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Targets" value={MOCK_TARGETS.length} sub="+2 This Week" icon={Target} color="text-emerald-500" />
        <StatCard title="Critical Vulns" value="6" sub="Requires Triage" icon={AlertTriangle} color="text-rose-500" />
        <StatCard title="Scan Coverage" value="92%" sub="12 Subdomains" icon={CheckCircle} color="text-indigo-500" />
        <StatCard title="Pipeline Load" value="1.2m" sub="Events / Hour" icon={Clock} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vulnerability Distribution */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} 
                  cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recon Activity Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Area type="monotone" dataKey="events" stroke="#6366f1" fillOpacity={1} fill="url(#colorEvents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Findings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Recent Critical Findings</h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Vulnerability</th>
                <th className="px-6 py-3">Tool</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_FINDINGS.map((finding) => (
                <tr key={finding.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold
                      ${finding.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 
                        finding.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-blue-500/10 text-blue-500'}`}>
                      {finding.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{finding.title}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{finding.tool}</td>
                  <td className="px-6 py-4 text-slate-500">{finding.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 text-xs border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded-full">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;