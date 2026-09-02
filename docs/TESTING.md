# Testing strategy

The project executes 217 API/domain tests plus a verified dashboard production build and structure tests.

| Layer | Coverage |
|---|---|
| Dispatch | score boundaries, hard gate, parts, determinism, tie-break |
| Safety | English/Persian hazards and routine false-positive cases |
| Assistant | citations, draft exclusion, refusal, safety precedence |
| Validation | required data and length boundaries |
| API | health, login, JWT, RBAC, intake, approvals, recommendation evidence |
| Workflow | stable keys and duplicate suppression |
| Web | build and rendered landmark/component structure |

Coverage gates are 80% lines/functions/statements and 75% branches. Before production add live PostgreSQL integration, browser E2E/accessibility, load/soak, chaos, provider contract, secret, dependency, container, and migration rollback tests.
