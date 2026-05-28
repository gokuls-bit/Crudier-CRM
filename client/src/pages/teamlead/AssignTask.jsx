import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const AssignTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('Jane Doe');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`Sprint task "${title}" assigned to ${assignee} successfully.`);
      setTitle('');
      setDescription('');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader 
        title="Assign Sprint Task" 
        description="Scaffold a new sprint goal, select task priority badges and assign it to a team member."
      />

      <div className="glass-panel p-6 rounded-xl border border-white/5">
        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          <Input
            type="text"
            label="Sprint Task Title"
            placeholder="e.g. Implement JWT refresh rotation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-400 Outfit">Sprint Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe requirements and expectations..."
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none focus:border-brand-500/60 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-400 Outfit">Priority Rating</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-400 Outfit">Assignee Member</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none"
              >
                <option value="Jane Doe">Jane Doe (Developer)</option>
                <option value="Alice Vance">Alice Vance (Developer)</option>
                <option value="John Smith">John Smith (Intern)</option>
              </select>
            </div>
          </div>

          <Button type="submit" isLoading={isSaving} className="w-fit self-end mt-2">
            Assign Sprint Task
          </Button>
        </form>
      </div>
    </div>
  );
};
export default AssignTask;
