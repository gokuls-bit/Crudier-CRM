import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const SubmitTask = () => {
  const [taskName, setTaskName] = useState('Implement JWT refresh rotation');
  const [prLink, setPrLink] = useState('https://github.com/crudier/server/pull/12');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prLink) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Task submission sent to lead reviewer.');
      setPrLink('');
      setComments('');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader 
        title="Submit Sprint Task" 
        description="Verify task criteria, attach pull request links, and submit your task for code review."
      />

      <div className="glass-panel p-6 rounded-xl border border-white/5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-400 Outfit">Select Assigned Task</label>
            <select
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none"
            >
              <option value="Implement JWT refresh rotation">Implement JWT refresh rotation</option>
              <option value="OAuth2 integration">OAuth2 integration</option>
            </select>
          </div>

          <Input
            type="text"
            label="Pull Request GitHub Link"
            placeholder="https://github.com/owner/repo/pull/1"
            value={prLink}
            onChange={(e) => setPrLink(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-400 Outfit">Comments / Submission Notes</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Added integration tests, all suites passing..."
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none focus:border-brand-500/60 transition-all resize-none"
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-fit self-end mt-2">
            Submit for Review
          </Button>
        </form>
      </div>
    </div>
  );
};
export default SubmitTask;
