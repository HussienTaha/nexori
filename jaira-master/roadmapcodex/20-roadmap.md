# Delivery roadmap

## Phase 0 — stabilization and security (critical)

Complete S1–S4: token/OTP hardening, security middleware, confirmed bugs, and a baseline test harness. Exit when auth/team/task authorization has integration coverage and no critical audit finding remains.

## Phase 1 — contract and core UX (high)

Complete H1–H4: align frontend login/session/API contracts, task/team user interfaces, pagination/indexes, and activity endpoint/UI. Exit when a verified user can complete core work entirely through the UI.

## Phase 2 — collaboration (medium)

Complete M1–M3: notifications, authenticated Socket.IO, and chat/messages. Exit when task/team changes notify intended users and direct/team conversation is supported with authorization tests.

## Phase 3 — production engineering (medium/low)

Complete M4 and L1–L3: OpenAPI, CI/deployment/observability, controlled renames and optional product enhancements. Exit when the service is reproducibly deployed, monitored, and maintainable.

All task definitions, dependencies, order, complexity, and impact are in [21-priority-tasks.md](21-priority-tasks.md).
