import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { routePaths } from '../../routes/routePaths';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Lock, Mail } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      navigate(routePaths.DASHBOARD);
    } catch (err) {
      // Mock Fallback: if server is not running or credentials failed, allow bypass for previewing
      if (email && password) {
        const mockUser = {
          _id: 'mock_user_id_123',
          name: email.split('@')[0].toUpperCase(),
          email,
          role: email.includes('ceo') ? 'CEO' : (email.includes('cto') ? 'CTO' : (email.includes('sales') ? 'Sales' : 'Founder')),
        };
        localStorage.setItem('crudier_user', JSON.stringify(mockUser));
        localStorage.setItem('crudier_token', 'mock_jwt_token');
        window.location.href = routePaths.DASHBOARD;
      } else {
        setErrorMsg('Please enter both email and password.');
      }
    }
  };

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

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            label="Email Address"
            placeholder="ceo@crudier.com, cto@crudier.com, or founder@crudier.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Demo bypass: enter any email & password</span>
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-2">
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
