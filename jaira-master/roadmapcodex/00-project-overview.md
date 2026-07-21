# Project overview

## What exists

Jaira is a task-management system with an Express/Mongoose API and a React/Vite client. The backend provides account lifecycle, team, task, embedded task-comment, attachment, and activity-log capabilities. The client supplies authentication screens, a protected layout, and mostly placeholder feature screens. Evidence: `backend/src/app.controller.js`, `backend/src/modules/**`, `frontend/src/routes/router.tsx`, and `frontend/src/features/**`.

## Runtime and scope

| Area | Implemented technology | Evidence |
|---|---|---|
| API | Node ESM, Express 5, Mongoose | `backend/package.json`, `backend/index.js` |
| Data | MongoDB collections via Mongoose | `backend/src/models/*.js` |
| Web client | React 19, TypeScript, Vite, React Query, Tailwind | `frontend/package.json`, `frontend/src/App.tsx` |
| Upload/email | Multer disk staging, Cloudinary, Nodemailer/Gmail | `backend/src/middleware/multer.js`, `backend/src/service/*.js` |
| Realtime | Socket.IO server connection logging only | `backend/src/sockets/socket.js` |

## Current maturity

The backend is a partially implemented API, not yet production-ready: it has no test suite, pagination, rate limits, security headers, database transaction boundaries, or deployment automation. The frontend has routes and API wrappers but only the admin user list performs a React Query request; task/team/detail/chat/notification screens are placeholders. Evidence: `backend/package.json`, `frontend/src/features/**/pages/*.tsx`.

## Immediate onboarding warnings

- The project root is this nested repository directory; the workspace parent contains `.git`.
- API paths are mounted without `/api`; Vite removes `/api` before proxying. Evidence: `backend/src/app.controller.js`, `frontend/vite.config.ts`.
- Source and historical docs disagree. Trust route/controller source over `ROADMAP.md`, `backend/README.md`, and `frontend/README.md`.
- Never commit `backend/src/config/.env`; it is explicitly ignored. Evidence: `.gitignore`.
