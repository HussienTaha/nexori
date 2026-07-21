# Testing

## Current state

Neither package defines a test script or test framework. `backend/test-socket.js` is a manual client pointing at port 5000, while backend defaults to env `port` and the frontend proxy targets 3000. Evidence: `backend/package.json`, `frontend/package.json`, `backend/test-socket.js`, `frontend/vite.config.ts`.

## Minimum strategy

- Backend unit: crypto/token helpers, Zod schemas, transition policy, authorization predicates.
- Backend integration: ephemeral MongoDB plus Supertest for all auth/team/task routes, including cross-user authorization and cleanup failure cases.
- Frontend: Vitest + Testing Library for login role persistence, route guards, API error/refresh behavior, and task/team rendering.
- E2E: Playwright happy paths: signup/verify/login, team creation/member management, task lifecycle/comment/attachment.

Gate lint, typecheck, unit/integration tests, and build in CI. Seed no real credentials; mock Cloudinary/mail.
