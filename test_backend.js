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
      doc._id = doc._id || Math.random().toString(36).substring(7);
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
  console.log('✅ Auth registration & login test passed.');

  // ── Test 2: Task Status Role Gating ──────────────────────
  console.log('\nTesting Task Status Gating...');
  const actorDev = { _id: testUser._id, role: 'Developer', workspaceId: 'ws1' };
  const actorLead = { _id: 'leadId', role: 'Team Lead', workspaceId: 'ws1' };
  const actorAdmin = { _id: 'adminId', role: 'Admin', workspaceId: 'ws1' };

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
  const recordOnTime = await attendanceService.checkIn(testUser._id, 'ws1', timeOnTime);
  assert.strictEqual(recordOnTime.status, 'Present');

  // Check-in late (10:00 AM)
  const timeLate = new Date('2026-05-28T10:00:00');
  mockDatabase.attendance = []; // Clear for next check-in
  const recordLate = await attendanceService.checkIn(testUser._id, 'ws1', timeLate);
  assert.strictEqual(recordLate.status, 'Late');

  // Check-out under 4 hours (e.g. checked in at 9:00 AM, check out at 11:30 AM -> 2.5 hours)
  mockDatabase.attendance = [];
  await attendanceService.checkIn(testUser._id, 'ws1', timeOnTime);
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
    _id: 'ws1',
    members: [{ userId: testUser._id }],
    ownerId: 'ownerId',
  };
  mockDatabase.workspaces.push(workspaceMock);

  const actorFounder = { _id: 'ownerId', role: 'Founder', workspaceId: 'ws1' };

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
