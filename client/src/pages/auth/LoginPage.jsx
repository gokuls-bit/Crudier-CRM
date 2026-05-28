import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { routePaths } from '../../routes/routePaths';
import { useToastStore } from '../../store/toast.store';
import { useAuthStore } from '../../store/auth.store';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const { login, loading } = useAuth();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  // Real-time email validation
  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val) {
      setEmailError('Email address is required.');
    } else if (!/^\S+@\S+\.\S+$/.test(val)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    if (!email) {
      setEmailError('Email address is required.');
    }
  };

  // Real-time password validation
  const handlePasswordChange = (val) => {
    setPassword(val);
    if (!val) {
      setPasswordError('Password is required.');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError('Password is required.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Final checks
    const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
    const isPasswordValid = password.length >= 6;

    if (!isEmailValid) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await login(email, password);
      addToast('Welcome back! Sign in successful.', 'success');
      navigate(routePaths.DASHBOARD);
    } catch (err) {
      // Mock Fallback: if server is down/credentials fail, allow bypass for visual previewing
      if (email && password && !emailError && !passwordError) {
        const mockUser = {
          _id: 'mock_user_id_123',
          name: email.split('@')[0].toUpperCase(),
          email,
          role: email.includes('ceo') ? 'CEO' : (email.includes('cto') ? 'CTO' : (email.includes('sales') ? 'Sales' : 'Founder')),
        };
        useAuthStore.getState().setAuth(mockUser, 'mock_jwt_token');
        addToast('Bypassed sign-in for design preview.', 'warning');
        navigate(routePaths.DASHBOARD);
      } else {
        const message = err.message || 'Failed to authenticate. Please check your credentials.';
        setFormError(message);
        addToast(message, 'error');
      }
    }
  };

  // Form isValid check
  const isFormValid = email && password && !emailError && !passwordError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-[#f3f4f6]">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl flex flex-col gap-6 animate-slide-up">
        {/* Title */}
        <div className="text-center flex flex-col gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center font-bold text-lg text-white mx-auto shadow-lg shadow-brand-600/35 Outfit">
            C
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white Outfit">Sign in to Crudier CRM</h2>
          <p className="text-xs text-slate-400">Enterprise workspace environment</p>
        </div>

        {formError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-semibold text-center">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            label="Email Address"
            placeholder="ceo@crudier.com, cto@crudier.com, or founder@crudier.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            error={emailError}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={handlePasswordBlur}
            error={passwordError}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Demo bypass: enter any email & password</span>
          </div>

          <Button type="submit" isLoading={loading} disabled={!isFormValid || loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to={routePaths.REGISTER} className="text-brand-400 hover:text-brand-350 font-semibold underline">
            Register Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
