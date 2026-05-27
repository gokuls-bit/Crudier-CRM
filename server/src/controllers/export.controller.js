/**
 * ============================================================
 * Crudier CRM — Exporter Controller
 * ============================================================
 * Exports workspace datasets (such as tasks and leads) into
 * downloadable formats (CSV and Microsoft Excel).
 */

const Task = require('../models/task.model');
const Lead = require('../models/lead.model');
const { exportToCSV } = require('../utils/csvExporter');
const { exportToExcel } = require('../utils/excelExporter');
const ApiError = require('../utils/apiError');

/**
 * Export tasks in CSV or Excel.
 * GET /api/v1/export/tasks
 */
const exportTasks = async (req, res, next) => {
  const workspaceId = req.user.workspaceId;
  const format = (req.query.format || 'csv').toLowerCase();

  if (!workspaceId) {
    return next(new ApiError('No active workspace selected.', 400));
  }

  // Fetch tasks for the active workspace
  const tasks = await Task.find({ workspaceId })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  // Map to flat structure for table exporters
  const flatData = tasks.map((task) => ({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assigneeName: task.assignedTo ? task.assignedTo.name : 'Unassigned',
    assigneeEmail: task.assignedTo ? task.assignedTo.email : '',
    creatorName: task.createdBy ? task.createdBy.name : 'System',
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'No Due Date',
    createdAt: task.createdAt.toISOString().split('T')[0],
  }));

  const headers = {
    title: 'Task Title',
    description: 'Task Description',
    status: 'Status',
    priority: 'Priority',
    assigneeName: 'Assigned Name',
    assigneeEmail: 'Assigned Email',
    creatorName: 'Created By',
    dueDate: 'Due Date',
    createdAt: 'Created On',
  };

  if (format === 'excel') {
    const excelContent = exportToExcel(flatData, headers);
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="tasks-export-${Date.now()}.xls"`);
    return res.status(200).send(excelContent);
  } else {
    const csvContent = exportToCSV(flatData, headers);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tasks-export-${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  }
};

/**
 * Export leads in CSV or Excel.
 * GET /api/v1/export/leads
 */
const exportLeads = async (req, res, next) => {
  const workspaceId = req.user.workspaceId;
  const format = (req.query.format || 'csv').toLowerCase();

  if (!workspaceId) {
    return next(new ApiError('No active workspace selected.', 400));
  }

  // Fetch leads for the active workspace
  const leads = await Lead.find({ workspaceId })
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });

  // Map to flat structure for table exporters
  const flatData = leads.map((lead) => ({
    companyName: lead.companyName,
    contactPerson: lead.contactPerson,
    email: lead.email || '',
    phone: lead.phone || '',
    status: lead.status,
    estimatedValue: lead.estimatedValue,
    assigneeName: lead.assignedTo ? lead.assignedTo.name : 'Unassigned',
    followUpDate: lead.followUpDate ? lead.followUpDate.toISOString().split('T')[0] : 'NoneScheduled',
    createdAt: lead.createdAt.toISOString().split('T')[0],
  }));

  const headers = {
    companyName: 'Company Name',
    contactPerson: 'Contact Person',
    email: 'Contact Email',
    phone: 'Contact Phone',
    status: 'Sales Stage',
    estimatedValue: 'Estimated Deal Value ($)',
    assigneeName: 'Assigned Agent',
    followUpDate: 'Follow Up Date',
    createdAt: 'Created On',
  };

  if (format === 'excel') {
    const excelContent = exportToExcel(flatData, headers);
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.xls"`);
    return res.status(200).send(excelContent);
  } else {
    const csvContent = exportToCSV(flatData, headers);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  }
};

module.exports = {
  exportTasks,
  exportLeads,
};
