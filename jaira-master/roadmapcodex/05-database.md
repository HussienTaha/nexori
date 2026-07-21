# Database

MongoDB is accessed through Mongoose. The schemas are in `backend/src/models/`.

| Collection | Key relationships / purpose | Evidence |
|---|---|---|
| User | owns `teams`; role, confirmation, soft-delete, encrypted phone | `user.model.js` |
| Team | owner, member role subdocuments, task IDs, optional chat/image | `team.model.js` |
| Task | creator, assignees, optional team/chat, embedded comments/attachments/tags | `task.model.js` |
| Activity | immutable-looking action records for task/team operations | `activity.model.js`, `service/activity.js` |
| Chat/Message/Comment/Notification | modeled but no mounted module uses them | respective model files, `app.controller.js` |
| Otp | email/purpose/code, expiry TTL, attempts | `otp.js` |
| RevokedToken | JWT identifier, expiry TTL | `revokedtoken.model.js` |

## Integrity findings

- Team create/add/remove synchronizes `User.teams`, but leave does not remove the team from the user; deleting a team does not remove tasks/activities or Cloudinary task attachments. Evidence: `team.service.js`.
- Task deletion removes the task ID from its team but not related cloud assets or activity records. Evidence: `task.service.js`.
- Only TTL indexes and User’s unique email are declared. List filters lack indexes for team/status/assignee/due date. Evidence: model files.
- OTPs are stored in plaintext. See [13-security-audit.md](13-security-audit.md).
