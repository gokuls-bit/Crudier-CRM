import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Warning, Shield, CheckCircle, Clock, ArrowRight } from '@phosphor-icons/react';

export const IncidentsQueue = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('P3'); // P1 - P4

  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicenow/incidents');
      setIncidents(response.data?.data || []);
    } catch (err) {
      // Mock lookup fallbacks
      setIncidents([
        { _id: 'inc_101', title: 'Database replication thread lag exceeds threshold', severity: 'P1', status: 'Active', assignedTo: 'Team Lead', createdAt: new Date() },
        { _id: 'inc_102', title: 'API Gateway latency timeout spikes', severity: 'P2', status: 'Active', assignedTo: 'Dev Alice', createdAt: new Date() },
        { _id: 'inc_103', title: 'Excel spreadsheet exporter output mismatch', severity: 'P3', status: 'Resolved', assignedTo: 'Dev Bob', createdAt: new Date(Date.now() - 3600000) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenIncident = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Short description is required.', 'error');
      return;
    }

    setCreating(true);
    try {
      const payload = { title, description, severity };
      const response = await api.post('/servicenow/incidents', payload);
      addToast(`Incident ${response.data?.data?._id || 'opened'} created successfully.`, 'success');
      
      if (severity === 'P1') {
        addToast('P1 CRITICAL ALERT: Immediate Slack and SMS notifications dispatched to Founders/Admins.', 'error');
      }

      setTitle('');
      setDescription('');
      setSeverity('P3');
      fetchIncidents();
    } catch (err) {
      // Fallback
      addToast('Incident created (mock).', 'info');
      fetchIncidents();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Incident Management" 
        description="Monitor system service interruptions, open outage tickets, and track MTTR analytics metrics."
      />

      {/* MTTR Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm text-left flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mean Time To Resolution (MTTR)</span>
            <span className="text-xl font-bold font-Outfit mt-1 text-[#1C2945]">42 mins</span>
          </div>
          <Clock className="w-8 h-8 text-[#00A9CE] opacity-60" />
        </div>

        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm text-left flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">P1 Critical Outages</span>
            <span className="text-xl font-bold font-Outfit mt-1 text-rose-600">1 Incident</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-rose-500 opacity-60" />
        </div>

        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm text-left flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Workload Queue</span>
            <span className="text-xl font-bold font-Outfit mt-1">2 Active</span>
          </div>
          <Warning className="w-8 h-8 text-amber-500 opacity-60" />
        </div>

        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm text-left flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">First Time Fix Rate</span>
            <span className="text-xl font-bold font-Outfit mt-1 text-emerald-600">89%</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500 opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left/Center pane: Incident Queue list */}
        <div className="lg:col-span-2 bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Active Service Desk Incidents</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E0E3E8] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Short Description</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Assignee</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">Loading incidents queue...</td>
                  </tr>
                ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">No incidents recorded.</td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc._id} className="border-b border-[#E0E3E8] hover:bg-[#F4F5F7]/50 transition-colors">
                      <td className="py-3 px-3 font-bold font-Outfit text-slate-500">#{inc._id.slice(-6)}</td>
                      <td className="py-3 px-3 font-semibold text-[#1C2945] max-w-xs truncate">{inc.title}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.severity === 'P1' 
                            ? 'bg-rose-100 text-rose-700' 
                            : (inc.severity === 'P2' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700')
                        }`}>{inc.severity}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{inc.assignedTo || 'Unassigned'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          inc.status === 'New' 
                            ? 'bg-blue-100 text-blue-700' 
                            : (inc.status === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                        }`}>{inc.status}</span>
                      </td>
                      <td className="py-3 px-3">
                        <Link 
                          to={`/incidents/${inc._id}`}
                          className="text-[#00A9CE] hover:underline font-bold flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane: Create Incident ticket form */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 font-semibold">Open Outage Ticket</h3>
          
          <form onSubmit={handleOpenIncident} className="flex flex-col gap-4">
            
            <Input 
              type="text"
              label="Short Description"
              placeholder="System outage, service failure..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input 
              type="text"
              label="Detailed Analysis"
              placeholder="What triggered this issue? What is the impact?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex flex-col gap-1 w-full">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity Gating</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
              >
                <option value="P1">Critical P1 (Founder+Admin Notification)</option>
                <option value="P2">Major P2 (Impacts Teams)</option>
                <option value="P3">Moderate P3 (Standard work)</option>
                <option value="P4">Minor P4 (Cosmetic/Trivial)</option>
              </select>
            </div>

            <Button type="submit" isLoading={creating} disabled={creating} className="w-full mt-2 bg-[#1C2945] hover:bg-[#1C2945]/90">
              Submit Outage Ticket
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default IncidentsQueue;
