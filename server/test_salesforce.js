/**
 * ============================================================
 * Crudier CRM — Salesforce CRM Integration & Regression Tests
 * ============================================================
 */

process.env.NODE_ENV = 'test';
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');

// Mock Database configurations
const dbConfig = require('./config/db');
dbConfig.connectDB = async () => {
  mongoose.connection.readyState = 1;
  return {};
};
dbConfig.getConnectionStatus = () => true;

// Mock Store
const store = {
  users: [],
  accounts: [],
  contacts: [],
  opportunities: [],
  cases: [],
  products: [],
  pricebooks: [],
  territories: [],
  emails: [],
  activities: [],
  quotas: []
};

dbConfig.getDb = () => ({
  collection: (name) => ({
    find: (q = {}) => ({
      sort: () => ({
        toArray: async () => {
          let list = store[name] || [];
          // Simple query filtering mock
          if (q.workspaceId) {
            list = list.filter(x => x.workspaceId && x.workspaceId.toString() === q.workspaceId.toString());
          }
          if (q.accountId) {
            list = list.filter(x => x.accountId && x.accountId.toString() === q.accountId.toString());
          }
          if (q.contactId) {
            list = list.filter(x => x.contactId && x.contactId.toString() === q.contactId.toString());
          }
          return list;
        }
      })
    }),
    findOne: async (q) => {
      const list = store[name] || [];
      return list.find(x => {
        return Object.entries(q).every(([k, v]) => {
          if (v && v.toString) {
            return (x[k] && x[k].toString() === v.toString()) || x[k] === v;
          }
          return x[k] === v;
        });
      });
    },
    insertOne: async (d) => {
      d._id = d._id || new mongoose.Types.ObjectId();
      (store[name] = store[name] || []).push(d);
      return { insertedId: d._id };
    },
    updateOne: async (q, update) => {
      const list = store[name] || [];
      const item = list.find(x => {
        return Object.entries(q).every(([k, v]) => {
          if (v && v.toString) {
            return (x[k] && x[k].toString() === v.toString()) || x[k] === v;
          }
          return x[k] === v;
        });
      });
      if (item && update.$set) {
        Object.assign(item, update.$set);
      }
      if (item && update.$push) {
        const field = Object.keys(update.$push)[0];
        item[field] = item[field] || [];
        item[field].push(update.$push[field]);
      }
      if (item && update.$pull) {
        const field = Object.keys(update.$pull)[0];
        const condition = update.$pull[field];
        if (item[field] && condition.lineItemId) {
          item[field] = item[field].filter(x => x.lineItemId !== condition.lineItemId);
        }
      }
      return { modifiedCount: item ? 1 : 0 };
    },
    updateMany: async (q, update) => {
      const list = store[name] || [];
      let count = 0;
      list.forEach(x => {
        const match = Object.entries(q).every(([k, v]) => {
          if (k === 'status' && v && v.$in) {
            return v.$in.includes(x.status);
          }
          if (k === 'createdAt' && v && v.$lt) {
            return x.createdAt < v.$lt;
          }
          if (v && v.toString) {
            return (x[k] && x[k].toString() === v.toString()) || x[k] === v;
          }
          return x[k] === v;
        });
        if (match && update.$set) {
          Object.assign(x, update.$set);
          count++;
        }
      });
      return { modifiedCount: count };
    },
    deleteOne: async (q) => {
      const index = (store[name] || []).findIndex(x => x._id.toString() === q._id.toString());
      if (index !== -1) {
        store[name].splice(index, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },
    aggregate: (pipeline) => ({
      toArray: async () => {
        // Simple aggregates simulation for forecasting
        if (pipeline && pipeline.length > 0) {
          return [];
        }
        return [];
      }
    })
  })
});

// Import App after stubs connected
const app = require('./app');

async function runTests() {
  console.log('🔬 Starting Salesforce CRM Integration Test Suite...\n');

  const workspaceId = new mongoose.Types.ObjectId();
  const actorId = new mongoose.Types.ObjectId();

  // Create mock workspace user
  const mockUser = {
    _id: actorId,
    name: 'Sales rep User',
    email: 'rep@crudier.com',
    role: 'Sales',
    workspaceId: workspaceId,
    password: 'securePassword123',
    isActive: true
  };
  store.users.push(mockUser);

  // Generate session cookie bypass or mock token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: mockUser._id.toString(), email: mockUser.email, role: mockUser.role, workspaceId: mockUser.workspaceId.toString() },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );

  const authHeaders = {
    'Authorization': `Bearer ${token}`
  };

  try {
    // ----------------------------------------
    // [Test 1] Create Territory Assignment
    // ----------------------------------------
    console.log('[Test 1] Territory Creation...');
    const territoryRes = await request(app)
      .post('/api/v1/sales/territories')
      .set(authHeaders)
      .send({
        name: 'US East Coast Tech startup region',
        region: 'US-East',
        industry: 'Tech',
        assignedRepId: actorId.toString()
      });
    
    assert.strictEqual(territoryRes.status, 201);
    assert.strictEqual(territoryRes.body.data.name, 'US East Coast Tech startup region');
    console.log('✓ Territory rule logged successfully.');

    // ----------------------------------------
    // [Test 2] Create Account with Auto-Routing Rep
    // ----------------------------------------
    console.log('\n[Test 2] Corporate Account Auto-Routing...');
    const accountRes = await request(app)
      .post('/api/v1/sales/accounts')
      .set(authHeaders)
      .send({
        name: 'Alpha Software Corp',
        type: 'Prospect',
        region: 'US-East',
        industry: 'Tech',
        annualRevenue: 4500000,
        employeesCount: 450
      });
    
    assert.strictEqual(accountRes.status, 201);
    // Rep should be auto assigned to actorId based on Territory routing rules!
    assert.strictEqual(accountRes.body.data.assignedTo.toString(), actorId.toString());
    console.log('✓ Account created and auto-assigned to rep correctly.');

    // ----------------------------------------
    // [Test 3] Contact creation and Merge Deduplication
    // ----------------------------------------
    console.log('\n[Test 3] Contacts Creation & Merge Deduplication...');
    const c1Res = await request(app)
      .post('/api/v1/sales/contacts')
      .set(authHeaders)
      .send({
        accountId: accountRes.body.data._id.toString(),
        firstName: 'Alice',
        lastName: 'Vance',
        email: 'alice@alpha.com',
        title: 'CTO'
      });
    
    const c2Res = await request(app)
      .post('/api/v1/sales/contacts')
      .set(authHeaders)
      .send({
        accountId: accountRes.body.data._id.toString(),
        firstName: 'Alice',
        lastName: 'Vance',
        email: 'alice.vance@alpha.com',
        phone: '555-999-0000',
        linkedInUrl: 'https://linkedin.com/alicev'
      });

    const mergeRes = await request(app)
      .post('/api/v1/sales/contacts/merge')
      .set(authHeaders)
      .send({
        primaryContactId: c1Res.body.data._id.toString(),
        secondaryContactId: c2Res.body.data._id.toString()
      });

    assert.strictEqual(mergeRes.status, 200);
    // Primary contact should now inherit secondary phone and linkedInUrl
    assert.strictEqual(mergeRes.body.data.phone, '555-999-0000');
    assert.strictEqual(mergeRes.body.data.linkedInUrl, 'https://linkedin.com/alicev');
    console.log('✓ Contacts merged and duplicates resolved correctly.');

    // ----------------------------------------
    // [Test 4] Opportunity Probability & Weighted Value
    // ----------------------------------------
    console.log('\n[Test 4] Opportunity Weighted Stages...');
    const oppRes = await request(app)
      .post('/api/v1/sales/opportunities')
      .set(authHeaders)
      .send({
        name: 'Database Enterprise license upgrade',
        accountId: accountRes.body.data._id.toString(),
        stage: 'Needs Analysis',
        amount: 100000
      });

    assert.strictEqual(oppRes.status, 201);
    // Probability for Needs Analysis is 25%
    assert.strictEqual(oppRes.body.data.probability, 25);
    assert.strictEqual(oppRes.body.data.forecastCategory, 'Pipeline');

    // Update to Proposal Quote (65%)
    const patchOpp = await request(app)
      .patch(`/api/v1/sales/opportunities/${oppRes.body.data._id}`)
      .set(authHeaders)
      .send({
        stage: 'Proposal / Price Quote'
      });

    assert.strictEqual(patchOpp.status, 200);
    assert.strictEqual(patchOpp.body.data.probability, 65);
    assert.strictEqual(patchOpp.body.data.forecastCategory, 'Best Case');
    console.log('✓ Stage-to-probability mapping verified.');

    // ----------------------------------------
    // [Test 5] Add Line Item Products with Discounts
    // ----------------------------------------
    console.log('\n[Test 5] Product Line Items & Quote Amounts...');
    const prodRes = await request(app)
      .post('/api/v1/sales/products')
      .set(authHeaders)
      .send({
        name: 'Database Cloud Engine',
        standardPrice: 50000
      });

    // Add product to opportunity: quantity = 2, unitPrice = 50000, discount = 10%
    const addLineRes = await request(app)
      .post(`/api/v1/sales/opportunities/${oppRes.body.data._id}/products`)
      .set(authHeaders)
      .send({
        productId: prodRes.body.data._id.toString(),
        name: prodRes.body.data.name,
        quantity: 2,
        unitPrice: 50000,
        discount: 10
      });

    assert.strictEqual(addLineRes.status, 201);
    // Calculated amount should be: 2 * 50000 * (1 - 0.10) = 90000
    assert.strictEqual(addLineRes.body.data.amount, 90000);
    console.log('✓ Line item calculations validated.');

    // ----------------------------------------
    // [Test 6] Case Escalation & CSAT scoring
    // ----------------------------------------
    console.log('\n[Test 6] Support Case Escalation & CSAT metrics...');
    const caseRes = await request(app)
      .post('/api/v1/sales/cases')
      .set(authHeaders)
      .send({
        subject: 'Database server offline',
        description: 'Client reports cluster timeout on US-East region.',
        priority: 'High'
      });

    assert.strictEqual(caseRes.status, 201);
    assert.strictEqual(caseRes.body.data.status, 'New');

    // Closed ticket CSAT
    const closeCaseRes = await request(app)
      .patch(`/api/v1/sales/cases/${caseRes.body.data._id}`)
      .set(authHeaders)
      .send({
        status: 'Closed',
        csatScore: 5
      });
    
    assert.strictEqual(closeCaseRes.status, 200);
    assert.strictEqual(closeCaseRes.body.data.csatScore, 5);
    console.log('✓ Support Case workflow validated successfully.');

    // ----------------------------------------
    // [Test 7] Email open-tracking pixel
    // ----------------------------------------
    console.log('\n[Test 7] Email Dispatch & Track Pixel Webhook...');
    const sendMailRes = await request(app)
      .post('/api/v1/sales/emails/send')
      .set(authHeaders)
      .send({
        contactId: c1Res.body.data._id.toString(),
        subject: 'Welcome back to our network {{contact.firstName}}!',
        body: 'Glad to have you with us.'
      });

    assert.strictEqual(sendMailRes.status, 200);
    const pixelId = sendMailRes.body.data.emailLog.pixelId;
    assert.ok(pixelId);

    // Call tracking pixel (public unprotected route!)
    const trackRes = await request(app)
      .get(`/api/v1/sales/emails/track/${pixelId}`);

    assert.strictEqual(trackRes.status, 200);
    assert.strictEqual(trackRes.headers['content-type'], 'image/gif');
    console.log('✓ Tracking pixel served and email open tracked.');

    console.log('\n======================================================');
    console.log('🎉 ALL SALESFORCE CRM INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    process.exit(0);

  } catch (err) {
    console.error('❌ Integration Test Failed:', err.message);
    process.exit(1);
  }
}

runTests();
