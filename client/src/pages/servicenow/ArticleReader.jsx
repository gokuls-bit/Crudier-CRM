import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { ArrowLeft, BookOpen, ThumbsUp, ThumbsDown, Eye, Clock, GitDiff } from '@phosphor-icons/react';

export const ArticleReader = () => {
  const { cat, slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Version diff states
  const [diffMode, setDiffMode] = useState(false);
  const [selectedOldVersion, setSelectedOldVersion] = useState(null);

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/servicenow/knowledge/${slug}`);
      setArticle(response.data?.data);
    } catch (err) {
      // Mock fallbacks
      const mockArticle = {
        _id: 'kb_1',
        title: 'Setting up Multi-Factor Authentication (2FA)',
        category: 'Security',
        content: `
          <p>Multi-factor authentication (MFA) adds an extra layer of protection on top of your standard login credentials.</p>
          <h3>How to Setup:</h3>
          <ol>
            <li>Go to the User Menu dropdown and select <strong>Security Settings</strong>.</li>
            <li>Click <strong>Configure 2FA</strong> to initialize.</li>
            <li>Scan the generated QR Code with an Authenticator app (e.g., Authy, Google Authenticator).</li>
            <li>Input the 6-digit confirmation code and click Verify to enable.</li>
          </ol>
        `,
        version: 2,
        views: 45,
        helpful: 12,
        unhelpful: 0,
        history: [
          { version: 1, content: '<p>MFA setup details are pending documentation draft.</p>', updatedAt: new Date(Date.now() - 86400000) }
        ]
      };
      setArticle(mockArticle);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isHelpful) => {
    if (feedbackSent) return;
    try {
      await api.post(`/servicenow/knowledge/${article._id}/rate`, { helpful: isHelpful });
      addToast('Thank you for your feedback.', 'success');
      setFeedbackSent(true);
      setArticle(prev => ({
        ...prev,
        helpful: isHelpful ? (prev.helpful || 0) + 1 : prev.helpful,
        unhelpful: !isHelpful ? (prev.unhelpful || 0) + 1 : prev.unhelpful
      }));
    } catch (err) {
      // Offline fallback
      setFeedbackSent(true);
      addToast('Feedback submitted (mock).', 'info');
    }
  };

  const triggerDiff = (hist) => {
    setSelectedOldVersion(hist);
    setDiffMode(true);
  };

  if (loading || !article) {
    return (
      <div className="flex items-center justify-center py-20 text-[#1C2945]">
        <Clock className="w-8 h-8 animate-spin text-[#00A9CE]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      
      {/* Navigation back */}
      <button 
        onClick={() => navigate('/knowledge')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1C2945] font-bold self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to directories explorer</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left/Center pane: Article display */}
        <div className="lg:col-span-2 bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-5 shadow-sm text-left">
          
          <div className="flex justify-between items-start border-b pb-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{article.category}</span>
              <h3 className="text-base font-bold text-[#1C2945] font-Outfit">{article.title}</h3>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="bg-[#00A9CE]/10 text-[#00A9CE] border border-[#00A9CE]/20 px-2 py-0.5 rounded text-[10px] font-bold">
                Version {article.version}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views} views
              </span>
            </div>
          </div>

          {/* Diff View Overlay or Standard content */}
          {diffMode && selectedOldVersion ? (
            <div className="flex flex-col gap-4 bg-rose-50/20 border border-rose-200 p-4 rounded-xl">
              <div className="flex justify-between items-center text-xs font-bold text-rose-800">
                <span className="flex items-center gap-1">
                  <GitCompare className="w-4 h-4" /> Compare: Current (V{article.version}) vs Older (V{selectedOldVersion.version})
                </span>
                <button 
                  onClick={() => setDiffMode(false)}
                  className="text-slate-500 hover:underline hover:text-slate-700"
                >
                  Close Diff
                </button>
              </div>

              {/* Simple side-by-side diff renderer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif leading-relaxed">
                <div className="border p-3 bg-slate-50 rounded">
                  <div className="font-bold border-b pb-1 font-Outfit mb-2">Older Version (V{selectedOldVersion.version})</div>
                  <div dangerouslySetInnerHTML={{ __html: selectedOldVersion.content }} />
                </div>
                <div className="border p-3 bg-emerald-50/10 border-emerald-200 rounded">
                  <div className="font-bold border-b pb-1 font-Outfit mb-2">Current Version (V{article.version})</div>
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="text-xs font-serif leading-relaxed text-slate-700 space-y-3 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}

          {/* Feedback buttons */}
          <div className="flex flex-col gap-3 border-t pt-4 items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Was this article helpful?</span>
            
            <div className="flex gap-4">
              <button
                disabled={feedbackSent}
                onClick={() => handleFeedback(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  feedbackSent 
                    ? 'bg-slate-50 text-slate-400 border-slate-200' 
                    : 'border-[#E0E3E8] text-[#1C2945] hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span>Yes ({article.helpful || 0})</span>
              </button>

              <button
                disabled={feedbackSent}
                onClick={() => handleFeedback(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  feedbackSent 
                    ? 'bg-slate-50 text-slate-400 border-slate-200' 
                    : 'border-[#E0E3E8] text-[#1C2945] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-rose-500" />
                <span>No ({article.unhelpful || 0})</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right pane: Version History logs */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <div className="flex items-center gap-1.5 border-b pb-2">
            <GitCompare className="w-4 h-4 text-[#00A9CE]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Version History</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="p-2.5 bg-[#F4F5F7] border border-[#E0E3E8] rounded text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1C2945]">Version {article.version}</span>
                <span className="text-[10px] text-slate-400 block">Active Current Version</span>
              </div>
              <span className="bg-[#00A9CE]/20 text-[#00A9CE] border border-[#00A9CE]/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                Active
              </span>
            </div>

            {article.history && article.history.length > 0 ? (
              article.history.map((hist, idx) => (
                <div key={idx} className="p-2.5 border border-[#E0E3E8] rounded text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#1C2945]">Version {hist.version}</span>
                    <span className="text-[9px] text-slate-400 block">{new Date(hist.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => triggerDiff(hist)}
                    className="text-xs text-[#00A9CE] hover:underline font-bold"
                  >
                    Compare Diff
                  </button>
                </div>
              ))
            ) : (
              <span className="text-slate-400 italic text-[10px]">No historical versions.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArticleReader;
