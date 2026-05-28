# Crudier CRM — Frontend Client

This is the React + Vite + Tailwind CSS frontend application for **Crudier CRM**.

## Features
- **Aesthetic Glassmorphic UI** utilizing HSL tailored colors and smooth CSS micro-animations.
- **Zustand State Stores** for active user sessions, websocket streams, real-time notifications, workspace context, active task management, and UI state.
- **Dynamic Role-Based Dashboards & Routing** for CEO, Founder, Admin, CTO, Team Lead, Developer, Designer, Sales, and Intern roles.
- **API Services Layer** mapped directly to versioned backend endpoints.
- **Real-Time Integration** with Socket.IO.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and adjust client endpoints if necessary:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build Production Bundle
```bash
npm run build
```
