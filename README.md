# GreenArch — Local Development and Netlify Deployment

This workspace contains a static frontend and an Express backend. The React SPA is present under `Project/react-app` but is archived and not served; the active site is the static frontend in `Project/`.

Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

Backend (API)
- Directory: `backend`
- Install and run locally:

```bash
cd backend
npm install
npm start
```

- The server listens on `PORT` or defaults to `3000`.
- Data is persisted to `backend/data/db.json` and the server seeds demo users, nursery, and products on first run.

Netlify deployment
- Netlify serves the static site from `Project/`.
- API requests are routed to a Netlify Function at `/api/*`, which wraps the same Express backend used locally.
- Netlify configuration lives in `netlify.toml`.
- The serverless adapter lives in `netlify/functions/api.js`.

Deploy steps
- Push the repo to GitHub.
- In Netlify, create a new site from Git.
- Use the repository root as the base directory.
- Netlify will read `netlify.toml` automatically and publish `Project/`.
- Deploy the site.

Local preview
- You can open `Project/index.html` directly in the browser for a quick preview.
- If you want the API-backed local experience, run the backend and open the site through it:

```bash
cd backend
npm install
npm start
# then open http://localhost:3000/
```

React app (archived)
- Directory: `Project/react-app` (archived)
- The React SPA is not used by the main site. If you need it later, the source and build remain in this folder.

Next steps
- I can also wire in a custom Netlify domain or split the backend onto a separate host if you want to keep the API outside Netlify.
