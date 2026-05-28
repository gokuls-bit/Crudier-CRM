import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import Button from '../ui/Button';
import { Github, Code2, Award, Zap, Star, RefreshCw, Trophy, Globe } from 'lucide-react';

const PlatformIcons = {
  github: Github,
  leetcode: Code2,
  hackerrank: Award,
  codeforces: Trophy,
  codechef: Zap,
  stackoverflow: Globe,
};

const PlatformDetails = {
  github: { name: 'GitHub', color: 'text-slate-300 border-slate-500/20 bg-slate-900/35 hover:border-slate-400/40', brandColor: '#f3f4f6' },
  leetcode: { name: 'LeetCode', color: 'text-amber-500 border-amber-500/20 bg-[#f89f1b]/5 hover:border-amber-500/40', brandColor: '#f89f1b' },
  hackerrank: { name: 'HackerRank', color: 'text-emerald-400 border-emerald-500/20 bg-[#2ec866]/5 hover:border-emerald-500/40', brandColor: '#2ec866' },
  codeforces: { name: 'Codeforces', color: 'text-red-400 border-red-500/20 bg-[#3182ce]/5 hover:border-red-500/40', brandColor: '#3182ce' },
  codechef: { name: 'CodeChef', color: 'text-yellow-600 border-yellow-800/20 bg-[#5b4636]/5 hover:border-yellow-700/40', brandColor: '#5b4636' },
  stackoverflow: { name: 'Stack Overflow', color: 'text-orange-500 border-orange-500/20 bg-[#f48024]/5 hover:border-orange-500/40', brandColor: '#f48024' },
};

export const DeveloperProfilesSection = () => {
  const [profiles, setProfiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/developer-profiles');
      setProfiles(response.data?.data || {});
    } catch (err) {
      // Offline mock fallback
      setProfiles({
        github: { username: 'dev-demo', stars: 8, repos: 15, syncedAt: new Date() },
        leetcode: { username: 'lc-demo', solved: 45, rating: 1510, syncedAt: new Date() },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/auth/developer-profiles/sync');
      setProfiles(response.data?.data || {});
      addToast('Developer profile coding metrics synced successfully.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Sync failed.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-slate-200 Outfit">Linked Developer Profiles</h3>
          <p className="text-[11px] text-slate-500">Live coder ratings and repository metrics synced automatically.</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 py-1 px-3"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>Sync Ratings</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(PlatformDetails).map(([key, config]) => {
          const profile = profiles?.[key];
          const Icon = PlatformIcons[key] || Globe;

          if (!profile) {
            return (
              <div 
                key={key} 
                className="glass-card p-4 rounded-xl border border-white/5 flex flex-col justify-between h-[120px] opacity-50 relative overflow-hidden group select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 font-Outfit">{config.name}</span>
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-[10px] text-slate-500">
                  Not connected
                </div>
              </div>
            );
          }

          return (
            <div 
              key={key} 
              className={`glass-card p-4 rounded-xl border flex flex-col justify-between h-[120px] relative overflow-hidden group transition-all duration-300 ${config.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold Outfit text-white">{config.name}</span>
                <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] font-mono text-slate-400">@{profile.username}</span>
                
                {/* Dynamic Stats display depending on platform */}
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                  {key === 'github' && (
                    <>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {profile.stars} stars
                      </span>
                      <span>{profile.repos} repos</span>
                    </>
                  )}

                  {key === 'leetcode' && (
                    <>
                      <span>{profile.solved} solved</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        Rating: {profile.rating}
                      </span>
                    </>
                  )}

                  {key === 'hackerrank' && (
                    <div className="flex flex-wrap gap-1 max-h-[22px] overflow-hidden text-[9px]">
                      {profile.badges?.map((b, i) => (
                        <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {key === 'codeforces' && (
                    <>
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                        Rating: {profile.rating}
                      </span>
                      <span className="text-[10px] text-slate-400">{profile.rank}</span>
                    </>
                  )}

                  {key === 'codechef' && (
                    <>
                      <span className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: profile.stars || 1 }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </span>
                      <span className="text-[10px] text-slate-400">({profile.rating})</span>
                    </>
                  )}

                  {key === 'stackoverflow' && (
                    <span className="text-slate-200">
                      Reputation: <strong className="text-orange-400 font-bold">{profile.reputation}</strong>
                    </span>
                  )}
                </div>
              </div>

              {profile.syncedAt && (
                <span className="text-[8px] text-slate-500 text-right self-end">
                  Synced: {new Date(profile.syncedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeveloperProfilesSection;
