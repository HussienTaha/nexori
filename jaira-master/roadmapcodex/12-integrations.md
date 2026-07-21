# Integrations

| Integration | Current use | Configuration/evidence | Readiness |
|---|---|---|---|
| MongoDB | primary persistence | `DB_URL`; `DB/connection.js` | missing readiness/retry/shutdown |
| Cloudinary | user/team images; task attachments | `service/cloudinary.js`, task/team/user services | env sample incomplete; deletion/cascade gaps |
| Gmail/Nodemailer | verification/reset mail | `service/modemailer.js`, `utlis/events/events.js` | in-process, no queue/retry/observability |
| Socket.IO | connection server | `sockets/socket.js` | scaffold only |

No external integration has a health check, mock, integration test, credential rotation instructions, or production observability. The application uses Gmail transport directly; production delivery should use a transactional email provider and a queued worker before relying on it for account access.
