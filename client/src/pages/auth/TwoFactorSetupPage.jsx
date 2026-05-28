import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import { routePaths } from '../../routes/routePaths';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ShieldCheck, Copy, Check, Download, AlertTriangle, KeyRound } from 'lucide-react';

export const TwoFactorSetupPage = () => {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [step, setStep] = useState(1); // 1: QR & Secret, 2: Verification, 3: Backup Codes Export
  
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    fetch2FADetails();
  }, []);

  const fetch2FADetails = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/setup');
      setSetupData(response.data?.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to initialize 2FA setup.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    addToast('Secret key copied to clipboard.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (code.length !== 6) {
      addToast('Please enter a 6-digit verification code.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/verify', { code });
      const codes = response.data?.data?.backupCodes || [];
      setBackupCodes(codes);
      addToast('Two-factor authentication enabled successfully.', 'success');
      setStep(3);
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid code. Verification failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    if (backupCodes.length === 0) return;
    const element = document.createElement("a");
    const file = new Blob([
      `CRUDIER CRM — 2FA BACKUP CODES\n`,
      `Generated: ${new Date().toLocaleString()}\n`,
      `Keep these in a safe place. Each code can only be used once.\n\n`,
      backupCodes.join('\n')
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `crudier-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Backup codes downloaded.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-4">
      <PageHeader 
        title="Multi-Factor Authentication Setup" 
        description="Secure your Crudier workspace account using an Authenticator app (Google Authenticator, Duo, Authy, etc.)."
      />

      <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col gap-6 relative overflow-hidden animate-slide-up">
        
        {/* Progress header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="text-xs font-semibold text-slate-400">
            Step {step} of 3
          </span>
          <div className="flex gap-1">
            <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-brand-500' : 'bg-white/5'}`} />
            <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-brand-500' : 'bg-white/5'}`} />
            <div className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-brand-500' : 'bg-white/5'}`} />
          </div>
        </div>

        {step === 1 && setupData && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="p-3 bg-white rounded-xl shadow-inner shrink-0">
                <QRCode 
                  value={setupData.otpauthUrl || ''} 
                  size={160}
                  className="w-40 h-40"
                />
              </div>
              
              <div className="flex flex-col gap-3 text-center lg:text-left">
                <h3 className="text-base font-bold text-white Outfit">Scan the QR Code</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Open your authenticator app on your mobile device, choose to add a new account, and scan the QR code displayed.
                </p>
                <div className="h-px bg-white/5 my-1" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 text-left uppercase">Can't scan? Enter manually:</span>
                  <div className="flex items-center bg-[#141824] border border-white/10 rounded-lg p-2 gap-2">
                    <code className="text-xs text-brand-300 font-mono flex-1 select-all break-all text-left">
                      {setupData.secret}
                    </code>
                    <button 
                      onClick={handleCopySecret}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setStep(2)}
              className="w-full mt-4"
            >
              I've scanned the QR Code
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white Outfit">Verify Setup</h3>
              <p className="text-xs text-slate-400">
                Enter the 6-digit verification code generated by your authenticator app to enable MFA.
              </p>
            </div>

            <Input 
              type="text"
              label="6-Digit Verification Code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              className="text-center tracking-[0.25em] text-lg font-bold"
            />

            <div className="flex gap-3 mt-2">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                isLoading={loading}
                className="flex-1"
              >
                Enable 2FA
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold Outfit">Save your backup codes!</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  These codes allow you to access your account if you lose your phone. Each code can only be used once. Store them securely offline.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#141824] border border-white/5 p-4 rounded-xl font-mono text-center text-xs tracking-wider text-slate-300">
              {backupCodes.map((bc, idx) => (
                <div key={idx} className="py-1 border border-white/5 rounded bg-[#0b0f19]/35">
                  {bc}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button 
                onClick={handleDownloadBackupCodes}
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Codes (.txt)</span>
              </Button>
              <Button 
                onClick={() => navigate(routePaths.SETTINGS)}
                className="w-full"
              >
                Return to Settings
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TwoFactorSetupPage;
