# Feature inventory

| Feature | Backend | Frontend | Status/evidence |
|---|---|---|---|
| Registration/login/OTP reset | Implemented | Login/signup only | API is usable; verification/reset UI missing. `user.*`, `features/auth/*` |
| User profiles/images | Implemented | Display placeholder | API usable; edit/image UI missing. `user.*`, `ProfilePage.tsx` |
| Admin users | Implemented | List implemented | Role is incorrectly fabricated after login. `UsersListPage.tsx`, `LoginPage.tsx` |
| Teams/membership/images | Implemented | Placeholder | Pages do not fetch/render. `team/*`, `TeamsListPage.tsx` |
| Tasks/status/comments/attachments | Implemented | Placeholder | Client wrappers are stale/incomplete. `Task/*`, task pages |
| Activity log | Written internally | None | No route/UI exposes it. `activity.model.js`, `service/activity.js` |
| Chats/messages | Models only | Placeholder/API assumptions | No backend routes. `models/chat.model.js`, `ChatsListPage.tsx` |
| Notifications | Model only | Placeholder/API assumptions | No backend routes. `notification.model.js` |
| Realtime | Connection server only | None | No auth, rooms, or events. `sockets/socket.js` |

The source confirms no implementation of direct chat, team/task chat creation, notification delivery, activity feed endpoint, user verification UI, or automated tests.
