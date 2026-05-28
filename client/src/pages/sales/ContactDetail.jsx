import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { ArrowLeft, Clock, PencilLine, Warning, Envelope, Phone } from '@phosphor-icons/react';

export const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Inline edit states for Highlights
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchContactDetails();
  }, [id]);

  const fetchContactDetails = async () => {
    setLoading(true);
    try {
      const response = await salesService.getContact(id);
      setContact(response.data?.data);
    } catch (err) {
      setContact({
        _id: id,
        firstName: 'Alice',
        lastName: 'Vance',
        title: 'VP Infrastructure',
        email: 'alice@alphacloud.com',
        phone: '617-555-0199',
        linkedInUrl: 'https://linkedin.com/in/alicev',
        mailingAddress: '100 Tech Way, Boston MA',
        account: { name: 'Alpha Cloud Services' },
        timeline: [
          { _id: 't1', type: 'Email', subject: 'Inbound Inquiry', description: 'Interested in upgrading standard price book quotes.', createdAt: new Date() }
        ],
        cases: [
          { _id: 'cs1', subject: 'Billing error in invoice Q2', status: 'Working', priority: 'Medium' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (field, val) => {
    setEditField(field);
    setEditValue(val);
  };

  const handleSaveField = async (field) => {
    try {
      const payload = { [field]: editValue };
      await salesService.updateContact(id, payload);
      setContact(prev => ({ ...prev, ...payload }));
      setEditField(null);
      addToast('Field updated successfully.', 'success');
    } catch (err) {
      setContact(prev => ({ ...prev, [field]: editValue }));
      setEditField(null);
      addToast('Field updated (offline mock).', 'info');
    }
  };

  if (loading || !contact) {
    return (
      <div className="flex justify-center items-center py-20 text-[#032D60]">
        <Clock className="w-8 h-8 animate-spin text-[#0176D3]" />
      </div>
    );
  }

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <button 
        onClick={() => navigate('/sales/contacts')}
        className="flex items-center gap-1 text-xs text-[#0176D3] hover:underline self-start font-bold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Contacts Registry
      </button>

      <PageHeader 
        title={`${contact.firstName} ${contact.lastName}`}
        description={`${contact.title || 'Representative'} linked to ${contact.account?.name || 'Standalone Account'}`}
      />

      {/* Highlights Panel */}
      <div className="slds-highlights p-4 border border-[#E5E5E5] rounded flex flex-col gap-4 text-left shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
          Highlights Panel (Click inline to modify contact attributes)
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">First Name:</span>
              {editField === 'firstName' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('firstName')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('firstName')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('firstName', contact.firstName)}
                  className="font-bold text-[#032D60] cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded"
                >
                  {contact.firstName} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Last Name:</span>
              {editField === 'lastName' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('lastName')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('lastName')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('lastName', contact.lastName)}
                  className="font-bold text-[#032D60] cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded"
                >
                  {contact.lastName} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Email:</span>
              {editField === 'email' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="email" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('email')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-32"
                  />
                  <button onClick={() => handleSaveField('email')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('email', contact.email)}
                  className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded"
                >
                  {contact.email} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Phone:</span>
              {editField === 'phone' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('phone')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('phone')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('phone', contact.phone)}
                  className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded"
                >
                  {contact.phone || 'N/A'} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Job Title:</span>
              {editField === 'title' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('title')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('title')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('title', contact.title)}
                  className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded"
                >
                  {contact.title || 'N/A'} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">LinkedIn:</span>
              {editField === 'linkedInUrl' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('linkedInUrl')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-32"
                  />
                  <button onClick={() => handleSaveField('linkedInUrl')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('linkedInUrl', contact.linkedInUrl)}
                  className="text-[#0176D3] cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded font-semibold truncate max-w-[150px]"
                >
                  {contact.linkedInUrl || 'Connect URL'} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* Left pane related Cases */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-[#E5E5E5] rounded p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5 mb-3">
              <Warning className="w-4 h-4 text-[#BA0517]" />
              Support Cases linked to Contact
            </h4>

            <div className="space-y-2">
              {(!contact.cases || contact.cases.length === 0) ? (
                <span className="text-xs italic text-slate-400 block text-center py-4">No cases logged.</span>
              ) : (
                contact.cases.map((c, i) => (
                  <div key={i} className="p-3 border border-[#E5E5E5] rounded flex justify-between items-center text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#032D60]">⚠️ {c.subject}</span>
                      <span className="text-[10px] text-slate-500">Status: {c.status}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] uppercase font-bold">{c.priority}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right pane timeline interactions */}
        <div className="bg-white border border-[#E5E5E5] rounded p-5 flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0176D3]" />
            Interaction History
          </h4>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pl-2 pr-1 custom-scrollbar">
            {(!contact.timeline || contact.timeline.length === 0) ? (
              <span className="text-xs italic text-slate-400 block text-center py-4">No timeline activities logs.</span>
            ) : (
              contact.timeline.map((act, idx) => (
                <div key={idx} className="relative border-l border-slate-200 pl-4 pb-2 text-xs text-left">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#B0D9FA] border border-[#0176D3]" />
                  <div className="flex justify-between items-center font-bold text-[#032D60]">
                    <span>{act.subject || act.type}</span>
                    <span className="text-[8px] text-slate-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-550 text-[11px] leading-relaxed mt-1">{act.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactDetail;
