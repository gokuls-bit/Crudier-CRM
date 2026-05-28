import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Trash, FloppyDisk, Layout, Eye, ShieldCheck, EyeSlash } from '@phosphor-icons/react';

export const FormBuilder = () => {
  const [selectedModule, setSelectedModule] = useState('incidents');
  const [columnsLayout, setColumnsLayout] = useState(2); // 1, 2, or 3 columns
  const [fields, setFields] = useState([]);
  const [publishedRoles, setPublishedRoles] = useState(['Developer', 'Admin', 'Founder']);
  const [loading, setLoading] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  const availableRoles = ['Founder', 'Admin', 'Team Lead', 'Developer', 'Designer', 'Sales', 'Intern'];

  useEffect(() => {
    fetchFormDefinition();
  }, [selectedModule]);

  const fetchFormDefinition = async () => {
    try {
      const response = await api.get('/servicenow/forms');
      const forms = response.data?.data || [];
      const match = forms.find(f => f.module === selectedModule);
      if (match) {
        setFields(match.fields || []);
        setPublishedRoles(match.publishedRoles || []);
      } else {
        // Load default seed fields
        setFields([
          { id: '1', name: 'Short Description', type: 'text', required: true, visibilityRule: 'always' },
          { id: '2', name: 'Details & Severity Justification', type: 'rich-text', required: false, visibilityRule: 'always' },
          { id: '3', name: 'Urgency Scope', type: 'dropdown', options: ['Critical Outage', 'Functional Impairment', 'Workaround Exists'], required: true, visibilityRule: 'always' }
        ]);
      }
    } catch (err) {
      addToast('Failed to load form definition.', 'error');
    }
  };

  const handleAddField = () => {
    const newField = {
      id: String(Date.now()),
      name: 'New Custom Field',
      type: 'text',
      required: false,
      visibilityRule: 'always',
      options: ''
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleFieldChange = (id, key, val) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        return { ...f, [key]: val };
      }
      return f;
    }));
  };

  const handleToggleRole = (role) => {
    if (publishedRoles.includes(role)) {
      setPublishedRoles(publishedRoles.filter(r => r !== role));
    } else {
      setPublishedRoles([...publishedRoles, role]);
    }
  };

  const handleSave = async () => {
    if (fields.length === 0) {
      addToast('Please add at least one field to publish.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fields,
        columnsLayout,
        publishedRoles
      };
      await api.post(`/servicenow/forms/${selectedModule}`, payload);
      addToast(`Form fields schema published for module ${selectedModule.toUpperCase()}.`, 'success');
    } catch (err) {
      addToast('Failed to publish custom form fields.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Custom Form Designer" 
        description="Drag, drop, and configure custom fields on incident tickets, change requests, or service catalog templates."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left pane: module configs */}
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl flex flex-col gap-5 shadow-sm text-left">
          
          {/* Target module selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
            >
              <option value="incidents">Incidents Queue</option>
              <option value="changes">Change Request board</option>
              <option value="catalog">Service Catalog items</option>
              <option value="tasks">Sprint Tasks</option>
            </select>
          </div>

          <div className="h-px bg-[#E0E3E8]" />

          {/* Columns layout switcher */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Layout Density Columns</label>
            <div className="flex bg-[#F4F5F7] p-0.5 rounded border border-[#E0E3E8] text-xs">
              <button 
                onClick={() => setColumnsLayout(1)}
                className={`flex-1 text-center py-1 font-bold rounded ${columnsLayout === 1 ? 'bg-white shadow' : 'text-slate-500'}`}
              >
                1 Col
              </button>
              <button 
                onClick={() => setColumnsLayout(2)}
                className={`flex-1 text-center py-1 font-bold rounded ${columnsLayout === 2 ? 'bg-white shadow' : 'text-slate-500'}`}
              >
                2 Cols
              </button>
              <button 
                onClick={() => setColumnsLayout(3)}
                className={`flex-1 text-center py-1 font-bold rounded ${columnsLayout === 3 ? 'bg-white shadow' : 'text-slate-500'}`}
              >
                3 Cols
              </button>
            </div>
          </div>

          <div className="h-px bg-[#E0E3E8]" />

          {/* Role restrictions */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Publish Gated Access Roles</label>
            <div className="flex flex-col gap-1.5">
              {availableRoles.map((role) => {
                const checked = publishedRoles.includes(role);
                return (
                  <label key={role} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={checked}
                      onChange={() => handleToggleRole(role)}
                      className="rounded border-[#E0E3E8] text-[#00A9CE] focus:ring-0"
                    />
                    <span>{role}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center/Right pane: Form Builder visual workspace canvas */}
        <div className="lg:col-span-2 bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-6 shadow-sm">
          
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Field Layout Canvas</h3>
            <Button onClick={handleAddField} variant="secondary" size="xs" className="flex items-center gap-1.5 py-1 px-2.5 text-[10px]">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Field</span>
            </Button>
          </div>

          {/* Visual Fields Canvas Grid */}
          <div className="flex-1 bg-[#F4F5F7] border border-[#E0E3E8] rounded-xl p-4 min-h-[360px] flex flex-col gap-4 overflow-y-auto">
            {fields.length === 0 ? (
              <span className="text-slate-400 text-xs italic py-12 text-center m-auto">Click "Add Custom Field" to start building your layout.</span>
            ) : (
              fields.map((f, idx) => (
                <div 
                  key={f.id} 
                  className="bg-white border border-[#E0E3E8] hover:border-[#00A9CE] transition-all p-4 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 text-left shadow-sm"
                >
                  {/* Title and details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
                    
                    {/* Label Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Field Label</label>
                      <input 
                        type="text" 
                        value={f.name}
                        onChange={(e) => handleFieldChange(f.id, 'name', e.target.value)}
                        className="border border-[#E0E3E8] px-2 py-1 rounded text-xs outline-none focus:border-[#00A9CE]"
                        required
                      />
                    </div>

                    {/* Field type dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Input Type</label>
                      <select
                        value={f.type}
                        onChange={(e) => handleFieldChange(f.id, 'type', e.target.value)}
                        className="border border-[#E0E3E8] px-2 py-1 rounded text-xs bg-white outline-none"
                      >
                        <option value="text">Text Box</option>
                        <option value="number">Number Field</option>
                        <option value="date">Date picker</option>
                        <option value="dropdown">Dropdown select</option>
                        <option value="checkbox">Toggle Checkbox</option>
                        <option value="rich-text">Rich Text Editor</option>
                        <option value="file">File Attachment</option>
                      </select>
                    </div>

                    {/* Options list for dropdowns */}
                    {f.type === 'dropdown' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Options (comma split)</label>
                        <input 
                          type="text" 
                          placeholder="Opt1, Opt2, Opt3"
                          value={f.options || ''}
                          onChange={(e) => handleFieldChange(f.id, 'options', e.target.value)}
                          className="border border-[#E0E3E8] px-2 py-1 rounded text-xs outline-none"
                        />
                      </div>
                    )}

                    {/* Visibility rules */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Visibility Rule</label>
                      <select
                        value={f.visibilityRule || 'always'}
                        onChange={(e) => handleFieldChange(f.id, 'visibilityRule', e.target.value)}
                        className="border border-[#E0E3E8] px-2 py-1 rounded text-xs bg-white outline-none"
                      >
                        <option value="always">Always Display</option>
                        <option value="admin_only">Admins Only</option>
                        <option value="conditional_critical">If Severity is Critical</option>
                      </select>
                    </div>

                    {/* Mandatory checkbox */}
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none mt-4 md:mt-0">
                      <input 
                        type="checkbox" 
                        checked={f.required}
                        onChange={(e) => handleFieldChange(f.id, 'required', e.target.checked)}
                        className="rounded border-[#E0E3E8] text-[#00A9CE]"
                      />
                      <span>Mandatory Field</span>
                    </label>

                  </div>

                  <button 
                    onClick={() => handleRemoveField(f.id)}
                    className="p-1.5 hover:bg-slate-100 rounded text-rose-500 shrink-0 self-end lg:self-center"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Builder Controls */}
          <div className="flex justify-end gap-3 mt-4 border-t pt-4">
            <Button 
              onClick={handleSave} 
              isLoading={loading}
              disabled={loading}
              className="flex items-center gap-1.5 py-2 px-4"
            >
              <FloppyDisk className="w-4 h-4" />
              <span>Publish Form Layout</span>
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FormBuilder;
