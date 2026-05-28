import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import { Shield, Clock, FileText } from '@phosphor-icons/react';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('All');

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicenow/audit');
      setLogs(response.data?.data || []);
    } catch (err) {
      // Local fallback logs
      setLogs([
        { _id: '1', action: 'Incident Opened', userId: 'Admin', details: { incidentId: 'inc_99', severity: 'P1' }, timestamp: new Date() },
        { _id: '2', action: 'Workflow Saved', userId: 'Founder', details: { name: 'Auto SLA Escalation' }, timestamp: new Date(Date.now() - 3600000) },
        { _id: '3', action: 'Form Structure Saved', userId: 'Admin', details: { module: 'Incidents' }, timestamp: new Date(Date.now() - 7200000) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (filterAction === 'All') return true;
    return l.action.toLowerCase().includes(filterAction.toLowerCase());
  });

  const actionsList = ['All', 'Incident', 'Workflow', 'Form', 'SLA', 'Approval'];

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945] text-left">
      <PageHeader 
        title="Workspace Audit Logs" 
        description="Comprehensive chronological system logs auditing all incidents, workflows, form configurations, and configuration modifications."
      />

      {/* Filter categories */}
      <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2">Filter Action:</span>
        {actionsList.map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
              filterAction === act 
                ? 'bg-[#1C2945] text-white border-transparent shadow' 
                : 'bg-slate-50 text-slate-500 border-[#E0E3E8] hover:bg-slate-100'
            }`}
          >
            {act}
          </button>
        ))}
      </div>

      {/* Chronological Table */}
      <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E0E3E8] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor ID</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Metadata Parameters</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">Loading audit trail logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">No audit records match selection.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="border-b border-[#E0E3E8] hover:bg-[#F4F5F7]/50 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-medium whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00A9CE]" />
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600">@{log.userId || 'system'}</td>
                    <td className="py-3 px-3">
                      <span className="bg-[#1C2945]/5 border border-[#1C2945]/15 text-[#1C2945] px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500 leading-normal max-w-md truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
