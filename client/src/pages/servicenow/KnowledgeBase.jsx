import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { BookOpen, FolderSimple, Eye, ThumbsUp, Plus, PencilSimple } from '@phosphor-icons/react';

export const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Article state
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('IT Operations');
  const [restrictedRoles, setRestrictedRoles] = useState([]);

  const addToast = useToastStore((state) => state.addToast);

  const availableRoles = ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicenow/knowledge');
      const data = response.data?.data || [];
      setArticles(data);
      
      // Extract unique categories
      const uniqueCats = ['All', ...new Set(data.map(a => a.category))];
      setCategories(uniqueCats);
    } catch (err) {
      // Mock fallbacks
      const mockArticles = [
        { _id: '1', title: 'Setting up Multi-Factor Authentication (2FA)', slug: 'setup-mfa', category: 'Security', content: 'Follow this guide to enable 2FA on your account settings...', views: 45, helpful: 12, unhelpful: 0, restrictedRoles: [] },
        { _id: '2', title: 'Emergency P1 Incident Gating Procedures', slug: 'p1-incidents', category: 'Support Operations', content: 'A P1 incident represents a critical service outage...', views: 28, helpful: 8, unhelpful: 1, restrictedRoles: [] }
      ];
      setArticles(mockArticles);
      setCategories(['All', 'Security', 'Support Operations']);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast('Title and content are required.', 'error');
      return;
    }

    setCreating(true);
    try {
      const payload = { title, content, category, restrictedRoles };
      await api.post('/servicenow/knowledge', payload);
      addToast('Knowledge article authored successfully.', 'success');
      setTitle('');
      setContent('');
      fetchArticles();
    } catch (err) {
      addToast('Failed to author knowledge article.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = (role) => {
    if (restrictedRoles.includes(role)) {
      setRestrictedRoles(restrictedRoles.filter(r => r !== role));
    } else {
      setRestrictedRoles([...restrictedRoles, role]);
    }
  };

  // Filtered articles
  const filteredArticles = articles.filter(a => {
    const matchCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchQuery = !searchQuery || 
                       a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Knowledge Base (KB)" 
        description="Browse help articles, operations guidelines, system policies, and submit helpful feedback reviews."
      />

      {/* Full-text search filters */}
      <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl shadow-sm text-left">
        <Input 
          type="text"
          placeholder="Search article titles, keywords, category logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left pane: Category Tree Folder List */}
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">KB Categories</h3>
          
          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs transition-all flex items-center gap-2 ${
                  selectedCategory === cat 
                    ? 'bg-[#00A9CE]/10 text-[#00A9CE] font-bold border-l-2 border-[#00A9CE]' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FolderSimple className="w-4 h-4 shrink-0" />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center pane: Articles list */}
        <div className="lg:col-span-2 bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
            Articles in: {selectedCategory} ({filteredArticles.length})
          </h3>

          <div className="flex flex-col gap-3">
            {loading ? (
              <span className="text-xs text-slate-400 italic py-4 block text-center">Loading articles...</span>
            ) : filteredArticles.length === 0 ? (
              <span className="text-xs text-slate-400 italic py-4 block text-center">No articles found in this category.</span>
            ) : (
              filteredArticles.map((art) => (
                <div key={art._id} className="p-4 bg-[#F4F5F7]/30 border border-[#E0E3E8] hover:border-[#00A9CE] transition-all rounded-xl flex justify-between items-center text-left gap-4">
                  <div className="flex flex-col gap-1">
                    <Link 
                      to={`/knowledge/${art.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${art.slug}`}
                      className="font-bold text-[#1C2945] hover:text-[#00A9CE] hover:underline font-Outfit"
                    >
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{art.category}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {art.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                      {art.helpful || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right pane: Author Article form */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <div className="flex items-center gap-1.5 border-b pb-2">
            <PencilSimple className="w-4 h-4 text-[#00A9CE]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Author KB Article</h3>
          </div>

          <form onSubmit={handleCreateArticle} className="flex flex-col gap-4">
            <Input 
              type="text"
              label="Article Title"
              placeholder="How to connect with Microsoft OAuth..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input 
              type="text"
              label="Category Folder"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1 w-full text-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Article Content (HTML)</label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<p>Enter help guide content here...</p>"
                className="w-full p-2 text-xs border border-[#E0E3E8] rounded bg-[#F4F5F7] focus:bg-white focus:border-[#00A9CE] outline-none font-mono"
                required
              />
            </div>

            {/* Role restriction toggles */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Restrict to Roles</label>
              <div className="flex flex-wrap gap-1.5">
                {availableRoles.map(role => {
                  const active = restrictedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleToggleRole(role)}
                      className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                        active 
                          ? 'bg-[#1C2945] text-white border-transparent' 
                          : 'bg-slate-50 text-slate-500 border-[#E0E3E8]'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" isLoading={creating} disabled={creating} className="w-full mt-2 bg-[#1C2945] text-white">
              Publish Article
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default KnowledgeBase;
