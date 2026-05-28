import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartBar, Download, Envelope, FloppyDisk, Funnel, Clock } from '@phosphor-icons/react';

export const ReportsBuilder = () => {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState('Workspace Task Performance');
  const [dataSource, setDataSource] = useState('tasks'); // tasks, leads, incidents, changes
  const [chartType, setChartType] = useState('bar'); // bar, line, pie, table
  const [filterField, setFilterField] = useState('priority');
  const [filterValue, setFilterValue] = useState('Critical');
  const [loading, setLoading] = useState(false);

  // Email Digest
  const [digestInterval, setDigestInterval] = useState('weekly');
  const [digestEmail, setDigestEmail] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  // Mock datasets depending on data source
  const datasets = {
    tasks: [
      { name: 'Developer Alice', count: 12, resolved: 10, breached: 0 },
      { name: 'Developer Bob', count: 15, resolved: 12, breached: 1 },
      { name: 'Intern Charlie', count: 8, resolved: 4, breached: 2 }
    ],
    incidents: [
      { name: 'Critical P1', count: 2 },
      { name: 'Major P2', count: 4 },
      { name: 'Moderate P3', count: 12 },
      { name: 'Minor P4', count: 22 }
    ],
    leads: [
      { name: 'New Leads', count: 45 },
      { name: 'Contacted', count: 28 },
      { name: 'Qualified', count: 15 },
      { name: 'Closed Deal', count: 8 }
    ],
    changes: [
      { name: 'Standard', count: 18 },
      { name: 'Normal', count: 8 },
      { name: 'Emergency', count: 3 }
    ]
  };

  const colors = ['#1C2945', '#00A9CE', '#8A99AD', '#E0E3E8', '#F4F5F7'];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/servicenow/reports');
      setReports(response.data?.data || []);
    } catch (err) {
      // Offline fallback
      setReports([
        { _id: 'rpt_1', title: 'Critical Incident MTTR Trends', dataSource: 'incidents', chartType: 'line' }
      ]);
    }
  };

  const handleSaveReport = async () => {
    if (!title.trim()) {
      addToast('Report title is required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = { title, dataSource, chartType, filterField, filterValue };
      await api.post('/servicenow/reports', payload);
      addToast('Report template configuration saved.', 'success');
      fetchReports();
    } catch (err) {
      addToast('Report saved (mock).', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleDigest = (e) => {
    e.preventDefault();
    if (!digestEmail.trim()) {
      addToast('Recipient email is required.', 'error');
      return;
    }
    setScheduling(true);
    setTimeout(() => {
      setScheduling(false);
      addToast(`Scheduled ${digestInterval} email digest sent to: ${digestEmail}`, 'success');
      setDigestEmail('');
    }, 800);
  };

  const handleExportCSV = () => {
    const data = datasets[dataSource];
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += Object.keys(data[0]).join(",") + "\n";
    data.forEach((row) => {
      csvContent += Object.values(row).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${dataSource}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV export downloaded successfully.', 'success');
  };

  const activeData = datasets[dataSource] || [];

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Saved Reports & Analytics Builder" 
        description="Build custom Recharts widgets across workspace modules, schedule email digests, and export files."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left pane: Report Builder tools */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Custom Query Configuration</h3>
          
          <Input 
            type="text"
            label="Report Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data Source Module</label>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
            >
              <option value="tasks">Sprint Tasks</option>
              <option value="incidents">System Outage Incidents</option>
              <option value="leads">Deals Leads Directory</option>
              <option value="changes">CAB Change Requests</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visual Chart Type</label>
            <div className="flex bg-[#F4F5F7] p-0.5 rounded border border-[#E0E3E8] text-xs">
              <button 
                onClick={() => setChartType('bar')}
                className={`flex-1 text-center py-1 font-bold rounded ${chartType === 'bar' ? 'bg-white shadow' : 'text-slate-500'}`}
              >
                Bar
              </button>
              <button 
                onClick={() => setChartType('line')}
                className={`flex-1 text-center py-1 font-bold rounded ${chartType === 'line' ? 'bg-white shadow' : 'text-slate-500'}`}
              >
                Line
              </button>
              <button 
                onClick={() => setChartType('pie')}
                className={`flex-1 text-center py-1 font-bold rounded ${chartType === 'pie' ? 'bg-white shadow' : 'text-slate-500'}`}
              >
                Pie
              </button>
            </div>
          </div>

          <div className="h-px bg-[#E0E3E8] my-1" />

          {/* Query Filter Builder */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Funnel className="w-4 h-4 text-[#00A9CE]" />
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Filters</label>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                placeholder="Field name..."
                className="border border-[#E0E3E8] px-2 py-1 rounded text-xs w-full bg-slate-50"
              />
              <span className="text-xs text-slate-400 self-center">==</span>
              <input 
                type="text" 
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Value..."
                className="border border-[#E0E3E8] px-2 py-1 rounded text-xs w-full bg-slate-50"
              />
            </div>
          </div>

          <Button onClick={handleSaveReport} disabled={loading} className="w-full mt-2 bg-[#1C2945] text-white">
            <FloppyDisk className="w-4 h-4 mr-1.5 inline" /> Save Report config
          </Button>
        </div>

        {/* Center/Right pane: Visual Chart output */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full text-left">
          
          <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-semibold">{title}</h3>
              
              <Button 
                onClick={handleExportCSV} 
                variant="secondary" 
                size="xs"
                className="flex items-center gap-1 py-1 px-2.5 text-[10px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>

            {/* Recharts Wrapper */}
            <div className="h-64 w-full">
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData}>
                    <XAxis dataKey="name" stroke="#8A99AD" fontSize={10} />
                    <YAxis stroke="#8A99AD" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#00A9CE" radius={[4, 4, 0, 0]} />
                    {dataSource === 'tasks' && <Bar dataKey="resolved" fill="#1C2945" radius={[4, 4, 0, 0]} />}
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeData}>
                    <XAxis dataKey="name" stroke="#8A99AD" fontSize={10} />
                    <YAxis stroke="#8A99AD" fontSize={10} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#00A9CE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {activeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Scheduled Digest Email panel */}
          <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Clock className="w-5 h-5 text-[#00A9CE]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Email digests</h3>
            </div>

            <form onSubmit={handleScheduleDigest} className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Input 
                  type="email"
                  label="Digest Recipient Email"
                  placeholder="manager@crudier.com"
                  value={digestEmail}
                  onChange={(e) => setDigestEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 w-full max-w-[160px]">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Digest Interval</label>
                <select
                  value={digestInterval}
                  onChange={(e) => setDigestInterval(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
                >
                  <option value="daily">Daily report digest</option>
                  <option value="weekly">Weekly performance digest</option>
                </select>
              </div>

              <Button type="submit" isLoading={scheduling} disabled={scheduling} className="whitespace-nowrap px-4 py-2 bg-[#1C2945] text-white">
                <Envelope className="w-4 h-4 mr-1 inline" /> Schedule Digest
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReportsBuilder;
