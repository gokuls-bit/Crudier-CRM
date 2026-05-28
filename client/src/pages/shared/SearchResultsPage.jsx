import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../config/api.config';
import PageHeader from '../../components/layout/PageHeader';
import { MagnifyingGlass, FileText, User, Calendar, Warning, BookOpen, CheckSquare } from '@phosphor-icons/react';

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({
    tasks: [],
    leads: [],
    members: [],
    notes: [],
    meetings: [],
    knowledge: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Hit a global unified search endpoint or gather from local lists
      // For this spec, we hit a mock search resolver or request each endpoint
      // We will perform a backend unified search request `/api/v1/servicenow/search?q=query`
      const response = await api.get(`/servicenow/search?q=${encodeURIComponent(query)}`);
      setResults(response.data?.data || {});
    } catch (err) {
      // Mock search results on failure/offline fallback
      const q = query.toLowerCase();
      setResults({
        tasks: [
          { _id: '1', title: 'Verify server logs', priority: 'High', status: 'In Progress' },
          { _id: '2', title: 'Upgrade auth framework to Clerk', priority: 'Critical', status: 'Approved' }
        ].filter(t => t.title.toLowerCase().includes(q)),
        leads: [
          { _id: '1', name: 'John Miller', company: 'Acme Corp', email: 'john@acme.com' }
        ].filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q)),
        members: [
          { _id: '1', name: 'Developer Alice', role: 'Developer' }
        ].filter(m => m.name.toLowerCase().includes(q)),
        notes: [
          { _id: '1', title: 'CAB Meeting agenda notes' }
        ].filter(n => n.title.toLowerCase().includes(q)),
        meetings: [
          { _id: '1', title: 'Weekly Scrum Sync', date: '2026-06-02' }
        ].filter(m => m.title.toLowerCase().includes(q)),
        knowledge: [
          { _id: '1', title: 'How to setup Multi-Factor Authentication', category: 'Security' },
          { _id: '2', title: 'ServiceNow Incident Guidelines', category: 'Support' }
        ].filter(k => k.title.toLowerCase().includes(k) || k.category.toLowerCase().includes(q)),
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultsCount = (tab) => {
    if (tab === 'all') {
      return Object.values(results).reduce((acc, curr) => acc + (curr?.length || 0), 0);
    }
    return results[tab]?.length || 0;
  };

  const tabs = [
    { id: 'all', label: 'All Results' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'leads', label: 'Leads', icon: User },
    { id: 'members', label: 'Members', icon: User },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl py-4 text-[#1C2945]">
      <PageHeader 
        title={`Search Results for: "${query}"`}
        description="Unified global lookup across tasks, leads, knowledge bases, and meetings."
      />

      {/* Type-Filtered Tabs */}
      <div className="flex border-b border-[#E0E3E8] overflow-x-auto bg-white p-1 rounded-t-md shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = getResultsCount(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#00A9CE] text-[#00A9CE]' 
                  : 'border-transparent text-slate-500 hover:text-[#1C2945]'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Workspace */}
      <div className="bg-white border border-[#E0E3E8] rounded-b-md p-6 shadow-sm min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <MagnifyingGlass className="w-8 h-8 animate-spin text-[#00A9CE]" />
          </div>
        ) : getResultsCount(activeTab) === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-2">
            <MagnifyingGlass className="w-10 h-10 text-slate-300" />
            <h4 className="text-sm font-bold">No results found</h4>
            <p className="text-xs text-slate-500">Try checking your spelling or searching for a different keyword.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Tasks section */}
            {(activeTab === 'all' || activeTab === 'tasks') && results.tasks?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Tasks</h4>
                <div className="flex flex-col gap-2">
                  {results.tasks.map((t) => (
                    <div key={t._id} className="flex justify-between items-center p-3 hover:bg-[#F4F5F7] rounded border border-[#E0E3E8] text-xs">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-[#1C2945]">{t.title}</span>
                        <span className="text-[10px] text-slate-500">Status: {t.status}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads section */}
            {(activeTab === 'all' || activeTab === 'leads') && results.leads?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Leads</h4>
                <div className="flex flex-col gap-2">
                  {results.leads.map((l) => (
                    <div key={l._id} className="flex justify-between items-center p-3 hover:bg-[#F4F5F7] rounded border border-[#E0E3E8] text-xs text-left">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1C2945]">{l.name}</span>
                        <span className="text-[10px] text-slate-500">{l.company} — {l.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members section */}
            {(activeTab === 'all' || activeTab === 'members') && results.members?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Workspace Members</h4>
                <div className="flex flex-col gap-2">
                  {results.members.map((m) => (
                    <div key={m._id} className="flex justify-between items-center p-3 hover:bg-[#F4F5F7] rounded border border-[#E0E3E8] text-xs text-left">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1C2945]">{m.name}</span>
                        <span className="text-[10px] text-slate-500">Role: {m.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes section */}
            {(activeTab === 'all' || activeTab === 'notes') && results.notes?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Notes</h4>
                <div className="flex flex-col gap-2">
                  {results.notes.map((n) => (
                    <div key={n._id} className="flex justify-between items-center p-3 hover:bg-[#F4F5F7] rounded border border-[#E0E3E8] text-xs text-left">
                      <span className="font-bold text-[#1C2945]">{n.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meetings section */}
            {(activeTab === 'all' || activeTab === 'meetings') && results.meetings?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Meetings</h4>
                <div className="flex flex-col gap-2">
                  {results.meetings.map((m) => (
                    <div key={m._id} className="flex justify-between items-center p-3 hover:bg-[#F4F5F7] rounded border border-[#E0E3E8] text-xs text-left">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1C2945]">{m.title}</span>
                        <span className="text-[10px] text-slate-500">Scheduled: {m.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge section */}
            {(activeTab === 'all' || activeTab === 'knowledge') && results.knowledge?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">Knowledge Articles</h4>
                <div className="flex flex-col gap-2">
                  {results.knowledge.map((k) => (
                    <div key={k._id} className="flex justify-between items-center p-3 hover:bg-[#F4F5F7] rounded border border-[#E0E3E8] text-xs text-left">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1C2945]">{k.title}</span>
                        <span className="text-[10px] text-slate-500">Category: {k.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
