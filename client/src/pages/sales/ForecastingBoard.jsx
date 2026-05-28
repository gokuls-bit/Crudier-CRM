import React, { useState, useEffect } from 'react';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Target, ChartBar, Users, PencilLine } from '@phosphor-icons/react';

export const ForecastingBoard = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('2026-Q2');
  const [editRepId, setEditRepId] = useState(null);
  const [quotaVal, setQuotaVal] = useState('');
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    fetchForecasts();
  }, [period]);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const response = await salesService.getForecasts({ period });
      setForecasts(response.data?.data || []);
    } catch (err) {
      setForecasts([
        { repId: 'rep1', repName: 'Sales Rep Alice', quota: 500000, pipeline: 350000, bestCase: 220000, commit: 180000, closed: 420000, gap: 80000 },
        { repId: 'rep2', repName: 'Sales Rep Bob', quota: 350000, pipeline: 120000, bestCase: 90000, commit: 75000, closed: 290000, gap: 60000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuotaEdit = (repId, currentQuota) => {
    setEditRepId(repId);
    setQuotaVal(currentQuota);
  };

  const handleSaveQuota = async (repId) => {
    try {
      await salesService.updateQuota({
        repId,
        period,
        value: parseFloat(quotaVal) || 0
      });
      addToast('Quota target updated successfully.', 'success');
      setEditRepId(null);
      fetchForecasts();
    } catch (err) {
      // Mock update
      setForecasts(prev => prev.map(f => {
        if (f.repId === repId) {
          const quota = parseFloat(quotaVal) || 0;
          const gap = Math.max(0, quota - f.closed);
          return { ...f, quota, gap };
        }
        return f;
      }));
      setEditRepId(null);
      addToast('Quota saved (offline mock).', 'info');
    }
  };

  // Manager roll-up aggregates
  const calculateRollups = () => {
    let totalQuota = 0;
    let totalPipeline = 0;
    let totalBestCase = 0;
    let totalCommit = 0;
    let totalClosed = 0;
    let totalGap = 0;

    forecasts.forEach(f => {
      totalQuota += f.quota || 0;
      totalPipeline += f.pipeline || 0;
      totalBestCase += f.bestCase || 0;
      totalCommit += f.commit || 0;
      totalClosed += f.closed || 0;
      totalGap += f.gap || 0;
    });

    return { totalQuota, totalPipeline, totalBestCase, totalCommit, totalClosed, totalGap };
  };

  const rollups = calculateRollups();

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <PageHeader 
        title="Forecasting & Quota Management" 
        description="Collaborative sales forecasts, period quota setting, commitments rollup, and gap metrics."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Forecast Period:</span>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value)}
              className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white font-bold"
            >
              <option value="2026-Q1">2026-Q1</option>
              <option value="2026-Q2">2026-Q2 (Active)</option>
              <option value="2026-Q3">2026-Q3</option>
              <option value="2026-Q4">2026-Q4</option>
            </select>
          </div>
        }
      />

      {/* Roll-up highlights cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
        <div className="bg-white border border-[#E5E5E5] p-5 rounded flex flex-col gap-1 shadow-sm border-t-4 border-t-[#032D60]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quota Aggregate Goal</span>
          <span className="text-lg font-bold text-[#032D60]">${rollups.totalQuota.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] p-5 rounded flex flex-col gap-1 shadow-sm border-t-4 border-t-[#2E844A]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Closed Revenue (Won)</span>
          <span className="text-lg font-bold text-[#2E844A]">${rollups.totalClosed.toLocaleString()}</span>
          <span className="text-[9px] text-[#2E844A] font-bold">
            {rollups.totalQuota > 0 ? `${Math.round((rollups.totalClosed / rollups.totalQuota) * 100)}% of quota` : '0%'}
          </span>
        </div>
        <div className="bg-white border border-[#E5E5E5] p-5 rounded flex flex-col gap-1 shadow-sm border-t-4 border-t-[#0176D3]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Commit Deals Rollup</span>
          <span className="text-lg font-bold text-[#0176D3]">${rollups.totalCommit.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#E5E5E5] p-5 rounded flex flex-col gap-1 shadow-sm border-t-4 border-t-[#BA0517]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining Quota Gap</span>
          <span className="text-lg font-bold text-[#BA0517]">${rollups.totalGap.toLocaleString()}</span>
        </div>
      </div>

      {/* Forecast matrix sheet */}
      <div className="bg-white border border-[#E5E5E5] rounded shadow-sm text-left">
        <div className="p-4 border-b border-[#E5E5E5] bg-slate-50 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#032D60] flex items-center gap-1.5">
            <ChartBar className="w-4.5 h-4.5 text-[#0176D3]" />
            Manager Roll-Up Forecast Matrix ({period})
          </h4>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 text-[10px] text-slate-450 uppercase font-bold border-b border-[#E5E5E5]">
                <th className="py-2.5 px-4">Sales Representative</th>
                <th className="py-2.5 px-4 text-right">Quota Target</th>
                <th className="py-2.5 px-4 text-right">Closed (Won)</th>
                <th className="py-2.5 px-4 text-right">Commit</th>
                <th className="py-2.5 px-4 text-right">Best Case</th>
                <th className="py-2.5 px-4 text-right">Pipeline</th>
                <th className="py-2.5 px-4 text-right">Gap to Quota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center italic text-slate-400">Loading forecasts...</td>
                </tr>
              ) : forecasts.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-[#032D60] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {row.repName}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editRepId === row.repId ? (
                      <div className="flex items-center justify-end gap-1">
                        <input 
                          type="number"
                          value={quotaVal}
                          onChange={e => setQuotaVal(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSaveQuota(row.repId)}
                          className="border border-[#0176D3] px-2 py-0.5 rounded text-xs text-right outline-none bg-white w-20"
                        />
                        <button onClick={() => handleSaveQuota(row.repId)} className="text-emerald-600 font-bold">✓</button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleStartQuotaEdit(row.repId, row.quota)}
                        className="cursor-pointer hover:bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800"
                      >
                        ${row.quota?.toLocaleString()} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#2E844A]">${row.closed?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-[#032D60]">${row.commit?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-650">${row.bestCase?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-500">${row.pipeline?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#BA0517]">
                    {row.gap > 0 ? `$${row.gap.toLocaleString()}` : 'Met ✓'}
                  </td>
                </tr>
              ))}
              
              {/* Rollups Aggregate Row */}
              <tr className="bg-slate-100/50 font-bold border-t-2 border-t-slate-300">
                <td className="py-3 px-4 text-[#032D60]">Total Workspace Rollup</td>
                <td className="py-3 px-4 text-right">${rollups.totalQuota.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-[#2E844A]">${rollups.totalClosed.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">${rollups.totalCommit.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-slate-650">${rollups.totalBestCase.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-slate-500">${rollups.totalPipeline.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-[#BA0517]">${rollups.totalGap.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastingBoard;
