# Realtime / WebSockets

Socket.IO is initialized on the HTTP server with `origin: "*"`; it logs connections/disconnections only. There is no handshake authentication, room membership, client socket setup, or domain event emission. Evidence: `backend/index.js`, `backend/src/sockets/socket.js`, `frontend/package.json` (no socket client dependency).

## Build after security/session work

1. Authenticate handshake with an access token and reject unverified/deleted users.
2. Join only server-authorized `user:<id>`, `team:<id>`, and `task:<id>` rooms.
3. Emit typed task/comment/notification events from services after successful commits.
4. Add `socket.io-client`, lifecycle hook, React Query cache updates, reconnection/error UI, and tests.

Do not use a client-provided room ID as authorization. CORS must use configured allowed origins, not `*`.
