import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FileText, Plus } from 'lucide-react';

const mockInitialNotes = [
  { id: '1', title: 'React 19 upgrades guidelines', category: 'Shared Reference', date: 'May 20, 2026' },
  { id: '2', title: 'API server deployments check', category: 'Personal', date: 'May 28, 2026' },
];

export const NotesPage = () => {
  const [notes, setNotes] = useState(mockInitialNotes);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('Personal');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title) return;

    const newNote = {
      id: String(notes.length + 1),
      title,
      category: cat,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    setNotes([newNote, ...notes]);
    setTitle('');
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
      label: 'Note Visibility scope',
      render: (val) => <Badge variant={val === 'Personal' ? 'slate' : 'brand'}>{val}</Badge>
    },
    { key: 'date', label: 'Updated Date' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Technical & Personal notes" 
        description="Write guidelines checklists, pin technical notes, and view shared team docs."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">My Technical Documents</h3>
          <Table columns={columns} data={notes} />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 h-fit flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Create Note</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Document Header"
              placeholder="e.g. Stripe webhooks logs configuration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-400 Outfit">Visibility Category</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none"
              >
                <option value="Personal">Personal (Private)</option>
                <option value="Shared Reference">Shared Reference (Team-wide)</option>
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
export default NotesPage;
// Make sure to export default as well!
