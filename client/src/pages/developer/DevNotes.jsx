import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FileText, Plus } from 'lucide-react';

const mockInitialNotes = [
  { id: '1', title: 'OAuth configuration guidelines', category: 'Personal', date: 'May 22, 2026' },
  { id: '2', title: 'Sprint 14 Standup Agenda', category: 'Shared Team', date: 'May 28, 2026' },
];

export const DevNotes = () => {
  const [notes, setNotes] = useState(mockInitialNotes);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('Personal');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const newNote = {
      id: String(notes.length + 1),
      title: newTitle,
      category: newCat,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    setNotes([newNote, ...notes]);
    setNewTitle('');
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Note Document Header',
      render: (val) => (
        <span className="flex items-center gap-2 text-brand-400 font-bold hover:underline cursor-pointer">
          <FileText className="w-4 h-4" />
          <span>{val}</span>
        </span>
      )
    },
    { 
      key: 'category', 
      label: 'Visibility scope',
      render: (val) => <Badge variant={val === 'Personal' ? 'slate' : 'brand'}>{val}</Badge>
    },
    { key: 'date', label: 'Updated Date' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Personal & Team Notes" 
        description="Write guidelines checklists, pin technical notes, and view shared team docs."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">My Technical Documents</h3>
          <Table columns={columns} data={notes} />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 h-fit flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Create Technical Note</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Document Header"
              placeholder="e.g. Stripe webhooks logs configuration"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-400 Outfit">Visibility Category</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none"
              >
                <option value="Personal">Personal (Private)</option>
                <option value="Shared Team">Shared (Team-wide)</option>
              </select>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-1.5 mt-2">
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default DevNotes;
