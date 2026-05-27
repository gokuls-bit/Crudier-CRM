# Crudier CRM — Backend API

Production-ready Node.js / Express backend for **Crudier CRM**.

---

## 📁 Project Structure

```
crudier/
├── src/
│   ├── config/
│   │   ├── index.js          # Centralized env config
│   │   └── db.js             # MongoDB Atlas connection utility
│   ├── controllers/
│   │   └── health.controller.js
│   ├── middlewares/
│   │   ├── errorHandler.js   # Centralized JSON error handler
│   │   └── notFound.js       # 404 catch-all
│   ├── models/               # MongoDB collection models
│   ├── routes/
│   │   ├── index.js          # Route index (/api/v1)
│   │   └── health.routes.js
│   ├── services/             # Business logic layer
│   ├── utils/
│   │   ├── AppError.js       # Custom operational error class
│   │   └── asyncWrapper.js   # Async try/catch eliminator
│   ├── app.js                # Express app + middleware stack
│   └── server.js             # Entry point (connect DB → listen)
├── uploads/                  # Multer upload destination
├── .env.example              # Documented env template
├── .gitignore
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd crudier
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable                | Description                                          |
|-------------------------|------------------------------------------------------|
| `PORT`                  | Server port (default `5000`)                         |
| `NODE_ENV`              | `development` / `production` / `test`                |
| `MONGO_URI`             | MongoDB Atlas connection string                      |
| `MONGO_DB_NAME`         | Database name (default `crudier`)                    |
| `JWT_SECRET`            | Secret for signing access tokens                     |
| `JWT_EXPIRES_IN`        | Access token lifetime (e.g. `1h`)                    |
| `JWT_REFRESH_SECRET`    | Secret for signing refresh tokens                    |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token lifetime (e.g. `7d`)                   |
| `CORS_ORIGIN`           | Comma-separated allowed origins                      |
| `RATE_LIMIT_MAX`        | Max requests per window (default `100`)              |
| `RATE_LIMIT_WINDOW_MIN` | Window size in minutes (default `15`)                |

### 3. Run

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

### 4. Verify

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "status": "ok",
  "data": {
    "service": "crudier-crm-api",
    "version": "1.0.0",
    "environment": "development",
    "uptime": "12s",
    "timestamp": "2026-05-28T00:00:00.000Z",
    "database": {
      "connected": true,
      "status": "healthy"
    },
    "memory": {
      "rss": "45MB",
      "heapUsed": "12MB"
    }
  }
}
```

---

## 🛡️ Middleware Stack

Applied globally in this exact order:

| #  | Middleware            | Purpose                                 |
|----|----------------------|-----------------------------------------|
| 1  | `morgan`             | HTTP request logging                    |
| 2  | `helmet`             | Security headers                        |
| 3  | `cors`               | Cross-origin resource sharing           |
| 4  | `express.json`       | Parse JSON bodies (10 MB limit)          |
| 5  | `express.urlencoded` | Parse URL-encoded bodies                |
| 6  | `cookie-parser`      | Parse cookies                           |
| 7  | `express-rate-limit` | Global throttle (100 req / 15 min)      |

---

## 🧰 Utilities

### `asyncWrapper(fn)`

Wraps async route handlers so rejected promises are automatically forwarded to the centralized error handler — eliminates repetitive try/catch blocks.

```js
const { asyncWrapper } = require('../utils/asyncWrapper');

router.get('/items', asyncWrapper(async (req, res) => {
  const items = await itemService.findAll();
  res.json({ success: true, data: items });
}));
```

### `AppError(message, statusCode)`

Custom error class. Throw anywhere — the centralized handler serializes it into structured JSON.

```js
const { AppError } = require('../utils/AppError');

if (!user) throw new AppError('User not found', 404);
```

---

## 📦 Approved Dependencies

| Package               | Purpose                     |
|-----------------------|-----------------------------|
| `express`             | Web framework               |
| `mongodb`             | MongoDB driver              |
| `dotenv`              | Environment variables       |
| `cors`                | CORS middleware              |
| `bcryptjs`            | Password hashing            |
| `jsonwebtoken`        | JWT auth tokens             |
| `cookie-parser`       | Cookie parsing              |
| `multer`              | File upload handling        |
| `morgan`              | HTTP request logger         |
| `helmet`              | Security headers            |
| `express-rate-limit`  | Rate limiting               |

> ⚠️ **No additional dependencies without team-lead approval.**

---

## 📜 NPM Scripts

| Script       | Command                         | Description                        |
|--------------|----------------------------------|------------------------------------|
| `npm run dev`| `node --watch src/server.js`     | Dev server with auto-restart       |
| `npm start`  | `node src/server.js`             | Production server                  |
| `npm run lint`| `npx eslint src/ --ext .js`     | Lint source files                  |

---

## 🔗 API Routes

All routes are versioned under `/api/v1`.

| Method | Endpoint            | Description                            |
|--------|---------------------|----------------------------------------|
| GET    | `/api/v1/health`    | Server status, uptime, DB connectivity |

---

## 📝 Error Response Format

All errors return a consistent JSON envelope:

```json
{
  "success": false,
  "status": "fail",
  "message": "Human-readable error description",
  "stack": "... (development only)"
}
```

---

## License

ISC
