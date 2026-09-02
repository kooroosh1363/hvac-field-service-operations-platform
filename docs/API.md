# API guide

Base path: `/v1`; JSON only. Protected routes require `Authorization: Bearer <JWT>`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Liveness |
| POST | `/v1/auth/login` | Public | Short-lived token |
| POST | `/v1/public/service-requests` | Public/rate-limited | Intake and safety triage |
| GET | `/v1/work-orders` | Authenticated | Queue |
| GET | `/v1/dispatch/recommendations` | Authenticated | Explainable ranking, not assignment |
| GET | `/v1/approvals` | Authenticated | Pending decisions |
| POST | `/v1/approvals/:id/resolve` | Dispatcher/admin | Approve/reject and audit |
| POST | `/v1/assistant/ask` | Authenticated | Grounded answer or escalation |
| POST | `/v1/workflows/:event` | Authenticated | Idempotent workflow ingress |
| GET | `/v1/audit` | Admin | Audit events |

Example intake:

```json
{"customerName":"Example Market","phone":"6045550101","address":"101 Main Street","issue":"The freezer is above setpoint","priority":"urgent"}
```

Errors use a stable `error` key: validation 422, authentication 401, role 403, missing entity 404. Do not parse human text as a machine contract.
