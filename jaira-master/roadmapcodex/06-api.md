# API

Base URL is `http://localhost:<port>`; development browser calls use `/api` and Vite rewrites it. Auth is `Authorization: bearer <JWT>` or `admin <JWT>`. Evidence: `frontend/vite.config.ts`, `middleware/authentaction.js`.

## Mounted routes

| Area | Paths (all are implemented) | Evidence |
|---|---|---|
| Health | `GET /` | `app.controller.js` |
| Auth | `POST /users/auth/{signup,login,verify-email,forget-password,reset-password,resend-otp}`; protected `{logout,refresh-token}` | `user.controller.js` |
| Self | `GET/PATCH/DELETE /users/me`; `PATCH /users/me/{email,password}`; image `POST/PUT/DELETE/GET /users/me/image` | `user.controller.js` |
| Admin users | `GET /users`, `GET/DELETE /users/:id` | `user.controller.js` |
| Teams | CRUD `/teams`; members, leave, transfer, image under `/:id` | `team.controller.js` |
| Tasks | CRUD `/tasks`; status, embedded comments, attachments under `/:id` | `Task/task.controller.js` |

## Contract gaps to resolve before public API documentation

There is no OpenAPI specification, API versioning, pagination envelope, consistent resource naming, or common error format beyond ad hoc `{message}`. Task list accepts unvalidated arbitrary query values. `GET /tasks/:id/attachments` does not validate its `id`; attachment deletion validates a Cloudinary public ID as a 24-character Mongo ObjectId, so many valid public IDs cannot be deleted. Evidence: `app.controller.js`, `task.controller.js`, `task.vaildation.js`.

Chat and notification frontend clients target routes that are not mounted; do not publish those as available API. Evidence: `frontend/src/features/{chats,notifications}/api/*.ts`, `backend/src/app.controller.js`.
