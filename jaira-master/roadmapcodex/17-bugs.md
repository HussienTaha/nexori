# Confirmed bugs

| ID | Defect | Evidence | Effect |
|---|---|---|---|
| B1 | Login UI discards returned user and saves role `user` | `user.service.js`, `LoginPage.tsx`, auth types | Admin cannot use admin route after normal login |
| B2 | Resend reset email passes `code` but listener destructures `otp` | `user.service.js#resendOtp`, `events.js` | Reset resend sends undefined code |
| B3 | Leave team does not update `User.teams` | `team.service.js#leaveTeam` | stale membership in profile/data |
| B4 | Attachment delete validates Cloudinary public ID as ObjectId | `task.controller.js`, `task.vaildation.js` | valid public IDs can be rejected |
| B5 | Task attachment error path only cleans already-recorded cloud assets; unstaged files after a failed upload may remain | `task.service.js#uploadTaskAttachments` | temp-file/cloud cleanup leak |
| B6 | Manual Socket.IO test targets 5000, not documented default 3000 | `test-socket.js`, `.env.example` | test fails against normal dev server |
| B7 | `is_TeamMember` is invalid if used | `middleware/is_TeamMember.js` | missing import/non-awaited query/incorrect assignments |

Fix B1–B4 before feature work; B5–B7 in stabilization/refactoring.
