import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FileText, Plus } from 'lucide-react';

const mockInitialNotes = [
  { id: '1', title: 'Q2 Roadmap Goals', category: 'Planning', updatedAt: 'May 20, 2026' },
  { id: '2', title: 'Client Feedback Guidelines', category: 'Reference', updatedAt: 'May 24, 2026' },
];

export const TeamNotes = () => {
  const [notes, setNotes] = useState(mockInitialNotes);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState('Planning');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const newNote = {
      id: String(notes.length + 1),
      title: newTitle,
      category: newCat,
      updatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    setNotes([newNote, ...notes]);
    setNewTitle('');
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Note Document Title',
      render: (val) => (
        <span className="flex items-center gap-2 text-brand-400 font-bold hover:underline cursor-pointer">
          <FileText className="w-4 h-4" />
          <span>{val}</span>
        </span>
      )
    },
    { 
      key: 'category', 
      label: 'Category Tag',
      render: (val) => <Badge variant="slate">{val}</Badge>
    },
    { key: 'updatedAt', label: 'Last Modified Date' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Department Shared Notes" 
        description="Write shared guidelines, pin documentation libraries, and structure sprint tasks guides."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Department Shared Documents</h3>
          <Table columns={columns} data={notes} />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 h-fit flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-200">Create Shared Note</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Document Header"
              placeholder="e.g. Sprint #14 Retrospective"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-400 Outfit">Assign Category</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none"
              >
                <option value="Planning">Planning</option>
                <option value="Reference">Reference</option>
                <option value="Guidelines">Guidelines</option>
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
export default TeamNotes;
