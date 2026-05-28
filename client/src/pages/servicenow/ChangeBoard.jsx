import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { GitBranch, Calendar, Trophy, CheckCircle, Warning, ChatCenteredText } from '@phosphor-icons/react';
import clsx from 'clsx';

export const ChangeBoard = () => {
  const [changes, setChanges] = useState([]);
  const [activeChange, setActiveChange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Standard'); // Standard, Normal, Emergency
  const [impact, setImpact] = useState('Low'); // Low, High
  const [risk, setRisk] = useState('Low'); // Low, High
  const [rollbackPlan, setRollbackPlan] = useState('');

  // CAB votes simulation
  const [cabVotes, setCabVotes] = useState({ approve: 0, reject: 0 });
  const [voted, setVoted] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicenow/changes');
      setChanges(response.data?.data || []);
      if (response.data?.data?.length > 0) {
        setActiveChange(response.data.data[0]);
      }
    } catch (err) {
      // Mock fallbacks
      const mockChanges = [
        { _id: 'chg_1', title: 'Upgrade database server SSD storage', type: 'Normal', impact: 'High', risk: 'Medium', status: 'Implementing', rollbackPlan: 'Restore from nightly snapshot.' },
        { _id: 'chg_2', title: 'Hotfix database connection pool overflow', type: 'Emergency', impact: 'High', risk: 'High', status: 'CAB Review', rollbackPlan: 'Revert deployment container image.' },
        { _id: 'chg_3', title: 'Update visual catalog request icons', type: 'Standard', impact: 'Low', risk: 'Low', status: 'Closed', rollbackPlan: 'Disable catalog flag.' }
      ];
      setChanges(mockChanges);
      if (mockChanges.length > 0) {
        setActiveChange(mockChanges[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Short description is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { title, description, type, impact, risk, rollbackPlan };
      const response = await api.post('/servicenow/changes', payload);
      addToast('Change request submitted successfully.', 'success');
      setTitle('');
      setDescription('');
      setRollbackPlan('');
      fetchChanges();
    } catch (err) {
      addToast('Change submitted (mock).', 'info');
      fetchChanges();
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = (action) => {
    if (voted) return;
    setCabVotes(prev => ({ ...prev, [action]: prev[action] + 1 }));
    setVoted(true);
    addToast('Your CAB vote has been recorded.', 'success');
  };

  // Determine risk category dynamically using 2x2 grid
  const getDynamicRisk = (imp, rsk) => {
    if (imp === 'High' && rsk === 'High') return 'Critical (Requires CAB Approval)';
    if (imp === 'High' || rsk === 'High') return 'Medium (Standard review)';
    return 'Low (Pre-approved)';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-700';
      case 'CAB Review': return 'bg-amber-100 text-amber-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Implementing': return 'bg-purple-100 text-purple-700';
      case 'Closed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Change Management" 
        description="Submit Change Requests (RFCs), perform 2x2 risk assessments, and schedule changes on the Advisory Board (CAB) calendar."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left pane: Active Change list */}
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Active Change Tickets</h3>
          
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px]">
            {loading ? (
              <span className="text-xs text-slate-400 italic py-4 block text-center">Loading changes...</span>
            ) : (
              changes.map((chg) => (
                <button
                  key={chg._id}
                  onClick={() => {
                    setActiveChange(chg);
                    setVoted(false);
                    setCabVotes({ approve: 0, reject: 0 });
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    activeChange?._id === chg._id 
                      ? 'border-[#00A9CE] bg-[#00A9CE]/5 font-semibold text-[#00A9CE]' 
                      : 'border-[#E0E3E8] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 font-bold font-Outfit">
                    <span>{chg.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${getStatusColor(chg.status)}`}>
                      {chg.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Type: {chg.type} Change
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center/Right pane: details workspace */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full text-left">
          
          {activeChange ? (
            <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-5 shadow-sm">
              <div className="flex justify-between items-start border-b pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-slate-400">ID: {activeChange._id}</span>
                  <h3 className="text-sm font-bold text-[#1C2945] font-Outfit">{activeChange.title}</h3>
                </div>
                
                <span className="bg-[#1C2945]/5 border border-[#1C2945]/15 text-slate-600 px-2.5 py-0.5 rounded text-[9px] font-bold">
                  {activeChange.type}
                </span>
              </div>

              {/* Matrix Risk indicator */}
              <div className="flex justify-between items-center bg-[#F4F5F7] border border-[#E0E3E8] p-3 rounded-lg text-xs">
                <span className="text-slate-500 font-semibold">2x2 Risk Evaluation:</span>
                <span className="font-bold text-slate-700">
                  {getDynamicRisk(activeChange.impact || 'Low', activeChange.risk || 'Low')}
                </span>
              </div>

              {activeChange.rollbackPlan && (
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Rollback Implementation Plan</span>
                  <p className="p-3 bg-rose-50/10 border border-rose-200 rounded text-slate-600 font-serif leading-relaxed">
                    {activeChange.rollbackPlan}
                  </p>
                </div>
              )}

              {/* CAB Review Voting Box */}
              {activeChange.status === 'CAB Review' && (
                <div className="border border-[#E0E3E8] p-4 bg-[#F4F5F7] rounded-xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-[#1C2945] font-Outfit flex items-center gap-1">
                    <ChatCenteredText className="w-4 h-4 text-[#00A9CE]" />
                    <span>Change Advisory Board (CAB) voting panel</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This RFC requires emergency votes from Workspace Managers before rollout in production environments.
                  </p>
                  
                  <div className="flex gap-4 items-center">
                    <button 
                      disabled={voted}
                      onClick={() => handleVote('approve')}
                      className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-all ${
                        voted 
                          ? 'bg-slate-50 text-slate-400' 
                          : 'border-emerald-500/20 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      Approve RFC ({cabVotes.approve})
                    </button>
                    <button 
                      disabled={voted}
                      onClick={() => handleVote('reject')}
                      className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-all ${
                        voted 
                          ? 'bg-slate-50 text-slate-400' 
                          : 'border-rose-500/20 text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      Reject RFC ({cabVotes.reject})
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-[#E0E3E8] p-12 rounded-xl flex flex-col items-center justify-center text-center text-slate-400 shadow-sm gap-2">
              <GitBranch className="w-10 h-10 text-slate-300" />
              <span>Select a change request to view details.</span>
            </div>
          )}

          {/* Form to submit RFC */}
          <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Submit Change Request (RFC)</h3>
            
            <form onSubmit={handleCreateChange} className="flex flex-col gap-4">
              
              <Input 
                type="text"
                label="Short Description"
                placeholder="Database replication indices rollout..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Input 
                type="text"
                label="Detailed Description"
                placeholder="What changes will be applied?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Change Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
                  >
                    <option value="Standard">Standard (Low Risk, Pre-approved)</option>
                    <option value="Normal">Normal (Requires CAB review)</option>
                    <option value="Emergency">Emergency (Immediate outage mitigation)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Impact level</label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
                  >
                    <option value="Low">Low (Team Outage)</option>
                    <option value="High">High (Global CRM Outage)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk Level</label>
                  <select
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
                  >
                    <option value="Low">Low (Zero downtime)</option>
                    <option value="High">High (High downtime risk)</option>
                  </select>
                </div>
              </div>

              <Input 
                type="text"
                label="Rollback Action Plan"
                placeholder="Revert build container image tags immediately..."
                value={rollbackPlan}
                onChange={(e) => setRollbackPlan(e.target.value)}
                required
              />

              <Button type="submit" isLoading={submitting} disabled={submitting} className="w-fit self-end px-5 py-2">
                Submit Change Request
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ChangeBoard;
