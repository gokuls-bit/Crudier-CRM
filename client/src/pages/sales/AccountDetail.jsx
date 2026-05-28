import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Building, User, Envelope, Phone, CurrencyDollar, ArrowLeft,
  CaretDown, CaretUp, Plus, Clock, Note, CheckSquare, PencilLine, PaperPlaneTilt
} from '@phosphor-icons/react';

export const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('contacts'); // contacts, opportunities, cases, timeline
  const addToast = useToastStore(state => state.addToast);

  // Modal forms
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);

  // Forms state
  const [contactFirst, setContactFirst] = useState('');
  const [contactLast, setContactLast] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [oppName, setOppName] = useState('');
  const [oppStage, setOppStage] = useState('Prospecting');
  const [oppAmount, setOppAmount] = useState('');
  
  const [caseSubject, setCaseSubject] = useState('');
  const [caseDesc, setCaseDesc] = useState('');
  const [casePriority, setCasePriority] = useState('Medium');

  // Timeline note state
  const [timelineText, setTimelineText] = useState('');
  const [timelineType, setTimelineType] = useState('Note');

  // Inline editing states for highlights panel
  const [editField, setEditField] = useState(null); // 'name' | 'type' | 'annualRevenue' | 'employeesCount' | 'region' | 'industry'
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchAccountDetails();
  }, [id]);

  const fetchAccountDetails = async () => {
    setLoading(true);
    try {
      const response = await salesService.getAccount(id);
      setAccount(response.data?.data);
    } catch (err) {
      // Mock details
      const mockAcc = {
        _id: id,
        name: 'Alpha Cloud Services',
        type: 'Customer',
        annualRevenue: 50000000,
        employeesCount: 1500,
        billingAddress: '100 Tech Way, Boston MA',
        shippingAddress: '100 Tech Way, Boston MA',
        region: 'US-East',
        industry: 'Tech',
        contacts: [
          { _id: 'c1', firstName: 'Alice', lastName: 'Vance', title: 'VP Infrastructure', email: 'alice@alphacloud.com', phone: '617-555-0199' }
        ],
        opportunities: [
          { _id: 'o1', name: 'Alpha Q3 Server Upgrade', amount: 250000, stage: 'Negotiation', probability: 75, closeDate: new Date() }
        ],
        cases: [
          { _id: 'cs1', subject: 'Billing error in invoice Q2', status: 'Working', priority: 'Medium', createdAt: new Date() }
        ],
        timeline: [
          { _id: 'act1', type: 'Note', subject: 'Logged Note', description: 'Customer requested enterprise-grade quote.', createdAt: new Date() }
        ],
        parent: null,
        children: []
      };
      setAccount(mockAcc);
    } finally {
      setLoading(false);
    }
  };

  // Inline edit handlers
  const handleStartEdit = (field, val) => {
    setEditField(field);
    setEditValue(val);
  };

  const handleSaveField = async (field) => {
    try {
      const updatedData = { [field]: editValue };
      if (field === 'annualRevenue') updatedData[field] = parseFloat(editValue) || 0;
      if (field === 'employeesCount') updatedData[field] = parseInt(editValue) || 0;

      await salesService.updateAccount(id, updatedData);
      setAccount(prev => ({ ...prev, ...updatedData }));
      setEditField(null);
      addToast('Field updated successfully.', 'success');
      fetchAccountDetails();
    } catch (err) {
      // Offline fallback
      setAccount(prev => ({ ...prev, [field]: editValue }));
      setEditField(null);
      addToast('Field updated (offline mock).', 'info');
    }
  };

  // Create Contact Handler
  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        accountId: id,
        firstName: contactFirst,
        lastName: contactLast,
        email: contactEmail,
        phone: contactPhone,
        title: 'Representative'
      };
      await salesService.createContact(payload);
      addToast('Contact added to account related list.', 'success');
      setShowContactModal(false);
      setContactFirst('');
      setContactLast('');
      setContactEmail('');
      setContactPhone('');
      fetchAccountDetails();
    } catch (err) {
      addToast('Contact added (offline mock).', 'info');
      setShowContactModal(false);
    }
  };

  // Create Opportunity Handler
  const handleCreateOpp = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        accountId: id,
        name: oppName,
        stage: oppStage,
        amount: parseFloat(oppAmount) || 0,
        closeDate: new Date(Date.now() + 30 * 86400000)
      };
      await salesService.createOpportunity(payload);
      addToast('Opportunity added to account.', 'success');
      setShowOppModal(false);
      setOppName('');
      setOppAmount('');
      fetchAccountDetails();
    } catch (err) {
      addToast('Opportunity added (offline mock).', 'info');
      setShowOppModal(false);
    }
  };

  // Create Case Handler
  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        accountId: id,
        subject: caseSubject,
        description: caseDesc,
        priority: casePriority
      };
      await salesService.createCase(payload);
      addToast('Support Case opened for account.', 'success');
      setShowCaseModal(false);
      setCaseSubject('');
      setCaseDesc('');
      fetchAccountDetails();
    } catch (err) {
      addToast('Support Case opened (offline mock).', 'info');
      setShowCaseModal(false);
    }
  };

  // Log activity notes/timeline
  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!timelineText.trim()) return;

    try {
      // Simulate endpoint email sending or timeline updates
      await salesService.sendEmails({
        contactId: account.contacts[0]?._id || id,
        subject: `Logged interaction: ${timelineType}`,
        body: timelineText
      });
      addToast('Interaction activity logged to timeline.', 'success');
      setTimelineText('');
      fetchAccountDetails();
    } catch (err) {
      // Fallback
      setAccount(prev => ({
        ...prev,
        timeline: [
          { _id: 'mock_' + Date.now(), type: timelineType, subject: timelineType, description: timelineText, createdAt: new Date() },
          ...(prev.timeline || [])
        ]
      }));
      setTimelineText('');
      addToast('Interaction logged (mock).', 'info');
    }
  };

  if (loading || !account) {
    return (
      <div className="flex justify-center items-center py-20 text-[#032D60]">
        <Clock className="w-8 h-8 animate-spin text-[#0176D3]" />
      </div>
    );
  }

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      {/* Page Navigation */}
      <button 
        onClick={() => navigate('/sales/accounts')}
        className="flex items-center gap-1 text-xs text-[#0176D3] hover:underline self-start font-bold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Accounts Command
      </button>

      <PageHeader 
        title={account.name}
        description={`360-Degree Profile showing related opportunities, cases, and historic interactions.`}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowContactModal(true)} variant="secondary" size="sm">
              + Contact
            </Button>
            <Button onClick={() => setShowOppModal(true)} variant="secondary" size="sm">
              + Opportunity
            </Button>
            <Button onClick={() => setShowCaseModal(true)} className="slds-btn-primary py-2 px-4 text-xs font-semibold">
              + Support Ticket
            </Button>
          </div>
        }
      />

      {/* ==========================================
          HIGHLIGHTS PANEL (2-Column Key Field Grid)
          ========================================== */}
      <div className="slds-highlights p-4 border border-[#E5E5E5] rounded flex flex-col gap-4 text-left shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
          Highlights Panel (Click values to edit, Enter/Save to commit changes)
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs items-center">
          {/* Col 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Account Name:</span>
              {editField === 'name' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('name')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-32"
                  />
                  <button onClick={() => handleSaveField('name')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('name', account.name)}
                  className="font-bold text-[#032D60] cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {account.name} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Account Type:</span>
              {editField === 'type' ? (
                <div className="flex items-center gap-1">
                  <select 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)}
                    className="border border-[#0176D3] px-1 py-0.5 rounded text-xs outline-none bg-white"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="Customer">Customer</option>
                    <option value="Partner">Partner</option>
                  </select>
                  <button onClick={() => handleSaveField('type')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('type', account.type)}
                  className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {account.type} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Annual Revenue:</span>
              {editField === 'annualRevenue' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('annualRevenue')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('annualRevenue')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('annualRevenue', account.annualRevenue)}
                  className="font-bold text-[#2E844A] cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  ${account.annualRevenue?.toLocaleString() || '0'} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Employees Count:</span>
              {editField === 'employeesCount' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('employeesCount')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-20"
                  />
                  <button onClick={() => handleSaveField('employeesCount')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('employeesCount', account.employeesCount)}
                  className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {account.employeesCount || '0'} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Territory Region:</span>
              {editField === 'region' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('region')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('region')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('region', account.region)}
                  className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {account.region || 'N/A'} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Industry vertical:</span>
              {editField === 'industry' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('industry')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('industry')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('industry', account.industry)}
                  className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {account.industry || 'N/A'} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* ==========================================
            LEFT/CENTER: RELATED LISTS ACCORDIONS
            ========================================== */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Related Contacts List */}
          <div className="bg-white border border-[#E5E5E5] rounded-md overflow-hidden">
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'contacts' ? '' : 'contacts')}
              className="w-full bg-slate-50 border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between font-bold text-xs"
            >
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0176D3]" />
                <span>Contacts ({account.contacts?.length || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowContactModal(true); }}
                  className="text-[#0176D3] hover:underline px-2 py-0.5 rounded text-[11px]"
                >
                  + New
                </button>
                {activeAccordion === 'contacts' ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {activeAccordion === 'contacts' && (
              <div className="p-3 space-y-2 text-xs">
                {(!account.contacts || account.contacts.length === 0) ? (
                  <span className="text-slate-400 italic block py-2 text-center">No contact representatives assigned.</span>
                ) : (
                  account.contacts.map((c, i) => (
                    <div key={i} className="p-3 border border-[#E5E5E5] rounded flex justify-between items-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#032D60]" onClick={() => navigate(`/sales/contacts/${c._id}`)}>
                          👤 {c.firstName} {c.lastName}
                        </span>
                        <span className="text-[10px] text-slate-500">{c.title || 'Representative'}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[10px] text-slate-650">
                        <span className="flex items-center gap-0.5"><Envelope className="w-3 h-3" /> {c.email}</span>
                        {c.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {c.phone}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Related Opportunities List */}
          <div className="bg-white border border-[#E5E5E5] rounded-md overflow-hidden">
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'opportunities' ? '' : 'opportunities')}
              className="w-full bg-slate-50 border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between font-bold text-xs"
            >
              <div className="flex items-center gap-1.5">
                <CurrencyDollar className="w-4 h-4 text-[#FE9339]" />
                <span>Opportunities ({account.opportunities?.length || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowOppModal(true); }}
                  className="text-[#0176D3] hover:underline px-2 py-0.5 rounded text-[11px]"
                >
                  + New
                </button>
                {activeAccordion === 'opportunities' ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {activeAccordion === 'opportunities' && (
              <div className="p-3 space-y-2 text-xs">
                {(!account.opportunities || account.opportunities.length === 0) ? (
                  <span className="text-slate-400 italic block py-2 text-center">No opportunities registered.</span>
                ) : (
                  account.opportunities.map((o, i) => (
                    <div key={i} className="p-3 border border-[#E5E5E5] rounded flex justify-between items-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#032D60]" onClick={() => navigate(`/sales/opportunities/${o._id}`)}>
                          💼 {o.name}
                        </span>
                        <span className="text-[10px] text-slate-500">Stage: {o.stage} ({o.probability}%)</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-[#2E844A]">${o.amount?.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400">Close: {new Date(o.closeDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Related Support Cases List */}
          <div className="bg-white border border-[#E5E5E5] rounded-md overflow-hidden">
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'cases' ? '' : 'cases')}
              className="w-full bg-slate-50 border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between font-bold text-xs"
            >
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#BA0517]" />
                <span>Support Cases ({account.cases?.length || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowCaseModal(true); }}
                  className="text-[#0176D3] hover:underline px-2 py-0.5 rounded text-[11px]"
                >
                  + New
                </button>
                {activeAccordion === 'cases' ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {activeAccordion === 'cases' && (
              <div className="p-3 space-y-2 text-xs">
                {(!account.cases || account.cases.length === 0) ? (
                  <span className="text-slate-400 italic block py-2 text-center">No open cases logged.</span>
                ) : (
                  account.cases.map((c, i) => (
                    <div key={i} className="p-3 border border-[#E5E5E5] rounded flex justify-between items-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#032D60]" onClick={() => navigate(`/sales/cases/${c._id}`)}>
                          ⚠️ {c.subject}
                        </span>
                        <span className="text-[10px] text-slate-500">Status: {c.status}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] rounded uppercase font-bold tracking-wider ${
                        c.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* ==========================================
            RIGHT COLUMN: REVERSE-CHRONO INTERACTION TIMELINE
            ========================================== */}
        <div className="flex flex-col gap-4">
          
          <div className="bg-white border border-[#E5E5E5] p-5 rounded-md flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0176D3]" />
              Activity Timeline interaction feed
            </h4>

            {/* Log customer interaction */}
            <form onSubmit={handleLogActivity} className="flex flex-col gap-2.5 bg-slate-55/30 p-3 border rounded border-[#E5E5E5]">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">LOG NEW INTERACTION</span>
                <select 
                  value={timelineType} 
                  onChange={e => setTimelineType(e.target.value)}
                  className="bg-transparent border border-slate-300 rounded outline-none p-0.5 text-slate-500"
                >
                  <option value="Note">📝 Note</option>
                  <option value="Call">📞 Call</option>
                  <option value="Meeting">🤝 Meeting</option>
                </select>
              </div>

              <textarea 
                placeholder="Log activity details or notes..."
                value={timelineText}
                onChange={e => setTimelineText(e.target.value)}
                className="w-full border border-slate-350 p-2 text-xs rounded outline-none h-16 resize-none bg-white"
                required
              />

              <Button type="submit" className="slds-btn-primary flex items-center justify-center gap-1 text-[11px] self-end py-1 px-3">
                <PaperPlaneTilt className="w-3.5 h-3.5" /> Log Interaction
              </Button>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pl-2 pr-1">
              {(!account.timeline || account.timeline.length === 0) ? (
                <span className="text-xs italic text-slate-400 block text-center py-4">No events logged in CRM.</span>
              ) : (
                account.timeline.map((act, idx) => (
                  <div key={idx} className="relative border-l border-slate-200 pl-4 pb-2 text-xs text-left">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#0176D3]" />
                    <div className="flex justify-between items-center font-bold text-[#032D60]">
                      <span>{act.subject || act.type}</span>
                      <span className="text-[8px] text-slate-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{act.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CREATE CONTACT RELATED LIST MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Create Related Contact</h3>
              <button onClick={() => setShowContactModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateContact} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={contactFirst} onChange={e => setContactFirst(e.target.value)} required />
                <Input label="Last Name" value={contactLast} onChange={e => setContactLast(e.target.value)} required />
              </div>
              <Input label="Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
              <Input label="Phone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowContactModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Save Contact</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showOppModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Create Related Opportunity</h3>
              <button onClick={() => setShowOppModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOpp} className="space-y-3">
              <Input label="Opportunity Name" value={oppName} onChange={e => setOppName(e.target.value)} required />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Pipeline Stage</label>
                <select 
                  value={oppStage} 
                  onChange={e => setOppStage(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                >
                  <option value="Prospecting">Prospecting (10%)</option>
                  <option value="Qualification">Qualification (20%)</option>
                  <option value="Needs Analysis">Needs Analysis (25%)</option>
                  <option value="Value Proposition">Value Proposition (50%)</option>
                  <option value="Proposal / Price Quote">Proposal / Price Quote (65%)</option>
                  <option value="Negotiation">Negotiation (75%)</option>
                </select>
              </div>
              <Input label="Deal Amount ($)" type="number" value={oppAmount} onChange={e => setOppAmount(e.target.value)} required />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowOppModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Save Opportunity</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CASE MODAL */}
      {showCaseModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Open Customer Support Case</h3>
              <button onClick={() => setShowCaseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <Input label="Case Subject" value={caseSubject} onChange={e => setCaseSubject(e.target.value)} required />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <textarea 
                  value={caseDesc} 
                  onChange={e => setCaseDesc(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none h-16 resize-none bg-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Case Severity</label>
                <select 
                  value={casePriority} 
                  onChange={e => setCasePriority(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowCaseModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Submit Case</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetail;
