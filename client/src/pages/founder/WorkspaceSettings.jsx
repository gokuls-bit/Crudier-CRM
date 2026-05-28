import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const WorkspaceSettings = () => {
  const [workspaceName, setWorkspaceName] = useState('Snavior CRM Inc.');
  const [logoUrl, setLogoUrl] = useState('http://localhost:5173/logo.png');
  const [accentColor, setAccentColor] = useState('#8b5cf6');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Workspace brand settings updated successfully.');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader 
        title="Workspace Configuration & Branding" 
        description="Customize workspace titles, assign custom accent palettes, and modify landing logo layouts."
      />

      <div className="glass-panel p-6 rounded-xl border border-white/5">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <Input
            type="text"
            label="Workspace Enterprise Title"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            required
          />

          <Input
            type="text"
            label="Company Logo Asset URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-slate-400 Outfit">Brand Accent Theme Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 border border-white/10 rounded-lg cursor-pointer bg-slate-900"
              />
              <span className="text-xs font-mono text-slate-300">{accentColor.toUpperCase()}</span>
            </div>
          </div>

          <Button type="submit" isLoading={isSaving} className="w-fit self-end mt-2">
            Save Workspace Changes
          </Button>
        </form>
      </div>
    </div>
  );
};
export default WorkspaceSettings;
