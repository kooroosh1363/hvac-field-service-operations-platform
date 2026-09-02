# Production readiness

This is a reference product, not a live customer deployment.

- Replace memory storage with transactional PostgreSQL repositories and outbox workers.
- Add tenant isolation, authorization integration tests, SSO/MFA, access review, backups, restore drills, SLOs, alerts, and runbooks.
- Calibrate policy on representative history; measure outcomes across region, shift, job type, and technician groups.
- Obtain operations, safety, labor, privacy, security, and legal approval.
- Contract-test maps, inventory, CRM, communication, and on-call adapters.
- Define emergency scripts. The system never replaces emergency services or licensed technicians.
- Add consent, quiet hours, opt-out, retention, deletion, export, residency, vendor, and breach processes.

| Proposed SLI | Starting target (not a measured claim) |
|---|---|
| API availability | 99.9% monthly |
| Safety escalation creation | p95 under 5 seconds |
| Recommendation without maps | p95 under 1 second |
| Duplicate workflow effects | zero |
| Approval audit capture | 100% |
