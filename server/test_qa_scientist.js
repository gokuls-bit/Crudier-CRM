/**
 * ============================================================
 * Crudier CRM — QA Scientist Integration & Regression Test Suite
 * ============================================================
 * Performs comprehensive verification on:
 *   1. Security Headers (Helmet configurations)
 *   2. NoSQL Operator Injection sanitization
 *   3. Cross-Site Scripting (XSS) input escaping
 *   4. Double-Submit Cookie CSRF protection
 *   5. Request Validator Schema boundaries
 *   6. Role-Based Access Controls (RBAC) route-gating
 *   7. Analytical aggregates & File Exporter engines
 * ============================================================
 */

const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// ── MOCKING THE DATABASE LAYER (Mongoose Models) ────────────
const store = {
  users: [],
  workspaces: [],
  tasks: [],
  leads: [],
  auditlogs: [],
  meetings: [],
  refreshtokens: [],
  activities: [],
};

// Stub MongoDB driver connect helpers
const dbConfig = require('./config/db');
dbConfig.connectDB = async () => {
  mongoose.connection.readyState = 1;
  return {};
};
dbConfig.getConnectionStatus = () => true;
dbConfig.getDb = () => ({
  collection: (name) => ({
    find: () => ({ toArray: async () => store[name] || [] }),
    findOne: async (q) => (store[name] || []).find(x => x.email === q.email),
    insertOne: async (d) => { (store[name] = store[name] || []).push(d); return { insertedId: d._id }; }
  })
});

// Import models to override prototype query methods
const User = require('./src/models/user.model');
const Task = require('./src/models/task.model');
const Lead = require('./src/models/lead.model');
const AuditLog = require('./src/models/auditLog.model');
const Meeting = require('./src/models/meeting.model');
const Workspace = require('./src/models/workspace.model');
const RefreshToken = require('./src/models/refreshToken.model');
const Activity = require('./src/models/activity.model');

const stubModel = (modelClass, storeKey) => {
  modelClass.find = (query) => {
    const list = store[storeKey] || [];
    let filtered = list;
    if (query && Object.keys(query).length > 0) {
      filtered = list.filter((item) => {
        return Object.entries(query).every(([k, v]) => {
          if (v && v.$ne !== undefined) return item[k] !== v.$ne;
          if (v && v.$gte !== undefined) return item[k] >= v.$gte;
          if (v && v.$lte !== undefined) return item[k] <= v.$lte;
          if (v && typeof v === 'object' && v.toString) return item[k]?.toString() === v.toString();
          return item[k] === v;
        });
      });
    }

    const chain = {
      populate: () => chain,
      sort: () => chain,
      skip: () => chain,
      limit: () => chain,
      then: (resolve) => resolve(filtered),
      exec: async () => filtered,
    };
    return chain;
  };

  modelClass.findOne = (query) => {
    const list = store[storeKey] || [];
    const item = list.find((x) => {
      if (!query || Object.keys(query).length === 0) return true;
      return Object.entries(query).every(([k, v]) => {
        if (v && typeof v === 'object' && v.toString) return x[k]?.toString() === v.toString();
        return x[k] === v;
      });
    });

    const chain = {
      populate: () => chain,
      then: (resolve) => resolve(item || null),
      exec: async () => item || null,
    };
    return chain;
  };

  modelClass.findById = (id) => modelClass.findOne({ _id: id });

  modelClass.create = async (doc) => {
    const newDoc = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...doc,
    };
    newDoc.save = async () => {
      const idx = store[storeKey].findIndex((x) => x._id.toString() === newDoc._id.toString());
      if (idx !== -1) {
        store[storeKey][idx] = newDoc;
      }
      return newDoc;
    };
    store[storeKey].push(newDoc);
    return newDoc;
  };

  modelClass.countDocuments = async (query) => {
    const list = store[storeKey] || [];
    if (!query || Object.keys(query).length === 0) return list.length;
    return list.filter((item) => {
      return Object.entries(query).every(([k, v]) => item[k]?.toString() === v?.toString());
    }).length;
  };

  modelClass.aggregate = (pipeline) => {
    const chain = {
      exec: async () => [],
      then: (resolve) => resolve([]),
    };
    return chain;
  };
};

