# Jaira engineering guide

This directory is the code-derived onboarding, audit, and delivery plan for the Task Management System. It was written from the repository snapshot reviewed on 2026-07-21. Application code was not changed.

## Start here

1. Read [00-project-overview.md](00-project-overview.md), [01-architecture.md](01-architecture.md), and [02-folder-structure.md](02-folder-structure.md).
2. Use [06-api.md](06-api.md) as the implemented-route contract and [10-features.md](10-features.md) for feature status.
3. Address critical items in [21-priority-tasks.md](21-priority-tasks.md), in its stated order. [20-roadmap.md](20-roadmap.md) groups the same work into delivery phases.

## Evidence convention

Every conclusion names the repository paths that support it. “Missing” means no implementing route/module was found in the reviewed source tree; it is not a product assumption. Existing `ROADMAP.md` and the two application READMEs are historical context only: several statements conflict with current source (notably task/team implementation).

## Index

- System: [overview](00-project-overview.md), [architecture](01-architecture.md), [structure](02-folder-structure.md)
- Implementation: [backend](03-backend.md), [frontend](04-frontend.md), [database](05-database.md), [API](06-api.md)
- Access: [authentication](07-authentication.md), [permissions](08-permissions.md)
- Product: [workflows](09-business-workflows.md), [features](10-features.md), [realtime](11-realtime-websockets.md), [integrations](12-integrations.md)
- Audit: [security](13-security-audit.md), [performance](14-performance-audit.md), [technical debt](15-technical-debt.md), [testing](16-testing.md), [bugs](17-bugs.md), [missing features](18-missing-features.md), [refactoring](19-refactoring-plan.md)
- Delivery: [roadmap](20-roadmap.md), [priority tasks](21-priority-tasks.md)
