/**
 * ============================================================
 * Crudier CRM — Clerk Auth Upgrade Verification Test Suite
 * ============================================================
 */

process.env.NODE_ENV = 'test';
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// ── MOCK DATABASE LAYER ────────────
const store = {
  users: [],
  refreshTokens: [],
};

// Stub MongoDB connect helpers
const dbConfig = require('./config/db');
dbConfig.connectDB = async () => {
  mongoose.connection.readyState = 1;
  return {};
};
dbConfig.getConnectionStatus = () => true;
dbConfig.getDb = () => ({
  collection: (name) => ({
    find: (q) => ({
      toArray: async () => {
        let list = store[name] || [];
        if (q && Object.keys(q).length > 0) {
          list = list.filter(item => {
            return Object.entries(q).every(([k, v]) => item[k] === v);
          });
        }
        return list;
      }
    }),
    findOne: async (q) => {
      const list = store[name] || [];
      return list.find(x => {
        return Object.entries(q).every(([k, v]) => {
          if (k === 'authProviders' && v && v.$elemMatch) {
            const { provider, providerId } = v.$elemMatch;
            return x.authProviders && x.authProviders.some(ap => ap.provider === provider && ap.providerId === providerId);
          }
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
    deleteOne: async (q) => {
      const idx = (store[name] || []).findIndex(x => x.token === q.token);
      if (idx !== -1) {
        store[name].splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },
    deleteMany: async (q) => {
      const initialCount = (store[name] || []).length;
      store[name] = (store[name] || []).filter(x => x.userId?.toString() !== q.userId?.toString());
      return { deletedCount: initialCount - store[name].length };
    },
    updateOne: async (q, u) => {
      const list = store[name] || [];
      const item = list.find(x => x._id.toString() === q._id.toString());
      if (!item) return { modifiedCount: 0 };

      if (u.$set) {
        Object.entries(u.$set).forEach(([k, v]) => {
          if (k.startsWith('activeSessions.')) {
            // Mock sub-property update
            return;
          }
          item[k] = v;
        });
      }
      if (u.$push) {
        Object.entries(u.$push).forEach(([k, v]) => {
          item[k] = item[k] || [];
          item[k].push(v);
        });
      }
      if (u.$pull) {
        Object.entries(u.$pull).forEach(([k, v]) => {
          if (item[k]) {
            if (v.provider) {
              item[k] = item[k].filter(x => x.provider !== v.provider);
            } else if (v.sessionId) {
              item[k] = item[k].filter(x => x.sessionId !== v.sessionId);
            }
          }
        });
      }
      if (u.$inc) {
        Object.entries(u.$inc).forEach(([k, v]) => {
          item[k] = (item[k] || 0) + v;
        });
      }
      return { modifiedCount: 1 };
    }
  })
});

// Import models to override prototype query methods
const User = require('./src/models/user.model');
const stubModel = (modelClass, storeKey) => {
  modelClass.find = (query) => {
    const list = store[storeKey] || [];
    const chain = {
      populate: () => chain,
      sort: () => chain,
      skip: () => chain,
      limit: () => chain,
      then: (resolve) => resolve(list),
      exec: async () => list,
    };
    return chain;
  };
  modelClass.findOne = (query) => {
    const list = store[storeKey] || [];
    const item = list.find(x => {
      if (!query || Object.keys(query).length === 0) return true;
      return Object.entries(query).every(([k, v]) => x[k] === v);
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
    store[storeKey].push(newDoc);
    return newDoc;
  };
};

stubModel(User, 'users');

// Override Custom Compare Passwords method
User.prototype.matchPassword = async function (enteredPassword) {
  return enteredPassword === 'securePassword123';
};

// ── IMPORT APP ────────────
const app = require('./app');
const env = require('./config/env');
const { getTOTP } = require('./src/utils/totp');
const { decrypt } = require('./src/utils/encryption');

async function runTests() {
  console.log('\n🔐 Starting Clerk Authentication Upgrade Integration Test...');
  console.log('===========================================================');

  // Test 1: User Registration
  console.log('[Test 1] User Registration...');
  const resRegister = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Clerk User',
      email: 'clerk@crm.local',
      password: 'securePassword123',
      role: 'Developer'
    });

  assert.strictEqual(resRegister.status, 201);
  assert.strictEqual(resRegister.body.success, true);
  assert.strictEqual(resRegister.body.data.email, 'clerk@crm.local');
  assert.strictEqual(resRegister.body.data.emailVerified, false);
  console.log('✓ User registered successfully.');

  // Test 2: Credential Login (Failed Attempts & Lockout)
  console.log('[Test 2] Login failure increments attempts and lockouts account...');
  let resLoginFail;
  for (let i = 0; i < 5; i++) {
    resLoginFail = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'clerk@crm.local',
        password: 'wrongPassword'
      });
  }
  assert.strictEqual(resLoginFail.status, 403);
  assert.ok(resLoginFail.body.message.includes('locked') || resLoginFail.body.message.includes('Too many failed attempts'));
  console.log('✓ Account lockout working correctly after 5 failed attempts.');

  // Reset user failed attempts so we can log in
  const user = store.users.find(u => u.email === 'clerk@crm.local');
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;

  // Test 3: Successful Login
  console.log('[Test 3] Successful login with credentials...');
  const resLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'clerk@crm.local',
      password: 'securePassword123'
    });

  assert.strictEqual(resLogin.status, 200);
  assert.ok(resLogin.body.data.accessToken);
  assert.ok(resLogin.body.data.sessionId);
  
  const token = resLogin.body.data.accessToken;
  console.log('✓ Logged in and generated active session.');

  // Test 4: 2FA Setup Flow
  console.log('[Test 4] Initiating 2FA TOTP setup...');
  const res2FASetup = await request(app)
    .post('/api/v1/auth/2fa/setup')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(res2FASetup.status, 200);
  assert.ok(res2FASetup.body.data.secret);
  assert.ok(res2FASetup.body.data.otpauthUrl);
  
  const rawSecret = res2FASetup.body.data.secret;
  console.log('✓ 2FA secret and OTP Auth URI created.');

  // Test 5: Verify 2FA to enable it
  console.log('[Test 5] Confirming TOTP verification to enable 2FA...');
  const currentOtp = getTOTP(rawSecret);

  const res2FAVerify = await request(app)
    .post('/api/v1/auth/2fa/verify')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: currentOtp });

  assert.strictEqual(res2FAVerify.status, 200);
  assert.strictEqual(res2FAVerify.body.data.backupCodes.length, 10);
  
  const backupCode = res2FAVerify.body.data.backupCodes[0];
  console.log('✓ 2FA enabled, backup codes successfully returned.');

  // Test 6: Login with 2FA enabled
  console.log('[Test 6] Login with 2FA enabled (should return MFA token)...');
  const resLoginMfa = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'clerk@crm.local',
      password: 'securePassword123'
    });

  assert.strictEqual(resLoginMfa.status, 200);
  assert.strictEqual(resLoginMfa.body.data.mfaRequired, true);
  assert.ok(resLoginMfa.body.data.tempToken);
  
  const tempToken = resLoginMfa.body.data.tempToken;
  console.log('✓ Gated successfully with mfaRequired challenge.');

  // Test 7: Verify MFA code to complete login
  console.log('[Test 7] Verify TOTP challenge to complete login...');
  const verifyMfaOtp = getTOTP(rawSecret);

  const resMfaValidate = await request(app)
    .post('/api/v1/auth/2fa/validate')
    .send({
      tempToken,
      code: verifyMfaOtp
    });

  assert.strictEqual(resMfaValidate.status, 200);
  assert.ok(resMfaValidate.body.data.accessToken);
  assert.ok(resMfaValidate.body.data.sessionId);
  console.log('✓ Login verified successfully via TOTP.');

  // Test 8: Revoking active session
  console.log('[Test 8] Revoke active login session...');
  const finalToken = resMfaValidate.body.data.accessToken;
  const sessionId = resMfaValidate.body.data.sessionId;

  const resRevoke = await request(app)
    .delete(`/api/v1/auth/sessions/${sessionId}`)
    .set('Authorization', `Bearer ${finalToken}`);

  assert.strictEqual(resRevoke.status, 200);
  console.log('✓ Active session revoked successfully.');

  // Test 9: Developer Profile Sync
  console.log('[Test 9] Sync Coder Stats for Developer Profile...');
  const resSync = await request(app)
    .post('/api/v1/auth/developer-profiles/sync')
    .set('Authorization', `Bearer ${finalToken}`);

  assert.strictEqual(resSync.status, 200);
  assert.ok(resSync.body.data.github);
  assert.ok(resSync.body.data.leetcode);
  console.log('✓ Coder stats retrieved and synced successfully.');

  console.log('===========================================================');
  console.log('🎉 ALL CLERK AUTH VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch((err) => {
  console.error('\n❌ Clerk Auth Test failed:', err);
  process.exit(1);
});
