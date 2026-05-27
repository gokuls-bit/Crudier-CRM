/**
 * ============================================================
 * Crudier CRM — Backend Business Logic Test Suite
 * ============================================================
 * Runs unit tests on our core business logic services (Auth, 
 * Workspace, Tasks, Attendance, Meetings, Notifications)
 * by mocking the MongoDB database layer.
 * ============================================================
 */

const assert = require('assert');

const { ObjectId } = require('mongodb');

// ── Mocking database layer ──────────────────────────────────
const mockDatabase = {
  users: [],
  workspaces: [],
  workspaceActivity: [],
  tasks: [],
  attendance: [],
  notes: [],
  meetings: [],
  notifications: [],
  refreshTokens: [],
};

const mockCollection = (name) => {
  const store = mockDatabase[name] || [];
  return {
    findOne: async (query) => {
      return store.find((item) => {
        return Object.entries(query).every(([k, v]) => {
          if (v && v.$gte) return item[k] >= v.$gte;
          if (v && v.$lte) return item[k] <= v.$lte;
          if (v && typeof v === 'object' && v.toString) return item[k]?.toString() === v.toString();
          return item[k] === v;
        });
      });
    },
    insertOne: async (doc) => {
      doc._id = doc._id || new ObjectId();
      store.push(doc);
      return { insertedId: doc._id };
    },
    updateOne: async (query, update) => {
      const idx = store.findIndex((item) => {
        return Object.entries(query).every(([k, v]) => item[k]?.toString() === v?.toString());
      });
      if (idx !== -1) {
        if (update.$set) store[idx] = { ...store[idx], ...update.$set };
        if (update.$push) {
          const pushKey = Object.keys(update.$push)[0];
          store[idx][pushKey] = store[idx][pushKey] || [];
          store[idx][pushKey].push(update.$push[pushKey]);
        }
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    deleteOne: async (query) => {
      const idx = store.findIndex((item) => {
        return Object.entries(query).every(([k, v]) => item[k]?.toString() === v?.toString());
      });
      if (idx !== -1) {
        store.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },
    deleteMany: async (query) => {
      const beforeCount = store.length;
      mockDatabase[name] = store.filter((item) => {
        return !Object.entries(query).every(([k, v]) => item[k]?.toString() === v?.toString());
      });
      return { deletedCount: beforeCount - mockDatabase[name].length };
    },
    find: (query) => {
      let result = store.filter((item) => {
        return Object.entries(query).every(([k, v]) => {
          if (k === '$or') {
            return v.some((orClause) => {
              return Object.entries(orClause).every(([ok, ov]) => item[ok]?.toString() === ov?.toString());
            });
          }
          return item[k]?.toString() === v?.toString();
        });
      });
      return {
        sort: () => ({
          skip: () => ({
            limit: () => ({
              toArray: async () => result,
            }),
          }),
          toArray: async () => result,
        }),
      };
    },
    countDocuments: async (query) => {
      return store.filter((item) => {
        return Object.entries(query).every(([k, v]) => item[k]?.toString() === v?.toString());
      });
    },
    createIndex: async () => {},
    aggregate: (pipeline) => {
      // Stub aggregation results for the attendance report
      return {
        toArray: async () => {
          // If we query users for workspace report:
          if (name === 'users') {
            const workspace = mockDatabase.workspaces[0];
            const members = store.filter(user => 
              workspace.members.some(m => m.userId.toString() === user._id.toString()) ||
              workspace.ownerId.toString() === user._id.toString()
            );
            return members.map(u => {
              const logs = mockDatabase.attendance.filter(log => log.userId.toString() === u._id.toString());
              const presentCount = logs.filter(l => l.status === 'Present').length;
              const lateCount = logs.filter(l => l.status === 'Late').length;
              const halfDayCount = logs.filter(l => l.status === 'Half Day').length;
              const absentCount = logs.filter(l => l.status === 'Absent').length;
              const totalHours = logs.reduce((sum, l) => sum + (l.totalHours || 0), 0);
              return {
                _id: u._id,
                name: u.name,
                email: u.email,
                totalDays: logs.length,
                presentCount,
                lateCount,
                halfDayCount,
                absentCount,
                avgHours: logs.length > 0 ? parseFloat((totalHours / logs.length).toFixed(2)) : 0.0,
              };
            });
          }
          return [];
        }
      };
    }
  };
};

// Override config/db getDb
const dbModule = require('./config/db');
dbModule.getDb = () => ({
  collection: (name) => mockCollection(name),
});

// Import services to test
const authService = require('./src/modules/auth/auth.service');
const taskService = require('./src/modules/tasks/task.service');
const attendanceService = require('./src/modules/attendance/attendance.service');
const meetingService = require('./src/modules/meetings/meeting.service');
const notificationService = require('./src/modules/notifications/notification.service');

async function runTests() {
  console.log('🧪 Running Business Logic Tests...');

  // ── Test 1: User password hashing & role check ───────────
  console.log('\nTesting Auth Service registration & login...');
  const testUser = await authService.register({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'securePassword123',
    role: 'Developer',
  });
  
  assert.strictEqual(testUser.name, 'Jane Doe');
  assert.strictEqual(testUser.email, 'jane@example.com');
  assert.strictEqual(testUser.role, 'Developer');
  assert.ok(testUser._id);
  assert.strictEqual(testUser.password, undefined); // should not return password

  // Try logging in
  const loginRes = await authService.login('jane@example.com', 'securePassword123');
  assert.strictEqual(loginRes.user.email, 'jane@example.com');
  assert.ok(loginRes.accessToken);
  assert.ok(loginRes.refreshToken);

  // Assert that refresh token has been whitelisted in DB
  const whitelistedToken = mockDatabase.refreshTokens.find(t => t.token === loginRes.refreshToken);
  assert.ok(whitelistedToken);
  assert.strictEqual(whitelistedToken.userId.toString(), testUser._id.toString());

  // Test token rotation on refresh
  const refreshed = await authService.refreshToken(loginRes.refreshToken);
  assert.ok(refreshed.accessToken);
  assert.ok(refreshed.refreshToken);
  assert.notStrictEqual(refreshed.refreshToken, loginRes.refreshToken);

  // Assert that the old refresh token was deleted and the new one was saved
  const oldTokenDoc = mockDatabase.refreshTokens.find(t => t.token === loginRes.refreshToken);
  const newTokenDoc = mockDatabase.refreshTokens.find(t => t.token === refreshed.refreshToken);
  assert.strictEqual(oldTokenDoc, undefined);
  assert.ok(newTokenDoc);

  // Test token revocation on logout
  await authService.logout(refreshed.refreshToken);
  const revokedTokenDoc = mockDatabase.refreshTokens.find(t => t.token === refreshed.refreshToken);
  assert.strictEqual(revokedTokenDoc, undefined);

  console.log('✅ Auth registration, login, rotation & logout tests passed.');

  // ── Test 2: Task Status Role Gating ──────────────────────
  console.log('\nTesting Task Status Gating...');
  const validWorkspaceId = '111111111111111111111111';
  const actorDev = { _id: testUser._id, role: 'Developer', workspaceId: validWorkspaceId };
  const actorLead = { _id: '222222222222222222222222', role: 'Team Lead', workspaceId: validWorkspaceId };
  const actorAdmin = { _id: '333333333333333333333333', role: 'Admin', workspaceId: validWorkspaceId };

  const task = await taskService.create({
    title: 'Code review dashboard',
    assignedTo: testUser._id,
    priority: 'High',
  }, actorDev);

  assert.strictEqual(task.status, 'Pending');

  // Dev sets to In Progress -> Allowed
  const taskInProg = await taskService.updateStatus(task._id, 'In Progress', actorDev);
  assert.strictEqual(taskInProg.status, 'In Progress');

  // Dev sets to Blocked -> Should Fail
  try {
    await taskService.updateStatus(task._id, 'Blocked', actorDev);
    assert.fail('Developer should not be allowed to set status to Blocked');
  } catch (err) {
    assert.strictEqual(err.statusCode, 403);
    assert.ok(err.message.includes('cannot transition task status'));
  }

  // Admin sets to Blocked -> Allowed
  const taskBlocked = await taskService.updateStatus(task._id, 'Blocked', actorAdmin);
  assert.strictEqual(taskBlocked.status, 'Blocked');
  console.log('✅ Task Status Gating test passed.');

  // ── Test 3: Attendance Auto Statuses ─────────────────────
  console.log('\nTesting Attendance Auto Status & Checkout...');
  // Check-in on time (9:00 AM)
  const timeOnTime = new Date('2026-05-28T09:00:00');
  const recordOnTime = await attendanceService.checkIn(testUser._id, validWorkspaceId, timeOnTime);
  assert.strictEqual(recordOnTime.status, 'Present');

  // Check-in late (10:00 AM)
  const timeLate = new Date('2026-05-28T10:00:00');
  mockDatabase.attendance = []; // Clear for next check-in
  const recordLate = await attendanceService.checkIn(testUser._id, validWorkspaceId, timeLate);
  assert.strictEqual(recordLate.status, 'Late');

  // Check-out under 4 hours (e.g. checked in at 9:00 AM, check out at 11:30 AM -> 2.5 hours)
  mockDatabase.attendance = [];
  await attendanceService.checkIn(testUser._id, validWorkspaceId, timeOnTime);
  const checkoutTime = new Date('2026-05-28T11:30:00');
  const checkedOut = await attendanceService.checkOut(testUser._id, checkoutTime);
  // Status should be downgraded to Half Day
  assert.strictEqual(checkedOut.status, 'Half Day');
  assert.strictEqual(checkedOut.totalHours, 2.5);
  console.log('✅ Attendance timing rules test passed.');

  // ── Test 4: Meeting Validations ──────────────────────────
  console.log('\nTesting Meeting scheduling validations...');
  // Stub workspace check
  const workspaceMock = {
    _id: validWorkspaceId,
    members: [{ userId: testUser._id }],
    ownerId: '444444444444444444444444',
  };
  mockDatabase.workspaces.push(workspaceMock);

  const actorFounder = { _id: '444444444444444444444444', role: 'Founder', workspaceId: validWorkspaceId };

  // Future start / End time validation
  const pastStart = new Date(Date.now() - 10000);
  const futureEnd = new Date(Date.now() + 60000);

  try {
    await meetingService.create({
      title: 'Sync',
      startTime: pastStart,
      endTime: futureEnd,
      participants: [testUser._id],
    }, actorFounder);
    assert.fail('Scheduling past start time should fail');
  } catch (err) {
    assert.strictEqual(err.statusCode, 400);
    assert.ok(err.message.includes('must be in the future'));
  }
  console.log('✅ Meeting scheduler validations test passed.');

  // ── Test 5: Notification Grouping ────────────────────────
  console.log('\nTesting consecutive Notification grouping...');
  mockDatabase.notifications = [];

  // Create first notification
  await notificationService.createNotification(testUser._id, {
    title: 'Build Fail',
    message: 'Build #1 failed.',
    type: 'task_assigned',
  });

  // Create second notification of same type in same hour
  await notificationService.createNotification(testUser._id, {
    title: 'Build Fail',
    message: 'Build #2 failed.',
    type: 'task_assigned',
  });

  // Should group into one record with joined message
  const list = mockDatabase.notifications;
  assert.strictEqual(list.length, 1);
  assert.ok(list[0].message.includes('Build #1 failed.'));
  assert.ok(list[0].message.includes('Build #2 failed.'));
  console.log('✅ Notification grouping test passed.');

  console.log('\n🎉 ALL BUSINESS LOGIC TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
