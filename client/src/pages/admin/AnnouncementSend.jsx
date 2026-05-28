import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const AnnouncementSend = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      alert(`Broadcast sent: "${title}" to all workspace members.`);
      setTitle('');
      setMessage('');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader 
        title="Broadcast System Announcements" 
        description="Deliver push alerts and dashboard notification banners to all workspace users."
      />

      <div className="glass-panel p-6 rounded-xl border border-white/5">
        <form onSubmit={handleBroadcast} className="flex flex-col gap-5">
          <Input
            type="text"
            label="Announcement Header / Subject"
            placeholder="System Update or Holiday Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-400 Outfit">Broadcast Body Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide information to the entire team..."
              required
              rows={5}
              className="w-full px-3 py-2 text-sm rounded-lg glass-input border border-white/10 outline-none focus:border-brand-500/60 transition-all resize-none"
            />
          </div>

          <Button type="submit" isLoading={isSending} className="w-fit self-end mt-2">
            Send Broadcast Announcement
          </Button>
        </form>
      </div>
    </div>
  );
};
export default AnnouncementSend;
