import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  ArrowLeft, Clock, CurrencyDollar, Calendar, Tag, Plus, 
  Trash, FilePdf, ShieldWarning, PencilLine 
} from '@phosphor-icons/react';

const STAGES = [
  'Prospecting',
  'Qualification',
  'Needs Analysis',
  'Value Proposition',
  'Proposal / Price Quote',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Line item form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customPrice, setCustomPrice] = useState('');
  const [discount, setDiscount] = useState('0');

  // Competitor inputs
  const [competitorText, setCompetitorText] = useState('');

  // Inline edit state
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchOpportunityDetails();
    fetchProductCatalog();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    setLoading(true);
    try {
      const response = await salesService.getOpportunity(id);
      setOpp(response.data?.data);
    } catch (err) {
      setOpp({
        _id: id,
        name: 'Alpha Server Deal',
        amount: 250000,
        stage: 'Negotiation',
        probability: 75,
        closeDate: new Date(),
        competitors: ['Amazon Web Services', 'Google Cloud Platform'],
        products: [
          { lineItemId: 'l1', productId: 'p1', name: 'Database Cloud Engine', quantity: 2, unitPrice: 100000, discount: 10 }
        ],
        account: { name: 'Alpha Cloud Services' }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCatalog = async () => {
    try {
      const response = await salesService.listProducts();
      setProducts(response.data?.data || []);
    } catch (err) {
      setProducts([
        { _id: 'p1', name: 'Database Cloud Engine', standardPrice: 100000 },
        { _id: 'p2', name: 'Redis Custom Clusters', standardPrice: 25000 },
        { _id: 'p3', name: 'Premium Analytics Dashboard', standardPrice: 5000 }
      ]);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      await salesService.updateOpportunity(id, { stage: newStage });
      addToast(`Opportunity stage updated to: ${newStage}`, 'success');
      fetchOpportunityDetails();
    } catch (err) {
      // Mock update
      const rules = {
        'Prospecting': 10, 'Qualification': 20, 'Needs Analysis': 25,
        'Value Proposition': 50, 'Proposal / Price Quote': 65,
        'Negotiation': 75, 'Closed Won': 100, 'Closed Lost': 0
      };
      setOpp(prev => ({ ...prev, stage: newStage, probability: rules[newStage] }));
      addToast('Stage updated (mock).', 'info');
    }
  };

  const handleSaveField = async (field) => {
    try {
      const payload = { [field]: editValue };
      if (field === 'amount') payload[field] = parseFloat(editValue) || 0;
      await salesService.updateOpportunity(id, payload);
      addToast('Opportunity updated.', 'success');
      setEditField(null);
      fetchOpportunityDetails();
    } catch (err) {
      setOpp(prev => ({ ...prev, [field]: editValue }));
      setEditField(null);
      addToast('Updated inline (mock).', 'info');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p._id === selectedProductId);
    if (!prod) return;

    try {
      const payload = {
        productId: prod._id,
        name: prod.name,
        quantity: parseInt(quantity) || 1,
        unitPrice: parseFloat(customPrice) || prod.standardPrice,
        discount: parseFloat(discount) || 0
      };
      await salesService.addOpportunityProduct(id, payload);
      addToast('Product added to opportunity line items.', 'success');
      setShowProductModal(false);
      fetchOpportunityDetails();
    } catch (err) {
      // Offline fallback
      const mockItem = {
        lineItemId: 'mock_' + Date.now(),
        productId: prod._id,
        name: prod.name,
        quantity: parseInt(quantity) || 1,
        unitPrice: parseFloat(customPrice) || prod.standardPrice,
        discount: parseFloat(discount) || 0
      };
      setOpp(prev => {
        const list = [...(prev.products || []), mockItem];
        let total = 0;
        list.forEach(p => {
          total += p.quantity * p.unitPrice * (1 - p.discount / 100);
        });
        return { ...prev, products: list, amount: total };
      });
      setShowProductModal(false);
      addToast('Product added (mock).', 'info');
    }
  };

  const handleRemoveProduct = async (lineItemId) => {
    try {
      await salesService.removeOpportunityProduct(id, lineItemId);
      addToast('Product line item removed.', 'success');
      fetchOpportunityDetails();
    } catch (err) {
      setOpp(prev => {
        const list = (prev.products || []).filter(p => p.lineItemId !== lineItemId);
        let total = 0;
        list.forEach(p => {
          total += p.quantity * p.unitPrice * (1 - p.discount / 100);
        });
        return { ...prev, products: list, amount: total };
      });
      addToast('Product line removed (mock).', 'info');
    }
  };

  const handleAddCompetitor = async (e) => {
    e.preventDefault();
    if (!competitorText.trim()) return;

    const list = [...(opp.competitors || []), competitorText.trim()];
    try {
      await salesService.updateOpportunity(id, { competitors: list });
      fetchOpportunityDetails();
      setCompetitorText('');
      addToast('Competitor catalog logged.', 'success');
    } catch (err) {
      setOpp(prev => ({ ...prev, competitors: list }));
      setCompetitorText('');
    }
  };

  if (loading || !opp) {
    return (
      <div className="flex justify-center items-center py-20 text-[#032D60]">
        <Clock className="w-8 h-8 animate-spin text-[#0176D3]" />
      </div>
    );
  }

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <button 
        onClick={() => navigate('/sales/opportunities')}
        className="flex items-center gap-1 text-xs text-[#0176D3] hover:underline self-start font-bold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Opportunity Pipeline
      </button>

      {/* STAGE PATH INDICATOR RAIL */}
      <div className="bg-white border border-[#E5E5E5] p-3.5 rounded flex flex-col gap-2 shadow-sm text-left">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opportunity Deal Stage Path</span>
        
        <div className="flex items-center w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
          {STAGES.map((s, idx) => {
            const isActive = opp.stage === s;
            const activeIdx = STAGES.indexOf(opp.stage);
            const isCompleted = STAGES.indexOf(s) < activeIdx;
            
            return (
              <button
                key={s}
                onClick={() => handleStageChange(s)}
                className={`flex-1 py-2 text-[10px] font-bold transition-all relative outline-none text-center ${
                  isActive 
                    ? 'bg-[#0176D3] text-white' 
                    : isCompleted 
                      ? 'bg-[#B0D9FA] text-[#032D60] hover:bg-[#B0D9FA]/80' 
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                } border-r last:border-r-0`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <PageHeader 
        title={opp.name}
        description={`Linked corporate client: ${opp.account?.name || 'Standalone Opportunity'}`}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowQuoteModal(true)} variant="secondary" size="sm" className="flex items-center gap-1">
              <FilePdf className="w-4 h-4 text-rose-700" /> Generate Quote sheet
            </Button>
            <Button onClick={() => setShowProductModal(true)} className="slds-btn-primary flex items-center gap-1.5 py-2">
              <Plus className="w-4 h-4" /> Add Products
            </Button>
          </div>
        }
      />

      {/* Highlights Panel */}
      <div className="slds-highlights p-4 border border-[#E5E5E5] rounded flex flex-col gap-4 text-left shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
          Highlights Panel (Click values to edit inline)
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Deal Amount:</span>
              {editField === 'amount' ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSaveField('amount')}
                    className="border border-[#0176D3] px-2 py-0.5 rounded text-xs outline-none bg-white w-24"
                  />
                  <button onClick={() => handleSaveField('amount')} className="text-emerald-600 font-bold">✓</button>
                  <button onClick={() => setEditField(null)} className="text-rose-600 font-bold">✕</button>
                </div>
              ) : (
                <span 
                  onClick={() => handleStartEdit('amount', opp.amount)}
                  className="font-bold text-[#2E844A] cursor-pointer hover:bg-slate-200 px-2 py-0.5 rounded"
                >
                  ${opp.amount?.toLocaleString()} <PencilLine className="w-3 h-3 text-slate-400 inline" />
                </span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Close Date:</span>
              <span className="font-semibold text-slate-700">
                {new Date(opp.closeDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Deal Stage:</span>
              <span className="font-bold text-[#0176D3]">{opp.stage}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Probability:</span>
              <span className="font-semibold text-slate-750">{opp.probability}% Weighted</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Forecast Category:</span>
              <span className="font-bold text-slate-700">{opp.forecastCategory || 'Pipeline'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Account:</span>
              <span className="font-semibold text-slate-700">{opp.account?.name || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        {/* Related list: Opportunity products sub-list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          <div className="bg-white border border-[#E5E5E5] rounded p-5">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#0176D3]" />
                Opportunity Line Items (Products)
              </h4>
              <button 
                onClick={() => setShowProductModal(true)}
                className="text-xs text-[#0176D3] font-bold hover:underline"
              >
                + Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {(!opp.products || opp.products.length === 0) ? (
                <span className="text-xs italic text-slate-400 block text-center py-4">No products linked to opportunity. Add products to configure deal size.</span>
              ) : (
                opp.products.map((item, idx) => (
                  <div key={idx} className="p-3.5 border border-[#E5E5E5] rounded flex justify-between items-center text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#032D60]">{item.name}</span>
                      <span className="text-[10px] text-slate-450">
                        Qty: {item.quantity} x ${item.unitPrice?.toLocaleString()} 
                        {item.discount > 0 && ` (Discount: ${item.discount}%)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#2E844A]">
                        ${(item.quantity * item.unitPrice * (1 - item.discount / 100)).toLocaleString()}
                      </span>
                      <button 
                        onClick={() => handleRemoveProduct(item.lineItemId)}
                        className="text-rose-600 hover:text-rose-800"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Competitor sub-list */}
        <div className="bg-white border border-[#E5E5E5] rounded p-5 flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
            <ShieldWarning className="w-4 h-4 text-[#FE9339]" />
            Competitors Intelligence
          </h4>

          <form onSubmit={handleAddCompetitor} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Competitor company..."
              value={competitorText}
              onChange={e => setCompetitorText(e.target.value)}
              className="border border-[#E5E5E5] px-2.5 py-1 text-xs rounded outline-none w-full bg-slate-50"
            />
            <Button type="submit" variant="secondary" size="xs" className="py-1">Log</Button>
          </form>

          <div className="space-y-1.5 text-xs">
            {(!opp.competitors || opp.competitors.length === 0) ? (
              <span className="text-[10px] italic text-slate-400 block text-center py-2">No competing bids logged.</span>
            ) : (
              opp.competitors.map((comp, i) => (
                <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <span>🏢 {comp}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ADD PRODUCT LINE ITEM MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Add Opportunity Line Item</h3>
              <button onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Pick Product</label>
                <select 
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find(p => p._id === e.target.value);
                    if (prod) {
                      setCustomPrice(prod.standardPrice);
                    }
                  }}
                  className="w-full border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none bg-white"
                  required
                >
                  <option value="">Select product catalog...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (${p.standardPrice?.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                <Input label="Custom Price" type="number" value={customPrice} onChange={e => setCustomPrice(e.target.value)} />
                <Input label="Discount (%)" type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowProductModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Add Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE QUOTE MODAL SHEET */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-[#032D60]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-2xl shadow-2xl p-8 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Printable Quote Preview</span>
              <button onClick={() => setShowQuoteModal(false)} className="text-slate-500 hover:text-slate-800 font-bold">✕ Close</button>
            </div>

            {/* Printable Area */}
            <div className="p-6 border rounded bg-[#FCFCFC] font-serif text-[#032D60] space-y-6" id="quote-print-area">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold font-sans text-[#0176D3] uppercase tracking-wider">SALESFORCE QUOTE</h2>
                  <span className="text-[10px] font-sans text-slate-400">Generated: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="text-right text-[10px] font-sans text-slate-500">
                  <span className="font-bold text-[#032D60] block">Crudier CRM Corp</span>
                  <span>100 Technology Boulevard</span>
                  <span>San Francisco, CA 94105</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">PREPARED FOR</span>
                  <span className="font-bold text-sm block mt-0.5">{opp.account?.name || 'Corporate Client'}</span>
                  <span className="text-slate-500">Subject deal: {opp.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">QUOTE DETAILS</span>
                  <span className="font-bold block mt-0.5">Reference ID: QT-{opp._id?.toString().slice(-6).toUpperCase()}</span>
                  <span className="text-slate-500">Close Date Target: {new Date(opp.closeDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs font-sans border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100 border-b text-[10px] text-slate-450 uppercase font-bold">
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Discount</th>
                    <th className="py-2 px-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(!opp.products || opp.products.length === 0) ? (
                    <tr>
                      <td colSpan="5" className="py-4 text-center italic text-slate-400">No line items configured.</td>
                    </tr>
                  ) : (
                    opp.products.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                        <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">${item.unitPrice?.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#2E844A]">
                          ${(item.quantity * item.unitPrice * (1 - item.discount / 100)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex justify-end pt-4 border-t font-sans">
                <div className="w-48 text-xs space-y-1.5">
                  <div className="flex justify-between border-b pb-1 text-slate-450">
                    <span>Subtotal:</span>
                    <span>${opp.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#032D60]">
                    <span>Total Bid:</span>
                    <span>${opp.amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => window.print()} className="slds-btn-primary py-2 px-5 flex items-center gap-1">
                ✕ Print Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetail;
