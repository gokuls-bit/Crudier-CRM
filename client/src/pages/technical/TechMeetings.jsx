import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/charts/StatCard';
import { Calendar, Video, FileText } from 'lucide-react';

const mockDevStandups = [
  { id: '1', title: 'Daily Engineering stand-up', date: 'Daily (Mon-Fri)', time: '09:30 AM', platform: 'Zoom (Standup Room)', status: 'Recurring' },
  { id: '2', title: 'Sprint Planning (Sprint #14)', date: 'Jun 01, 2026', time: '11:00 AM', platform: 'Google Meet', status: 'One-time' },
  { id: '3', title: 'System Architecture Alignment', date: 'Jun 08, 2026', time: '03:00 PM', platform: 'Zoom', status: 'One-time' },
];

const mockSprintNotes = [
  { id: '1', title: 'Sprint 13 Retro Notes', date: 'May 24, 2026', author: 'CTO Office', file: 'Sprint_13_Retro.md' },
  { id: '2', title: 'Database Migration Action items', date: 'May 26, 2026', author: 'VP Engineering', file: 'Db_Migration_Strategy.md' },
];

export const TechMeetings = () => {
  const meetingColumns = [
    { key: 'title', label: 'Standup / Sprint Planning Session' },
    { key: 'date', label: 'Schedule' },
    { key: 'time', label: 'Time' },
    { key: 'platform', label: 'Platform / Room' },
    { 
      key: 'status', 
      label: 'Type',
      render: (val) => <Badge variant={val === 'Recurring' ? 'brand' : 'slate'}>{val}</Badge>
    },
  ];

  const noteColumns = [
    { key: 'title', label: 'Meeting Note File Name' },
    { key: 'date', label: 'Date Logged' },
    { key: 'author', label: 'Logged By' },
    { 
      key: 'file', 
      label: 'Attached Doc file',
      render: (val) => <span className="text-brand-400 font-bold hover:underline cursor-pointer flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{val}</span>
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Developer Stand-ups & Sprints" 
        description="Schedule dev scrum meetings, plan sprint cycles, view action notes and retro details."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Scrum Sessions Scheduled" value="3 Meetings" icon={Calendar} />
        <StatCard title="Tech Action notes" value="14 Files" icon={FileText} />
        <StatCard title="Daily Standup Room" value="Zoom Room #3" icon={Video} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Upcoming Stand-ups & Agile alignments</h3>
        <Table columns={meetingColumns} data={mockDevStandups} />
      </div>

      <div className="glass-card p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Stand-up & Sprint Retro Archive</h3>
        <Table columns={noteColumns} data={mockSprintNotes} />
      </div>
    </div>
  );
};
export default TechMeetings;
