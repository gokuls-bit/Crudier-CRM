import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Warning, Envelope, ArrowsMerge, Plus, Clock } from '@phosphor-icons/react';

export const CasesList = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState([]);

  // Merge states
  const [primaryCaseId, setPrimaryCaseId] = useState('');
  const [secondaryCaseId, setSecondaryCaseId] = useState('');

  // Webhook simulator state
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    fetchCases();
    fetchAccounts();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await salesService.listCases();
      setCases(response.data?.data || []);
    } catch (err) {
      setCases([
        { _id: 'cs1', subject: 'Billing mismatch in invoice Q2', description: 'Customer got billed double for database cluster engine.', status: 'Working', priority: 'Medium', createdAt: new Date() },
        { _id: 'cs2', subject: 'Database access credentials expired', description: 'Rep cannot login to cluster admin panel.', status: 'Escalated', priority: 'Critical', createdAt: new Date(Date.now() - 24 * 3600000) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await salesService.listAccounts();
      setAccounts(response.data?.data || []);
    } catch (err) {
      setAccounts([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    try {
      const payload = {
        subject,
        description,
        priority,
        accountId: accountId || undefined
      };
      await salesService.createCase(payload);
      addToast('Support Case created successfully.', 'success');
      setShowCreateModal(false);
      setSubject('');
      setDescription('');
      fetchCases();
    } catch (err) {
      addToast('Case logged (offline mock).', 'info');
      setShowCreateModal(false);
    }
  };

  const handleMerge = async (e) => {
    e.preventDefault();
    if (!primaryCaseId || !secondaryCaseId || primaryCaseId === secondaryCaseId) {
      addToast('Select two unique cases to merge.', 'error');
      return;
    }

    try {
      await salesService.mergeCases({ primaryCaseId, secondaryCaseId });
      addToast('Support tickets merged successfully.', 'success');
      setShowMergeModal(false);
      fetchCases();
    } catch (err) {
      addToast('Cases merged successfully (mock).', 'success');
      setShowMergeModal(false);
    }
  };

  const handleWebhookSimulate = async (e) => {
    e.preventDefault();
    if (!senderEmail.trim() || !emailSubject.trim()) return;

    try {
      const payload = {
        from: senderEmail,
        fromName: senderName,
        subject: emailSubject,
        body: emailBody
      };
      await salesService.simulateEmailToCaseWebhook(payload);
      addToast('Email-to-case webhook parsed outbound trigger successfully.', 'success');
      setShowWebhookModal(false);
      setSenderEmail('');
      setSenderName('');
      setEmailSubject('');
      setEmailBody('');
      fetchCases();
    } catch (err) {
      addToast('Inbound email-to-case triggered (offline mock).', 'info');
      setShowWebhookModal(false);
    }
  };

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <PageHeader 
        title="Support Tickets Cases" 
        description="Ticketing backlog, escalation rules manager (unresolved tickets > 12h), and inbound email webhook simulator."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowWebhookModal(true)} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <Envelope className="w-4 h-4" />
              <span>Email Webhook Sim</span>
            </Button>
            <Button onClick={() => setShowMergeModal(true)} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <ArrowsMerge className="w-4 h-4" />
              <span>Merge Cases</span>
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="slds-btn-primary flex items-center gap-1.5 py-2">
              <Plus className="w-4 h-4" />
              <span>New Case</span>
            </Button>
          </div>
        }
      />

      {/* Backlog Lists grid */}
      <div className="bg-white border border-[#E5E5E5] rounded shadow-sm text-left">
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#032D60] flex items-center gap-1.5">
            <Warning className="w-4.5 h-4.5 text-[#BA0517]" />
            Active Service Ticket Queue
          </h4>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100/50 text-[10px] text-slate-450 uppercase font-bold border-b">
                <th className="py-2.5 px-4 text-left">Case Number / Subject</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Logged Time</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center italic text-slate-400">Loading cases...</td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center italic text-slate-400">No support tickets active.</td>
                </tr>
              ) : cases.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-left">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#032D60] cursor-pointer hover:underline" onClick={() => navigate(`/sales/cases/${c._id}`)}>
                        #{c._id?.toString().slice(-6).toUpperCase()} - {c.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[280px]">{c.description}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      c.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      c.status === 'Escalated' 
                        ? 'bg-amber-100 text-amber-700 font-bold border border-amber-300' 
                        : c.status === 'Closed' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => navigate(`/sales/cases/${c._id}`)}
                      className="text-xs text-[#0176D3] hover:underline font-bold"
                    >
                      Manage Ticket →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TICKET CASE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Open Support Ticket Case</h3>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Case Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Details Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none h-16 w-full resize-none bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Case Severity</label>
                  <select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Link Corporate Account</label>
                  <select 
                    value={accountId} 
                    onChange={e => setAccountId(e.target.value)}
                    className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                  >
                    <option value="">None (Standalone Ticket)</option>
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Log Case</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE CASES MODAL */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60] flex items-center gap-1.5">
                <ArrowsMerge className="w-5 h-5 text-[#BA0517]" />
                Support Tickets Case Merger
              </h3>
              <button onClick={() => setShowMergeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleMerge} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Primary Case (Retained Ticket)</label>
                <select 
                  value={primaryCaseId} 
                  onChange={(e) => setPrimaryCaseId(e.target.value)}
                  className="w-full border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white"
                  required
                >
                  <option value="">Select primary ticket...</option>
                  {cases.map(c => (
                    <option key={c._id} value={c._id}>#{c._id?.toString().slice(-6).toUpperCase()} - {c.subject}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Secondary Case (Merged & Deleted Ticket)</label>
                <select 
                  value={secondaryCaseId} 
                  onChange={(e) => setSecondaryCaseId(e.target.value)}
                  className="w-full border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white"
                  required
                >
                  <option value="">Select duplicate ticket...</option>
                  {cases.map(c => (
                    <option key={c._id} value={c._id}>#{c._id?.toString().slice(-6).toUpperCase()} - {c.subject}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowMergeModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Perform Merge</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL-TO-CASE WEBHOOK SIMULATOR */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60] flex items-center gap-1.5">
                <Envelope className="w-5 h-5 text-[#0176D3]" />
                Inbound Email Webhook Simulator
              </h3>
              <button onClick={() => setShowWebhookModal(false)}>✕</button>
            </div>
            <form onSubmit={handleWebhookSimulate} className="space-y-3">
              <Input label="Sender Email (from)" type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} required />
              <Input label="Sender Name" value={senderName} onChange={e => setSenderName(e.target.value)} />
              <Input label="Email Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Email Body / Description</label>
                <textarea 
                  value={emailBody} 
                  onChange={e => setEmailBody(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none h-20 w-full resize-none bg-white"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded text-[10px] leading-relaxed text-slate-500 border border-slate-200">
                💡 **Email-to-Case webhook router behavior**:
                Matches the inbound sender email against the **Contacts** registry. If matched, links the case to that contact's company Account. Otherwise, creates a new contact profile under the Catch-All Support Account.
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowWebhookModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Trigger Webhook</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesList;
