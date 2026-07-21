# Permissions

## Current rules

| Resource | Enforced policy | Evidence |
|---|---|---|
| Admin users | global `admin` role required | `user.controller.js`, `authoritation.js` |
| Team read | team member only | `team.service.js#getTeamById` |
| Team update/add/remove | owner or team member with `admin` role; role/ownership change is owner-only | `team.service.js` |
| Task create in team | team owner/admin; personal task allowed | `task.service.js#Create_Task` |
| Task read | creator, assignee, or team member | `canAccessTask` |
| Task edit | creator only | `update_Task` |
| Status | assignee, creator, or team admin | `update_TaskStatus` |
| Task delete | creator or team admin | `delete_Task` |
| Comments | access to read/add; author edit; author/team admin delete | comment functions |
| Attachments | creator upload/delete; task access view | attachment functions |

## Gaps

The unused `is_TeamMember.js` is broken: it lacks `TeamModel` import, does not await `findById`, writes misspelled fields, and is not mounted. Keep all authorization in a tested policy module rather than adding more inline variants. Evidence: `backend/src/middleware/is_TeamMember.js`, controllers.

Team owner is represented separately from `members`; creation conditionally inserts owner, but client-provided initial members are not validated as existing/active users. Evidence: `team.service.js#createTeam`.
