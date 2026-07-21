# Technical debt

- Historical documentation is inaccurate about implemented team/task routes and fixes. `ROADMAP.md`, `backend/README.md`, `frontend/README.md`.
- Naming/casing typos are embedded in import paths: `utlis`, `vaildation`, `authentaction`, `authoritation`, `Task`, and service function names such as `Create_Task`. `backend/src/**`.
- Dead/incomplete code: `is_TeamMember.js`, `is_Admin.js` (unused); models for standalone Comment/Chat/Message/Notification are unused by mounted routes. `middleware/*`, `models/*`, `app.controller.js`.
- Client comments describe features as unimplemented although routes exist, and types do not match API data shapes. `frontend/src/features/**`.
- No CI, test scripts, formatter, Docker/deployment manifests, OpenAPI, or root workspace scripts. Root listing, `package.json` files.

Address behavior/security before cosmetic renames. The controlled rename sequence is in [19-refactoring-plan.md](19-refactoring-plan.md).
