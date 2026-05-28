import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Calendar, Plus } from 'lucide-react';

const mockMeetings = [
  { id: '1', title: 'Daily engineering Standup scrum', date: 'May 30, 2026', time: '09:30 AM', room: 'Zoom #1', rsvp: 'Accepted' },
  { id: '2', title: 'Q2 Performance & Branding Review', date: 'Jun 05, 2026', time: '02:00 PM', room: 'Google Meet', rsvp: 'Pending' },
];

export const MeetingsPage = () => {
  const [meetings, setMeetings] = useState(mockMeetings);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title || !date) return;

    const newMeeting = {
      id: String(meetings.length + 1),
      title,
      date,
      time: time || '12:00 PM',
      room: 'Zoom Link Room',
      rsvp: 'Accepted',
    };
    setMeetings([...meetings, newMeeting]);
    setTitle('');
    setDate('');
    setTime('');
    alert('Meeting scheduled successfully.');
  };

  const columns = [
    { key: 'title', label: 'Scrum / Board Meeting Title', sortable: true },
    { key: 'date', label: 'Date scheduled', sortable: true },
    { key: 'time', label: 'Time' },
    { key: 'room', label: 'Meeting Room / Link' },
    { 
      key: 'rsvp', 
      label: 'My RSVP status',
      render: (val) => (
        <Badge variant={val === 'Accepted' ? 'emerald' : 'amber'}>
          {val}
        </Badge>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Agile Calendar & Meetings" 
        description="Schedule corporate board standups, RSVP to department stand-ups and access Zoom room links."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Upcoming Team Alignments</h3>
          <Table columns={columns} data={meetings} />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 h-fit flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Schedule alignment</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Meeting Topic Title"
              placeholder="e.g. Sprint #14 alignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              <span>Schedule meeting</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default MeetingsPage;
// Make sure to export default as well!
