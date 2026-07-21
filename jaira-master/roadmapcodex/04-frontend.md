# Frontend

## Implemented experience

Login and signup forms submit real API calls. The app stores tokens and a user record in `localStorage`, protects routes, and lists users for an admin-role session. All other major screens state TODO/roadmap copy rather than rendering data. Evidence: `features/auth/pages/*.tsx`, `routes/router.tsx`, `features/users/pages/UsersListPage.tsx`, `features/{tasks,teams,chats,notifications}/pages/*.tsx`.

## API-contract drift

- Login actually returns `user`, but `LoginResponse` omits it and LoginPage saves a fabricated user/always `user` role. This makes real admin users lose admin access after login. Evidence: `backend/src/modules/user.service.js`, `frontend/src/features/auth/types.ts`, `frontend/src/features/auth/pages/LoginPage.tsx`.
- Team and task API wrappers generally target current paths, but their comments claim routes are planned. Comments API expects standalone comment objects while the backend embeds comments in Task and returns subdocuments. Evidence: `frontend/src/features/*/api/*.ts`, `backend/src/modules/Task/task.service.js`.
- API 401/403 clears the session instead of attempting the available refresh endpoint. Evidence: `frontend/src/lib/apiClient.ts`, `features/auth/api/authApi.ts`.

## UX implementation order

Fix login/session state first, then build task list/detail, then teams, profile editing, attachments/comments, notifications, and chats. This aligns UI work with usable backend capabilities and avoids building against non-existent notification/chat endpoints.
