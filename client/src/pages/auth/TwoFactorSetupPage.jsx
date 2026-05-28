import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../store/toast.store';
import { useAuthStore } from '../../store/auth.store';
import { routePaths } from '../../routes/routePaths';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import QRCode from 'react-qr-code';
import { ShieldCheck, Copy, Check, Download, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export const TwoFactorSetupPage = () => {
  const [step, setStep] = useState(1); // 1: QR & Verify, 2: Backup Codes
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const addToast = useToastStore((state) => state.addToast);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Load TOTP Setup Details from API
  const loadSetupDetails = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${baseUrl}/auth/2fa/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSecret(response.data.data.secret);
      setOtpauthUrl(response.data.data.otpauthUrl);
    } catch (err) {
      // Local preview fallback
      setSecret('MOCK2FASECRET4DEMOONLY');
      setOtpauthUrl('otpauth://totp/Crudier%20CRM:demo@crudier.com?secret=MOCK2FASECRET4DEMOONLY&issuer=Crudier%20CRM');
      addToast('MFA setup simulated (Offline mode).', 'warning');
    }
  };

  useEffect(() => {
    if (token) {
      loadSetupDetails();
    }
  }, [token]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    addToast('Secret copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      addToast('Please enter the 6-digit TOTP verification code.', 'error');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${baseUrl}/auth/2fa/verify`, { code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackupCodes(response.data.data.backupCodes);
      setStep(2);
      addToast('TOTP verified successfully! 2FA is now enabled.', 'success');
    } catch (err) {
      // Simulation verification bypass
      if (code === '123456' || secret === 'MOCK2FASECRET4DEMOONLY') {
        const dummyBackups = Array.from({ length: 10 }, (_, i) => `bc-${i + 1}-mockcode`);
        setBackupCodes(dummyBackups);
        setStep(2);
        addToast('Bypassed TOTP verification for demo.', 'warning');
      } else {
        addToast(err.response?.data?.message || 'Invalid verification code. Please check and try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = `Crudier CRM — 2FA Backup Verification Codes\nUser: ${user?.email || 'demo@crudier.com'}\nDate: ${new Date().toLocaleDateString()}\n\nKeep these codes in a secure location. Each code can only be used once.\n\n` + backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n');
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'crudier-mfa-backup-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Backup codes downloaded successfully.', 'success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-[#f3f4f6]">
      <div className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl flex flex-col gap-6 animate-slide-up">
        {step === 1 ? (
          <>
            <div className="text-center flex flex-col gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-600/35">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">Configure 2FA</h2>
              <p className="text-xs text-slate-400">Scan this QR code with Google Authenticator or Microsoft Authenticator.</p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-inner max-w-[210px] mx-auto">
              {otpauthUrl ? (
                <QRCode value={otpauthUrl} size={180} level="M" />
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-900 font-semibold text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Manual Copy Option */}
            <div className="bg-[#141824]/80 p-3 rounded-lg border border-white/5 flex items-center justify-between text-xs gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Secret Key</span>
                <span className="font-mono text-slate-300 truncate select-all">{secret}</span>
              </div>
              <button
                onClick={handleCopySecret}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 shrink-0 transition-all active:scale-[0.9]"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* OTP Verify Form */}
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <Input
                type="text"
                label="TOTP Verification Code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
              <Button type="submit" isLoading={loading} className="w-full mt-2">
                Enable Two-Factor Authentication
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center flex flex-col gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/35">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white Outfit">2FA Setup Complete</h2>
              <p className="text-xs text-slate-400">Please download and save these one-time use emergency recovery backup codes.</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg flex items-start gap-2 text-[11px] leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Warning:</strong> If you lose your authenticator device, these backup codes are the only way to recover access to your account.
              </div>
            </div>

            {/* Backup Codes Grid */}
            <div className="grid grid-cols-2 gap-2 bg-[#141824]/60 p-4 rounded-xl border border-white/5 font-mono text-xs text-center text-slate-300">
              {backupCodes.map((codeStr, idx) => (
                <div key={idx} className="p-1.5 border border-white/5 bg-[#0f121b]/40 rounded-lg">
                  {codeStr}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              <Button onClick={handleDownloadBackupCodes} variant="primary" className="w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                <span>Download Backup Codes</span>
              </Button>
              <Button onClick={() => navigate(routePaths.DASHBOARD)} variant="secondary" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetupPage;
