# Performance audit

## Observed risks

- Task listing loads all matching tasks, populates three relations, and has no pagination or indexes for its filters. `Task/task.service.js`, `models/task.model.js`.
- Team task detail populates full `tasksId`; user/team lists similarly have no pagination. `team.service.js`.
- `canAccessTask` can issue an extra team query per task access, and comments are embedded unboundedly in task documents. `task.service.js`, `task.model.js`.
- Cloudinary uploads are sequential for attachments; large/unbounded array upload handling exacerbates latency. `task.service.js`, `multer.js`.

## Measured state

No benchmarks, query profiling, metrics, cache, load tests, or production SLOs exist in the repository. Therefore no throughput/latency numbers are asserted.

## Plan

First add pagination/limits/indexes and response projections. Then introduce structured metrics, Mongo slow-query monitoring, and a load-test baseline. Use cursor pagination for activity/comments/messages when their volumes grow.
