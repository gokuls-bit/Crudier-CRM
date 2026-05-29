import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Calendar, Plus } from 'lucide-react';

const mockInitialFollowups = [
  { id: '1', company: 'Alpha Corp Demo', date: 'May 30, 2026', time: '10:30 AM', notes: 'Demonstrate custom metrics card grids.' },
  { id: '2', company: 'Beta Systems Proposal follow-up', date: 'Jun 02, 2026', time: '02:00 PM', notes: 'Check pricing and contract approval status.' },
];

export const FollowUps = () => {
  const [followups, setFollowups] = useState(mockInitialFollowups);
  const [company, setCompany] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!company || !date) return;

    const newFollowup = {
      id: String(followups.length + 1),
      company,
      date,
      time: time || '12:00 PM',
      notes: 'Custom scheduled reminder note.',
    };
    setFollowups([...followups, newFollowup]);
    setCompany('');
    setDate('');
    setTime('');
    alert('Follow-up scheduled successfully.');
  };

  const columns = [
    { key: 'company', label: 'Company / Lead Account', sortable: true },
    { key: 'date', label: 'Reminder Date', sortable: true },
    { key: 'time', label: 'Time' },
    { key: 'notes', label: 'Agenda Description' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Follow-up Reminders" 
        description="Schedule touchpoints reminders, follow up on closed deals proposals, and coordinate standup alignments."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#E0E3E8] shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-[#1C2945] mb-4 Outfit">Scheduled Follow-up Reminders</h3>
          <Table columns={columns} data={followups} />
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E0E3E8] shadow-sm h-fit flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#1C2945] Outfit">Schedule Reminder</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Company Name"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />

            <Input
              type="date"
              label="Schedule Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Input
              type="time"
              label="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

            <Button type="submit" className="w-full flex items-center justify-center gap-1.5 mt-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule Followup</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default FollowUps;
