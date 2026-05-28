import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { useUiStore } from '../../store/ui.store';
import { Moon, Sun } from 'lucide-react';

export const SettingsPage = () => {
  const { isDarkMode, toggleTheme } = useUiStore();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader 
        title="Settings & Preferences" 
        description="Configure dashboard theme values, toggle notifications pushes, and review security settings."
      />

      <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col gap-6">
        {/* Toggle dark mode */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-slate-200 Outfit">Color Theme Preference</span>
            <span className="text-xs text-slate-500">Toggle dark mode interface schemas</span>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-brand-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-brand-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Notifications config */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-slate-200 Outfit">Push Alerts Notification</span>
            <span className="text-xs text-slate-500">Receive system broadcasts and scrum reminders</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => alert('Notification settings saved.')}>
            Configure Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
// Make sure to export default as well!
