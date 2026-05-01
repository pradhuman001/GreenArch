# GreenArch — Local Development

This workspace contains a static frontend and an Express backend. The React SPA is present under `Project/react-app` but is archived and not served; the project will focus on the main static site.

Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

Backend (API)
- Directory: `backend`
- Install and run:

```bash
cd backend
npm install
npm start
```

- The server listens on `PORT` environment variable or defaults to `3000`.
- Data is persisted to `backend/data/db.json` and the server seeds demo users, nursery, and products on first run.

React app (archived)
- Directory: `Project/react-app` (archived)
- The React SPA is not used by the main site. If you need it later, the source and build remain in this folder.

Static site (primary)
- The static public site pages are under `Project/` (e.g. `Project/index.html`, `Project/styles.css`). This is the active site. To run the backend and serve these pages:

```bash
cd backend
npm install
npm start
# then open http://localhost:3000/
```

You can also open `Project/index.html` directly in the browser for a quick preview.

Next steps
- I can start the backend locally, start the React dev server, or wire the React app to call the backend APIs — which would you like me to do?