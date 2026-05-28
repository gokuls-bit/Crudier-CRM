import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Calendar, Video, FileText, CheckSquare } from 'lucide-react';

const mockBoardMeetings = [
  { id: '1', title: 'Q2 Performance & Funding Review', date: 'May 30, 2026', time: '10:00 AM', platform: 'Zoom (Board Room)', rsvp: 'Accepted' },
  { id: '2', title: 'Equity Compensation Restructuring', date: 'Jun 05, 2026', time: '02:30 PM', platform: 'Google Meet', rsvp: 'Pending' },
  { id: '3', title: 'Global Product Roadmap Alignments', date: 'Jun 12, 2026', time: '09:00 AM', platform: 'Microsoft Teams', rsvp: 'Tentative' },
];

const mockArchives = [
  { id: '1', title: 'Q1 Board Directors Alignments', date: 'Mar 15, 2026', author: 'CEO Office', file: 'Board_Q1_Minutes.pdf' },
  { id: '2', title: 'Series A Pre-Seed Term Sheet Pitch', date: 'Apr 02, 2026', author: 'Founder/CEO', file: 'Series_A_Term_Sheet_Approved.pdf' },
];

export const StrategicMeetings = () => {
  const meetingColumns = [
    { key: 'title', label: 'Board Meeting Title' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'platform', label: 'Location / Platform' },
    { 
      key: 'rsvp', 
      label: 'My RSVP',
      render: (val) => (
        <Badge variant={val === 'Accepted' ? 'emerald' : (val === 'Pending' ? 'amber' : 'slate')}>
          {val}
        </Badge>
      )
    },
  ];

  const archiveColumns = [
    { key: 'title', label: 'Archived Meeting Title' },
    { key: 'date', label: 'Date Archived' },
    { key: 'author', label: 'Owner' },
    { 
      key: 'file', 
      label: 'Minutes / Doc file',
      render: (val) => <span className="text-brand-400 font-bold hover:underline cursor-pointer flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{val}</span>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Strategic Board Meetings" 
        description="Exclusive board alignments, executive archives, Term Sheet distributions, and RSVP selectors."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Upcoming Board Alignments" value="3 Scheduled" icon={Calendar} />
        <StatCard title="Total Board Minutes" value="12 Docs" icon={FileText} />
        <StatCard title="Total Board RSVPs" value="1 Pending" icon={CheckSquare} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Upcoming Leadership Alignments</h3>
        <Table columns={meetingColumns} data={mockBoardMeetings} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Executive Standup Archive</h3>
        <Table columns={archiveColumns} data={mockArchives} />
      </div>
    </div>
  );
};
export default StrategicMeetings;
