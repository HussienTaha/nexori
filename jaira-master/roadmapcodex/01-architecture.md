# Architecture

## Logical flow

```text
Browser -> Vite /api proxy (development) -> Express routes -> middleware -> services -> Mongoose/MongoDB
                                     |                         |-> Cloudinary
                                     |                         |-> EventEmitter -> Nodemailer/Gmail
                                     +-------------------------+-> Socket.IO server (currently no app events)
```

Evidence: `frontend/vite.config.ts`, `frontend/src/lib/apiClient.ts`, `backend/index.js`, `backend/src/app.controller.js`, `backend/src/service/cloudinary.js`, `backend/src/utlis/events/events.js`, `backend/src/sockets/socket.js`.

## Backend composition

`index.js` loads an env file, builds Express, calls `bootstrap`, then wraps that app in an HTTP server for Socket.IO. `bootstrap` connects MongoDB and mounts `/users`, `/teams`, and `/tasks`. Controllers are thin route registries; services contain both business policy and persistence. Models are directly queried from services. There is no repository layer, centralized domain error type, or API-version boundary. Evidence: `backend/index.js`, `backend/src/app.controller.js`, `backend/src/modules/*/*.service.js`.

## Frontend composition

`main.tsx` mounts `App`; `App` adds React Query and React Router. `router.tsx` gates authenticated routes using token/role values from `localStorage`. Feature API files call a shared Axios instance. There is no global client-state store, design system beyond three primitives, or Socket.IO client. Evidence: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/routes/*`, `frontend/src/lib/*`.

## Architectural decisions to preserve

- Feature-oriented frontend folders are a sound boundary.
- Zod schema middleware is a reusable API input boundary.
- Team membership is checked in task services, rather than trusting client claims.
- Activity records are separated from task documents.

## Architectural risks

- Authentication accepts a header-selected signing key without verifying that its prefix agrees with the JWT role (`backend/src/middleware/authentaction.js`).
- Data changes spanning collections lack transactions; partial updates are possible (`team.service.js`, `task.service.js`).
- Background email uses an in-process EventEmitter with no retry/queue (`utlis/events/events.js`).
