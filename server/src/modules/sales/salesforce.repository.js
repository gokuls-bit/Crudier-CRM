/**
 * ============================================================
 * Crudier CRM — Salesforce CRM Repository
 * ============================================================
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../../config/db');

// Stage to Probability/Category mapping
const STAGE_RULES = {
  'Prospecting': { prob: 10, cat: 'Pipeline' },
  'Qualification': { prob: 20, cat: 'Pipeline' },
  'Needs Analysis': { prob: 25, cat: 'Pipeline' },
  'Value Proposition': { prob: 50, cat: 'Best Case' },
  'Proposal / Price Quote': { prob: 65, cat: 'Best Case' },
  'Negotiation': { prob: 75, cat: 'Commit' },
  'Closed Won': { prob: 100, cat: 'Closed' },
  'Closed Lost': { prob: 0, cat: 'Omitted' }
};

const salesforceRepository = {

  // ==========================================
  // TIMELINE ACTIVITIES
  // ==========================================
  
  logTimelineActivity: async (workspaceId, parentType, parentId, type, subject, description, actorId) => {
    const db = getDb();
    const activity = {
      workspaceId: new ObjectId(workspaceId),
      parentType, // 'Account' or 'Contact' or 'Opportunity' or 'Case'
      parentId: new ObjectId(parentId),
      type, // 'Email' | 'Call' | 'Meeting' | 'Note' | 'Task' | 'System'
      subject,
      description,
      createdBy: actorId ? new ObjectId(actorId) : null,
      createdAt: new Date()
    };
    await db.collection('activities').insertOne(activity);
    return activity;
  },

  getTimelineActivities: async (parentType, parentId) => {
    const db = getDb();
    if (!ObjectId.isValid(parentId)) return [];
    return db.collection('activities')
      .find({ parentType, parentId: new ObjectId(parentId) })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // ==========================================
  // TERRITORY MANAGEMENT
  // ==========================================
  
  createTerritory: async (workspaceId, data) => {
    const db = getDb();
    const territory = {
      workspaceId: new ObjectId(workspaceId),
      name: data.name,
      region: data.region || '',
      industry: data.industry || '',
      assignedRepId: data.assignedRepId ? new ObjectId(data.assignedRepId) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('territories').insertOne(territory);
    return { _id: result.insertedId, ...territory };
  },

  findTerritories: async (workspaceId) => {
    const db = getDb();
    return db.collection('territories').find({ workspaceId: new ObjectId(workspaceId) }).toArray();
  },

  routeLeadOrAccount: async (workspaceId, region, industry) => {
    const db = getDb();
    // Find territory matching region and industry
    const query = { workspaceId: new ObjectId(workspaceId) };
    if (region) query.region = region;
    if (industry) query.industry = industry;

    const territory = await db.collection('territories').findOne(query);
    return territory ? territory.assignedRepId : null;
  },

  // ==========================================
  // ACCOUNTS
  // ==========================================
  
  createAccount: async (workspaceId, data, actorId) => {
    const db = getDb();
    
    // Auto-route based on territory
    let assignedRep = data.assignedTo ? new ObjectId(data.assignedTo) : null;
    if (!assignedRep) {
      const routedRep = await salesforceRepository.routeLeadOrAccount(workspaceId, data.region, data.industry);
      if (routedRep) assignedRep = routedRep;
    }

    const account = {
      workspaceId: new ObjectId(workspaceId),
      name: data.name,
      type: data.type || 'Prospect', // Prospect, Customer, Partner
      parentAccountId: data.parentAccountId ? new ObjectId(data.parentAccountId) : null,
      annualRevenue: parseFloat(data.annualRevenue) || 0,
      employeesCount: parseInt(data.employeesCount) || 0,
      billingAddress: data.billingAddress || '',
      shippingAddress: data.shippingAddress || '',
      assignedTo: assignedRep,
      region: data.region || '',
      industry: data.industry || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('accounts').insertOne(account);
    const newAccount = { _id: result.insertedId, ...account };

    await salesforceRepository.logTimelineActivity(
      workspaceId, 'Account', newAccount._id, 'System',
      'Account Created', `Company account "${data.name}" was initialized in CRM.`, actorId
    );

    return newAccount;
  },

  findAccounts: async (workspaceId, filters = {}) => {
    const db = getDb();
    const query = { workspaceId: new ObjectId(workspaceId) };
    if (filters.type) query.type = filters.type;
    return db.collection('accounts').find(query).sort({ name: 1 }).toArray();
  },

  findAccountById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const account = await db.collection('accounts').findOne({ _id: new ObjectId(id) });
    if (!account) return null;

    // Retrieve Related Lists
    const contacts = await db.collection('contacts').find({ accountId: account._id }).toArray();
    const opportunities = await db.collection('opportunities').find({ accountId: account._id }).toArray();
    const cases = await db.collection('cases').find({ accountId: account._id }).toArray();
    
    // Recursive Hierarchy: Find children accounts
    const children = await db.collection('accounts').find({ parentAccountId: account._id }).toArray();
    
    // Parent account if exists
    let parent = null;
    if (account.parentAccountId) {
      parent = await db.collection('accounts').findOne({ _id: account.parentAccountId });
    }

    // Timeline Interactions
    const timeline = await salesforceRepository.getTimelineActivities('Account', account._id);

    return {
      ...account,
      contacts,
      opportunities,
      cases,
      children,
      parent,
      timeline
    };
  },

  updateAccount: async (id, data, actorId) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const cleanUpdate = { ...data, updatedAt: new Date() };
    if (cleanUpdate.parentAccountId) cleanUpdate.parentAccountId = new ObjectId(cleanUpdate.parentAccountId);
    if (cleanUpdate.assignedTo) cleanUpdate.assignedTo = new ObjectId(cleanUpdate.assignedTo);
    
    await db.collection('accounts').updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    const updated = await db.collection('accounts').findOne({ _id: new ObjectId(id) });

    await salesforceRepository.logTimelineActivity(
      updated.workspaceId, 'Account', updated._id, 'System',
      'Account Updated', 'Account fields updated inline.', actorId
    );

    return updated;
  },

  deleteAccount: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection('accounts').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  // ==========================================
  // CONTACTS
  // ==========================================
  
  createContact: async (workspaceId, data, actorId) => {
    const db = getDb();
    const contact = {
      workspaceId: new ObjectId(workspaceId),
      accountId: data.accountId ? new ObjectId(data.accountId) : null,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      title: data.title || '',
      email: data.email ? data.email.toLowerCase().trim() : '',
      phone: data.phone || '',
      linkedInUrl: data.linkedInUrl || '',
      mailingAddress: data.mailingAddress || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('contacts').insertOne(contact);
    const newContact = { _id: result.insertedId, ...contact };

    await salesforceRepository.logTimelineActivity(
      workspaceId, 'Contact', newContact._id, 'System',
      'Contact Created', `Contact card for ${contact.firstName} ${contact.lastName} created.`, actorId
    );

    return newContact;
  },

  findContacts: async (workspaceId, filters = {}) => {
    const db = getDb();
    const query = { workspaceId: new ObjectId(workspaceId) };
    if (filters.accountId) query.accountId = new ObjectId(filters.accountId);
    return db.collection('contacts').find(query).sort({ lastName: 1, firstName: 1 }).toArray();
  },

  findContactById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(id) });
    if (!contact) return null;

    let account = null;
    if (contact.accountId) {
      account = await db.collection('accounts').findOne({ _id: contact.accountId });
    }

    const timeline = await salesforceRepository.getTimelineActivities('Contact', contact._id);
    const cases = await db.collection('cases').find({ contactId: contact._id }).toArray();

    return {
      ...contact,
      account,
      timeline,
      cases
    };
  },

  updateContact: async (id, data, actorId) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const cleanUpdate = { ...data, updatedAt: new Date() };
    if (cleanUpdate.accountId) cleanUpdate.accountId = new ObjectId(cleanUpdate.accountId);

    await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    const updated = await db.collection('contacts').findOne({ _id: new ObjectId(id) });

    await salesforceRepository.logTimelineActivity(
      updated.workspaceId, 'Contact', updated._id, 'System',
      'Contact Updated', 'Contact details saved.', actorId
    );

    return updated;
  },

  deleteContact: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  mergeContacts: async (workspaceId, primaryId, secondaryId, actorId) => {
    const db = getDb();
    if (!ObjectId.isValid(primaryId) || !ObjectId.isValid(secondaryId)) return null;

    const primary = await db.collection('contacts').findOne({ _id: new ObjectId(primaryId) });
    const secondary = await db.collection('contacts').findOne({ _id: new ObjectId(secondaryId) });

    if (!primary || !secondary) return null;

    // Move all Opportunities, Cases, Activities from secondary to primary
    await db.collection('opportunities').updateMany({ contactId: secondary._id }, { $set: { contactId: primary._id } });
    await db.collection('cases').updateMany({ contactId: secondary._id }, { $set: { contactId: primary._id } });
    await db.collection('activities').updateMany({ parentType: 'Contact', parentId: secondary._id }, { $set: { parentId: primary._id } });

    // Merge missing fields
    const updates = {};
    if (!primary.title && secondary.title) updates.title = secondary.title;
    if (!primary.phone && secondary.phone) updates.phone = secondary.phone;
    if (!primary.linkedInUrl && secondary.linkedInUrl) updates.linkedInUrl = secondary.linkedInUrl;
    if (!primary.mailingAddress && secondary.mailingAddress) updates.mailingAddress = secondary.mailingAddress;

    if (Object.keys(updates).length > 0) {
      await db.collection('contacts').updateOne({ _id: primary._id }, { $set: updates });
    }

    // Delete secondary
    await db.collection('contacts').deleteOne({ _id: secondary._id });

    await salesforceRepository.logTimelineActivity(
      workspaceId, 'Contact', primary._id, 'System',
      'Contact Merged', `Deduplicated and merged contact "${secondary.firstName} ${secondary.lastName}" into this profile.`, actorId
    );

    return primary;
  },

  // ==========================================
  // LEAD CONVERSION
  // ==========================================
  
  convertLead: async (workspaceId, leadId, actorId) => {
    const db = getDb();
    if (!ObjectId.isValid(leadId)) return null;

    const lead = await db.collection('leads').findOne({ _id: new ObjectId(leadId) });
    if (!lead) return null;

    // 1. Create or Find Account
    let account = await db.collection('accounts').findOne({ workspaceId: new ObjectId(workspaceId), name: lead.companyName });
    if (!account) {
      account = await salesforceRepository.createAccount(workspaceId, {
        name: lead.companyName,
        type: 'Customer',
        assignedTo: lead.assignedTo,
        region: lead.region || '',
        industry: lead.industry || ''
      }, actorId);
    }

    // 2. Create Contact
    const names = lead.contactPerson.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || 'LeadContact';
    
    const contact = await salesforceRepository.createContact(workspaceId, {
      accountId: account._id,
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone,
      title: 'Lead Prospect'
    }, actorId);

    // 3. Create Opportunity
    const opp = await salesforceRepository.createOpportunity(workspaceId, {
      name: `${lead.companyName} - Deal Opportunity`,
      accountId: account._id,
      contactId: contact._id,
      stage: 'Prospecting',
      amount: lead.estimatedValue || 0,
      closeDate: lead.followUpDate || new Date(Date.now() + 30 * 86400000),
      assignedTo: lead.assignedTo
    }, actorId);

    // 4. Move notes & log activity
    if (lead.notes && lead.notes.length > 0) {
      for (const note of lead.notes) {
        await salesforceRepository.logTimelineActivity(
          workspaceId, 'Account', account._id, 'Note',
          'Imported Lead Note', note.text, note.createdBy
        );
      }
    }

    // Mark Lead as Closed Won
    await db.collection('leads').updateOne({ _id: lead._id }, { $set: { status: 'Closed Won', updatedAt: new Date() } });

    return { account, contact, opportunity: opp };
  },

  // ==========================================
  // OPPORTUNITIES
  // ==========================================
  
  createOpportunity: async (workspaceId, data, actorId) => {
    const db = getDb();
    const stage = data.stage || 'Prospecting';
    const rule = STAGE_RULES[stage] || { prob: 10, cat: 'Pipeline' };

    const opp = {
      workspaceId: new ObjectId(workspaceId),
      accountId: data.accountId ? new ObjectId(data.accountId) : null,
      contactId: data.contactId ? new ObjectId(data.contactId) : null,
      name: data.name,
      stage,
      probability: rule.prob,
      forecastCategory: rule.cat,
      amount: parseFloat(data.amount) || 0,
      closeDate: data.closeDate ? new Date(data.closeDate) : new Date(Date.now() + 30 * 86400000),
      assignedTo: data.assignedTo ? new ObjectId(data.assignedTo) : null,
      competitors: data.competitors || [],
      products: [], // Opportunity Line Items
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('opportunities').insertOne(opp);
    const newOpp = { _id: result.insertedId, ...opp };

    await salesforceRepository.logTimelineActivity(
      workspaceId, 'Account', opp.accountId, 'System',
      'Opportunity Opened', `New opportunity "${opp.name}" valued at $${opp.amount.toLocaleString()} was initiated.`, actorId
    );

    return newOpp;
  },

  findOpportunities: async (workspaceId, filters = {}) => {
    const db = getDb();
    const query = { workspaceId: new ObjectId(workspaceId) };
    if (filters.accountId) query.accountId = new ObjectId(filters.accountId);
    if (filters.stage) query.stage = filters.stage;
    return db.collection('opportunities').find(query).sort({ closeDate: 1 }).toArray();
  },

  findOpportunityById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const opp = await db.collection('opportunities').findOne({ _id: new ObjectId(id) });
    if (!opp) return null;

    let account = null;
    if (opp.accountId) {
      account = await db.collection('accounts').findOne({ _id: opp.accountId });
    }

    return {
      ...opp,
      account
    };
  },

  updateOpportunity: async (id, data, actorId) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const cleanUpdate = { ...data, updatedAt: new Date() };
    if (cleanUpdate.accountId) cleanUpdate.accountId = new ObjectId(cleanUpdate.accountId);
    if (cleanUpdate.assignedTo) cleanUpdate.assignedTo = new ObjectId(cleanUpdate.assignedTo);
    
    // Auto calculate probability and category if stage changes
    if (cleanUpdate.stage) {
      const rule = STAGE_RULES[cleanUpdate.stage];
      if (rule) {
        cleanUpdate.probability = rule.prob;
        cleanUpdate.forecastCategory = rule.cat;
      }
    }

    await db.collection('opportunities').updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    const updated = await db.collection('opportunities').findOne({ _id: new ObjectId(id) });

    await salesforceRepository.logTimelineActivity(
      updated.workspaceId, 'Account', updated.accountId, 'System',
      'Opportunity Updated', `Deal stage updated to: ${updated.stage} (${updated.probability}% probability)`, actorId
    );

    return updated;
  },

  addOpportunityProduct: async (oppId, data, actorId) => {
    if (!ObjectId.isValid(oppId)) return null;
    const db = getDb();
    
    const lineItem = {
      lineItemId: new ObjectId().toString(),
      productId: new ObjectId(data.productId),
      name: data.name,
      quantity: parseInt(data.quantity) || 1,
      unitPrice: parseFloat(data.unitPrice) || 0,
      discount: parseFloat(data.discount) || 0 // discount percentage
    };

    // Push product to array
    await db.collection('opportunities').updateOne(
      { _id: new ObjectId(oppId) },
      { $push: { products: lineItem } }
    );

    // Recalculate Opportunity amount
    const opp = await db.collection('opportunities').findOne({ _id: new ObjectId(oppId) });
    let totalAmount = 0;
    opp.products.forEach(p => {
      totalAmount += p.quantity * p.unitPrice * (1 - p.discount / 100);
    });

    await db.collection('opportunities').updateOne(
      { _id: opp._id },
      { $set: { amount: parseFloat(totalAmount.toFixed(2)), updatedAt: new Date() } }
    );

    await salesforceRepository.logTimelineActivity(
      opp.workspaceId, 'Account', opp.accountId, 'System',
      'Product Line Added', `Added product line "${data.name}" x ${data.quantity} to opportunity.`, actorId
    );

    return db.collection('opportunities').findOne({ _id: opp._id });
  },

  removeOpportunityProduct: async (oppId, lineItemId, actorId) => {
    if (!ObjectId.isValid(oppId)) return null;
    const db = getDb();

    await db.collection('opportunities').updateOne(
      { _id: new ObjectId(oppId) },
      { $pull: { products: { lineItemId } } }
    );

    // Recalculate Opportunity amount
    const opp = await db.collection('opportunities').findOne({ _id: new ObjectId(oppId) });
    let totalAmount = 0;
    opp.products.forEach(p => {
      totalAmount += p.quantity * p.unitPrice * (1 - p.discount / 100);
    });

    await db.collection('opportunities').updateOne(
      { _id: opp._id },
      { $set: { amount: parseFloat(totalAmount.toFixed(2)), updatedAt: new Date() } }
    );

    return opp;
  },

  deleteOpportunity: async (id) => {
    if (!ObjectId.isValid(id)) return false;
    const db = getDb();
    const result = await db.collection('opportunities').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  // ==========================================
  // FORECASTING & QUOTAS
  // ==========================================
  
  getForecasts: async (workspaceId, period = '2026-Q2') => {
    const db = getDb();
    
    // List all sales reps in workspace
    const reps = await db.collection('users').find({
      workspaceId: new ObjectId(workspaceId),
      role: { $in: ['Sales', 'Team Lead', 'Founder'] }
    }).toArray();

    const result = [];
    for (const rep of reps) {
      // Find quota
      const quotaRecord = await db.collection('quotas').findOne({
        workspaceId: new ObjectId(workspaceId),
        repId: rep._id,
        period
      });
      const quota = quotaRecord ? quotaRecord.value : 0;

      // Agg opportunities for rep
      const opps = await db.collection('opportunities').find({
        workspaceId: new ObjectId(workspaceId),
        assignedTo: rep._id
      }).toArray();

      let pipeline = 0;
      let bestCase = 0;
      let commit = 0;
      let closed = 0;

      opps.forEach(o => {
        if (o.forecastCategory === 'Pipeline') pipeline += o.amount;
        else if (o.forecastCategory === 'Best Case') bestCase += o.amount;
        else if (o.forecastCategory === 'Commit') commit += o.amount;
        else if (o.forecastCategory === 'Closed') closed += o.amount;
      });

      const gap = Math.max(0, quota - closed);

      result.push({
        repId: rep._id,
        repName: `${rep.firstName || ''} ${rep.lastName || ''}`.trim(),
        quota,
        pipeline: parseFloat(pipeline.toFixed(2)),
        bestCase: parseFloat(bestCase.toFixed(2)),
        commit: parseFloat(commit.toFixed(2)),
        closed: parseFloat(closed.toFixed(2)),
        gap: parseFloat(gap.toFixed(2))
      });
    }

    return result;
  },

  upsertQuota: async (workspaceId, repId, period, value) => {
    const db = getDb();
    const query = {
      workspaceId: new ObjectId(workspaceId),
      repId: new ObjectId(repId),
      period
    };
    
    await db.collection('quotas').updateOne(
      query,
      { $set: { value: parseFloat(value) || 0, updatedAt: new Date() } },
      { upsert: true }
    );

    return db.collection('quotas').findOne(query);
  },

  // ==========================================
  // CASES (SUPPORT TICKETS)
  // ==========================================
  
  createCase: async (workspaceId, data, actorId) => {
    const db = getDb();
    const supportCase = {
      workspaceId: new ObjectId(workspaceId),
      accountId: data.accountId ? new ObjectId(data.accountId) : null,
      contactId: data.contactId ? new ObjectId(data.contactId) : null,
      subject: data.subject,
      description: data.description || '',
      status: 'New', // New, Working, Escalated, Closed
      priority: data.priority || 'Medium', // Low, Medium, High, Critical
      csatScore: null, // set on closed
      assignedTo: data.assignedTo ? new ObjectId(data.assignedTo) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('cases').insertOne(supportCase);
    const newCase = { _id: result.insertedId, ...supportCase };

    if (supportCase.accountId) {
      await salesforceRepository.logTimelineActivity(
        workspaceId, 'Account', supportCase.accountId, 'System',
        'Support Case Logged', `Case #${newCase._id.toString().slice(-6)}: "${supportCase.subject}" opened.`, actorId
      );
    }
    if (supportCase.contactId) {
      await salesforceRepository.logTimelineActivity(
        workspaceId, 'Contact', supportCase.contactId, 'System',
        'Support Case Logged', `Case #${newCase._id.toString().slice(-6)}: "${supportCase.subject}" opened.`, actorId
      );
    }

    return newCase;
  },

  findCases: async (workspaceId, filters = {}) => {
    const db = getDb();
    const query = { workspaceId: new ObjectId(workspaceId) };
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.accountId) query.accountId = new ObjectId(filters.accountId);
    if (filters.contactId) query.contactId = new ObjectId(filters.contactId);

    // Dynamic checks for Escalation Rules (unresolved cases older than N hours)
    // Rule: Unresolved (New/Working) cases older than 12 hours get auto-escalated to 'Critical' and 'Escalated'
    const N_HOURS = 12;
    const cutoffTime = new Date(Date.now() - N_HOURS * 3600000);

    const checkQuery = {
      workspaceId: new ObjectId(workspaceId),
      status: { $in: ['New', 'Working'] },
      createdAt: { $lt: cutoffTime }
    };

    await db.collection('cases').updateMany(
      checkQuery,
      {
        $set: {
          status: 'Escalated',
          priority: 'Critical',
          updatedAt: new Date()
        }
      }
    );

    return db.collection('cases').find(query).sort({ createdAt: -1 }).toArray();
  },

  findCaseById: async (id) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    return db.collection('cases').findOne({ _id: new ObjectId(id) });
  },

  updateCase: async (id, data, actorId) => {
    if (!ObjectId.isValid(id)) return null;
    const db = getDb();
    const cleanUpdate = { ...data, updatedAt: new Date() };
    if (cleanUpdate.assignedTo) cleanUpdate.assignedTo = new ObjectId(cleanUpdate.assignedTo);
    if (cleanUpdate.accountId) cleanUpdate.accountId = new ObjectId(cleanUpdate.accountId);
    if (cleanUpdate.contactId) cleanUpdate.contactId = new ObjectId(cleanUpdate.contactId);

    await db.collection('cases').updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdate }
    );
    const updated = await db.collection('cases').findOne({ _id: new ObjectId(id) });

    await salesforceRepository.logTimelineActivity(
      updated.workspaceId, 'Account', updated.accountId, 'System',
      'Case Updated', `Support Case status changed to: ${updated.status}`, actorId
    );

    return updated;
  },

  mergeCases: async (workspaceId, primaryId, secondaryId, actorId) => {
    const db = getDb();
    if (!ObjectId.isValid(primaryId) || !ObjectId.isValid(secondaryId)) return null;

    const primary = await db.collection('cases').findOne({ _id: new ObjectId(primaryId) });
    const secondary = await db.collection('cases').findOne({ _id: new ObjectId(secondaryId) });

    if (!primary || !secondary) return null;

    // Merge descriptions and delete secondary
    const mergedDesc = `${primary.description}\n\n[Merged Case #${secondary._id}]:\n${secondary.description}`;
    await db.collection('cases').updateOne(
      { _id: primary._id },
      { $set: { description: mergedDesc, updatedAt: new Date() } }
    );

    // Redirect any timeline events
    await db.collection('activities').updateMany({ parentType: 'Case', parentId: secondary._id }, { $set: { parentId: primary._id } });

    await db.collection('cases').deleteOne({ _id: secondary._id });

    await salesforceRepository.logTimelineActivity(
      workspaceId, 'Account', primary.accountId, 'System',
      'Cases Merged', `Merged support ticket case #${secondary._id} into case #${primary._id}`, actorId
    );

    return primary;
  },

  processEmailToCase: async (workspaceId, inboundEmail) => {
    const db = getDb();
    // Match sender email with contact
    const contact = await db.collection('contacts').findOne({
      workspaceId: new ObjectId(workspaceId),
      email: inboundEmail.from.toLowerCase().trim()
    });

    let accountId = null;
    let contactId = null;

    if (contact) {
      contactId = contact._id;
      accountId = contact.accountId;
    } else {
      // Find or create catch-all Account
      let catchAllAcc = await db.collection('accounts').findOne({
        workspaceId: new ObjectId(workspaceId),
        name: 'Catch-All Support Account'
      });
      if (!catchAllAcc) {
        catchAllAcc = await salesforceRepository.createAccount(workspaceId, {
          name: 'Catch-All Support Account',
          type: 'Customer'
        });
      }
      accountId = catchAllAcc._id;

      // Create new Contact
      const newContact = await salesforceRepository.createContact(workspaceId, {
        accountId: catchAllAcc._id,
        firstName: inboundEmail.fromName || 'Inbound',
        lastName: 'EmailSender',
        email: inboundEmail.from
      });
      contactId = newContact._id;
    }

    // Create case
    const ticket = await salesforceRepository.createCase(workspaceId, {
      accountId,
      contactId,
      subject: inboundEmail.subject || 'Inbound Support Email',
      description: inboundEmail.body || 'No description provided.',
      priority: 'Medium'
    });

    return ticket;
  },

  // ==========================================
  // PRODUCTS & PRICE BOOKS
  // ==========================================
  
  createProduct: async (workspaceId, data) => {
    const db = getDb();
    const product = {
      workspaceId: new ObjectId(workspaceId),
      name: data.name,
      description: data.description || '',
      standardPrice: parseFloat(data.standardPrice) || 0,
      priceBooks: data.priceBooks || [], // [{ priceBookId, name, price }]
      createdAt: new Date()
    };
    const result = await db.collection('products').insertOne(product);
    return { _id: result.insertedId, ...product };
  },

  findProducts: async (workspaceId) => {
    const db = getDb();
    return db.collection('products').find({ workspaceId: new ObjectId(workspaceId) }).toArray();
  },

  createPriceBook: async (workspaceId, data) => {
    const db = getDb();
    const priceBook = {
      workspaceId: new ObjectId(workspaceId),
      name: data.name,
      createdAt: new Date()
    };
    const result = await db.collection('pricebooks').insertOne(priceBook);
    return { _id: result.insertedId, ...priceBook };
  },

  findPriceBooks: async (workspaceId) => {
    const db = getDb();
    return db.collection('pricebooks').find({ workspaceId: new ObjectId(workspaceId) }).toArray();
  },

  // ==========================================
  // EMAIL INTEGRATION & BULK SEND
  // ==========================================
  
  createEmailTemplate: async (workspaceId, data) => {
    const db = getDb();
    const template = {
      workspaceId: new ObjectId(workspaceId),
      name: data.name,
      subject: data.subject,
      body: data.body,
      createdAt: new Date()
    };
    const result = await db.collection('email_templates').insertOne(template);
    return { _id: result.insertedId, ...template };
  },

  findEmailTemplates: async (workspaceId) => {
    const db = getDb();
    return db.collection('email_templates').find({ workspaceId: new ObjectId(workspaceId) }).toArray();
  },

  sendEmail: async (workspaceId, emailData, actorId) => {
    const db = getDb();
    const pixelId = new ObjectId().toString();

    // Map template fields
    let subject = emailData.subject;
    let body = emailData.body;

    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(emailData.contactId) });
    if (contact) {
      // Merge tags
      subject = subject.replace(/\{\{contact\.firstName\}\}/g, contact.firstName || '')
                       .replace(/\{\{contact\.lastName\}\}/g, contact.lastName || '')
                       .replace(/\{\{contact\.email\}\}/g, contact.email || '');
      
      body = body.replace(/\{\{contact\.firstName\}\}/g, contact.firstName || '')
                 .replace(/\{\{contact\.lastName\}\}/g, contact.lastName || '')
                 .replace(/\{\{contact\.email\}\}/g, contact.email || '');
    }

    const emailLog = {
      workspaceId: new ObjectId(workspaceId),
      contactId: new ObjectId(emailData.contactId),
      accountId: contact ? contact.accountId : null,
      direction: 'Outbound',
      subject,
      body,
      pixelId,
      openedAt: null,
      createdAt: new Date()
    };

    await db.collection('emails').insertOne(emailLog);

    // Log to contact timeline
    await salesforceRepository.logTimelineActivity(
      workspaceId, 'Contact', emailLog.contactId, 'Email',
      `Sent: ${subject}`, body, actorId
    );

    if (emailLog.accountId) {
      await salesforceRepository.logTimelineActivity(
        workspaceId, 'Account', emailLog.accountId, 'Email',
        `Sent: ${subject}`, body, actorId
      );
    }

    return { success: true, emailLog };
  },

  trackEmailOpen: async (pixelId) => {
    const db = getDb();
    const emailLog = await db.collection('emails').findOne({ pixelId });
    if (emailLog && !emailLog.openedAt) {
      await db.collection('emails').updateOne(
        { _id: emailLog._id },
        { $set: { openedAt: new Date() } }
      );

      // Log open to Contact timeline
      await salesforceRepository.logTimelineActivity(
        emailLog.workspaceId, 'Contact', emailLog.contactId, 'System',
        'Email Opened', `The outbound email "${emailLog.subject}" was opened by recipient.`
      );
    }
    return true;
  }
};

module.exports = salesforceRepository;
