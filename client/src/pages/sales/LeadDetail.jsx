import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { getLeadStatusColors } from '../../utils/statusHelpers';

const mockLeads = {
  '1': { _id: '1', company: 'Alpha Corp', value: 85000, stage: 'Closed Won', email: 'vance@alpha.com', notes: 'Interested in core licensing packages.', activities: [{ act: 'Sent initial pricing tables', time: '2 days ago' }] },
  '2': { _id: '2', company: 'Omega Logistics', value: 120000, stage: 'Negotiation', email: 'logistics@omega.com', notes: 'Requiring custom Redis cache features integrations.', activities: [{ act: 'Conducted live dashboard demo', time: '1 week ago' }] },
};

export const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lead = mockLeads[id] || { company: 'Unknown Lead', value: 0, stage: 'New Lead', email: 'N/A', notes: 'N/A', activities: [] };

  const [noteText, setNoteText] = useState('');
  const [activities, setActivities] = useState(lead.activities);

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!noteText) return;

    setActivities([{ act: noteText, time: 'Just now' }, ...activities]);
    setNoteText('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader 
        title={lead.company} 
        description="Leads contact directory cards, client notes, and historic updates timeline."
        actions={
          <Button onClick={() => navigate('/sales/leads')} variant="secondary" size="sm">
            Back to Directory
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#E0E3E8] shadow-sm md:col-span-2 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 Outfit uppercase">Deal Notes</h4>
            <p className="text-xs text-slate-700 leading-relaxed mt-2">{lead.notes}</p>
          </div>
 
          <div className="border-t border-[#E0E3E8] pt-4 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-slate-500 Outfit uppercase">Interaction Timeline</h4>
            <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto custom-scrollbar mt-1">
              {activities.length > 0 ? (
                activities.map((a, idx) => (
                  <div key={idx} className="p-3 bg-[#F4F5F7] border border-[#E0E3E8] rounded-lg flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between items-center font-bold text-[#1C2945]">
                      <span>Sales Update Activity</span>
                      <span className="text-[9px] text-slate-500">{a.time}</span>
                    </div>
                    <p className="text-slate-600">{a.act}</p>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500">No client activities logged yet.</span>
              )}
            </div>
 
            <form onSubmit={handleAddActivity} className="flex gap-2 mt-2">
              <Input
                type="text"
                placeholder="Log customer response activity..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
              />
              <Button type="submit" variant="secondary" size="sm" className="h-fit self-end py-2">
                Log Update
              </Button>
            </form>
          </div>
        </div>
 
        <div className="bg-white p-5 rounded-xl border border-[#E0E3E8] shadow-sm h-fit flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-slate-500 Outfit uppercase">Lead Metadata</h4>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Email:</span>
              <span className="font-semibold text-slate-700">{lead.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deal Value:</span>
              <span className="font-bold text-slate-700">${lead.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pipeline Stage:</span>
              <Badge className={getLeadStatusColors(lead.stage)}>{lead.stage}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadDetail;
