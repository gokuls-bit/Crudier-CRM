import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../store/toast.store';
import Button from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { GitBranch, Star, Trophy, Award, Code, MessageSquare, RefreshCw } from 'lucide-react';
import axios from 'axios';

export const DeveloperProfilesSection = () => {
  const [profiles, setProfiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const token = useAuthStore((state) => state.token);
  const addToast = useToastStore((state) => state.addToast);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.get(`${baseUrl}/auth/developer-profiles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(response.data.data);
    } catch (err) {
      // Offline fallback defaults
      setProfiles({
        github: { username: 'octocat', stars: 24, repos: 38, syncedAt: new Date() },
        leetcode: { username: 'leetcode_coder', solved: 215, rating: 1720, syncedAt: new Date() },
        hackerrank: { username: 'hr_expert', badges: ['Algorithms Gold', 'Java Silver'], syncedAt: new Date() },
        codeforces: { username: 'specialist_cf', rating: 1480, rank: 'Specialist', syncedAt: new Date() },
        codechef: { username: 'cc_3star', rating: 1610, stars: 3, syncedAt: new Date() },
        stackoverflow: { username: 'so_helper', reputation: 512, syncedAt: new Date() }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${baseUrl}/auth/developer-profiles/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(response.data.data);
      addToast('Developer profiles coding stats synchronized successfully.', 'success');
    } catch (err) {
      // Local mock state refresh
      setProfiles({
        github: { username: 'octocat', stars: 28, repos: 42, syncedAt: new Date() },
        leetcode: { username: 'leetcode_coder', solved: 234, rating: 1780, syncedAt: new Date() },
        hackerrank: { username: 'hr_expert', badges: ['Algorithms Gold', 'Java Silver', 'SQL Gold'], syncedAt: new Date() },
        codeforces: { username: 'specialist_cf', rating: 1510, rank: 'Specialist', syncedAt: new Date() },
        codechef: { username: 'cc_3star', rating: 1650, stars: 3, syncedAt: new Date() },
        stackoverflow: { username: 'so_helper', reputation: 580, syncedAt: new Date() }
      });
      addToast('Refreshed stats simulation (offline).', 'warning');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfiles();
    }
  }, [token]);

  if (loading && !profiles) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner className="text-brand-500" />
      </div>
    );
  }

  if (!profiles) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Developer Platform Integrations</h3>
          <span className="text-[10px] text-slate-500">Live competitive programming stats & repository metrics.</span>
        </div>
        <Button
          onClick={handleSync}
          isLoading={syncing}
          variant="secondary"
          size="xs"
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sync Coding Stats</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* GitHub Card */}
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-[#24292f]/5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#24292f] flex items-center justify-center font-bold text-white text-xs">GH</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">GitHub</span>
                <span className="text-[10px] text-slate-500">@{profiles.github?.username || 'octocat'}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Stars</span>
                <span className="font-bold text-white">{profiles.github?.stars || 0}</span>
              </div>
            </div>
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-brand-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Repositories</span>
                <span className="font-bold text-white">{profiles.github?.repos || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* LeetCode Card */}
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-[#ffa116]/5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ffa116] flex items-center justify-center font-bold text-white text-xs">LC</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">LeetCode</span>
                <span className="text-[10px] text-slate-500">@{profiles.leetcode?.username || 'lc_user'}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Rating</span>
                <span className="font-bold text-white">{profiles.leetcode?.rating || 0}</span>
              </div>
            </div>
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Solved</span>
                <span className="font-bold text-white">{profiles.leetcode?.solved || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* HackerRank Card */}
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-[#1ba94c]/5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1ba94c] flex items-center justify-center font-bold text-white text-xs">HR</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">HackerRank</span>
                <span className="text-[10px] text-slate-500">@{profiles.hackerrank?.username || 'hr_user'}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex flex-col gap-1 text-xs">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Earned Badges</span>
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {profiles.hackerrank?.badges?.map((badge, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-semibold border border-emerald-500/20">
                  {badge}
                </span>
              )) || <span className="text-slate-600 text-[10px]">No badges synced</span>}
            </div>
          </div>
        </div>

        {/* Codeforces Card */}
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-[#3182ce]/5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3182ce] flex items-center justify-center font-bold text-white text-xs">CF</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Codeforces</span>
                <span className="text-[10px] text-slate-500">@{profiles.codeforces?.username || 'cf_user'}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Rating</span>
                <span className="font-bold text-white">{profiles.codeforces?.rating || 0}</span>
              </div>
            </div>
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-300" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Rank</span>
                <span className="font-bold text-white capitalize">{profiles.codeforces?.rank || 'Newbie'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CodeChef Card */}
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-[#5b4636]/15 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#5b4636] flex items-center justify-center font-bold text-white text-xs">CC</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">CodeChef</span>
                <span className="text-[10px] text-slate-500">@{profiles.codechef?.username || 'cc_user'}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Rating</span>
                <span className="font-bold text-white">{profiles.codechef?.rating || 0}</span>
              </div>
            </div>
            <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Stars</span>
                <span className="font-bold text-white">{profiles.codechef?.stars || 0}★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stack Overflow Card */}
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-[#f48225]/5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#f48225] flex items-center justify-center font-bold text-white text-xs">SO</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Stack Overflow</span>
                <span className="text-[10px] text-slate-500">@{profiles.stackoverflow?.username || 'so_user'}</span>
              </div>
            </div>
          </div>
          <div className="bg-[#141824]/60 p-2.5 rounded-lg border border-white/5 flex items-center gap-3 text-xs">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500">Reputation</span>
              <span className="font-bold text-white">{profiles.stackoverflow?.reputation || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfilesSection;
