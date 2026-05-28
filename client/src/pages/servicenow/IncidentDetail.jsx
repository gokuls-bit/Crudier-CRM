import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api.config';
import { useToastStore } from '../../store/toast.store';
import { useUiStore } from '../../store/ui.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  ArrowLeft, Warning, CheckCircle, Clock, Calendar, 
  ChatCenteredText, ListBullets, PencilSimple 
} from '@phosphor-icons/react';

export const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Status & assignment actions
  const [status, setStatus] = useState('New');
  const [assignedTo, setAssignedTo] = useState('');
  
  // PIR fields
  const [pirContent, setPirContent] = useState('');
  const [updating, setUpdating] = useState(false);

  const addToast = useToastStore((state) => state.addToast);
  const openContextPanel = useUiStore((state) => state.openContextPanel);

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const fetchIncidentDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/servicenow/incidents/${id}`);
      const data = response.data?.data;
      setIncident(data);
      setStatus(data.status);
      setAssignedTo(data.assignedTo || '');
      setPirContent(data.postIncidentReview || '');

      // Load into right context panel automatically on record open!
      openContextPanel({
        type: 'Incident Ticket',
        title: data.title,
        status: data.status,
        priority: data.severity === 'P1' ? 'Critical' : 'High',
        description: data.description,
        assignedTo: data.assignedTo || 'Unassigned',
        activities: data.timeline?.map(t => ({ action: t.event, timestamp: t.timestamp })) || []
      });

    } catch (err) {
      // Mockup fallbacks
      const mockInc = {
        _id: id,
        title: 'Database replication thread lag exceeds threshold',
        description: 'Critical primary/secondary replication lagging by 3500 seconds, affecting read endpoints.',
        severity: 'P1',
        status: 'Active',
        assignedTo: 'Team Lead',
        createdBy: 'Admin',
        timeline: [
          { event: 'Incident Opened', timestamp: new Date(Date.now() - 3600000), userId: 'Admin' },
          { event: 'Assigned to Team Lead', timestamp: new Date(Date.now() - 3000000), userId: 'Admin' },
          { event: 'Active Diagnostics Initiated', timestamp: new Date(Date.now() - 1200000), userId: 'Team Lead' }
        ],
        linkedTasks: ['Task #99', 'Task #100'],
        postIncidentReview: 'Pending resolution'
      };
      setIncident(mockInc);
      setStatus(mockInc.status);
      setAssignedTo(mockInc.assignedTo);
      setPirContent(mockInc.postIncidentReview);

      openContextPanel({
        type: 'Incident Ticket',
        title: mockInc.title,
        status: mockInc.status,
        priority: mockInc.severity === 'P1' ? 'Critical' : 'High',
        description: mockInc.description,
        assignedTo: mockInc.assignedTo,
        activities: mockInc.timeline.map(t => ({ action: t.event, timestamp: t.timestamp }))
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIncident = async (e) => {
    if (e) e.preventDefault();
    setUpdating(true);
    try {
      const payload = { status, assignedTo, postIncidentReview: pirContent };
      await api.patch(`/servicenow/incidents/${id}`, payload);
      addToast('Incident ticket updated successfully.', 'success');
      fetchIncidentDetails();
    } catch (err) {
      // Preview support
      const updated = {
        ...incident,
        status,
        assignedTo,
        postIncidentReview: pirContent,
        timeline: [
          ...incident.timeline,
          { event: `Incident fields updated: Status ➔ ${status}`, timestamp: new Date(), userId: 'current_user' }
        ]
      };
      setIncident(updated);
      addToast('Incident fields updated (preview).', 'info');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !incident) {
    return (
      <div className="flex items-center justify-center py-20 text-[#1C2945]">
        <Clock className="w-8 h-8 animate-spin text-[#00A9CE]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full py-4 text-[#1C2945]">
      
      {/* Navigation back */}
      <button 
        onClick={() => navigate('/incidents')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1C2945] font-bold self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to incidents queue</span>
      </button>

      <PageHeader 
        title={`Incident ticket: #${incident._id.slice(-6)}`}
        description={incident.title}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left/Center pane: incident status & PIR forms */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full text-left">
          
          {/* Main info card */}
          <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">Outage ticket details</h3>
            
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed bg-[#F4F5F7] p-4 rounded-lg border border-[#E0E3E8]">
              <div><strong>Description:</strong> {incident.description || 'No description provided.'}</div>
              <div><strong>Opened Severity:</strong> {incident.severity}</div>
              <div><strong>Created By:</strong> {incident.createdBy || 'System'}</div>
            </div>

            <form onSubmit={handleUpdateIncident} className="flex flex-col gap-4 mt-2">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ticket Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-[#E0E3E8] bg-white outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Active">Active Diagnostics</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <Input 
                  type="text"
                  label="Assignee User"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Developer Alice"
                />
              </div>

              {/* PIR Form (Only editable for Resolved/Closed incidents) */}
              {(status === 'Resolved' || status === 'Closed') && (
                <div className="flex flex-col gap-1.5 border-t pt-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <PencilSimple className="w-4 h-4 text-[#00A9CE]" />
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Post-Incident Review (PIR)</label>
                  </div>
                  <textarea
                    rows={4}
                    value={pirContent}
                    onChange={(e) => setPirContent(e.target.value)}
                    placeholder="Document root cause analysis, timeline review, and preventive actions..."
                    className="w-full p-2.5 text-xs border border-[#E0E3E8] rounded bg-[#F4F5F7] focus:bg-white focus:border-[#00A9CE] outline-none transition-all placeholder-slate-400"
                    required
                  />
                </div>
              )}

              <Button type="submit" isLoading={updating} disabled={updating} className="w-fit self-end px-5 py-2">
                Save Outage Changes
              </Button>
            </form>
          </div>

          {/* Linked spawned tasks */}
          <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <ListBullets className="w-4 h-4 text-[#00A9CE]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Linked Spawned Tasks</h3>
            </div>
            {incident.linkedTasks?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {incident.linkedTasks.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-[#F4F5F7] border border-[#E0E3E8] rounded text-xs">
                    <span className="font-bold">{t}</span>
                    <span className="text-slate-500 uppercase text-[9px]">Active</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No linked tasks generated for this incident.</span>
            )}
          </div>

        </div>

        {/* Right pane: timeline events */}
        <div className="bg-white border border-[#E0E3E8] p-6 rounded-xl flex flex-col gap-4 shadow-sm text-left">
          <div className="flex items-center gap-1.5 border-b pb-2">
            <ChatCenteredText className="w-4 h-4 text-[#00A9CE]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Outage Incident Timeline</h3>
          </div>

          <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-5 py-1">
            {incident.timeline?.map((evt, idx) => (
              <div key={idx} className="relative text-xs text-left">
                {/* Dot */}
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#00A9CE] border border-white" />
                <span className="font-bold text-[#1C2945] block">{evt.event}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default IncidentDetail;
