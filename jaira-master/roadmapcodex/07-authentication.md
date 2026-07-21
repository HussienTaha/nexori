# Authentication

## Current flow

Signup hashes password and AES-encrypts phone, creates a six-digit verification OTP, and emits an email event. Verification marks the account confirmed/active. Login rejects unconfirmed/deleted users and issues access tokens for one year and refresh tokens for seven years. Refresh requires the same authentication middleware and revokes the token it was sent with. Evidence: `backend/src/modules/user.service.js`, `middleware/authentaction.js`.

## Findings

- Refresh lifetime is exceptionally long (seven years) and token rotation has no token family/device/session model.
- Tokens are saved in `localStorage`, exposing them to XSS; the backend does not set secure cookies. `frontend/src/lib/authStorage.ts`.
- Authentication selects signature solely from header prefix, but does not validate `decoded.userrole` against the prefix or loaded user. `backend/src/middleware/authentaction.js`.
- Any authenticated token can call refresh; distinguish access and refresh token purpose/type to prevent an access token being refreshed. `user.service.js`.
- OTP values are plaintext and email resend has no global/IP rate limit. `models/otp.js`, `user.service.js`.

Recommended target: short-lived access tokens, rotating refresh sessions (hashed server-side), token `typ` claim, prefix/role consistency validation, rate limits, and either HttpOnly cookie delivery or a documented XSS-threat mitigation strategy.
