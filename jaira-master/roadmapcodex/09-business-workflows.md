# Business workflows

## Account lifecycle

Signup -> OTP email -> verify -> login -> token-authenticated profile. Password reset creates a reset OTP and replaces password after OTP validation. Email change resets confirmation and sends verification. Evidence: `user.controller.js`, `user.service.js`.

## Team lifecycle

Authenticated user creates team and becomes owner/admin; member IDs become member-role entries; all members’ User documents are updated. Owner/admin can manage membership; owner must transfer ownership before leaving; team image can be managed via Cloudinary. Evidence: `team.service.js`.

## Task lifecycle

Team admin/owner may create team task; any user may create a personal task. Team tasks require all assignees to be members. Status must transition `todo -> in_progress -> review -> done` (with backwards paths from in-progress/review). Activity is recorded for create/update/status/delete and comment/attachment creation/deletion. Evidence: `Task/task.service.js`, `activity.model.js`.

## Workflow failures to fix

- `leaveTeam` does not `$pull` the team from the departing user’s `teams` array.
- Team create accepts unknown/deleted `membersId` values, creating inconsistent membership.
- No notifications/realtime updates are triggered by activity events.
- Current UI redirects after signup to login although login is intentionally blocked until verification, and provides no verification screen. Evidence: `team.service.js`, `SignupPage.tsx`, `user.service.js`.