// Wire up stub models
stubModel(User, 'users');
stubModel(Workspace, 'workspaces');
stubModel(Task, 'tasks');
stubModel(Lead, 'leads');
stubModel(AuditLog, 'auditlogs');
stubModel(Meeting, 'meetings');
stubModel(RefreshToken, 'refreshtokens');
stubModel(Activity, 'activities');

// Override custom compare passwords method
User.prototype.matchPassword = async function (enteredPassword) {
  return enteredPassword === 'securePassword123';
};

// ── IMPORT AND BOOT THE APPLICATION ────────────────────────
const app = require('./app');
const env = require('./config/env');

async function runQAScientistTests() {
  console.log('\n🔬 Starting QA Scientist Verification Test Suite...');
  console.log('====================================================');

  // Initialize common ID stubs
  const workspaceId = new mongoose.Types.ObjectId();
  const userIdDev = new mongoose.Types.ObjectId();
  const userIdAdmin = new mongoose.Types.ObjectId();

  // Create mock database records
  store.users = [
    { _id: userIdDev, name: 'Developer User', email: 'dev@crm.local', role: 'Developer', workspaceId, isActive: true },
    { _id: userIdAdmin, name: 'Admin User', email: 'admin@crm.local', role: 'Admin', workspaceId, isActive: true },
  ];

  store.workspaces = [
    { _id: workspaceId, name: 'QA Laboratories', ownerId: userIdAdmin, members: [{ userId: userIdDev, role: 'Developer' }] },
  ];

  // Issue tokens
  const tokenDev = jwt.sign({ id: userIdDev, role: 'Developer', workspaceId }, env.jwtSecret);
  const tokenAdmin = jwt.sign({ id: userIdAdmin, role: 'Admin', workspaceId }, env.jwtSecret);

  // ── TEST 1: Security Headers (Helmet Checks) ─────────────────
  console.log('\n[Test 1] Security Headers (Helmet Check)...');
  const resHeaders = await request(app).get('/api/v1/health');
  assert.strictEqual(resHeaders.status, 200);
  assert.ok(resHeaders.headers['x-frame-options'], 'Missing X-Frame-Options');
  assert.ok(resHeaders.headers['x-content-type-options'], 'Missing X-Content-Type-Options');
  assert.ok(resHeaders.headers['x-dns-prefetch-control'], 'Missing X-DNS-Prefetch-Control');
  console.log('✓ Security headers validated successfully.');

  // ── TEST 2: NoSQL Injection Prevention ──────────────────────
  console.log('\n[Test 2] NoSQL Injection Prevention...');
  // Attempt sending NoSQL operator query in register
  const resNoSQL = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Hacker Name',
      email: 'hacker@crm.local',
      password: 'securePassword123',
      '$gt': 'injection_payload',
    });
  // If sanitization runs, the '$gt' field will be removed before route logic
  assert.strictEqual(resNoSQL.status, 201);
  const createdUser = store.users.find(u => u.email === 'hacker@crm.local');
  assert.strictEqual(createdUser['$gt'], undefined, 'NoSQL operator was not stripped!');
  console.log('✓ NoSQL operator injections successfully intercepted and stripped.');

  // ── TEST 3: XSS Sanitization Escaping ───────────────────────
  console.log('\n[Test 3] Cross-Site Scripting (XSS) Prevention...');
  const xssPayload = '<script>alert("XSS")</script>';
  const resXSS = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: xssPayload,
      email: 'xss@crm.local',
      password: 'securePassword123',
    });
  assert.strictEqual(resXSS.status, 201);
  const createdXssUser = store.users.find(u => u.email === 'xss@crm.local');
  assert.strictEqual(createdXssUser.name, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;', 'XSS tags not escaped!');
  console.log('✓ XSS scripts tags successfully escaped.');

  // ── TEST 4: CSRF Gating ─────────────────────────────────────
  console.log('\n[Test 4] CSRF Protection Gating...');
  // Make sure mutation requests without header are blocked
  // Set process.env.NODE_ENV to production temporarily to enforce CSRF in test script
  const oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  const resCSRFBlocked = await request(app)
    .post('/api/v1/auth/register')
    .set('Cookie', ['x-csrf-token=secret_token'])
    .send({ name: 'CSRF Test', email: 'csrf@crm.local', password: 'securePassword123' });
  
  assert.strictEqual(resCSRFBlocked.status, 403, 'CSRF should have returned 403 Forbidden!');
  assert.ok(resCSRFBlocked.body.message.includes('CSRF'));

  // Test successful CSRF verification (header matches cookie)
  const resCSRFPassed = await request(app)
    .post('/api/v1/auth/register')
    .set('Cookie', ['x-csrf-token=secret_token'])
    .set('X-CSRF-Token', 'secret_token')
    .send({ name: 'CSRF Test Passed', email: 'csrf_pass@crm.local', password: 'securePassword123' });

  assert.strictEqual(resCSRFPassed.status, 201, 'CSRF verification failed when matching!');
  console.log('✓ Double-Submit CSRF cookies and headers verified.');
  process.env.NODE_ENV = oldNodeEnv; // Restore env

  // ── TEST 5: Input Validation Schema Bounds ──────────────────
  console.log('\n[Test 5] Input Validation Schema Bounds...');
  // Password too short
  const resValidation = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Valid Name',
      email: 'valid@crm.local',
      password: '123', // < 6 chars
    });
  assert.strictEqual(resValidation.status, 400);
  assert.ok(resValidation.body.message.includes('at least 6 characters'));
  console.log('✓ Bad parameters correctly failed schema validations.');

  // ── TEST 6: Role-Based Access Controls (RBAC) Gating ───────
  console.log('\n[Test 6] Role-Based Access Controls (RBAC) Gating...');
  // Dev user trying to fetch admin diagnostics
  const resDevAdmin = await request(app)
    .get('/api/v1/admin/stats')
    .set('Authorization', `Bearer ${tokenDev}`);
  assert.strictEqual(resDevAdmin.status, 403);
  assert.ok(resDevAdmin.body.message.includes('not authorized'));

  // Admin user trying to fetch admin diagnostics
  const resAdminStats = await request(app)
    .get('/api/v1/admin/stats')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.strictEqual(resAdminStats.status, 200);
  assert.strictEqual(resAdminStats.body.success, true);
  console.log('✓ RBAC boundaries successfully protected admin endpoints.');

  // ── TEST 7: Export & Analytics Engines ──────────────────────
  console.log('\n[Test 7] Exporters and Analytics Engines...');
  // Analytics fetch
  const resAnalytics = await request(app)
    .get('/api/v1/analytics/dashboard')
    .set('Authorization', `Bearer ${tokenDev}`);
  assert.strictEqual(resAnalytics.status, 200);
  assert.ok(resAnalytics.body.data.tasksCount);

  // CSV export
  const resCSV = await request(app)
    .get('/api/v1/export/tasks?format=csv')
    .set('Authorization', `Bearer ${tokenDev}`);
  assert.strictEqual(resCSV.status, 200);
  assert.strictEqual(resCSV.headers['content-type'], 'text/csv; charset=utf-8');

  // Excel export
  const resExcel = await request(app)
    .get('/api/v1/export/tasks?format=excel')
    .set('Authorization', `Bearer ${tokenDev}`);
  assert.strictEqual(resExcel.status, 200);
  assert.strictEqual(resExcel.headers['content-type'], 'application/vnd.ms-excel; charset=utf-8');
  assert.ok(resExcel.text.includes('html xmlns:o="urn:schemas-microsoft-com:office:office"'));
  console.log('✓ Dashboard analytics summaries and Excel/CSV data exports verified.');

  console.log('\n====================================================');
  console.log('🎉 ALL QA SCIENTIST REGRESSION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runQAScientistTests().catch((err) => {
  console.error('\n❌ QA Scientist Test failed:', err);
  process.exit(1);
});
