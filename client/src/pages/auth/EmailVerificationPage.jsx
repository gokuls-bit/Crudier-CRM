import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../store/toast.store';
import { routePaths } from '../../routes/routePaths';
import Button from '../../components/ui/Button';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';

export const EmailVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown > 0 && !verified) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, verified]);

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto-advance focus to next block
    if (cleanValue && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Focus previous block on Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      addToast('Please enter the full 6-digit verification code.', 'error');
      return;
    }

    setLoading(true);
    // Simulate code verification
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      addToast('Email address verified successfully!', 'success');
      
      // Auto-redirect to dashboard
      setTimeout(() => {
        navigate(routePaths.DASHBOARD);
      }, 2500);
    }, 1200);
  };

  const handleResend = () => {
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs[0].current.focus();
    addToast('A new 6-digit verification OTP has been sent to your email.', 'success');
  };

  // Trigger auto-submit when all 6 fields are filled
  useEffect(() => {
    if (otp.every(val => val !== '')) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-[#f3f4f6]">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl flex flex-col gap-6 animate-slide-up">
        {!verified ? (
          <>
            <div className="text-center flex flex-col gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-600/35">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">Verify Email Address</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                We've sent a 6-digit secure verification OTP code to your workspace email account.
              </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-6 items-center">
              <div className="flex gap-2 justify-center w-full">
                {otp.map((val, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    value={val}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-12 text-center text-lg font-bold rounded-lg bg-[#141824] border border-white/10 text-white focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    maxLength={1}
                    required
                  />
                ))}
              </div>

              <Button type="submit" isLoading={loading} className="w-full">
                Confirm Code
              </Button>
            </form>

            <div className="flex flex-col items-center gap-1.5 text-xs text-slate-500">
              {countdown > 0 ? (
                <span>Resend verification code in <strong className="text-slate-300 font-semibold">{countdown}s</strong></span>
              ) : (
                <button
                  onClick={handleResend}
                  className="flex items-center gap-1 text-brand-400 hover:text-brand-350 hover:underline font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center flex flex-col gap-5 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-white Outfit">Email Confirmed</h2>
              <p className="text-xs text-slate-400">Your workspace identity verification is complete.</p>
            </div>
            <span className="text-xs text-slate-500">Loading your account dashboard...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
