# EstateHub — Real Estate & Property Management System

A full-stack web application for managing a property portfolio: properties,
tenants, leases and maintenance requests, with a dashboard that reports live
occupancy and revenue. Built as the Full Stack Development mini project and
designed to exercise the theory from **Units 1–5** of the course.

**Stack:** HTML5 · CSS3 · Vanilla JavaScript · Node.js · Express · MongoDB (Mongoose)

---

## How the project maps to the syllabus

| Unit | Topic | Where it lives in this project |
|------|-------|--------------------------------|
| **1** | HTML5 fundamentals, semantic elements, forms & validation | `public/*.html` — semantic `header` / `aside` / `main` / `nav`, and forms with native `required`, `minlength`, `type="email"` validation. |
| **2** | CSS basics, box model, Flexbox, Grid, responsive design | `public/css/styles.css` — a design system built on Flexbox and CSS Grid with mobile-first media queries. |
| **3** | Advanced JS, DOM, RegExp, secure validation/sanitization; Node.js core, HTTP, File System, Events, Email automation | Client: `public/js/*` (DOM, `fetch`, RegExp validation). Server: `server.js` (Express/HTTP), `utils/sanitize.js` (anti-injection), `utils/activityLog.js` (fs + EventEmitter), `utils/notifier.js` (email automation). |
| **4** | Databases, SQL vs NoSQL, MongoDB CRUD, data modeling, relationships, aggregation, Atlas | `models/*` (schemas, references), `routes/*` (CRUD), `routes/dashboard.js` (aggregation pipelines), Atlas-ready `config/db.js`. |
| **5** | DevOps: Git, Jenkins, Apache Tomcat | `.gitignore`, `Jenkinsfile` (CI pipeline), and the **Deployment** section below (Tomcat + Render). |

> Unit 6 topics (authentication, environment variables, Render deployment) are
> also included — login/registration with JWT, `.env` config, and deploy notes —
> because they tie the mini project together.

---

## Project structure

```
FCCproject/
├── server.js               # App entry — Express + HTTP, middleware, error handling (Unit 3)
├── config/db.js            # MongoDB / Atlas connection (Unit 4)
├── models/                 # Mongoose schemas & relationships (Unit 4)
│   ├── Property.js  Tenant.js  Lease.js  MaintenanceRequest.js  User.js
├── routes/                 # REST API (Unit 3 + Unit 4 CRUD)
│   ├── properties.js  tenants.js  leases.js  maintenance.js  dashboard.js  auth.js
├── middleware/             # auth (JWT), sanitize, async error wrapper
├── utils/                  # sanitize (anti-XSS), activity_log (fs+events), notifier (email)
├── scripts/seed.js         # Populate demo data (Unit 4)
├── public/                 # Frontend (Units 1 & 2)
│   ├── index.html (public website)  login.html  dashboard.html  properties.html  tenants.html  leases.html  maintenance.html
│   ├── css/styles.css
│   └── js/  api.js  ui.js  login.js  dashboard.js  properties.js  tenants.js  leases.js  maintenance.js
├── Jenkinsfile             # CI pipeline (Unit 5)
├── .env.example            # Environment template (Unit 6)
└── .gitignore
```

---

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** — either a local server *or* a free **MongoDB Atlas** cluster (recommended)

---

## Setup & run

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
#    (copy the template, then edit .env)
cp .env.example .env        # Windows: copy .env.example .env

# 3. Seed demo data (properties, tenants, leases, maintenance)
npm run seed

# 4. Start the server
npm start
```

Then open **http://localhost:4000** and sign in with the seeded account:

- **Email:** `manager@estatehub.local`
- **Password:** `password123`

For auto-reload during development: `npm run dev`.

### Using MongoDB Atlas (Unit 4)

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Add a database user and allow your IP under **Network Access**.
3. Copy the connection string into `.env` as `MONGO_URI`, e.g.
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/estatehub`.
4. Run `npm run seed` then `npm start` — no code changes needed.

---

## REST API reference

All `/api` routes except `/api/auth/*` require a `Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a manager account |
| POST | `/api/auth/login` | Get a JWT |
| GET | `/api/dashboard` | Aggregated portfolio stats |
| GET/POST | `/api/properties` | List (with `?q=&status=&type=`) / create |
| GET/PUT/DELETE | `/api/properties/:id` | Read (with leases + maintenance) / update / delete |
| GET/POST | `/api/tenants` | List / create |
| GET/PUT/DELETE | `/api/tenants/:id` | Read / update / delete |
| GET/POST | `/api/leases` | List / create |
| PUT/DELETE | `/api/leases/:id` | Update / delete |
| GET/POST | `/api/maintenance` | List / create |
| PUT/DELETE | `/api/maintenance/:id` | Update / delete |
| POST | `/api/maintenance/:id/notify` | Email automation — notify the tenant |

Test them with Postman or curl, e.g.:

```bash
# login, capture the token, then list properties
curl -s localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"manager@estatehub.local","password":"password123"}'
```

---

## Security notes (Unit 3)

- **Input sanitization** — every request body is stripped of HTML tags
  (`utils/sanitize.js`) so a value like `<script>…</script>` is stored as plain
  text, not executable markup.
- **Output escaping** — the client escapes all dynamic values before inserting
  them into the DOM (`UI.esc` in `public/js/ui.js`), a second layer against XSS.
- **Passwords** are hashed with bcrypt; the hash is never returned by the API.
- **Auth** uses short-lived JWTs; protected routes reject missing/expired tokens.

---

## DevOps (Unit 5)

### Git
```bash
git init
git add .
git commit -m "Initial commit: EstateHub property management system"
# add a remote and push to your master/main branch
git remote add origin <your-repo-url>
git push -u origin main
```
`.gitignore` keeps `node_modules/`, `.env` and `logs/` out of version control.

### Jenkins
`Jenkinsfile` defines a pipeline — **Checkout → Install → Verify → Build**.
Point a Jenkins "Pipeline from SCM" job at this repo; it runs on every push so
broken code is caught before deployment. Configure a NodeJS tool named
`node20` under *Manage Jenkins → Global Tool Configuration*.

### Apache Tomcat
The Node/Express API and the static frontend can be split for a Tomcat setup:

1. Run `npm start` to serve the API (port 4000).
2. Build the static bundle: the `Build frontend bundle` stage copies `public/`
   into `dist/`. Zip `dist/` as `estatehub.war` (or drop the folder into
   `CATALINA_HOME/webapps/estatehub`).
3. Start Tomcat (v8+) and browse `http://localhost:8080/estatehub/`.
4. If the frontend is served from Tomcat on a different origin, point the API
   base URL in `public/js/api.js` at `http://localhost:4000/api` — CORS is
   already enabled server-side.

---

## Deployment on Render (Unit 6)

1. Push the repo to GitHub.
2. On <https://render.com>, create a **Web Service** from the repo.
3. Build command `npm install`, start command `npm start`.
4. Add environment variables (`MONGO_URI`, `JWT_SECRET`) in the Render dashboard
   — use an Atlas connection string for the database.
5. Deploy; Render gives you a live URL.

---

## Author

Full Stack Development mini project — `atharvrevat1098@gmail.com`.
License: MIT.
