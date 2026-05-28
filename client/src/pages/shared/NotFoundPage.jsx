import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../routes/routePaths';
import Button from '../../components/ui/Button';
import { HelpCircle } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-[#f3f4f6]">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center gap-6 animate-slide-up">
        <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400">
          <HelpCircle className="w-12 h-12" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold tracking-tight text-white Outfit">404 — Page Not Found</h2>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            The workspace directory or page you are requesting could not be located.
          </p>
        </div>

        <Button onClick={() => navigate(routePaths.DASHBOARD)} variant="primary" size="sm">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
