import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../store/toast.store';
import { routePaths } from '../../routes/routePaths';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, CheckCircle2, ShieldCheck, KeyRound, Loader } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  // Password strength logic
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

  const handlePasswordChange = (val) => {
    setNewPassword(val);
    setPasswordStrength(calculatePasswordStrength(val));
  };

  // Step 1: Send OTP code to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    // Simulate sending OTP or call backend endpoint if available
    setTimeout(() => {
      setLoading(false);
      addToast(`Verification code sent to ${email}.`, 'success');
      setStep(2);
    }, 1000);
  };

  // Step 2: Validate OTP code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      addToast('Please enter the 6-digit verification code.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast('Identity verified successfully.', 'success');
      setStep(3);
    }, 1000);
  };

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast('Password has been successfully updated.', 'success');
      setStep(4);
    }, 1200);
  };

  // Step 4: Auto-redirect to Login
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        navigate(routePaths.LOGIN);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const getStrengthColor = () => {
    if (passwordStrength <= 20) return 'bg-rose-500';
    if (passwordStrength <= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-[#f3f4f6]">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl flex flex-col gap-6 animate-slide-up">
        {step === 1 && (
          <>
            <div className="text-center flex flex-col gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-600/35">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">Reset Password</h2>
              <p className="text-xs text-slate-400">Enter your email and we'll send you a 6-digit OTP code to verify your identity.</p>
            </div>

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="ceo@crudier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" isLoading={loading} className="w-full mt-2">
                Send Verification Code
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center flex flex-col gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">Enter OTP Code</h2>
              <p className="text-xs text-slate-400">We've sent a 6-digit validation code to your email inbox.</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <Input
                type="text"
                label="OTP Verification Code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
              <Button type="submit" isLoading={loading} className="w-full mt-2">
                Verify Code
              </Button>
              <div className="text-center text-xs text-slate-500">
                Demo code fallback: enter 123456
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center flex flex-col gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">New Password</h2>
              <p className="text-xs text-slate-400">Choose a strong password to protect your corporate CRM credentials.</p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <Input
                type="password"
                label="New Password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />

              {newPassword && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                    <span>Password Strength</span>
                    <span>{passwordStrength}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" isLoading={loading} disabled={newPassword.length < 6} className="w-full mt-2">
                Reset Password
              </Button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="text-center flex flex-col gap-5 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-white Outfit">Password Reset Complete</h2>
              <p className="text-xs text-slate-400">Your account credentials have been successfully updated.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader className="w-3.5 h-3.5 animate-spin text-brand-500" />
              <span>Redirecting to sign in screen...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
