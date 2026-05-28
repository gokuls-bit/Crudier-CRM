import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import { useAuthStore } from '../../store/auth.store';
import { routePaths } from '../../routes/routePaths';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { 
  ShieldCheck, ShieldAlert, Cpu, Calendar, Globe, Trash2, 
  Smartphone, Eye, HelpCircle, KeyRound, Check, RefreshCw 
} from 'lucide-react';

const providerList = [
  { id: 'google', name: 'Google' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'github', name: 'GitHub' },
  { id: 'gitlab', name: 'GitLab' },
  { id: 'bitbucket', name: 'Bitbucket' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'slack', name: 'Slack' },
  { id: 'discord', name: 'Discord' },
  { id: 'leetcode', name: 'LeetCode' },
  { id: 'hackerrank', name: 'HackerRank' },
  { id: 'hackerearth', name: 'HackerEarth' },
  { id: 'codechef', name: 'CodeChef' },
  { id: 'codeforces', name: 'Codeforces' },
  { id: 'stackoverflow', name: 'Stack Overflow' },
  { id: 'atlassian', name: 'Atlassian' },
  { id: 'figma', name: 'Figma' },
  { id: 'apple', name: 'Apple' },
];

export const SecuritySettingsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);

  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const currentToken = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await api.get('/auth/me');
      setUserProfile(response.data?.data);
    } catch (err) {
      addToast('Failed to fetch user security profile details.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await api.get('/auth/sessions');
      setSessions(response.data?.data || []);
    } catch (err) {
      // Fallback local mock sessions for preview
      setSessions([
        { sessionId: 'current_session', device: 'Desktop', browser: 'Google Chrome', ip: '127.0.0.1', location: 'Local Network', lastActive: new Date() }
      ]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    setRevokingId(sessionId);
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      addToast('Session revoked successfully.', 'success');
      setSessions(sessions.filter(s => s.sessionId !== sessionId));
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to revoke session.', 'error');
    } finally {
      setRevokingId(null);
    }
  };

  const handleUnlink = async (providerId) => {
    setUnlinkingProvider(providerId);
    try {
      await api.delete(`/auth/oauth/unlink/${providerId}`);
      addToast(`${providerId.charAt(0).toUpperCase() + providerId.slice(1)} account unlinked successfully.`, 'success');
      fetchProfile();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to unlink account.', 'error');
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const handleLink = (providerId) => {
    // Simulated linking redirect
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const clientRedirectUri = `${window.location.origin}/oauth/callback`;
    window.location.href = `${baseUrl}/auth/oauth/${providerId}?redirect_uri=${encodeURIComponent(clientRedirectUri)}`;
  };

  const isProviderLinked = (providerId) => {
    if (!userProfile?.authProviders) return false;
    return userProfile.authProviders.some(ap => ap.provider === providerId);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl py-4">
      <PageHeader 
        title="Security Settings" 
        description="Manage Multi-Factor Authentication, audit active login sessions, view account logs, and connect workspaces."
      />

      {/* 2FA Gating Alert Card */}
      <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex gap-4 items-start text-left">
          <div className={`p-3 rounded-xl shrink-0 ${
            userProfile?.twoFactorEnabled 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {userProfile?.twoFactorEnabled ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white Outfit">
              Two-Factor Authentication (2FA) is {userProfile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Enhance workspace account security. In addition to credentials, you'll be prompted for a secure 6-digit verification code from your mobile authenticator app.
            </p>
          </div>
        </div>
        
        {!userProfile?.twoFactorEnabled ? (
          <Button 
            onClick={() => navigate(routePaths.TWO_FACTOR_SETUP)}
            className="w-full md:w-auto px-5 py-2 whitespace-nowrap"
          >
            Configure 2FA
          </Button>
        ) : (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Activated
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Sessions & Login History */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          
          {/* Active Sessions */}
          <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 Outfit">Active Device Sessions</h3>
              <button 
                onClick={fetchSessions}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {loadingSessions ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
                </div>
              ) : (
                sessions.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#141824]/50 border border-white/5 p-3 rounded-lg text-left gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="p-2 bg-white/5 rounded text-slate-300">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white Outfit">{s.browser || 'Browser'} on {s.device || 'Device'}</span>
                        <span className="text-[10px] text-slate-400">{s.ip} — {s.location || 'Local Network'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {s.sessionId === 'current_session' || idx === 0 ? (
                        <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
                          Current Session
                        </span>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleRevokeSession(s.sessionId)}
                          isLoading={revokingId === s.sessionId}
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Login History Log */}
          <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-200 Outfit font-semibold">Account Sign In History Logs</h3>
            <div className="max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar flex flex-col gap-2">
              {!userProfile?.loginHistory || userProfile.loginHistory.length === 0 ? (
                <span className="text-xs text-slate-500 py-4 text-center">No sign in history recorded yet.</span>
              ) : (
                userProfile.loginHistory.map((lh, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2 last:border-b-0">
                    <div className="flex flex-col text-left gap-0.5">
                      <span className="text-slate-300 font-semibold">{lh.ip}</span>
                      <span className="text-[9px] text-slate-500 truncate max-w-[280px]">{lh.userAgent}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold capitalize text-brand-400">
                        {lh.provider}
                      </span>
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(lh.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: OAuth Provider Linking */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-200 Outfit">Social Profile Linking</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Connect or disconnect OAuth login methods. You must keep at least one method to sign in.
            </p>
          </div>

          <div className="max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar flex flex-col gap-2.5">
            {providerList.map((provider) => {
              const connected = isProviderLinked(provider.id);
              return (
                <div key={provider.id} className="flex justify-between items-center p-2.5 border border-white/5 bg-[#141824]/40 rounded-lg text-left gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white Outfit">{provider.name}</span>
                    <span className={`text-[9px] font-semibold ${connected ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {connected ? 'Linked' : 'Not Connected'}
                    </span>
                  </div>

                  {connected ? (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleUnlink(provider.id)}
                      isLoading={unlinkingProvider === provider.id}
                      className="px-2.5 py-1 text-[10px] font-bold bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleLink(provider.id)}
                      className="px-2.5 py-1 text-[10px] font-bold border-white/10 text-slate-300 hover:text-white"
                    >
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecuritySettingsPage;
