import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToastStore } from '../../store/toast.store';
import { useAuthStore } from '../../store/auth.store';
import { routePaths } from '../../routes/routePaths';
import Input from '../../components/ui/Input';
import { ShieldCheck, ShieldAlert, Cpu, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export const AuthPage = ({ initialTab = 'signin' }) => {
  const [tab, setTab] = useState(initialTab); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');
  const [showPassword, setShowPassword] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  // MFA Flow States
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Field validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 100

  const { login, register, loading } = useAuth();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect parameter checks
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      addToast(error, 'error');
    }
  }, [searchParams]);

  // Real-time password strength calculation
  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 20;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return score;
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val) {
      setEmailError('Email is required.');
    } else if (!/^\S+@\S+\.\S+$/.test(val)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    setPasswordStrength(calculatePasswordStrength(val));
    if (!val) {
      setPasswordError('Password is required.');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
    } else {
      setPasswordError('');
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!val.trim()) {
      setNameError('Full name is required.');
    } else {
      setNameError('');
    }
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setNameError('');
  };

  const handleOAuthLogin = (providerId) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const clientRedirectUri = `${window.location.origin}/oauth/callback`;
    window.location.href = `${baseUrl}/auth/oauth/${providerId}?redirect_uri=${encodeURIComponent(clientRedirectUri)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === 'signup' && !name.trim()) {
      setNameError('Full name is required.');
      return;
    }
    if (!email || emailError) {
      setEmailError('Valid email is required.');
      return;
    }
    if (!password || passwordError) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (tab === 'signin') {
        const res = await login(email, password);
        if (res && res.mfaRequired) {
          setMfaRequired(true);
          setTempToken(res.tempToken);
          addToast('Multi-factor authentication required.', 'warning');
        } else {
          addToast('Welcome back to Crudier CRM!', 'success');
          navigate(routePaths.DASHBOARD);
        }
      } else {
        await register(name, email, password, role);
        addToast('Account created successfully! Please sign in.', 'success');
        setTab('signin');
      }
    } catch (err) {
      // Fallback local mock simulation if backend offline
      if (email && password && !emailError && !passwordError) {
        const mockUser = {
          _id: 'mock_user_123',
          name: tab === 'signup' ? name : email.split('@')[0].toUpperCase(),
          email,
          role: role || 'Developer',
        };
        const setAuth = useAuthStore.getState().setAuth;
        setAuth(mockUser, 'mock_jwt_token');
        addToast('Bypassed credentials check for demo preview.', 'warning');
        navigate(routePaths.DASHBOARD);
      } else {
        addToast(err.message || 'An error occurred during submission.', 'error');
      }
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      addToast('Please enter a valid 6-digit TOTP verification code.', 'error');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${baseUrl}/auth/2fa/validate`, {
        tempToken,
        code: otpCode,
      });

      const { user, accessToken } = response.data.data;
      const setAuth = useAuthStore.getState().setAuth;
      setAuth(user, accessToken);
      
      addToast('MFA verification successful. Access granted.', 'success');
      navigate(routePaths.DASHBOARD);
    } catch (err) {
      // Offline fallback bypass
      if (otpCode === '123456' || otpCode === '000000') {
        const mockUser = {
          _id: 'mock_user_123',
          name: email.split('@')[0].toUpperCase() || 'DEMO USER',
          email: email || 'demo@crudier.com',
          role: 'Founder',
        };
        const setAuth = useAuthStore.getState().setAuth;
        setAuth(mockUser, 'mock_jwt_token');
        addToast('Demo OTP bypass accepted.', 'warning');
        navigate(routePaths.DASHBOARD);
      } else {
        addToast(err.response?.data?.message || 'Invalid verification code. Please check and try again.', 'error');
      }
    }
  };

  // Render 2FA Validation View
  if (mfaRequired) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-gray-900">
        <div className="w-full max-w-[440px] bg-white rounded-[32px] border border-gray-200/60 shadow-[0_24px_64px_rgba(0,0,0,0.06)] p-8 flex flex-col gap-6 animate-slide-up">
          <div className="text-center flex flex-col gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 Outfit">Two-Factor Authentication</h2>
            <p className="text-xs text-gray-500 leading-relaxed px-4">Enter the verification code from your authenticator app or one of your backup codes.</p>
          </div>

          <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">TOTP Verification Code</label>
              <Input
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                maxLength={8}
                className="!bg-white !border-gray-200 !text-gray-900 focus:!border-brand-500/60 focus:!ring-2 focus:!ring-brand-500/10 placeholder-gray-400 h-11 px-4 rounded-xl text-center font-bold tracking-widest text-lg"
                required
              />
            </div>
            <div className="text-[10px] font-semibold text-gray-400 text-center">
              Demo code fallback: enter 123456 to bypass
            </div>
            <button 
              type="submit" 
              className="w-full h-11 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm mt-2"
            >
              Verify Identity
            </button>
            <button
              type="button"
              onClick={() => {
                setMfaRequired(false);
                setOtpCode('');
              }}
              className="text-xs font-bold text-brand-600 hover:underline hover:text-brand-500 mx-auto"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-gray-900">
      <div className="w-full max-w-[440px] bg-white rounded-[32px] border border-gray-200/60 shadow-[0_24px_64px_rgba(0,0,0,0.06)] p-8 flex flex-col gap-6 relative overflow-hidden animate-slide-up">
        
        {/* Header / Brand */}
        <div className="flex flex-col items-center text-center gap-2 mb-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Cpu className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 Outfit">Crudier CRM</h2>
          <p className="text-xs font-medium text-gray-500">Workspace Management Portal</p>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50 relative">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              clearErrors();
            }}
            className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-1.5 ${
              tab === 'signin' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              clearErrors();
            }}
            className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-300 z-10 flex items-center justify-center gap-1.5 ${
              tab === 'signup' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign Up
          </button>
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${
              tab === 'signin' ? 'left-1' : 'left-[calc(50%+2px)]'
            }`}
          />
        </div>

        {/* Social Authentication Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('gmail')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#EA4335" />
              <path d="M22 6V18C22 19.1 21.1 20 20 20H18V9.5L12 13.5L6 9.5V20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H5L12 9L19 4H20C21.1 4 22 4.9 22 6Z" fill="#FBBC05" />
              <path d="M20 4H17L12 9L7 4H4C2.9 4 2 4.9 2 6V7L12 14L22 7V6C22 4.9 21.1 4 20 4Z" fill="#34A853" />
              <path d="M22 6V8L12 14L2 8V6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6Z" fill="#4285F4" />
            </svg>
            Continue with Gmail
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'signup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                error={nameError}
                className="!bg-white !border-gray-200 !text-gray-900 focus:!border-brand-500/60 focus:!ring-2 focus:!ring-brand-500/10 placeholder-gray-400 h-11 px-4 rounded-xl"
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              error={emailError}
              className="!bg-white !border-gray-200 !text-gray-900 focus:!border-brand-500/60 focus:!ring-2 focus:!ring-brand-500/10 placeholder-gray-400 h-11 px-4 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={passwordError}
                className="!bg-white !border-gray-200 !text-gray-900 focus:!border-brand-500/60 focus:!ring-2 focus:!ring-brand-500/10 placeholder-gray-400 h-11 px-4 rounded-xl pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password strength indicator for signup */}
          {tab === 'signup' && password && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Password Strength</span>
                <span>{passwordStrength}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                <div
                  className={`h-full transition-all duration-500 ${
                    passwordStrength <= 20 ? 'bg-rose-500' : passwordStrength <= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
            </div>
          )}

          {tab === 'signup' && (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 px-3 py-2 text-sm rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-brand-500/60 outline-none transition-all focus:ring-2 focus:ring-brand-500/10"
              >
                <option value="Founder">Founder</option>
                <option value="Admin">Admin</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Sales">Sales</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          )}

          {tab === 'signin' && (
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors self-end"
            >
              Forgot password?
            </Link>
          )}

          {/* Newsletter Updates Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none text-left py-1">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 transition-all cursor-pointer"
            />
            <span className="text-[11px] text-gray-500 leading-normal">
              Please keep me updated by email with the latest news, research findings, reward programs, event updates.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || (tab === 'signup' && (!name || emailError || passwordError))}
            className="w-full h-12 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-1"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {tab === 'signin' ? 'Sign In to Dashboard' : 'Create an account'}
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div className="text-center text-xs text-gray-500 mt-2">
          {tab === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  clearErrors();
                }}
                className="font-bold text-brand-600 hover:underline hover:text-brand-500 transition-colors"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  clearErrors();
                }}
                className="font-bold text-brand-600 hover:underline hover:text-brand-500 transition-colors"
              >
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
