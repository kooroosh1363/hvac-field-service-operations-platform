# Architecture and decisions

Northstar separates probabilistic assistance from operational authority. AI may structure an intake or retrieve approved knowledge. Deterministic code validates data, applies dispatch policy, records approvals, emits idempotent events, and writes audit records.

## Components

- **Dashboard:** Vinext/React and Shadcn primitives; explicitly synthetic state for a self-contained product demo.
- **API:** Fastify, TypeScript, Zod, JWT, Helmet, CORS, rate limiting, role checks, and bounded bodies.
- **Database:** PostgreSQL customers, assets, work orders, technicians/skills, parts/inventory, approvals, knowledge, workflows, outbox, and audit.
- **Decision policy:** pure deterministic scoring, stable ordering, skill hard gate, factor-level explanations.
- **Assistant:** approved-source filtering, citation IDs, insufficient-evidence escalation, safety-first short circuit.
- **Workflow layer:** inactive n8n reference exports; every action calls an authenticated, idempotent API boundary.

## Trust boundaries

| Boundary | Untrusted input | Enforcement |
|---|---|---|
| Public intake → API | Free text, phone, address | Validation, rate limit, safety triage |
| User → protected API | Token and claimed role | Signature, expiry, RBAC |
| Assistant → operation | Retrieved/generated content | Schema and no direct write authority |
| Workflow → API | Event payload | Authentication, idempotency, audit |
| API → database | Query parameters | Constraints and parameterized repositories |

## Failure behavior

- Missing skill makes the candidate ineligible.
- Missing parts is visible and lowers the score; nothing is silently reserved.
- Hazard text creates a safety hold and pending human escalation.
- No approved evidence returns a refusal/escalation.
- A duplicate workflow event returns `duplicate: true` without a second side effect.

## ADR-001 — deterministic final dispatch

The LLM never assigns technicians. Dispatch affects safety, worker fairness, customer commitments, inventory, and liability. A versioned policy is reproducible, testable, and appealable; a human remains accountable.

## ADR-002 — approved knowledge only

Draft articles are excluded before ranking. Supported answers contain source IDs; unsupported questions escalate rather than inventing instructions.
