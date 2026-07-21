# Security audit

## Critical

- **OTP secrets are stored and compared in plaintext.** Database compromise exposes active verification/reset codes. Hash OTPs, use timing-safe comparison, invalidate prior OTPs per purpose, and rate-limit by IP/email. Evidence: `models/otp.js`, `user.service.js`.
- **Token design permits long-lived refresh and does not distinguish token type.** A valid access token can call refresh, yielding a seven-year refresh token. Add `typ`, short expirations, hashed refresh-session rotation, and reuse detection. Evidence: `user.service.js`, `authentaction.js`.

## High

- **CORS is permissive and Socket.IO uses all origins.** Configure explicit environment-driven origins. `app.controller.js`, `sockets/socket.js`.
- **No rate limiting, Helmet/security headers, payload limits, or sanitization.** Dependencies include `express-rate-limit` but it is not applied. `backend/package.json`, `app.controller.js`.
- **Multer relies on client MIME type, has unlimited count for task arrays, and writes to local disk.** Add magic-byte validation, count/size limits, cleanup, and safe filenames. `middleware/multer.js`, `task.controller.js`.

## Medium

- AES phone encryption key comes from env but there is no key rotation, authenticated encryption strategy, or decryption access policy. `utlis/encrypt/encrypt.js`.
- Production error messages may expose implementation errors; logging prints DB URL. `app.controller.js`, `DB/connection.js`.
- Password/reset actions do not revoke other active sessions. `user.service.js`.

Remediation order is S1, S2, S3 in [21-priority-tasks.md](21-priority-tasks.md).
