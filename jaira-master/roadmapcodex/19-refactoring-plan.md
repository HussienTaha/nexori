# Refactoring plan

## Safe sequence

1. Add tests around existing routes and client auth before moving files.
2. Extract tested policy helpers for global role, team membership/admin, and task access from service-local logic.
3. Standardize errors, validation/query parsing, pagination responses, logging, and transaction boundaries.
4. Align frontend types/API responses with actual contracts and remove stale roadmap comments.
5. Rename paths with IDE-assisted import updates in one bounded change: `utlis -> utils`, `vaildation -> validation`, `authentaction -> authentication`, `authoritation -> authorization`, `Task -> task`; preserve compatibility re-exports temporarily if releases require it.
6. Decide whether comments remain embedded or become the standalone `Comment` collection; remove the unused alternative only after data migration.

## Non-goals

Do not rename files as part of security fixes, alter persistence models without migration/backup, or introduce a generic repository layer unless it removes a demonstrated duplication. Evidence for existing duplication and inconsistent naming: `backend/src/modules/**`, `backend/src/middleware/**`.
