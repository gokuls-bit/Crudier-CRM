import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/auth.store';
import { Send, Hash, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

const mockChannels = ['general', 'engineering', 'design', 'sales-pipeline'];

const mockInitialMessages = {
  general: [
    { sender: 'Jane Doe', text: 'Welcome to Crudier CRM monorepo workspace!', time: 'Yesterday' },
    { sender: 'Alice Vance', text: 'Scaffolding structures are fully completed.', time: '10 mins ago' },
  ],
  engineering: [
    { sender: 'CTO Office', text: 'Backend endpoints versioned under /api/v1 are operational.', time: '2 hrs ago' },
    { sender: 'Bob Ross', text: 'Verifying DB replica schemas indexing.', time: '1 hr ago' },
  ],
  design: [],
  'sales-pipeline': [],
};

export const ChatPage = () => {
  const user = useAuthStore(state => state.user);
  const [channels] = useState(mockChannels);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState(mockInitialMessages);
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMsg = {
      sender: user?.name || 'You',
      text: text,
      time: 'Just now',
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }));
    setText('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const activeMessages = messages[activeChannel] || [];

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
      <PageHeader 
        title="Team Collaboration Chat" 
        description="Real-time workspace communication rooms. Discuss sprint goals and coordinate live deployments."
      />

      <div className="flex-1 flex glass-panel rounded-xl border border-white/5 overflow-hidden">
        {/* Left Panel: Channels List */}
        <div className="w-64 border-r border-white/5 bg-slate-950/20 flex flex-col p-4 gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest Outfit">Active Channels</span>
          <div className="flex flex-col gap-1">
            {channels.map((chan) => {
              const isSelected = chan === activeChannel;
              return (
                <button
                  key={chan}
                  onClick={() => setActiveChannel(chan)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors',
                    isSelected 
                      ? 'bg-brand-600/15 text-brand-400 border border-brand-500/25' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )}
                >
                  <Hash className="w-4 h-4 text-slate-500" />
                  <span>{chan}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Chat viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel Header */}
          <div className="h-12 border-b border-white/5 px-4 flex items-center gap-2 bg-slate-900/20">
            <Hash className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-bold text-slate-200 Outfit">#{activeChannel}</span>
          </div>

          {/* Messages viewport */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {activeMessages.length > 0 ? (
              activeMessages.map((msg, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <Avatar name={msg.sender} size="sm" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-200 Outfit">{msg.sender}</span>
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-350 bg-slate-900/30 border border-white/5 p-3 rounded-xl rounded-tl-none leading-relaxed max-w-lg">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <MessageSquare className="w-8 h-8 text-slate-600" />
                <span>No messages posted in #{activeChannel} yet.</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-slate-950/20 flex gap-2">
            <Input
              type="text"
              placeholder={`Send message to #${activeChannel}...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="h-fit self-end py-2 px-4 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
// Make sure to export default as well!
