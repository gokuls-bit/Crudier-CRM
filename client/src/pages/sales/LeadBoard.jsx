import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getLeadStatusColors } from '../../utils/statusHelpers';
import { Plus } from 'lucide-react';

const mockInitialLeads = [
  { _id: '1', name: 'Alpha Corp', value: 85000, stage: 'Closed Won', email: 'vance@alpha.com', company: 'Alpha Corp' },
  { _id: '2', name: 'Omega Logistics', value: 120000, stage: 'Negotiation', email: 'logistics@omega.com', company: 'Omega Logistics' },
  { _id: '3', name: 'Beta Systems', value: 45000, stage: 'Closed Won', email: 'systems@beta.com', company: 'Beta Systems' },
  { _id: '4', name: 'Gamma Retail', value: 60000, stage: 'Closed Lost', email: 'retail@gamma.com', company: 'Gamma Retail' },
];

export const LeadBoard = () => {
  const [leads, setLeads] = useState(mockInitialLeads);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredLeads = leads.filter(l => 
    l.company.toLowerCase().includes(search.toLowerCase()) ||
    l.stage.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'company', label: 'Company / Client', sortable: true },
    { key: 'email', label: 'Contact Email' },
    { 
      key: 'value', 
      label: 'Pipeline Value',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-700">${val.toLocaleString()}</span>
    },
    { 
      key: 'stage', 
      label: 'Pipeline Stage',
      render: (val) => (
        <Badge className={getLeadStatusColors(val)}>
          {val}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button onClick={() => navigate(`/sales/leads/${row._id}`)} variant="secondary" size="sm" className="px-2.5 py-1 text-[10px] rounded">
          Details
        </Button>
      )
    }
  ];
 
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Leads Directory" 
        description="Search global corporate leads profiles, register deal values and track pipeline stages."
        actions={
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        }
      />
 
      <div className="bg-white p-5 rounded-xl border border-[#E0E3E8] shadow-sm">
        <Table columns={columns} data={filteredLeads} />
      </div>
    </div>
  );
};
export default LeadBoard;
// Make sure to export default as well!
