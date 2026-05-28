export const getTaskStatusColors = (status) => {
  switch (status) {
    case 'Approved':
    case 'Done':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Review':
    case 'Submitted':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'In Progress':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    case 'Blocked':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'Rejected':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'Pending':
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

export const getPriorityColors = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse-subtle';
    case 'High':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'Medium':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    case 'Low':
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

export const getAttendanceColors = (status) => {
  switch (status) {
    case 'Present':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Late':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'Half Day':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    case 'Absent':
    default:
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  }
};

export const getLeadStatusColors = (status) => {
  switch (status) {
    case 'Closed Won':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Closed Lost':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'Negotiation':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'Meeting Scheduled':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'Contacted':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    case 'New Lead':
    default:
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
  }
};
