# 🚀 Crudier CRM v2.0 (ServiceNow Redesign & Salesforce Lightning Upgrades)

**Crudier CRM** is an enterprise-grade Customer Relationship Management platform that merges the powerful workflows of **ServiceNow** with the robust Sales modules of **Salesforce**, backed by a secure **Clerk-inspired** authentication flow.

---

## 📁 Repository Structure

This repository is split into two main sections:
- **`client/`**: React + Vite frontend application powered by Tailwind CSS.
- **`server/`**: Express + Node.js backend API powered by native MongoDB collections.

```
crudier/
├── client/                 # Vite + React Frontend
│   ├── src/
│   │   ├── config/         # API configs (Axios interceptors) & Socket.IO config
│   │   ├── routes/         # Unified AppRouter routing tree and path maps
│   │   ├── store/          # Zustand State Stores (Auth, Toast, UI, etc.)
│   │   ├── pages/          # Auth, ServiceNow, and Salesforce CRM layout views
│   │   └── components/     # High-density UI sheets, highlights, and accordions
│   └── package.json
│
├── server/                 # Node.js + Express API Backend
│   ├── config/             # DB & Redis connection settings
│   ├── src/
│   │   ├── middlewares/    # XSS sanitization, double-submit CSRF, Helmet, RBAC
│   │   ├── modules/        # Auth, Notes, Notifications, and Salesforce Modules
│   │   ├── queues/         # In-memory async worker queue
│   │   └── app.js          # Express app initialization
│   ├── test_*.js           # Full regression and integration test scripts
│   └── package.json
│
└── README.md               # Main instructions (This file)
```

---

## 🔐 1. Clerk-Inspired Security & Authentication

A premium, hosted-grade authentication flow featuring:
- **Unified Sign-in & Sign-up**: [AuthPage.jsx](file:///d:/manhattan%202/velox-code-agancy/company/crm/crudier/client/src/pages/auth/AuthPage.jsx) with smooth transitions, password strength indicators, and **17 branded OAuth provider buttons** (Google, GitHub, Microsoft, GitLab, Slack, Discord, LinkedIn, Atlassian, Figma, Apple, LeetCode, HackerRank, and more).
- **Two-Factor Authentication (2FA)**: Full TOTP registration via QR Code (`react-qr-code`) and copyable manual secrets, returning **10 printable backup recovery codes**.
- **Session & Login Management**: Interactive [SecuritySettingsPage.jsx](file:///d:/manhattan%202/velox-code-agancy/company/crm/crudier/client/src/pages/shared/SecuritySettingsPage.jsx) to view IP history, device and browser metadata, and click-to-revoke active login sessions.
- **Developer Profiles**: Cards display live coding statistics compiled across synced developer platforms (GitHub repositories, LeetCode ratings, HackerRank badges, Stack Overflow statistics).
- **Security Boundaries**: Real-time Helmet security headers, NoSQL operator injection cleaners, HTML entity-escaping XSS middlewares, and rate-limit lockouts (locks account for 30 minutes after 5 consecutive failures).

---

## 💼 2. Salesforce CRM Module

Features structured according to the Salesforce Lightning Design System (SLDS):
- **Highlights Panel**: Instant inline editing for key record fields on Account and Contact detail pages.
- **Activity Timeline**: Chromatically ordered timeline log aggregating system events, custom notes, sent emails, meetings, and tasks.
- **Related Lists**: Collapsible accordions showing child associations (Contacts, Cases, Opportunities) with inline creation prompts.
- **Deduplication Wizard**: Full-page Contact Merge tool that transfers opportunities, cases, and timeline logs to a selected primary record.
- **Pipeline Kanban**: Opportunity Kanban board with weighted calculations based on stages (Prospecting = 10%, Needs Analysis = 25%, Proposal/Quote = 65%, Negotiation = 75%, Closed Won = 100%).
- **Email Hub**: Markdown composition with auto-filled tags (`{{contact.firstName}}`), bulk sends, and an unprotected external **Pixel Open-Tracking** route.
- **Territory Board**: Assigns leads and accounts to representatives automatically based on Region (e.g. `US-East`) and Industry (e.g. `Tech`).
- **Support Cases**: Support center with a webhook intake simulator, automatic case escalations (unresolved > 12 hours become *Critical*), and CSAT feedback ratings.

---

## 🛠️ 3. Environment & Configuration

The application is configured to run out-of-the-box locally.

### Database Connection
If connection to the Atlas cluster fails or is restricted by IP whitelist settings, the server automatically connects to the local MongoDB daemon:
- **Default Database URL**: `mongodb://127.0.0.1:27017/crudier`

### Redis Standalone Bypass
To make developer onboarding seamless, Redis has been bypassed for local environments.
- **Redis Sync & Cache**: The cache middleware and Socket.IO cluster synchronizer automatically bypass Redis and run in robust standalone mode.
- **Bull Queues**: Bull queue managers are bypassed, processing asynchronous tasks (such as email dispatches) asynchronously in-memory using Node's `setImmediate` loop.

---

## ⚡ Setup & Quick Start

### 1. Clone & Install Dependencies

From the project root directory, install dependencies in both packages:
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 2. Configure Environments
Copy the environment files and customize as needed:
```bash
# Server Configuration (.env)
cd ../server
cp .env.example .env
```

### 3. Run Development Servers
Ensure MongoDB is running locally on port `27017` and launch both components:
```bash
# Start backend API (runs on http://localhost:5000)
cd server
npm run dev

# Start frontend application (runs on http://localhost:5173)
cd ../client
npm run dev
```

---

## 🧪 Running Integration Tests

Four distinct backend test suites check the business logic, security middlewares, Clerk Auth, and Salesforce modules:

```bash
cd server

# 1. Run General Backend logic (Auth rotations, attendance timers)
node test_backend.js

# 2. Run Security Gating Suite (Helmet, NoSQL injection, XSS, CSRF, RBAC)
node test_qa_scientist.js

# 3. Run Clerk Authentication Flow (Account lockouts, 2FA MFA, session revocation)
node test_clerk_auth.js

# 4. Run Salesforce CRM Modules (Lead convert, contact merge, Kanban stage probabilities, pixel track)
node test_salesforce.js
```

---

## 🌐 API Reference Version 1

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Email + password credentials registration |
| `POST` | `/api/v1/auth/login` | Credentials login; returns `accessToken` & `sessionId` |
| `POST` | `/api/v1/auth/logout` | Revokes active session cookie and refresh tokens |
| `POST` | `/api/v1/auth/refresh-token` | Rotates authentication tokens |
| `GET` | `/api/v1/auth/oauth/:provider` | Initiates simulated OAuth flow |
| `GET` | `/api/v1/auth/oauth/:provider/callback` | OAuth success redirection callback |
| `POST` | `/api/v1/auth/2fa/setup` | Generates new TOTP secret & setup QR code |
| `POST` | `/api/v1/auth/2fa/verify` | Enables 2FA and returns 10 backup codes |
| `POST` | `/api/v1/auth/2fa/validate` | Validates MFA challenge using TOTP code |
| `GET` | `/api/v1/auth/sessions` | Lists active sessions logged into the profile |
| `DELETE` | `/api/v1/auth/sessions/:id` | Revokes and logs out a specific session |
| `POST` | `/api/v1/sales/contacts/merge` | Merges secondary contact details into primary contact |
| `GET` | `/api/v1/sales/emails/track/:pixelId` | Public external pixel route tracking email open events |

---

## 📜 License

Distributed under the ISC License. Copyright © 2026.
