# Folder structure

```text
./
├── backend/                 Express API
│   ├── index.js             process entry + HTTP/Socket.IO server
│   └── src/
│       ├── DB/              Mongo connection
│       ├── middleware/      auth, RBAC, validation, upload helpers
│       ├── models/          Mongoose schemas
│       ├── modules/         user, team, Task controllers/services/schemas
│       ├── service/         Cloudinary, mail, activity helpers
│       ├── sockets/         Socket.IO initialization
│       └── utlis/           token, crypto, event, enum helpers (misspelled)
├── frontend/                React SPA
│   └── src/
│       ├── components/      shared layout and UI primitives
│       ├── features/        auth, users, teams, tasks, comments, chats, notifications
│       ├── lib/             Axios/auth/query helpers
│       └── routes/          router and route guard
├── ROADMAP.md               stale historical plan
└── roadmapcodex/            this code-derived guide
```

The casing of `modules/Task` and misspellings such as `utlis`, `vaildation`, `authentaction`, and `authoritation` are live import paths. Do not rename ad hoc; use the migration in [19-refactoring-plan.md](19-refactoring-plan.md). Evidence: all imports in `backend/src/modules/**/*.js`.
