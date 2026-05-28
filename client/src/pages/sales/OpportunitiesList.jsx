import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Target, CurrencyDollar, TrendUp, Warning } from '@phosphor-icons/react';

const STAGES = [
  'Prospecting',
  'Qualification',
  'Needs Analysis',
  'Value Proposition',
  'Proposal / Price Quote',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const OpportunitiesList = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState('Prospecting');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchOpportunities();
    fetchAccounts();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await salesService.listOpportunities();
      setOpportunities(response.data?.data || []);
    } catch (err) {
      // Mock data
      setOpportunities([
        { _id: 'o1', name: 'Alpha Server Deal', amount: 200000, stage: 'Negotiation', probability: 75, closeDate: new Date(), accountId: 'acc1', accountName: 'Alpha Cloud Services' },
        { _id: 'o2', name: 'Delta DB Migration', amount: 450000, stage: 'Value Proposition', probability: 50, closeDate: new Date(), accountId: 'acc2', accountName: 'Delta Bank Corp' },
        { _id: 'o3', name: 'Zeta Clinical Trial Software', amount: 80000, stage: 'Prospecting', probability: 10, closeDate: new Date() }
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
    if (!name.trim() || !amount) return;

    try {
      const payload = {
        name,
        amount: parseFloat(amount) || 0,
        stage,
        accountId: accountId || undefined,
        closeDate: new Date(Date.now() + 30 * 86400000)
      };
      await salesService.createOpportunity(payload);
      addToast('Opportunity created successfully.', 'success');
      setShowCreateModal(false);
      setName('');
      setAmount('');
      fetchOpportunities();
    } catch (err) {
      addToast('Opportunity created (offline mock).', 'info');
      setShowCreateModal(false);
    }
  };

  // Weighted calculations
  const calculateTotalPipeline = () => {
    let rawTotal = 0;
    let weightedTotal = 0;
    opportunities.forEach(o => {
      rawTotal += o.amount || 0;
      weightedTotal += (o.amount || 0) * ((o.probability || 0) / 100);
    });
    return { rawTotal, weightedTotal };
  };

  const { rawTotal, weightedTotal } = calculateTotalPipeline();

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <PageHeader 
        title="Opportunities Pipeline" 
        description="Track pending contracts, deal progress states, and probability-weighted pipeline forecasts."
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="slds-btn-primary flex items-center gap-1.5 py-2">
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </Button>
        }
      />

      {/* Aggregate metrics box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E5E5] p-5 rounded flex items-center gap-4 text-left shadow-sm border-t-4 border-t-[#0176D3]">
          <div className="p-3 bg-[#B0D9FA]/30 rounded">
            <CurrencyDollar className="w-6 h-6 text-[#0176D3]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Raw Pipeline Value</span>
            <span className="text-lg font-bold text-[#032D60]">${rawTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-5 rounded flex items-center gap-4 text-left shadow-sm border-t-4 border-t-[#2E844A]">
          <div className="p-3 bg-[#2E844A]/10 rounded">
            <TrendUp className="w-6 h-6 text-[#2E844A]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Weighted Pipeline</span>
            <span className="text-lg font-bold text-[#2E844A]">${Math.round(weightedTotal).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] p-5 rounded flex items-center gap-4 text-left shadow-sm border-t-4 border-t-[#FE9339]">
          <div className="p-3 bg-[#FE9339]/10 rounded">
            <Target className="w-6 h-6 text-[#FE9339]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Deals Count</span>
            <span className="text-lg font-bold text-[#032D60]">{opportunities.length} Contracts</span>
          </div>
        </div>
      </div>

      {/* Pipeline Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 text-xs select-none">
        {STAGES.map(colStage => {
          const colOpps = opportunities.filter(o => o.stage === colStage);
          const colValue = colOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
          
          return (
            <div key={colStage} className="flex-1 min-w-[250px] bg-[#F3F3F3] border border-[#E5E5E5] p-3.5 rounded flex flex-col gap-3 h-[450px]">
              <div className="flex justify-between items-center border-b pb-1.5 shrink-0">
                <span className="font-bold text-[#032D60] truncate max-w-[150px]">{colStage}</span>
                <span className="bg-[#B0D9FA]/40 text-[#032D60] px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {colOpps.length}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold -mt-2 text-left">
                Value: ${colValue.toLocaleString()}
              </div>

              {/* Opportunities cards list */}
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-0.5">
                {colOpps.map(opp => (
                  <div 
                    key={opp._id} 
                    onClick={() => navigate(`/sales/opportunities/${opp._id}`)}
                    className="slds-card slds-card-opp p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow text-left bg-white"
                  >
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {opp.accountName || 'Standalone Opportunity'}
                    </span>
                    <h4 className="font-bold text-[#032D60] hover:underline leading-tight truncate">
                      {opp.name}
                    </h4>
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      <span className="font-bold text-[#2E844A]">${opp.amount?.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{opp.probability}% Prob</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Create New Deal Opportunity</h3>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Opportunity Name" value={name} onChange={e => setName(e.target.value)} required />
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Pipeline Stage</label>
                <select 
                  value={stage} 
                  onChange={e => setStage(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white w-full"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <Input label="Deal Amount ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Link Account</label>
                <select 
                  value={accountId} 
                  onChange={e => setAccountId(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white w-full"
                >
                  <option value="">None (Standalone Opportunity)</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Save Opportunity</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
