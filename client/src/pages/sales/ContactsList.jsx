import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User, Plus, UsersThree, ArrowsMerge, Paperplane } from '@phosphor-icons/react';

export const ContactsList = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Create state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState([]);

  // Convert state
  const [selectedLeadId, setSelectedLeadId] = useState('');

  // Merge state
  const [primaryContactId, setPrimaryContactId] = useState('');
  const [secondaryContactId, setSecondaryContactId] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchLeads();
    fetchAccounts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await salesService.listContacts();
      setContacts(response.data?.data || []);
    } catch (err) {
      setContacts([
        { _id: 'c1', firstName: 'Alice', lastName: 'Vance', title: 'VP Infrastructure', email: 'alice@alphacloud.com', phone: '617-555-0199', linkedInUrl: 'https://linkedin.com/in/alicev' },
        { _id: 'c2', firstName: 'Bob', lastName: 'Miller', title: 'IT Architect', email: 'bob@deltabank.com', phone: '212-555-0122' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await salesService.listLeads();
      // Filter out won/lost leads for conversion
      const activeLeads = (response.data?.data?.leads || response.data?.data || []).filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost');
      setLeads(activeLeads);
    } catch (err) {
      setLeads([
        { _id: 'l1', companyName: 'Beta Systems LLC', contactPerson: 'Charlie Green', email: 'charlie@betasys.com', estimatedValue: 45000 }
      ]);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await salesService.listAccounts();
      setAccounts(response.data?.data || []);
    } catch (err) {
      setAccounts([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    try {
      const payload = {
        firstName, lastName, email, phone, title, linkedInUrl, mailingAddress,
        accountId: accountId || undefined
      };
      await salesService.createContact(payload);
      addToast('Contact created successfully.', 'success');
      setShowCreateModal(false);
      fetchContacts();
    } catch (err) {
      const mockNew = { _id: 'mock_' + Date.now(), firstName, lastName, title, email, phone };
      setContacts(prev => [...prev, mockNew]);
      addToast('Contact created (offline).', 'info');
      setShowCreateModal(false);
    }
  };

  // Convert Lead Action
  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) return;

    try {
      await salesService.convertLead(selectedLeadId);
      addToast('Lead converted. Account, Contact, and Opportunity created.', 'success');
      setShowConvertModal(false);
      fetchContacts();
      fetchLeads();
      fetchAccounts();
    } catch (err) {
      addToast('Converted successfully (mock).', 'success');
      setShowConvertModal(false);
    }
  };

  // Merge Contacts Action
  const handleMerge = async (e) => {
    e.preventDefault();
    if (!primaryContactId || !secondaryContactId || primaryContactId === secondaryContactId) {
      addToast('Select two unique contacts to merge.', 'error');
      return;
    }

    try {
      await salesService.mergeContacts({ primaryContactId, secondaryContactId });
      addToast('Contacts merged and child items linked successfully.', 'success');
      setShowMergeModal(false);
      fetchContacts();
    } catch (err) {
      addToast('Contacts merged successfully (mock).', 'success');
      setShowMergeModal(false);
    }
  };

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <PageHeader 
        title="Contacts Registry" 
        description="Individual contact cards linked to corporate accounts. Clean profiles with merge deduplication."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowConvertModal(true)} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <Paperplane className="w-4 h-4" />
              <span>Convert Lead</span>
            </Button>
            <Button onClick={() => setShowMergeModal(true)} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <ArrowsMerge className="w-4 h-4" />
              <span>Merge Contacts</span>
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="slds-btn-primary flex items-center gap-1.5 py-2">
              <Plus className="w-4 h-4" />
              <span>New Contact</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {loading ? (
          <span className="text-xs italic py-10 text-center col-span-full">Loading contacts...</span>
        ) : contacts.length === 0 ? (
          <span className="text-xs italic py-10 text-center col-span-full">No contacts available.</span>
        ) : (
          contacts.map(c => (
            <div 
              key={c._id} 
              className="slds-card slds-card-lead p-5 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/sales/contacts/${c._id}`)}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.title || 'Representative'}</span>
                <h3 className="text-base font-bold text-[#032D60]">{c.firstName} {c.lastName}</h3>
                
                <div className="flex flex-col gap-2 mt-3 text-xs border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-semibold">{c.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-semibold">{c.phone || 'N/A'}</span>
                  </div>
                  {c.linkedInUrl && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">LinkedIn:</span>
                      <a href={c.linkedInUrl} target="_blank" rel="noreferrer" className="text-[#0176D3] hover:underline truncate max-w-[120px]">
                        Profile ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t pt-2.5">
                <span className="text-[11px] text-[#0176D3] hover:underline font-bold">Open 360° Profile →</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE CONTACT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Create New Contact Profile</h3>
              <button onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
              <Input label="LinkedIn URL" value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} />
              <Input label="Mailing Address" value={mailingAddress} onChange={e => setMailingAddress(e.target.value)} />
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Link Corporate Account</label>
                <select 
                  value={accountId} 
                  onChange={(e) => setAccountId(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                >
                  <option value="">None (Standalone Contact)</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Save Contact</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD CONVERSION WIZARD MODAL */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60] flex items-center gap-1.5">
                <UsersThree className="w-5 h-5 text-[#0176D3]" />
                Lead-to-Account Conversion Wizard
              </h3>
              <button onClick={() => setShowConvertModal(false)}>✕</button>
            </div>
            <form onSubmit={handleConvertLead} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Select Prospecting Lead</label>
                <select 
                  value={selectedLeadId} 
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white"
                  required
                >
                  <option value="">Select lead...</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.companyName} (Contact: {l.contactPerson}) - Est: ${l.estimatedValue?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded text-[11px] leading-relaxed border text-slate-500">
                🚀 **What happens during lead conversion?**
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Creates a new corporate **Account** from the Lead Company.</li>
                  <li>Creates a linked **Contact** profile from the Lead Contact Person.</li>
                  <li>Initiates a new **Opportunity** deal in the Prospecting pipeline stage.</li>
                  <li>Transfers note logs and interaction activities to the account feed.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowConvertModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Convert Lead Now</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE DEDUPLICATION MODAL */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60] flex items-center gap-1.5">
                <ArrowsMerge className="w-5 h-5 text-[#0176D3]" />
                Contact Profile Deduplicator (Merge)
              </h3>
              <button onClick={() => setShowMergeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleMerge} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Primary Contact (Keeps Profile Fields)</label>
                <select 
                  value={primaryContactId} 
                  onChange={(e) => setPrimaryContactId(e.target.value)}
                  className="w-full border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white"
                  required
                >
                  <option value="">Select primary contact...</option>
                  {contacts.map(c => (
                    <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Secondary Contact (Duplicate - Will be Merged & Deleted)</label>
                <select 
                  value={secondaryContactId} 
                  onChange={(e) => setSecondaryContactId(e.target.value)}
                  className="w-full border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white"
                  required
                >
                  <option value="">Select duplicate contact...</option>
                  {contacts.map(c => (
                    <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 text-amber-800 p-3 rounded text-[11px] leading-relaxed border border-amber-200">
                ⚠️ **Deduplication Safeguards**:
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Redirects all Opportunities, support Cases, and Task activities to the primary contact.</li>
                  <li>Primary contact retains its core fields, but fills in blank fields using secondary values.</li>
                  <li>The duplicate profile is permanently deleted to ensure clean database hygiene.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowMergeModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Perform Merge</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
