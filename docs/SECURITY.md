# Security model

## Implemented

- Signed short-lived JWT, bcrypt password verification, RBAC, deny-by-default admin audit.
- Helmet, configurable allow-list CORS, body limit, global/intake rate limits.
- Zod contracts and PostgreSQL constraints.
- Safety stops, approved-knowledge filtering, citations, evidence refusal.
- Human approval for consequential dispatch state.
- Idempotent automation events and auditable decisions.
- Environment-only secrets; `.env` is excluded.

## Production gates

Use SSO/MFA and managed secrets; add tenant scope to every repository query; encrypt storage/backups; redact logs; define retention/deletion; add WAF, SBOM, vulnerability/container/secret scans; isolate networks; test restore and incident response; complete worker-monitoring, privacy, safety, and legal review.

Prompt injection cannot reach dispatch authority or tools. Unapproved knowledge is filtered before retrieval. Duplicate webhooks cannot duplicate actions. Exact technician GPS is not displayed in the preview.
