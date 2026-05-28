import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { FileImage, ExternalLink } from 'lucide-react';

const mockAssets = [
  { id: '1', title: 'Figma Brand Design System', type: 'Design System', link: 'figma.com/file/brand-sys' },
  { id: '2', title: 'Corporate SVG Logo Kit', type: 'Logo kit', link: 'google.drive/logo-kit-svg' },
  { id: '3', title: 'Typography & Color Guides', type: 'Guidelines', link: 'google.drive/branding-pdf' },
];

export const AssetNotes = () => {
  const columns = [
    { 
      key: 'title', 
      label: 'Asset Document Description',
      render: (val) => (
        <span className="flex items-center gap-2 text-brand-400 font-bold hover:underline cursor-pointer">
          <FileImage className="w-4 h-4" />
          <span>{val}</span>
        </span>
      )
    },
    { 
      key: 'type', 
      label: 'Format / Category',
      render: (val) => <Badge variant="slate">{val}</Badge>
    },
    { 
      key: 'link', 
      label: 'External Asset Link',
      render: (val) => (
        <a href={`https://${val}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-400 hover:text-slate-200 font-semibold transition-colors">
          <span>View File</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Asset & Branding Guides" 
        description="Workspace branding assets, typography documents, logo kits and Figma libraries links."
      />

      <div className="glass-panel p-5 rounded-xl border border-white/5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 Outfit">Branding Files & Figma Libraries</h3>
        <Table columns={columns} data={mockAssets} />
      </div>
    </div>
  );
};
export default AssetNotes;
