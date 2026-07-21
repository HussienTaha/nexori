# Backend

## Boot and middleware

`backend/index.js` loads `src/config/.env`, creates the HTTP server, and initializes Socket.IO. `app.controller.js` applies permissive `cors()` and JSON parsing, starts the DB connection without awaiting readiness, mounts three routers, then uses a JSON 404 and error handler. The error handler exposes stacks outside production. Evidence: `backend/index.js`, `backend/src/app.controller.js`, `backend/src/DB/connection.js`.

## Implemented modules

- Users/auth: sign-up, email verification, login, logout, token refresh, reset flow, profile CRUD, profile image, admin user listing/deletion. `backend/src/modules/user.*`
- Teams: CRUD, members, member roles, leaving/ownership transfer, team image. `backend/src/modules/team/*`
- Tasks: CRUD, status transitions, embedded comments, Cloudinary attachments, activity entries. `backend/src/modules/Task/*`

## Service conventions and gaps

Services return HTTP responses directly and duplicate resource/role checks. Query strings for task filtering are not validated, and list endpoints do not paginate. Cloudinary operations are embedded in services and use disk-backed Multer staging. Evidence: `task.service.js`, `team.service.js`, `middleware/multer.js`.

## Operational requirements

Required documented env keys include DB URL, JWT keys/prefixes, crypto key, salt, Gmail credentials, and Cloudinary credentials. Cloudinary keys are read in `service/cloudinary.js` but absent from `backend/.env.example`; correct this before deployment. Evidence: `backend/.env.example`, `backend/src/service/cloudinary.js`.
