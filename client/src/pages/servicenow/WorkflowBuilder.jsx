import React, { useState, useEffect } from 'react';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Play, Plus, Trash, FloppyDisk, GitMerge, FileText, CheckCircle, 
  UserPlus, Bell, ArrowSquareOut, EnvelopeSimple, Clock 
} from '@phosphor-icons/react';

export const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [wfName, setWfName] = useState('');
  const [trigger, setTrigger] = useState('record_created');
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchWorkflows();
    fetchRuns();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/servicenow/workflows');
      const data = response.data?.data || [];
      setWorkflows(data);
      if (data.length > 0) {
        selectWorkflow(data[0]);
      } else {
        createNewWorkflow();
      }
    } catch (err) {
      addToast('Failed to fetch workflows.', 'error');
    }
  };

  const fetchRuns = async () => {
    try {
      const response = await api.get('/servicenow/workflows/runs');
      setLogs(response.data?.data || []);
    } catch (err) {
      // Local mockup runs
      setLogs([
        { workflowName: 'Auto-Assign High Severity', trigger: 'record_created', timestamp: new Date(), status: 'Success', details: 'Task assigned to Team Lead.' }
      ]);
    }
  };

  const selectWorkflow = (wf) => {
    setActiveWorkflow(wf);
    setWfName(wf.name);
    setTrigger(wf.trigger);
    setNodes(wf.nodes || []);
  };

  const createNewWorkflow = () => {
    setActiveWorkflow(null);
    setWfName('New Workflow Policy');
    setTrigger('record_created');
    setNodes([
      { id: '1', type: 'condition', config: { field: 'priority', value: 'Critical' } },
      { id: '2', type: 'assign_task', config: { assignee: 'Team Lead' } }
    ]);
  };

  const handleAddNode = (type) => {
    const newNode = {
      id: String(Date.now()),
      type,
      config: type === 'condition' ? { field: 'status', value: 'Pending' } : { details: 'New action block' }
    };
    setNodes([...nodes, newNode]);
  };

  const handleRemoveNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const handleNodeConfigChange = (id, key, val) => {
    setNodes(nodes.map(n => {
      if (n.id === id) {
        return { ...n, config: { ...n.config, [key]: val } };
      }
      return n;
    }));
  };

  const handleSave = async () => {
    if (!wfName.trim()) {
      addToast('Workflow name is required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: wfName, trigger, nodes };
      await api.post('/servicenow/workflows', payload);
      addToast('Workflow saved successfully.', 'success');
      fetchWorkflows();
    } catch (err) {
      addToast('Failed to save workflow.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const runPayload = {
        workflowName: wfName,
        trigger,
        status: 'Success',
        details: `Simulated trigger '${trigger}' - executed ${nodes.length} nodes successfully.`
      };
      await api.post('/servicenow/workflows/runs', runPayload);
      addToast('Simulation run recorded.', 'success');
      fetchRuns();
    } catch (err) {
      addToast('Failed to run simulation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      <PageHeader 
        title="Visual Workflow Builder" 
        description="Design visual trigger engines to assign tasks, issue notifications, and orchestrate CRM workflows automatically."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left pane: policy library */}
        <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rules Library</h3>
            <Button variant="secondary" size="xs" onClick={createNewWorkflow} className="py-1 px-2 text-[10px]">
              + New Rule
            </Button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
            {workflows.map((wf) => (
              <button
                key={wf._id}
                onClick={() => selectWorkflow(wf)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                  activeWorkflow?._id === wf._id 
                    ? 'border-[#00A9CE] bg-[#00A9CE]/5 font-semibold text-[#00A9CE]' 
                    : 'border-[#E0E3E8] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1 font-Outfit">
                  <GitMerge className="w-4 h-4" />
                  <span>{wf.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Trigger: {wf.trigger}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center pane: Visual canvas editor */}
        <div className="lg:col-span-2 bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center border-b pb-4">
            <div className="flex-1 w-full max-w-sm">
              <Input 
                type="text"
                label="Rule Policy Name"
                value={wfName}
                onChange={(e) => setWfName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1 w-full max-w-[200px]">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trigger Source</label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
              >
                <option value="record_created">Record Created</option>
                <option value="field_changed">Field Changed</option>
                <option value="scheduled">Scheduled Interval</option>
                <option value="webhook_received">Webhook Trigger</option>
                <option value="manual">Manual Play Button</option>
              </select>
            </div>
          </div>

          {/* Builder Canvas */}
          <div className="flex-1 bg-[#F4F5F7] border border-[#E0E3E8] rounded-xl p-6 min-h-[300px] flex flex-col items-center gap-4 relative overflow-y-auto">
            {/* Start node */}
            <div className="bg-[#1C2945] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md">
              <Play className="w-4 h-4 text-[#00A9CE]" />
              <span>TRIGGER: {trigger.toUpperCase()}</span>
            </div>

            <div className="w-0.5 h-6 bg-[#E0E3E8]" />

            {/* Configured Nodes */}
            {nodes.length === 0 ? (
              <span className="text-slate-400 text-xs italic py-6">Canvas is empty. Drag action blocks in below.</span>
            ) : (
              nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <div className="bg-white border border-[#E0E3E8] p-4 rounded-xl flex items-center justify-between gap-4 w-full max-w-lg shadow-sm hover:border-[#00A9CE] transition-all text-left">
                    <div className="flex gap-3 items-start flex-1">
                      <div className="p-2 rounded bg-slate-100 text-slate-600">
                        {node.type === 'condition' && <GitMerge className="w-4 h-4" />}
                        {node.type === 'assign_task' && <UserPlus className="w-4 h-4" />}
                        {node.type === 'notify' && <Bell className="w-4 h-4" />}
                        {node.type === 'webhook' && <ArrowSquareOut className="w-4 h-4" />}
                        {node.type === 'email' && <EnvelopeSimple className="w-4 h-4" />}
                        {node.type === 'approval' && <Clock className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 flex flex-col gap-1 text-xs">
                        <span className="font-bold capitalize text-[#1C2945]">{node.type.replace('_', ' ')} Block</span>
                        {node.type === 'condition' ? (
                          <div className="flex gap-2 items-center mt-1">
                            <input 
                              type="text" 
                              placeholder="priority" 
                              value={node.config.field || ''} 
                              onChange={(e) => handleNodeConfigChange(node.id, 'field', e.target.value)}
                              className="border border-[#E0E3E8] px-2 py-1 rounded w-20 text-[10px]"
                            />
                            <span>equals</span>
                            <input 
                              type="text" 
                              placeholder="Critical" 
                              value={node.config.value || ''} 
                              onChange={(e) => handleNodeConfigChange(node.id, 'value', e.target.value)}
                              className="border border-[#E0E3E8] px-2 py-1 rounded w-20 text-[10px]"
                            />
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="Configuration details..." 
                            value={node.config.assignee || node.config.details || ''} 
                            onChange={(e) => handleNodeConfigChange(node.id, node.type === 'assign_task' ? 'assignee' : 'details', e.target.value)}
                            className="border border-[#E0E3E8] px-2 py-1 rounded w-full text-[10px] mt-1"
                          />
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveNode(node.id)}
                      className="p-1 hover:bg-slate-100 rounded text-rose-500"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-0.5 h-6 bg-[#E0E3E8]" />
                </React.Fragment>
              ))
            )}

            {/* Action buttons to append nodes */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Button onClick={() => handleAddNode('condition')} variant="secondary" size="xs" className="text-[10px]">
                + Branch Rule
              </Button>
              <Button onClick={() => handleAddNode('assign_task')} variant="secondary" size="xs" className="text-[10px]">
                + Assign Action
              </Button>
              <Button onClick={() => handleAddNode('notify')} variant="secondary" size="xs" className="text-[10px]">
                + Notify Action
              </Button>
              <Button onClick={() => handleAddNode('email')} variant="secondary" size="xs" className="text-[10px]">
                + Email Action
              </Button>
              <Button onClick={() => handleAddNode('webhook')} variant="secondary" size="xs" className="text-[10px]">
                + Webhook Action
              </Button>
            </div>
          </div>

          {/* Builder Controls */}
          <div className="flex gap-3 justify-end mt-4">
            <Button 
              onClick={handleRunSimulation} 
              variant="secondary" 
              className="flex items-center gap-1.5"
              disabled={loading}
            >
              <Play className="w-4 h-4" />
              <span>Simulate Run</span>
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex items-center gap-1.5"
              disabled={loading}
            >
              <FloppyDisk className="w-4 h-4" />
              <span>Save Policy</span>
            </Button>
          </div>
        </div>

      </div>

      {/* Execution history log */}
      <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl shadow-sm mt-4 text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Simulation Execution History & Debug Logs</h3>
        <div className="max-h-[200px] overflow-y-auto pr-1.5 custom-scrollbar flex flex-col gap-2">
          {logs.map((log, idx) => (
            <div key={idx} className="flex justify-between items-center p-2.5 bg-[#F4F5F7] border border-[#E0E3E8] rounded text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-[#1C2945]">{log.workflowName}</span>
                <span className="text-[10px] text-slate-500">{log.details}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Successful
                </span>
                <span className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
