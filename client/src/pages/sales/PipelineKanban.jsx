import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const mockInitialDeals = [
  { _id: '1', company: 'Alpha Corp', value: 85000, stage: 'New Lead' },
  { _id: '2', company: 'Omega Logistics', value: 120000, stage: 'Negotiation' },
  { _id: '3', company: 'Beta Systems', value: 45000, stage: 'Contacted' },
  { _id: '4', company: 'Stardust Ventures', value: 60000, stage: 'Closed Won' },
];

export const PipelineKanban = () => {
  const [deals, setDeals] = useState(mockInitialDeals);
  const stages = ['New Lead', 'Contacted', 'Negotiation', 'Closed Won'];

  const moveDeal = (dealId, direction) => {
    setDeals(prev => prev.map(d => {
      if (d._id === dealId) {
        const curIdx = stages.indexOf(d.stage);
        const nextIdx = curIdx + direction;
        if (nextIdx >= 0 && nextIdx < stages.length) {
          return { ...d, stage: stages[nextIdx] };
        }
      }
      return d;
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Deals Pipeline Kanban Board" 
        description="Monitor current sales pipeline values, switch deal stages, and sign off won deal values."
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start select-none">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div key={stage} className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex flex-col gap-3 min-h-[450px]">
              <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200 Outfit">{stage}</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">${stageValue.toLocaleString()}</span>
                </div>
                <Badge variant="brand">{stageDeals.length}</Badge>
              </div>

              <div className="flex flex-col gap-2.5">
                {stageDeals.map(d => (
                  <div key={d._id} className="glass-card p-3.5 rounded-lg border border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-semibold text-slate-100 leading-normal">{d.company}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Pipeline:</span>
                      <span className="font-bold text-brand-400">${d.value.toLocaleString()}</span>
                    </div>

                    {/* Move controls */}
                    <div className="flex justify-end gap-1 border-t border-white/5 pt-2 mt-1">
                      {stage !== 'New Lead' && (
                        <button 
                          onClick={() => moveDeal(d._id, -1)} 
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      )}
                      {stage !== 'Closed Won' && (
                        <button 
                          onClick={() => moveDeal(d._id, 1)} 
                          className="p-1 rounded bg-brand-600/20 hover:bg-brand-600/35 text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PipelineKanban;
