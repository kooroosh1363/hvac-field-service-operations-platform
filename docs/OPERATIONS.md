# Operator, demo, and customization guide

## Demo path

Record 60–90 seconds: create intake → inspect deterministic dispatch evidence → check parts → approve/reject → show grounded assistant → enter “gas smell” to trigger safety boundary → analytics → audit. State clearly that all data is synthetic and this is a reusable reference implementation.

## Operator path

1. Review emergency/urgent queue state.
2. Check technician skills/capacity and parts readiness.
3. Inspect every score factor in Approvals; never treat the score as authority.
4. Ask the assistant operational questions only; hazards should stop troubleshooting.
5. Use analytics for trends and audit for accountability.

## Customize

- Version changes to zones, skills, score weights, and policy.
- Replace dashboard arrays with authenticated API queries.
- Implement PostgreSQL repositories while keeping pure policy functions.
- Import n8n JSON as inactive, add credentials in n8n, then test approval/error branches before activation.
- Replace branding and synthetic data. Retain disclosure unless a real case study can be substantiated.
