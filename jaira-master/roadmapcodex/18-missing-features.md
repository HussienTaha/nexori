# Missing features

These are absent from mounted backend routes and/or usable screens, based on `backend/src/app.controller.js` and `frontend/src/routes/router.tsx`.

- Verification, resend OTP, forgotten-password/reset, password/email change, and profile/image management UI.
- Working task/teams UI, filtering/pagination, task assignment controls, comments and attachments interface.
- Activity feed endpoint/UI despite activity writes.
- Notifications module and delivery.
- Chat/message module, direct-chat lifecycle, and chat UI.
- Authenticated real-time events/rooms/client.
- API documentation, observability/health/readiness, production configuration, CI/CD, backups/retention.
- Transactions/cascade policy and administrative recovery/audit views.

The priority order is intentionally not “implement all features”: stabilize access/security and client contract first, then complete core task/team UX, then build notifications/chat/realtime.
