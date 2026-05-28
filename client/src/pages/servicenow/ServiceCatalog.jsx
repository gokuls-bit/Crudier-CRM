import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ShoppingBag, Clock, ShieldCheck, ShoppingCart, Checklist } from '@phosphor-icons/react';

export const ServiceCatalog = () => {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Form data state
  const [formData, setFormData] = useState({});

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchItems();
    fetchRequests();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicenow/catalog');
      setItems(response.data?.data || []);
    } catch (err) {
      // Local mockup fallbacks
      setItems([
        {
          _id: 'cat_laptop',
          name: 'Developer Laptop Upgrade',
          description: 'Request a MacBook Pro M3 Max or high-spec ThinkPad for corporate software engineering workflows.',
          fields: [
            { name: 'Operating System', type: 'dropdown', options: ['macOS Sonoma', 'Ubuntu Linux', 'Windows 11 Pro'], required: true },
            { name: 'Justification', type: 'text', required: true }
          ],
          approverRole: 'Admin',
          sla: 24
        },
        {
          _id: 'cat_prod_db',
          name: 'CRM Database Production Access',
          description: 'Temporary database credentials for production troubleshooting operations.',
          fields: [
            { name: 'Access Duration', type: 'dropdown', options: ['1 Hour', '4 Hours', '24 Hours'], required: true }
          ],
          approverRole: 'Founder',
          sla: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/servicenow/catalog/requests');
      setRequests(response.data?.data || []);
    } catch (err) {
      // Fallback
      setRequests([
        { _id: 'req_201', itemName: 'Developer Laptop Upgrade', status: 'Pending', createdAt: new Date() }
      ]);
    }
  };

  const handleSelectItem = (item) => {
    setActiveItem(item);
    setFormData({});
  };

  const handleInputChange = (fieldName, val) => {
    setFormData(prev => ({ ...prev, [fieldName]: val }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        itemId: activeItem._id,
        formData
      };
      await api.post('/servicenow/catalog/request', payload);
      addToast('Service catalog request submitted successfully.', 'success');
      setActiveItem(null);
      fetchRequests();
    } catch (err) {
      addToast('Request submitted (mock).', 'info');
      setActiveItem(null);
      fetchRequests();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Service Catalog" 
        description="Request IT hardware, software licenses, or database access profiles with automated approval routing."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left pane: catalog directory items */}
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Procurement items</h3>
          
          <div className="flex flex-col gap-3">
            {loading ? (
              <span className="text-xs text-slate-400 italic py-4 block text-center">Loading catalog...</span>
            ) : (
              items.map((item) => (
                <div 
                  key={item._id} 
                  className="p-3 border border-[#E0E3E8] hover:border-[#00A9CE] rounded-lg text-xs flex flex-col justify-between gap-3 text-left transition-all hover:bg-slate-50/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#1C2945] font-Outfit">{item.name}</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed">{item.description}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t pt-2 mt-1">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3.5 h-3.5" /> SLA Target: {item.sla} hrs
                    </span>
                    <button 
                      onClick={() => handleSelectItem(item)}
                      className="text-xs text-[#00A9CE] hover:underline font-bold"
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center/Right pane: details or active order tracker */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full text-left">
          
          {/* Active catalog item form */}
          {activeItem ? (
            <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-5 shadow-sm">
              <div className="flex justify-between items-start border-b pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Service Catalog Item</span>
                  <h3 className="text-sm font-bold text-[#1C2945] font-Outfit">{activeItem.name}</h3>
                </div>
                
                <button 
                  onClick={() => setActiveItem(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Dynamic inputs form */}
              <form onSubmit={handleSubmitRequest} className="flex flex-col gap-4">
                {activeItem.fields?.map((f, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    {f.type === 'dropdown' ? (
                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-semibold text-slate-500">{f.name}</label>
                        <select
                          value={formData[f.name] || ''}
                          onChange={(e) => handleInputChange(f.name, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
                          required={f.required}
                        >
                          <option value="">Select option...</option>
                          {f.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <Input 
                        type="text"
                        label={f.name}
                        value={formData[f.name] || ''}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}

                <Button type="submit" isLoading={submitting} disabled={submitting} className="w-fit self-end px-5 py-2">
                  Submit Catalog Order
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-[#E0E3E8] p-12 rounded-xl flex flex-col items-center justify-center text-center text-slate-400 shadow-sm gap-2">
              <ShoppingCart className="w-10 h-10 text-slate-300" />
              <span>Select an item from the left directory to open a procurement order.</span>
            </div>
          )}

          {/* Catalog Request fulfillment tracker */}
          <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Checklist className="w-5 h-5 text-[#00A9CE]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order tracking & Fulfillment board</h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {requests.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No procurement requests submitted yet.</span>
              ) : (
                requests.map((r, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#F4F5F7]/50 border border-[#E0E3E8] rounded-lg text-xs text-left gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#1C2945]">{r.itemName || 'Catalog Procurement Order'}</span>
                      <span className="text-[9px] text-slate-400">Ordered: {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                        r.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ServiceCatalog;
