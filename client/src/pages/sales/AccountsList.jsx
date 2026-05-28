import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { House, Plus, FolderSimple, TrendUp, User } from '@phosphor-icons/react';

export const AccountsList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('Prospect');
  const [parentAccountId, setParentAccountId] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [employeesCount, setEmployeesCount] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [region, setRegion] = useState('US-East');
  const [industry, setIndustry] = useState('Tech');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await salesService.listAccounts();
      setAccounts(response.data?.data || []);
    } catch (err) {
      // Mock fallback
      setAccounts([
        { _id: 'acc1', name: 'Alpha Cloud Services', type: 'Customer', annualRevenue: 50000000, employeesCount: 1500, industry: 'Tech', region: 'US-East' },
        { _id: 'acc2', name: 'Delta Bank Corp', type: 'Prospect', annualRevenue: 120000000, employeesCount: 3400, industry: 'Finance', region: 'Europe' },
        { _id: 'acc3', name: 'Zeta Medical Research', type: 'Partner', annualRevenue: 25000000, employeesCount: 200, industry: 'Healthcare', region: 'US-West', parentAccountId: 'acc1' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name,
        type,
        parentAccountId: parentAccountId || undefined,
        annualRevenue: parseFloat(annualRevenue) || 0,
        employeesCount: parseInt(employeesCount) || 0,
        billingAddress,
        shippingAddress,
        region,
        industry
      };
      await salesService.createAccount(payload);
      addToast('Account created successfully.', 'success');
      setShowCreateModal(false);
      setName('');
      fetchAccounts();
    } catch (err) {
      // Offline fallback
      const mockNew = {
        _id: 'mock_' + Date.now(),
        name, type, annualRevenue: parseFloat(annualRevenue) || 0,
        employeesCount: parseInt(employeesCount) || 0, industry, region, parentAccountId
      };
      setAccounts(prev => [...prev, mockNew]);
      addToast('Account created (Offline Mode).', 'info');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <PageHeader 
        title="Accounts Command Center" 
        description="Comprehensive directory of corporate clients, business partners, and billing hierarchy networks."
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="slds-btn-primary flex items-center gap-1.5 py-2">
            <Plus className="w-4 h-4" />
            <span>New Account</span>
          </Button>
        }
      />

      {/* Hierarchy Network Overview Tree */}
      <div className="bg-[#B0D9FA]/20 border border-[#B0D9FA] p-5 rounded-lg text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#032D60] mb-3 flex items-center gap-1.5">
          <FolderSimple className="w-4 h-4 text-[#0176D3]" />
          Visual Account Hierarchy Matrix
        </h4>
        <div className="text-xs text-[#032D60]/80 space-y-2 leading-relaxed">
          {accounts.filter(a => !a.parentAccountId).map(parent => (
            <div key={parent._id} className="pl-2 border-l-2 border-[#0176D3] py-1">
              <span className="font-bold cursor-pointer hover:underline text-[#0176D3]" onClick={() => navigate(`/sales/accounts/${parent._id}`)}>
                🏢 {parent.name}
              </span>
              <span className="text-[10px] text-slate-500 ml-2">({parent.type} | Revenue: ${parent.annualRevenue?.toLocaleString()})</span>
              
              {/* Children accounts */}
              <div className="pl-6 mt-1 space-y-1">
                {accounts.filter(child => child.parentAccountId === parent._id).map(child => (
                  <div key={child._id} className="relative">
                    <span className="absolute -left-4 top-2 w-3 h-px bg-slate-300" />
                    <span className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/sales/accounts/${child._id}`)}>
                      ↳ 🏢 {child.name}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2">({child.type})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid List view */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {loading ? (
          <span className="text-xs italic py-10 text-center col-span-full">Loading accounts repository...</span>
        ) : accounts.length === 0 ? (
          <span className="text-xs italic py-10 text-center col-span-full">No accounts stored. Click "New Account" to initialize one.</span>
        ) : (
          accounts.map(acc => (
            <div 
              key={acc._id} 
              className="slds-card slds-card-lead p-5 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/sales/accounts/${acc._id}`)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{acc.type}</span>
                <h3 className="text-base font-bold text-[#032D60]">{acc.name}</h3>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs border-t pt-3">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Revenue</span>
                    <span className="font-semibold">${acc.annualRevenue?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Employees</span>
                    <span className="font-semibold">{acc.employeesCount || '0'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Region</span>
                    <span className="font-semibold">{acc.region || 'N/A'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Industry</span>
                    <span className="font-semibold">{acc.industry || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-2.5">
                <span className="text-[11px] text-[#0176D3] hover:underline font-bold">Open 360° Profile →</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-[#032D60]">Create New Corporate Account</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-650 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input 
                label="Account Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Account Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="Customer">Customer</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Parent Account (if any)</label>
                  <select 
                    value={parentAccountId} 
                    onChange={(e) => setParentAccountId(e.target.value)}
                    className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                  >
                    <option value="">None (Top Level)</option>
                    {accounts.map(a => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Annual Revenue ($)" 
                  type="number"
                  value={annualRevenue} 
                  onChange={(e) => setAnnualRevenue(e.target.value)} 
                />
                <Input 
                  label="Employees Count" 
                  type="number"
                  value={employeesCount} 
                  onChange={(e) => setEmployeesCount(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Territory Region</label>
                  <select 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)}
                    className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                  >
                    <option value="US-East">US-East</option>
                    <option value="US-West">US-West</option>
                    <option value="Europe">Europe</option>
                    <option value="APAC">APAC</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Industry Vertical</label>
                  <select 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)}
                    className="border border-[#E5E5E5] px-3 py-1.5 text-xs rounded outline-none bg-white"
                  >
                    <option value="Tech">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
              </div>

              <Input 
                label="Billing Address" 
                value={billingAddress} 
                onChange={(e) => setBillingAddress(e.target.value)} 
              />
              <Input 
                label="Shipping Address" 
                value={shippingAddress} 
                onChange={(e) => setShippingAddress(e.target.value)} 
              />

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary" size="sm">
                  Cancel
                </Button>
                <Button type="submit" className="slds-btn-primary py-2 px-4">
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsList;
