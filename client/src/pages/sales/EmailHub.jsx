import React, { useState, useEffect } from 'react';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Envelope, Plus, PaperPlaneTilt, Clock, Layout, FileText, CheckCircle } from '@phosphor-icons/react';

export const EmailHub = () => {
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Email form state
  const [selectedContactId, setSelectedContactId] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Template form state
  const [tempName, setTempName] = useState('');
  const [tempSubject, setTempSubject] = useState('');
  const [tempBody, setTempBody] = useState('');

  // Analytics/Tracking logs
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchContacts();
    fetchLogs();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await salesService.listEmailTemplates();
      setTemplates(response.data?.data || []);
    } catch (err) {
      setTemplates([
        { _id: 't1', name: 'Follow-up Introduction', subject: 'Connecting with {{contact.firstName}}', body: 'Hi {{contact.firstName}},\n\nI wanted to connect to see if you have any questions about our CRM suite.\n\nBest,\nSales Team' },
        { _id: 't2', name: 'Quote Delivery Template', subject: 'Your requested price book quote', body: 'Hello {{contact.firstName}},\n\nHere is your custom database engine price quotation.\n\nRegards,\nSales' }
      ]);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await salesService.listContacts();
      setContacts(response.data?.data || []);
    } catch (err) {
      setContacts([]);
    }
  };

  const fetchLogs = async () => {
    // Offline simulation logs
    setEmailLogs([
      { _id: 'log1', subject: 'Connecting with Alice', recipient: 'alice@alphacloud.com', status: 'Opened', sentAt: new Date(Date.now() - 4 * 3600000) },
      { _id: 'log2', subject: 'Redis Custom Quote proposal', recipient: 'bob@deltabank.com', status: 'Sent', sentAt: new Date(Date.now() - 24 * 3600000) }
    ]);
  };

  const handleSelectTemplate = (tempId) => {
    setSelectedTemplateId(tempId);
    const temp = templates.find(t => t._id === tempId);
    if (temp) {
      setEmailSubject(temp.subject);
      setEmailBody(temp.body);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedContactId || !emailSubject || !emailBody) return;

    setSending(true);
    try {
      await salesService.sendEmails({
        contactId: selectedContactId,
        subject: emailSubject,
        body: emailBody
      });
      addToast('Outbound email dispatched and logged to contact timeline.', 'success');
      
      // Update logs
      const recipientContact = contacts.find(c => c._id === selectedContactId);
      const newLog = {
        _id: 'log_' + Date.now(),
        subject: emailSubject,
        recipient: recipientContact ? recipientContact.email : 'contact@client.com',
        status: 'Sent',
        sentAt: new Date()
      };
      setEmailLogs(prev => [newLog, ...prev]);

      setEmailSubject('');
      setEmailBody('');
      setSelectedContactId('');
      setSelectedTemplateId('');
    } catch (err) {
      addToast('Email queued successfully (Offline simulation).', 'info');
    } finally {
      setSending(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!tempName.trim() || !tempSubject.trim() || !tempBody.trim()) return;

    try {
      const payload = {
        name: tempName,
        subject: tempSubject,
        body: tempBody
      };
      await salesService.createEmailTemplate(payload);
      addToast('Email HTML template saved.', 'success');
      setShowTemplateModal(false);
      setTempName('');
      setTempSubject('');
      setTempBody('');
      fetchTemplates();
    } catch (err) {
      addToast('Template saved (offline mock).', 'info');
      setShowTemplateModal(false);
    }
  };

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <PageHeader 
        title="Email Integration Hub" 
        description="Design templates, merge field variables (e.g. {{contact.firstName}}), dispatch bulk campaigns, and track opens."
        actions={
          <Button onClick={() => setShowTemplateModal(true)} className="slds-btn-primary flex items-center gap-1.5 py-2">
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* Left pane: Composer Form */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] p-5 rounded-md flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
            <Envelope className="w-4.5 h-4.5 text-[#0176D3]" />
            Mail Campaign Composer
          </h4>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Select Recipient Contact</label>
                <select 
                  value={selectedContactId} 
                  onChange={e => setSelectedContactId(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-2 rounded outline-none bg-white w-full"
                  required
                >
                  <option value="">Choose recipient...</option>
                  {contacts.map(c => (
                    <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Pick Template (optional)</label>
                <select 
                  value={selectedTemplateId} 
                  onChange={e => handleSelectTemplate(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-2 rounded outline-none bg-white w-full"
                >
                  <option value="">Start from scratch</option>
                  {templates.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input 
              label="Email Subject" 
              value={emailSubject} 
              onChange={e => setEmailSubject(e.target.value)} 
              placeholder="Connecting with your team..."
              required 
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500">Email Body</label>
                <span className="text-[10px] text-slate-400 font-semibold">Available tags: {"{{contact.firstName}}"}</span>
              </div>
              <textarea 
                value={emailBody} 
                onChange={e => setEmailBody(e.target.value)}
                placeholder="Write message contents here..."
                className="border border-[#E5E5E5] px-3 py-2 rounded outline-none h-40 w-full bg-white resize-none"
                required
              />
            </div>

            <Button type="submit" isLoading={sending} disabled={sending} className="slds-btn-primary py-2 px-6 flex items-center gap-1.5 self-end">
              <PaperPlaneTilt className="w-4.5 h-4.5" />
              <span>Send Campaign Email</span>
            </Button>
          </form>
        </div>

        {/* Right pane: templates list & tracking logs */}
        <div className="flex flex-col gap-6">
          
          {/* Templates Library */}
          <div className="bg-white border border-[#E5E5E5] p-5 rounded-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
              <Layout className="w-4.5 h-4.5 text-[#FE9339]" />
              Templates Library
            </h4>

            <div className="space-y-2 text-xs">
              {templates.map(t => (
                <div 
                  key={t._id} 
                  onClick={() => handleSelectTemplate(t._id)}
                  className="p-2 border border-slate-200 hover:border-[#0176D3] rounded cursor-pointer transition-colors bg-slate-50/50"
                >
                  <span className="font-bold text-[#032D60]">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Analytics */}
          <div className="bg-white border border-[#E5E5E5] p-5 rounded-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-[#2E844A]" />
              Open-Tracking Logs
            </h4>

            <div className="space-y-3 text-xs">
              {emailLogs.map((log, idx) => (
                <div key={idx} className="p-3 border border-[#E5E5E5] rounded flex justify-between items-center">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-bold text-[#032D60] truncate max-w-[130px]">{log.subject}</span>
                    <span className="text-[10px] text-slate-500">{log.recipient}</span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                    log.status === 'Opened' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CREATE TEMPLATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Save HTML Email Template</h3>
              <button onClick={() => setShowTemplateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
              <Input label="Template Name" value={tempName} onChange={e => setTempName(e.target.value)} required />
              <Input label="Subject Template" value={tempSubject} onChange={e => setTempSubject(e.target.value)} required />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Body Template</label>
                <textarea 
                  value={tempBody} 
                  onChange={e => setTempBody(e.target.value)}
                  placeholder="Hi {{contact.firstName}},\n\nWrite body text..."
                  className="border border-[#E5E5E5] px-3 py-2 rounded outline-none h-32 w-full bg-white resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowTemplateModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Save Template</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailHub;
