/**
 * ============================================================
 * Crudier CRM — Salesforce CRM Controller
 * ============================================================
 */

const salesforceRepository = require('./salesforce.repository');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');

const salesforceController = {

  // ==========================================
  // ACCOUNTS
  // ==========================================
  createAccount: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const account = await salesforceRepository.createAccount(workspaceId, req.body, req.user._id);
    return ApiResponse.success(res, 'Account created successfully.', account, 201);
  },

  listAccounts: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const accounts = await salesforceRepository.findAccounts(workspaceId, req.query);
    return ApiResponse.success(res, 'Accounts list retrieved.', accounts);
  },

  getAccountById: async (req, res) => {
    const account = await salesforceRepository.findAccountById(req.params.id);
    if (!account) throw new ApiError('Account not found.', 404);
    return ApiResponse.success(res, 'Account details fetched.', account);
  },

  updateAccount: async (req, res) => {
    const account = await salesforceRepository.updateAccount(req.params.id, req.body, req.user._id);
    if (!account) throw new ApiError('Account not found.', 404);
    return ApiResponse.success(res, 'Account updated successfully.', account);
  },

  deleteAccount: async (req, res) => {
    const success = await salesforceRepository.deleteAccount(req.params.id);
    if (!success) throw new ApiError('Failed to delete account.', 404);
    return ApiResponse.success(res, 'Account deleted successfully.');
  },

  // ==========================================
  // CONTACTS
  // ==========================================
  createContact: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const contact = await salesforceRepository.createContact(workspaceId, req.body, req.user._id);
    return ApiResponse.success(res, 'Contact created successfully.', contact, 201);
  },

  listContacts: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const contacts = await salesforceRepository.findContacts(workspaceId, req.query);
    return ApiResponse.success(res, 'Contacts list retrieved.', contacts);
  },

  getContactById: async (req, res) => {
    const contact = await salesforceRepository.findContactById(req.params.id);
    if (!contact) throw new ApiError('Contact not found.', 404);
    return ApiResponse.success(res, 'Contact details fetched.', contact);
  },

  updateContact: async (req, res) => {
    const contact = await salesforceRepository.updateContact(req.params.id, req.body, req.user._id);
    if (!contact) throw new ApiError('Contact not found.', 404);
    return ApiResponse.success(res, 'Contact updated successfully.', contact);
  },

  deleteContact: async (req, res) => {
    const success = await salesforceRepository.deleteContact(req.params.id);
    if (!success) throw new ApiError('Failed to delete contact.', 404);
    return ApiResponse.success(res, 'Contact deleted successfully.');
  },

  mergeContacts: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { primaryContactId, secondaryContactId } = req.body;
    if (!primaryContactId || !secondaryContactId) {
      throw new ApiError('Primary and secondary contact IDs are required.', 400);
    }

    const primary = await salesforceRepository.mergeContacts(workspaceId, primaryContactId, secondaryContactId, req.user._id);
    if (!primary) throw new ApiError('Failed to merge contacts.', 400);

    return ApiResponse.success(res, 'Contacts merged successfully.', primary);
  },

  convertLead: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const result = await salesforceRepository.convertLead(workspaceId, req.params.id, req.user._id);
    if (!result) throw new ApiError('Lead conversion failed.', 400);

    return ApiResponse.success(res, 'Lead converted to Account and Contact successfully.', result);
  },

  // ==========================================
  // OPPORTUNITIES
  // ==========================================
  createOpportunity: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const opp = await salesforceRepository.createOpportunity(workspaceId, req.body, req.user._id);
    return ApiResponse.success(res, 'Opportunity created successfully.', opp, 201);
  },

  listOpportunities: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const opps = await salesforceRepository.findOpportunities(workspaceId, req.query);
    return ApiResponse.success(res, 'Opportunities list retrieved.', opps);
  },

  getOpportunityById: async (req, res) => {
    const opp = await salesforceRepository.findOpportunityById(req.params.id);
    if (!opp) throw new ApiError('Opportunity not found.', 404);
    return ApiResponse.success(res, 'Opportunity details fetched.', opp);
  },

  updateOpportunity: async (req, res) => {
    const opp = await salesforceRepository.updateOpportunity(req.params.id, req.body, req.user._id);
    if (!opp) throw new ApiError('Opportunity not found.', 404);
    return ApiResponse.success(res, 'Opportunity updated successfully.', opp);
  },

  deleteOpportunity: async (req, res) => {
    const success = await salesforceRepository.deleteOpportunity(req.params.id);
    if (!success) throw new ApiError('Failed to delete opportunity.', 404);
    return ApiResponse.success(res, 'Opportunity deleted successfully.');
  },

  addOpportunityProduct: async (req, res) => {
    const opp = await salesforceRepository.addOpportunityProduct(req.params.id, req.body, req.user._id);
    if (!opp) throw new ApiError('Opportunity not found.', 404);
    return ApiResponse.success(res, 'Product line added successfully.', opp, 201);
  },

  removeOpportunityProduct: async (req, res) => {
    const opp = await salesforceRepository.removeOpportunityProduct(req.params.id, req.params.lineItemId, req.user._id);
    if (!opp) throw new ApiError('Opportunity not found.', 404);
    return ApiResponse.success(res, 'Product line removed successfully.', opp);
  },

  getOpportunityQuote: async (req, res) => {
    const opp = await salesforceRepository.findOpportunityById(req.params.id);
    if (!opp) throw new ApiError('Opportunity not found.', 404);

    // Format quote parameters
    const quote = {
      opportunityId: opp._id,
      name: opp.name,
      amount: opp.amount,
      closeDate: opp.closeDate,
      products: opp.products || [],
      generatedAt: new Date()
    };

    return ApiResponse.success(res, 'Quote template generated successfully.', quote);
  },

  // ==========================================
  // FORECASTING & QUOTAS
  // ==========================================
  getForecasts: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const period = req.query.period || '2026-Q2';
    const forecasts = await salesforceRepository.getForecasts(workspaceId, period);
    return ApiResponse.success(res, 'Forecast matrices retrieved.', forecasts);
  },

  updateQuota: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { repId, period, value } = req.body;
    if (!repId || !period || value === undefined) {
      throw new ApiError('repId, period, and value fields are required.', 400);
    }

    const quota = await salesforceRepository.upsertQuota(workspaceId, repId, period, value);
    return ApiResponse.success(res, 'Quota updated successfully.', quota);
  },

  // ==========================================
  // CASES (SUPPORT TICKETS)
  // ==========================================
  createCase: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const supportCase = await salesforceRepository.createCase(workspaceId, req.body, req.user._id);
    return ApiResponse.success(res, 'Case opened successfully.', supportCase, 201);
  },

  listCases: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const cases = await salesforceRepository.findCases(workspaceId, req.query);
    return ApiResponse.success(res, 'Cases list retrieved.', cases);
  },

  getCaseById: async (req, res) => {
    const supportCase = await salesforceRepository.findCaseById(req.params.id);
    if (!supportCase) throw new ApiError('Case not found.', 404);
    return ApiResponse.success(res, 'Case details fetched.', supportCase);
  },

  updateCase: async (req, res) => {
    const supportCase = await salesforceRepository.updateCase(req.params.id, req.body, req.user._id);
    if (!supportCase) throw new ApiError('Case not found.', 404);
    return ApiResponse.success(res, 'Case updated successfully.', supportCase);
  },

  mergeCases: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const { primaryCaseId, secondaryCaseId } = req.body;
    if (!primaryCaseId || !secondaryCaseId) {
      throw new ApiError('Primary and secondary case IDs are required.', 400);
    }

    const primary = await salesforceRepository.mergeCases(workspaceId, primaryCaseId, secondaryCaseId, req.user._id);
    if (!primary) throw new ApiError('Failed to merge support tickets.', 400);

    return ApiResponse.success(res, 'Support tickets merged successfully.', primary);
  },

  processWebhook: async (req, res) => {
    // Webhook must match header context or accept param body
    const workspaceId = req.user ? req.user.workspaceId : req.body.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace ID context is required.', 400);

    const { from, fromName, subject, body } = req.body;
    if (!from) throw new ApiError('Sender email ("from") is required.', 400);

    const ticket = await salesforceRepository.processEmailToCase(workspaceId, { from, fromName, subject, body });
    return ApiResponse.success(res, 'Email-to-case webhook parsed successfully.', ticket, 201);
  },

  // ==========================================
  // PRODUCTS & PRICE BOOKS
  // ==========================================
  createProduct: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const product = await salesforceRepository.createProduct(workspaceId, req.body);
    return ApiResponse.success(res, 'Product created successfully.', product, 201);
  },

  listProducts: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const products = await salesforceRepository.findProducts(workspaceId);
    return ApiResponse.success(res, 'Products list retrieved.', products);
  },

  createPriceBook: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const pb = await salesforceRepository.createPriceBook(workspaceId, req.body);
    return ApiResponse.success(res, 'Price Book created successfully.', pb, 201);
  },

  listPriceBooks: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const pbs = await salesforceRepository.findPriceBooks(workspaceId);
    return ApiResponse.success(res, 'Price Books list retrieved.', pbs);
  },

  // ==========================================
  // TERRITORIES
  // ==========================================
  createTerritory: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const territory = await salesforceRepository.createTerritory(workspaceId, req.body);
    return ApiResponse.success(res, 'Territory created successfully.', territory, 201);
  },

  listTerritories: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const territories = await salesforceRepository.findTerritories(workspaceId);
    return ApiResponse.success(res, 'Territories list retrieved.', territories);
  },

  // ==========================================
  // EMAIL ENGINE
  // ==========================================
  sendEmail: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const result = await salesforceRepository.sendEmail(workspaceId, req.body, req.user._id);
    return ApiResponse.success(res, 'Outbound email queued successfully.', result);
  },

  createTemplate: async (workspaceId, req, res) => {
    const template = await salesforceRepository.createEmailTemplate(workspaceId, req.body);
    return ApiResponse.success(res, 'Email template created.', template, 201);
  },

  listTemplates: async (req, res) => {
    const workspaceId = req.user.workspaceId;
    if (!workspaceId) throw new ApiError('Workspace context missing.', 400);

    const templates = await salesforceRepository.findEmailTemplates(workspaceId);
    return ApiResponse.success(res, 'Email templates list retrieved.', templates);
  },

  trackPixel: async (req, res) => {
    const { pixelId } = req.params;
    if (pixelId) {
      await salesforceRepository.trackEmailOpen(pixelId);
    }

    // Serve 1x1 transparent GIF tracking pixel
    const imgBuffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': imgBuffer.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    return res.end(imgBuffer);
  }
};

module.exports = salesforceController;
