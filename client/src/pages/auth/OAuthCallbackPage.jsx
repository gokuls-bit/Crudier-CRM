import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToastStore } from '../../store/toast.store';
import { useAuthStore } from '../../store/auth.store';
import { routePaths } from '../../routes/routePaths';
import { Spinner } from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import axios from 'axios';

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const setAuth = useAuthStore((state) => state.setAuth);

  const provider = searchParams.get('provider') || 'google';
  const code = searchParams.get('code');

  const processOAuthCallback = async () => {
    if (!code) {
      setStatus('error');
      setErrorMessage('Authorization code is missing from the provider callback.');
      return;
    }

    setStatus('processing');
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.get(`${baseUrl}/auth/oauth/${provider}/callback`, {
        params: { code }
      });

      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      addToast(`Connected successfully with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`, 'success');
      navigate(routePaths.DASHBOARD);
    } catch (err) {
      // Local fallback for quick mock bypass testing
      if (code === 'mock_code_123' || code === 'mock_oauth_code_123') {
        const mockUser = {
          _id: 'mock_oauth_user_99',
          name: `Mock ${provider.toUpperCase()} User`,
          email: `mock_${provider}@crudier.com`,
          role: 'Developer'
        };
        setAuth(mockUser, 'mock_oauth_jwt_token');
        addToast(`Bypassed OAuth check (Offline Simulator).`, 'warning');
        navigate(routePaths.DASHBOARD);
      } else {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Failed to authenticate with social provider.');
      }
    }
  };

  useEffect(() => {
    processOAuthCallback();
  }, [provider, code]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-[#f3f4f6]">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center gap-6 animate-slide-up">
        {status === 'processing' ? (
          <>
            <Spinner size="lg" className="text-brand-500" />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">Verifying Credentials</h2>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Completing handshake with <span className="text-brand-400 capitalize font-semibold">{provider}</span>. Please hold on.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
              <ShieldAlert className="w-12 h-12" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">Authentication Failed</h2>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Button onClick={processOAuthCallback} variant="primary" className="w-full">
                Retry Connection
              </Button>
              <Button onClick={() => navigate(routePaths.LOGIN)} variant="secondary" className="w-full">
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
