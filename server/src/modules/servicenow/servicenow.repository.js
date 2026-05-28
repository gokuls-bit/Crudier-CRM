/**
 * ============================================================
 * Crudier CRM — ServiceNow Module Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

// Seed helper to populate basic templates on start
const ensureCatalogAndKBSeeded = async (db) => {
  const catalogCount = await db.collection('catalog_items').countDocuments();
  if (catalogCount === 0) {
    await db.collection('catalog_items').insertMany([
      {
        _id: new ObjectId(),
        name: 'Developer Laptop Upgrade',
        description: 'Request a MacBook Pro M3 Max or high-spec ThinkPad for corporate software engineering workflows.',
        fields: [
          { name: 'Operating System', type: 'dropdown', options: ['macOS Sonoma', 'Ubuntu Linux', 'Windows 11 Pro'], required: true },
          { name: 'Justification', type: 'rich-text', required: true }
        ],
        approverRole: 'Admin',
        sla: 24 // hours
      },
      {
        _id: new ObjectId(),
        name: 'CRM Database Production Access',
        description: 'Temporary database credentials for production troubleshooting operations.',
        fields: [
          { name: 'Access Duration', type: 'dropdown', options: ['1 Hour', '4 Hours', '24 Hours'], required: true },
          { name: 'Incident Ticket ID', type: 'text', required: false }
        ],
        approverRole: 'Founder',
        sla: 2 // hours
      }
    ]);
  }

  const kbCount = await db.collection('kb_articles').countDocuments();
  if (kbCount === 0) {
    await db.collection('kb_articles').insertMany([
      {
        _id: new ObjectId(),
        title: 'Setting up Multi-Factor Authentication (2FA)',
        slug: 'setup-mfa',
        category: 'Security',
        content: '<p>Follow this guide to enable 2FA on your account settings workspace panel. Use Google Authenticator or Microsoft Authenticator apps to scan the QR code.</p>',
        version: 1,
        history: [],
        views: 45,
        helpful: 12,
        unhelpful: 0,
        restrictedRoles: []
      },
      {
        _id: new ObjectId(),
        title: 'Emergency P1 Incident Gating Procedures',
        slug: 'p1-incidents',
        category: 'Support Operations',
        content: '<p>A P1 incident represents a critical service outage. Creating a P1 automatically notifies both the Workspace Founder and Workspace Administrators immediately.</p>',
        version: 2,
        history: [
          { version: 1, content: '<p>P1 incidents represent service outages.</p>', updatedAt: new Date(Date.now() - 86400000) }
        ],
        views: 28,
        helpful: 8,
        unhelpful: 1,
        restrictedRoles: ['Founder', 'Admin', 'Team Lead', 'Developer']
      }
    ]);
  }
};

const servicenowRepository = {
  /**
   * Global Unified Search
   */
  searchEverything: async (queryText) => {
    const db = getDb();
    await ensureCatalogAndKBSeeded(db);
    
    const regex = { $regex: queryText, $options: 'i' };

    const tasks = await db.collection('tasks').find({ title: regex }).limit(10).toArray();
    const leads = await db.collection('leads').find({ $or: [{ name: regex }, { company: regex }] }).limit(10).toArray();
    const members = await db.collection('users').find({ name: regex }).limit(10).toArray();
    const notes = await db.collection('notes').find({ title: regex }).limit(10).toArray();
    const meetings = await db.collection('meetings').find({ title: regex }).limit(10).toArray();
    const knowledge = await db.collection('kb_articles').find({ title: regex }).limit(10).toArray();

    return { tasks, leads, members, notes, meetings, knowledge };
  },

  /**
   * Workflows (Visual builder & history log)
   */
  getWorkflows: async () => {
    const db = getDb();
    return db.collection('workflows').find().toArray();
  },

  createWorkflow: async (data) => {
    const db = getDb();
    const doc = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('workflows').insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  getWorkflowRuns: async () => {
    const db = getDb();
    return db.collection('workflow_runs').find().sort({ timestamp: -1 }).toArray();
  },

  createWorkflowRun: async (runData) => {
    const db = getDb();
    const doc = {
      ...runData,
      timestamp: new Date()
    };
    await db.collection('workflow_runs').insertOne(doc);
    return doc;
  },

  /**
   * Custom Form definitions
   */
  getFormDefinitions: async () => {
    const db = getDb();
    return db.collection('custom_forms').find().toArray();
  },

  saveFormDefinition: async (module, data) => {
    const db = getDb();
    await db.collection('custom_forms').updateOne(
      { module },
      { $set: { fields: data.fields, publishedRoles: data.publishedRoles, updatedAt: new Date() } },
      { upsert: true }
    );
    return { module, ...data };
  },

  /**
   * SLAs
   */
  getSLAs: async () => {
    const db = getDb();
    return db.collection('slas').find().toArray();
  },

  saveSLA: async (data) => {
    const db = getDb();
    await db.collection('slas').updateOne(
      { priority: data.priority },
      { $set: { duration: data.duration, escalationRole: data.escalationRole, updatedAt: new Date() } },
      { upsert: true }
    );
    return data;
  },

  /**
   * Approvals
   */
  getApprovals: async (userId) => {
    const db = getDb();
    const uId = new ObjectId(userId);
    // Find approvals where user is either the current approver or delegator
    return db.collection('approvals').find({
      $or: [
        { 'stages.approverId': uId },
        { delegatedTo: uId }
      ]
    }).toArray();
  },

  createApproval: async (data) => {
    const db = getDb();
    const doc = {
      ...data,
      targetId: new ObjectId(data.targetId),
      stages: data.stages.map(s => ({
        ...s,
        approverId: new ObjectId(s.approverId),
        status: s.status || 'Pending'
      })),
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('approvals').insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  updateApprovalStatus: async (approvalId, userId, action, comment) => {
    const db = getDb();
    const app = await db.collection('approvals').findOne({ _id: new ObjectId(approvalId) });
    if (!app) return null;

    const uId = new ObjectId(userId);
    const updatedStages = app.stages.map(stage => {
      if (stage.approverId.toString() === uId.toString() && stage.status === 'Pending') {
        return {
          ...stage,
          status: action === 'approve' ? 'Approved' : 'Rejected',
          comment: comment || '',
          decidedAt: new Date()
        };
      }
      return stage;
    });

    const isAllApproved = updatedStages.every(s => s.status === 'Approved');
    const isAnyRejected = updatedStages.some(s => s.status === 'Rejected');

    const nextStatus = isAllApproved ? 'Approved' : (isAnyRejected ? 'Rejected' : 'Pending');

    await db.collection('approvals').updateOne(
      { _id: new ObjectId(approvalId) },
      { $set: { stages: updatedStages, status: nextStatus, updatedAt: new Date() } }
    );

    return { ...app, stages: updatedStages, status: nextStatus };
  },

  /**
   * Incidents
   */
  getIncidents: async () => {
    const db = getDb();
    return db.collection('incidents').find().sort({ createdAt: -1 }).toArray();
  },

  getIncidentById: async (id) => {
    const db = getDb();
    return db.collection('incidents').findOne({ _id: new ObjectId(id) });
  },

  createIncident: async (userId, data) => {
    const db = getDb();
    const doc = {
      title: data.title.trim(),
      description: data.description || '',
      severity: data.severity || 'P3', // P1 - P4
      status: 'New',
      assignedTo: data.assignedTo ? new ObjectId(data.assignedTo) : null,
      createdBy: new ObjectId(userId),
      timeline: [
        { event: 'Incident Created', timestamp: new Date(), userId: new ObjectId(userId) }
      ],
      linkedTasks: [],
      postIncidentReview: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('incidents').insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  updateIncident: async (id, updateData, userId) => {
    const db = getDb();
    const incId = new ObjectId(id);
    const timelineEntry = {
      event: `Incident Updated: ${Object.keys(updateData).join(', ')}`,
      timestamp: new Date(),
      userId: new ObjectId(userId)
    };

    const cleanUpdate = { ...updateData, updatedAt: new Date() };
    if (cleanUpdate.assignedTo) {
      cleanUpdate.assignedTo = new ObjectId(cleanUpdate.assignedTo);
    }

    await db.collection('incidents').updateOne(
      { _id: incId },
      { 
        $set: cleanUpdate,
        $push: { timeline: timelineEntry }
      }
    );
    return db.collection('incidents').findOne({ _id: incId });
  },

  /**
   * Knowledge Base
   */
  getArticles: async () => {
    const db = getDb();
    await ensureCatalogAndKBSeeded(db);
    return db.collection('kb_articles').find().toArray();
  },

  getArticleBySlug: async (slug) => {
    const db = getDb();
    await ensureCatalogAndKBSeeded(db);
    return db.collection('kb_articles').findOne({ slug });
  },

  createArticle: async (data) => {
    const db = getDb();
    const doc = {
      ...data,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      version: 1,
      history: [],
      views: 0,
      helpful: 0,
      unhelpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('kb_articles').insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  updateArticle: async (id, data) => {
    const db = getDb();
    const art = await db.collection('kb_articles').findOne({ _id: new ObjectId(id) });
    if (!art) return null;

    const nextVer = (art.version || 1) + 1;
    const historyEntry = {
      version: art.version || 1,
      content: art.content,
      updatedAt: art.updatedAt || new Date()
    };

    const cleanUpdate = {
      ...data,
      version: nextVer,
      updatedAt: new Date()
    };

    await db.collection('kb_articles').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: cleanUpdate,
        $push: { history: historyEntry }
      }
    );
    return db.collection('kb_articles').findOne({ _id: new ObjectId(id) });
  },

  submitKBFeedback: async (id, isHelpful) => {
    const db = getDb();
    const incField = isHelpful ? 'helpful' : 'unhelpful';
    await db.collection('kb_articles').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { [incField]: 1 } }
    );
    return db.collection('kb_articles').findOne({ _id: new ObjectId(id) });
  },

  /**
   * Change Requests
   */
  getChanges: async () => {
    const db = getDb();
    return db.collection('changes').find().toArray();
  },

  createChange: async (userId, data) => {
    const db = getDb();
    const doc = {
      title: data.title.trim(),
      description: data.description || '',
      type: data.type || 'Standard', // Standard, Normal, Emergency
      impact: data.impact || 'Low',
      risk: data.risk || 'Low',
      status: 'Draft',
      rollbackPlan: data.rollbackPlan || '',
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('changes').insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  updateChangeStatus: async (id, status) => {
    const db = getDb();
    await db.collection('changes').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    return db.collection('changes').findOne({ _id: new ObjectId(id) });
  },

  /**
   * Service Catalog
   */
  getCatalogItems: async () => {
    const db = getDb();
    await ensureCatalogAndKBSeeded(db);
    return db.collection('catalog_items').find().toArray();
  },

  createCatalogRequest: async (userId, data) => {
    const db = getDb();
    const doc = {
      itemId: new ObjectId(data.itemId),
      userId: new ObjectId(userId),
      formData: data.formData || {},
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('catalog_requests').insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  getCatalogRequests: async (userId) => {
    const db = getDb();
    const query = userId ? { userId: new ObjectId(userId) } : {};
    return db.collection('catalog_requests').find(query).toArray();
  },

  /**
   * Reports
   */
  getReports: async () => {
    const db = getDb();
    return db.collection('reports').find().toArray();
  },

  saveReport: async (userId, data) => {
    const db = getDb();
    const doc = {
      ...data,
      createdBy: new ObjectId(userId),
      createdAt: new Date()
    };
    const result = await db.collection('reports').insertOne(doc);
    return { _id: result.insertedId, ...doc };
  },

  /**
   * Audit Logs
   */
  getAuditLogs: async () => {
    const db = getDb();
    return db.collection('audit_logs').find().sort({ timestamp: -1 }).limit(100).toArray();
  },

  writeAuditLog: async (userId, action, details) => {
    const db = getDb();
    const log = {
      userId: userId ? new ObjectId(userId) : null,
      action,
      details,
      timestamp: new Date()
    };
    await db.collection('audit_logs').insertOne(log);
    return log;
  }
};

module.exports = servicenowRepository;
