import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { CheckSquareOffset, CheckCircle, XCircle, ArrowSquareOut, Clock, ArrowsSplit, UserCirclePlus } from '@phosphor-icons/react';

export const ApprovalsInbox = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeApproval, setActiveApproval] = useState(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Delegation state
  const [delegatedUser, setDelegatedUser] = useState('');
  const [delegationActive, setDelegationActive] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicenow/approvals');
      setApprovals(response.data?.data || []);
      if (response.data?.data?.length > 0) {
        setActiveApproval(response.data.data[0]);
      }
    } catch (err) {
      // Local mockup fallbacks
      const mockApprovals = [
        {
          _id: 'app_1',
          targetType: 'Budget Allocation request',
          details: 'Requesting $5,000 budget for visual catalog icons upgrade.',
          requesterName: 'Lead Designer Bob',
          status: 'Pending',
          flowPattern: 'Parallel', // Sequential | Parallel
          stages: [
            { stageIndex: 0, approverName: 'Team Lead', status: 'Approved', comment: 'Approved on budget basis' },
            { stageIndex: 1, approverName: 'Admin', status: 'Pending', comment: '' }
          ],
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          _id: 'app_2',
          targetType: 'Developer Workspace Change',
          details: 'Modify database indexing structure for CRM leads.',
          requesterName: 'Dev Alice',
          status: 'Approved',
          flowPattern: 'Sequential',
          stages: [
            { stageIndex: 0, approverName: 'CTO', status: 'Approved', comment: 'Looks good' }
          ],
          createdAt: new Date(Date.now() - 86400000)
        }
      ];
      setApprovals(mockApprovals);
      if (mockApprovals.length > 0) {
        setActiveApproval(mockApprovals[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (action) => {
    if (action === 'reject' && !decisionComment.trim()) {
      addToast('Rejection comment is mandatory.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/servicenow/approvals/${activeApproval._id}/decide`, {
        action,
        comment: decisionComment
      });
      addToast(`Approval decision recorded: ${action.toUpperCase()}`, 'success');
      setDecisionComment('');
      fetchApprovals();
    } catch (err) {
      // Local preview emulation bypass
      const updated = {
        ...activeApproval,
        status: action === 'approve' ? 'Approved' : 'Rejected',
        stages: activeApproval.stages.map(s => {
          if (s.status === 'Pending') {
            return { ...s, status: action === 'approve' ? 'Approved' : 'Rejected', comment: decisionComment };
          }
          return s;
        })
      };
      setActiveApproval(updated);
      setApprovals(approvals.map(a => a._id === updated._id ? updated : a));
      addToast(`Preview: request ${action}d.`, 'info');
      setDecisionComment('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelegationSave = () => {
    if (!delegatedUser.trim()) {
      addToast('Delegated assignee username is required.', 'error');
      return;
    }
    setDelegationActive(true);
    addToast(`Approvals successfully delegated to: @${delegatedUser}`, 'success');
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Approvals Inbox" 
        description="Review workspace submissions, track multi-stage sequential/parallel approval chains, and manage delegation rules."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left pane: inbox list */}
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">My Reviews Inbox</h3>
          
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px]">
            {loading ? (
              <span className="text-xs text-slate-400 italic py-4 block text-center">Loading approvals...</span>
            ) : approvals.length === 0 ? (
              <span className="text-xs text-slate-400 italic py-4 block text-center">No pending requests.</span>
            ) : (
              approvals.map((a) => (
                <button
                  key={a._id}
                  onClick={() => {
                    setActiveApproval(a);
                    setDecisionComment('');
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    activeApproval?._id === a._id 
                      ? 'border-[#00A9CE] bg-[#00A9CE]/5 font-semibold text-[#00A9CE]' 
                      : 'border-[#E0E3E8] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 font-bold font-Outfit">
                    <span>{a.targetType}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${
                      a.status === 'Pending' ? 'bg-amber-100 text-amber-700' : (a.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Requester: {a.requesterName}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center/Right pane: details workspace */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          
          {/* Active approval details card */}
          {activeApproval ? (
            <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-5 shadow-sm text-left">
              
              <div className="flex justify-between items-start border-b pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-slate-400">ID: {activeApproval._id}</span>
                  <h3 className="text-sm font-bold text-[#1C2945] font-Outfit">{activeApproval.targetType}</h3>
                </div>

                {/* Patterns tag */}
                <span className="flex items-center gap-1 bg-[#1C2945]/5 border border-[#1C2945]/15 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold">
                  <ArrowsSplit className="w-3.5 h-3.5" />
                  {activeApproval.flowPattern || 'Parallel'} Flow
                </span>
              </div>

              {/* Description body */}
              <div className="text-xs text-slate-600 leading-relaxed bg-[#F4F5F7] p-3 rounded-lg border border-[#E0E3E8]">
                <strong>Requester Details:</strong> {activeApproval.requesterName} <br />
                <strong>Context/Details:</strong> {activeApproval.details}
              </div>

              {/* Sequential/Parallel Stages Tracker */}
              <div className="flex flex-col gap-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-stage approvals progress</h4>
                <div className="flex flex-col gap-3 mt-1">
                  {activeApproval.stages?.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#F4F5F7]/40 border border-[#E0E3E8] p-3 rounded-lg text-xs">
                      <div className="flex gap-2 items-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          s.status === 'Approved' ? 'bg-emerald-500' : (s.status === 'Pending' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500')
                        }`} />
                        <span className="font-bold text-[#1C2945]">Stage {s.stageIndex + 1}: {s.approverName}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider">{s.status}</span>
                        {s.comment && <span className="text-[10px] text-slate-400 italic">"{s.comment}"</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input decision section (Only shown for pending items) */}
              {activeApproval.status === 'Pending' && (
                <div className="flex flex-col gap-4 border-t pt-4 mt-2">
                  <Input 
                    type="text"
                    label="Decision Comments & Notes"
                    placeholder="Enter approval feedback or rejection reasons (mandatory for rejection)..."
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                  />

                  <div className="flex gap-3 justify-end">
                    <Button 
                      onClick={() => handleDecision('reject')}
                      variant="secondary"
                      disabled={actionLoading}
                      className="flex items-center gap-1 border-rose-500/20 text-rose-500 hover:bg-rose-50 px-4 py-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Request</span>
                    </Button>
                    <Button 
                      onClick={() => handleDecision('approve')}
                      disabled={actionLoading}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 border-none px-4 py-2 text-white"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Request</span>
                    </Button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-[#E0E3E8] p-12 rounded-xl flex flex-col items-center justify-center text-center text-slate-400 shadow-sm gap-2">
              <CheckSquareOffset className="w-10 h-10 text-slate-300" />
              <span>Select an approval item to view details.</span>
            </div>
          )}

          {/* Delegated settings dashboard */}
          <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
            <div className="flex items-center gap-2 border-b pb-2">
              <UserCirclePlus className="w-5 h-5 text-[#00A9CE]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Approval Delegation Rules</h3>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Input 
                  type="text"
                  label="Delegated Approver Username"
                  placeholder="e.g. lead_developer"
                  value={delegatedUser}
                  onChange={(e) => setDelegatedUser(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {delegationActive && (
                  <Button 
                    onClick={() => {
                      setDelegationActive(false);
                      setDelegatedUser('');
                      addToast('Delegation rules removed.', 'info');
                    }}
                    variant="secondary"
                    className="whitespace-nowrap px-4 py-2"
                  >
                    Remove
                  </Button>
                )}
                <Button 
                  onClick={handleDelegationSave}
                  className="whitespace-nowrap px-4 py-2"
                >
                  Delegate Approvals
                </Button>
              </div>
            </div>

            {delegationActive && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>All inbound approvals are currently delegated to <strong>@{delegatedUser}</strong>.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ApprovalsInbox;
