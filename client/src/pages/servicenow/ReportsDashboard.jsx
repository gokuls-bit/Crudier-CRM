import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Warning, CheckCircle, Clock, ShieldCheck, ChartPieSlice, ChartBar } from '@phosphor-icons/react';

export const ReportsDashboard = () => {
  // Mock aggregated metric counts
  const incidentData = [
    { name: 'P1 Outage', value: 1, color: '#EF4444' },
    { name: 'P2 High', value: 3, color: '#F59E0B' },
    { name: 'P3 Moderate', value: 8, color: '#3B82F6' },
    { name: 'P4 Cosmetic', value: 14, color: '#10B981' }
  ];

  const slaData = [
    { name: 'Compliant', value: 92, color: '#10B981' },
    { name: 'Breached', value: 8, color: '#EF4444' }
  ];

  const taskWorkloadData = [
    { name: 'Alice', assigned: 12, completed: 9 },
    { name: 'Bob', assigned: 15, completed: 12 },
    { name: 'Charlie', assigned: 8, completed: 4 }
  ];

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Saved Reports Dashboard" 
        description="Consolidated enterprise workspace dashboard displaying system health metrics and SLA compliance ratios."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm flex items-center justify-between text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">First Contact resolution</span>
            <span className="text-xl font-bold font-Outfit text-emerald-600 mt-1">94%</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500 opacity-60" />
        </div>

        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm flex items-center justify-between text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Change Success Rate</span>
            <span className="text-xl font-bold font-Outfit mt-1 text-[#00A9CE]">98.5%</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-[#00A9CE] opacity-60" />
        </div>

        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm flex items-center justify-between text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mean Time to Diagnose</span>
            <span className="text-xl font-bold font-Outfit mt-1 text-slate-700">14 mins</span>
          </div>
          <Clock className="w-8 h-8 text-slate-500 opacity-60" />
        </div>

        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm flex items-center justify-between text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Backlog Tickets Count</span>
            <span className="text-xl font-bold font-Outfit mt-1 text-rose-600">3 Tickets</span>
          </div>
          <Warning className="w-8 h-8 text-rose-500 opacity-60" />
        </div>
      </div>

      {/* Grid containing Recharts widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Incident Severity Distribution */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl shadow-sm text-left flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <ChartPieSlice className="w-4 h-4 text-[#00A9CE]" /> Incident Severity Distribution
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                >
                  {incidentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Compliance compliance */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl shadow-sm text-left flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <ChartPieSlice className="w-4 h-4 text-[#00A9CE]" /> SLA Compliance Ratio
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                >
                  {slaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Workload vs Completion */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl shadow-sm text-left flex flex-col gap-4 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <ChartBar className="w-4 h-4 text-[#00A9CE]" /> Team Member Task Workload vs Resolution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskWorkloadData}>
                <XAxis dataKey="name" stroke="#8A99AD" fontSize={10} />
                <YAxis stroke="#8A99AD" fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned" fill="#1C2945" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#00A9CE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsDashboard;
