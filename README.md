# GreenArch — Local Development and Vercel Deployment

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

Vercel deployment
- Vercel serves the app from the repository root.
- API routes should be implemented in the app or on a separate backend service.

Deploy steps
- Push the repo to GitHub.
- Import the repository into Vercel.
- Use the repository root as the project root.
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
- I can also help wire in a custom Vercel domain or split the backend onto a separate host if you want to keep the API outside Vercel.
