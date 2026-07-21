# Priority tasks

Complexity is relative engineering effort: S (≤1 day), M (2–4 days), L (≥1 week). Execute in numeric order within and across priority groups unless a dependency says otherwise.

## Critical

### S1 — Harden token and OTP lifecycle

- Description: add access/refresh token type claims, short access expiry, rotating hashed refresh sessions/reuse detection; hash OTPs and invalidate prior active OTPs.
- Reason: current access tokens can refresh and refresh tokens last seven years; OTPs are plaintext.
- Priority: Critical. Complexity: L. Files/modules: `user.service.js`, `authentaction.js`, `models/otp.js`, new session model/migration, frontend auth client.
- Dependencies: none; coordinate data migration/forced logout. Recommended implementation order: token claims/session design, server validation/rotation, OTP hashing, UI refresh handling, integration tests. Expected impact: blocks account/session compromise paths.

### S2 — Apply production security controls

- Description: configured CORS, Helmet, rate limits, request limits/sanitization, upload limits/content validation, safe structured logging.
- Reason: API/Socket.IO currently allow any origin and have no defenses against common abuse.
- Priority: Critical. Complexity: M. Files/modules: `app.controller.js`, `sockets/socket.js`, `multer.js`, `DB/connection.js`, env examples.
- Dependencies: S1 for auth-specific rate-limit rules. Recommended implementation order: config schema, HTTP middleware, upload policy, socket CORS, tests. Expected impact: reduces browser abuse, denial-of-service, and information leakage.

### S3 — Fix confirmed application bugs

- Description: correct B1–B4 (login user state, OTP resend payload, leave-team sync, attachment ID validation).
- Reason: core flows are currently broken/inconsistent.
- Priority: Critical. Complexity: S. Files/modules: `LoginPage.tsx`, auth types, `user.service.js`, `team.service.js`, `Task/task.controller.js`, validation.
- Dependencies: none. Recommended implementation order: B1, B2, B4, B3; add regression tests with each fix. Expected impact: restores admin, reset, data-integrity, and attachment flows.

### S4 — Establish automated test baseline

- Description: add backend unit/integration and frontend component test tooling; test auth, authorization, task transitions, and B1–B4.
- Reason: no existing automated coverage makes security/refactoring unsafe.
- Priority: Critical. Complexity: M. Files/modules: both `package.json` files, new test directories, controllers/services/lib.
- Dependencies: none; run alongside S1–S3. Recommended implementation order: harness/CI script, auth tests, policy tests, API/client regression tests. Expected impact: enables safe delivery gates.

## High

### H1 — Align API contracts and session refresh

- Description: define typed response/error/pagination contracts; consume returned login user; implement single-flight refresh/retry or redesign cookie auth.
- Reason: client/server types and behavior drift, and 401 immediately logs out users.
- Priority: High. Complexity: M. Files/modules: `frontend/src/lib/*`, `features/**/types.ts`, API services, backend controllers.
- Dependencies: S1, S4. Recommended implementation order: contract spec, login/refresh, generated/shared types or tests, remaining feature wrappers. Expected impact: predictable client integration and fewer false logouts.

### H2 — Deliver core task UI

- Description: build query/mutation-backed task list/detail/create/edit/status/assignee/comments/attachments screens.
- Reason: backend core functionality is inaccessible from normal UI.
- Priority: High. Complexity: L. Files/modules: `frontend/src/features/tasks`, `comments`, shared UI; `Task/*` for contract gaps.
- Dependencies: H1, S4. Recommended implementation order: list/detail, create/edit, status/assignees, comments, attachments. Expected impact: turns API into a usable task manager.

### H3 — Deliver team and profile UX

- Description: build team list/detail/create/member/role/image flows and verified account/profile/password/email flows.
- Reason: these APIs exist but the client is placeholder-only; signup has no verification journey.
- Priority: High. Complexity: L. Files/modules: frontend `teams`, `users`, `auth`; user/team controllers as needed.
- Dependencies: H1, S3, S4. Recommended implementation order: verification/reset screens, team list/detail, member management, profile/images. Expected impact: completes onboarding and collaboration setup.

