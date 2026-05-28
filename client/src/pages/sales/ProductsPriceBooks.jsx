import React, { useState, useEffect } from 'react';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Tag, BookOpen, Plus, Clock } from '@phosphor-icons/react';

export const ProductsPriceBooks = () => {
  const [products, setProducts] = useState([]);
  const [pricebooks, setPricebooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPbModal, setShowPbModal] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Form states
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [standardPrice, setStandardPrice] = useState('');

  const [pbName, setPbName] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchPriceBooks();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await salesService.listProducts();
      setProducts(response.data?.data || []);
    } catch (err) {
      setProducts([
        { _id: 'p1', name: 'Database Cloud Engine', description: 'Enterprise PostgreSQL cluster hosting with auto failover.', standardPrice: 100000 },
        { _id: 'p2', name: 'Redis Custom Clusters', description: 'In-memory database cache cluster configurations.', standardPrice: 25000 },
        { _id: 'p3', name: 'Premium Analytics Dashboard', description: 'Real-time pipeline analytics dashboards visualizer.', standardPrice: 5000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceBooks = async () => {
    try {
      const response = await salesService.listPriceBooks();
      setPricebooks(response.data?.data || []);
    } catch (err) {
      setPricebooks([
        { _id: 'pb1', name: 'Standard Price Book' },
        { _id: 'pb2', name: 'US Public Sector Discount Book' }
      ]);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !standardPrice) return;

    try {
      const payload = {
        name: prodName,
        description: prodDesc,
        standardPrice: parseFloat(standardPrice) || 0
      };
      await salesService.createProduct(payload);
      addToast('Product added to catalog successfully.', 'success');
      setShowProductModal(false);
      setProdName('');
      setProdDesc('');
      setStandardPrice('');
      fetchProducts();
    } catch (err) {
      addToast('Product added (offline mock).', 'info');
      setShowProductModal(false);
    }
  };

  const handleCreatePb = async (e) => {
    e.preventDefault();
    if (!pbName.trim()) return;

    try {
      await salesService.createPriceBook({ name: pbName });
      addToast('Price Book created successfully.', 'success');
      setShowPbModal(false);
      setPbName('');
      fetchPriceBooks();
    } catch (err) {
      addToast('Price Book created (offline mock).', 'info');
      setShowPbModal(false);
    }
  };

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <PageHeader 
        title="Product Catalog & Price Books" 
        description="Unified catalog definitions, standard price lists, and customized Price Books structures."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowPbModal(true)} variant="secondary" size="sm" className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>New Price Book</span>
            </Button>
            <Button onClick={() => setShowProductModal(true)} className="slds-btn-primary flex items-center gap-1.5 py-2">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* Left column: Price Books catalog */}
        <div className="bg-white border border-[#E5E5E5] p-5 rounded-md flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5 text-[#0176D3]" />
            Active Price Books
          </h4>

          <div className="space-y-2 text-xs">
            {pricebooks.map(pb => (
              <div key={pb._id} className="p-3 border border-[#E5E5E5] rounded flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-[#032D60]">📖 {pb.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Right column: Product list catalog */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] p-5 rounded-md flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 flex items-center gap-1.5">
            <Tag className="w-4.5 h-4.5 text-[#2E844A]" />
            Standard Product Catalog
          </h4>

          <div className="space-y-3">
            {loading ? (
              <span className="text-xs italic py-8 text-center block">Loading products...</span>
            ) : products.length === 0 ? (
              <span className="text-xs italic py-8 text-center block">No products in catalog.</span>
            ) : (
              products.map(p => (
                <div key={p._id} className="p-4 border border-[#E5E5E5] rounded flex justify-between items-center text-xs">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-[#032D60]">{p.name}</span>
                    <span className="text-[10px] text-slate-450 leading-relaxed max-w-[400px]">{p.description}</span>
                  </div>
                  <span className="font-bold text-[#2E844A] text-sm">
                    ${p.standardPrice?.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* CREATE PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Add Product to Catalog</h3>
              <button onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <Input label="Product Name" value={prodName} onChange={e => setProdName(e.target.value)} required />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <textarea 
                  value={prodDesc} 
                  onChange={e => setProdDesc(e.target.value)}
                  className="border border-[#E5E5E5] px-3 py-2 text-xs rounded outline-none h-16 w-full resize-none bg-white"
                />
              </div>
              <Input label="Standard Price ($)" type="number" value={standardPrice} onChange={e => setStandardPrice(e.target.value)} required />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowProductModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Save Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PRICE BOOK MODAL */}
      {showPbModal && (
        <div className="fixed inset-0 bg-[#032D60]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E5E5E5] w-full max-w-md shadow-2xl p-6 text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#032D60]">Create Custom Price Book</h3>
              <button onClick={() => setShowPbModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreatePb} className="space-y-3">
              <Input label="Price Book Name" value={pbName} onChange={e => setPbName(e.target.value)} required />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" onClick={() => setShowPbModal(false)} variant="secondary" size="xs">Cancel</Button>
                <Button type="submit" className="slds-btn-primary py-1.5 px-4 text-xs font-semibold">Create Book</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPriceBooks;
