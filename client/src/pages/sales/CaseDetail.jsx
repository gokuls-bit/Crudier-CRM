import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import salesService from '../../services/sales.service';
import { useToastStore } from '../../store/toast.store';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import { ArrowLeft, Clock, Warning, Star } from '@phosphor-icons/react';

export const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csatScore, setCsatScore] = useState(5);
  const [submittingCSAT, setSubmittingCSAT] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const response = await salesService.getCase(id);
      setTicket(response.data?.data);
    } catch (err) {
      setTicket({
        _id: id,
        subject: 'Billing mismatch in invoice Q2',
        description: 'Customer got billed double for database cluster engine.',
        status: 'Working',
        priority: 'Medium',
        csatScore: null,
        createdAt: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await salesService.updateCase(id, { status: newStatus });
      setTicket(prev => ({ ...prev, status: newStatus }));
      addToast(`Case status updated to: ${newStatus}`, 'success');
      if (newStatus !== 'Closed') {
        fetchCaseDetails();
      }
    } catch (err) {
      setTicket(prev => ({ ...prev, status: newStatus }));
      addToast('Status updated (mock).', 'info');
    }
  };

  const handleSubmitCSAT = async (e) => {
    e.preventDefault();
    setSubmittingCSAT(true);
    try {
      await salesService.updateCase(id, { csatScore });
      setTicket(prev => ({ ...prev, csatScore }));
      addToast('CSAT feedback submitted successfully.', 'success');
    } catch (err) {
      setTicket(prev => ({ ...prev, csatScore }));
      addToast('CSAT logged (mock).', 'info');
    } finally {
      setSubmittingCSAT(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div className="flex justify-center items-center py-20 text-[#032D60]">
        <Clock className="w-8 h-8 animate-spin text-[#0176D3]" />
      </div>
    );
  }

  return (
    <div className="salesforce-theme flex flex-col gap-6 w-full py-4 text-[#032D60]">
      <button 
        onClick={() => navigate('/sales/cases')}
        className="flex items-center gap-1 text-xs text-[#0176D3] hover:underline self-start font-bold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Case Queue
      </button>

      <PageHeader 
        title={`Support Case #${ticket._id?.toString().slice(-6).toUpperCase()}`}
        description={`Customer Ticket Details: ${ticket.subject}`}
        actions={
          <div className="flex gap-2">
            {ticket.status !== 'Closed' && (
              <Button 
                onClick={() => handleStatusChange('Closed')} 
                className="bg-[#2E844A] hover:bg-[#2E844A]/80 text-white font-semibold py-1.5 px-4 text-xs rounded"
              >
                Close Ticket
              </Button>
            )}
            {ticket.status === 'New' && (
              <Button 
                onClick={() => handleStatusChange('Working')} 
                variant="secondary" 
                size="sm"
              >
                Start Investigation
              </Button>
            )}
          </div>
        }
      />

      {/* Highlights Panel */}
      <div className="slds-highlights p-4 border border-[#E5E5E5] rounded flex flex-col gap-4 text-left shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
          Highlights Panel
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Priority:</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-100 text-slate-700'
              }`}>
                {ticket.priority}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Logged Time:</span>
              <span className="font-semibold text-slate-750">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Status:</span>
              <span className="font-bold text-[#0176D3]">{ticket.status}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">CSAT Score:</span>
              <span className="font-semibold text-slate-700">
                {ticket.csatScore ? `⭐️ ${ticket.csatScore} / 5` : 'Pending closure'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Ticket Subject:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[150px]">{ticket.subject}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-400 font-semibold">Escalated:</span>
              <span className="font-bold text-[#BA0517]">
                {ticket.status === 'Escalated' ? 'Escalation Alert ⚠️' : 'Active normal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* Ticket Description details */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-[#E5E5E5] p-5 rounded">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 mb-3">
              Description / Issue Logs
            </h4>
            <p className="text-xs text-[#032D60] leading-relaxed whitespace-pre-line bg-slate-50 p-4 border rounded">
              {ticket.description}
            </p>
          </div>
        </div>

        {/* CSAT Survey form column if Closed */}
        <div className="flex flex-col gap-4">
          {ticket.status === 'Closed' && (
            <div className="bg-white border border-[#E5E5E5] p-5 rounded-md flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E844A] border-b pb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-emerald-600" />
                Customer CSAT Survey
              </h4>

              {ticket.csatScore ? (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-500">Feedback successfully logged. Rating given:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-6 h-6 ${star <= ticket.csatScore ? 'text-amber-500 font-bold fill-amber-500' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitCSAT} className="flex flex-col gap-3">
                  <span className="text-[11px] text-slate-500 leading-normal">
                    Please submit a satisfaction rating for this ticket resolution:
                  </span>
                  
                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCsatScore(star)}
                        className="outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 ${star <= csatScore ? 'text-amber-500 fill-amber-500' : 'text-slate-350 hover:text-amber-400'}`} 
                        />
                      </button>
                    ))}
                  </div>

                  <Button 
                    type="submit" 
                    isLoading={submittingCSAT}
                    disabled={submittingCSAT}
                    className="slds-btn-primary py-2 w-full text-xs font-semibold"
                  >
                    Submit Score
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CaseDetail;