### H4 — Add data integrity, pagination, and indexes

- Description: validate task query params; paginate list endpoints; add indexes; define transactional/cascade behavior for team/task/user deletion and membership changes.
- Reason: unbounded expensive reads and cross-collection partial state exist.
- Priority: High. Complexity: L. Files/modules: models, team/task/user services, new migration/maintenance scripts.
- Dependencies: S4. Recommended implementation order: data policy, indexes, pagination contract, transactions/cascades, load tests. Expected impact: scalable reads and consistent relationships.

## Medium

### M1 — Expose activity and notifications

- Description: add authorized activity-feed and notification routes, service/event handling, and client screens.
- Reason: activities are written but invisible; notification model is unused.
- Priority: Medium. Complexity: M. Files/modules: activity/notification models, new modules, task/team services, frontend features.
- Dependencies: H1, H4. Recommended implementation order: activity API, notification persistence, UI, tests. Expected impact: traceability and collaboration awareness.

### M2 — Build authenticated realtime delivery

- Description: add socket handshake auth, authorization-backed rooms, task/notification events, client cache updates, reconnect handling.
- Reason: Socket.IO currently only logs connections.
- Priority: Medium. Complexity: L. Files/modules: `sockets/socket.js`, backend services, frontend new socket lib/hooks.
- Dependencies: S1, S2, M1. Recommended implementation order: server auth/rooms, emit post-commit events, client subscription, end-to-end tests. Expected impact: timely collaboration without polling.

### M3 — Implement chat/messages or remove the unused model promise

- Description: decide and implement direct/team/task chat with authorization, pagination, messages, read receipts, UI; otherwise remove stale frontend/model placeholders.
- Reason: model and UI expectations exist, but no feature is delivered.
- Priority: Medium. Complexity: L. Files/modules: chat/message models, new modules, frontend chats, realtime.
- Dependencies: H4, M2. Recommended implementation order: decision/spec, REST/cursor pagination, UI, realtime enhancements. Expected impact: coherent collaboration scope.

### M4 — Production docs and operations

- Description: OpenAPI, health/readiness, graceful shutdown, Docker/compose, CI, logging/metrics, backup/runbook.
- Reason: no reproducible deployment or operational visibility exists.
- Priority: Medium. Complexity: L. Files/modules: backend boot/app, package scripts, new CI/container/docs files.
- Dependencies: S2, S4, H1. Recommended implementation order: health/config, OpenAPI, CI, container, metrics/runbook. Expected impact: deployable/supportable service.

## Low

### L1 — Controlled naming and module cleanup

- Description: perform the staged rename/dead-code cleanup in the refactoring plan.
- Reason: names reduce readability but direct renames risk imports.
- Priority: Low. Complexity: M. Files/modules: all backend imports, obsolete middleware/models/docs.
- Dependencies: S4, H1. Recommended implementation order: compatibility exports, rename one boundary, remove dead code after coverage. Expected impact: maintainability.

### L2 — Product enhancements

- Description: evaluate subtasks, recurring tasks, board/calendar views, search, user preferences, and audit admin UI with product input.
- Reason: useful but not evidenced as required for the current core workflow.
- Priority: Low. Complexity: L. Files/modules: new product modules/UI/models.
- Dependencies: H2, H3, H4. Recommended implementation order: product discovery, schema/API, UI, metrics. Expected impact: increased product depth.

### L3 — Replace direct Gmail/EventEmitter delivery

- Description: introduce transactional email provider and durable job queue with retries/idempotency.
- Reason: in-process email is lost on failure/restart and Gmail is fragile at scale.
- Priority: Low. Complexity: L. Files/modules: `modemailer.js`, `events.js`, new worker/queue/config.
- Dependencies: M4. Recommended implementation order: provider selection, queue abstraction, migration, monitoring. Expected impact: reliable account communication.
