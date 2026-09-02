import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { MemoryStore } from "../src/store.js";

let app: ReturnType<typeof buildApp>; let store: MemoryStore; let token: string;
beforeEach(async () => { store = new MemoryStore(); app = buildApp(store, { jwtSecret: "test-secret-that-is-long-enough-123" }); await app.ready(); const login = await app.inject({ method: "POST", url: "/v1/auth/login", payload: { email: "dispatcher@northstar.local", password: "DispatchDemo!2026" } }); token = login.json().token; });
afterEach(async () => app.close());

describe("API security and contracts", () => {
  it("reports health without authentication", async () => expect((await app.inject({ method: "GET", url: "/health" })).statusCode).toBe(200));
  it("rejects invalid login", async () => expect((await app.inject({ method: "POST", url: "/v1/auth/login", payload: { email: "dispatcher@northstar.local", password: "wrong" } })).statusCode).toBe(401));
  ["/v1/work-orders", "/v1/dispatch/recommendations", "/v1/approvals"].forEach(url => it(`protects ${url}`, async () => expect((await app.inject({ method: "GET", url })).statusCode).toBe(401)));
  it("forbids dispatcher from admin audit", async () => expect((await app.inject({ method: "GET", url: "/v1/audit", headers: { authorization: `Bearer ${token}` } })).statusCode).toBe(403));
  it("returns explainable ranked recommendations", async () => { const response = await app.inject({ method: "GET", url: "/v1/dispatch/recommendations", headers: { authorization: `Bearer ${token}` } }); expect(response.statusCode).toBe(200); expect(response.json().finalDecisionBy).toBe("human_dispatcher"); expect(response.json().items[0].explanation.skillGate).toBe(true); });
});

describe("service request intake", () => {
  for (let i = 0; i < 20; i++) it(`creates valid routine intake ${i}`, async () => { const response = await app.inject({ method: "POST", url: "/v1/public/service-requests", payload: { customerName: `Customer ${i}`, phone: "6045550101", address: `${i + 1} Main Street`, issue: "The rooftop unit is not cooling correctly", priority: "routine" } }); expect(response.statusCode).toBe(201); expect(response.json().order.status).toBe("new_intake"); });
  const hazards = ["gas smell near furnace", "carbon monoxide detector alarm", "electrical fire at disconnect", "smoke coming from unit", "refrigerant leak in mechanical room"];
  hazards.forEach(hazard => it(`creates safety hold for ${hazard}`, async () => { const response = await app.inject({ method: "POST", url: "/v1/public/service-requests", payload: { customerName: "Safety Customer", phone: "6045550101", address: "10 Main Street", issue: hazard, priority: "emergency" } }); expect(response.statusCode).toBe(201); expect(response.json().order.status).toBe("safety_hold"); expect(store.approvals.size).toBe(1); }));
  it("returns structured validation errors", async () => { const response = await app.inject({ method: "POST", url: "/v1/public/service-requests", payload: { customerName: "x" } }); expect(response.statusCode).toBe(422); expect(response.json().error).toBe("validation_error"); });
});

describe("human approvals, assistant and workflow idempotency", () => {
  it("resolves a pending approval and writes audit", async () => { store.approvals.set("APR-1", { id: "APR-1", workOrderId: "WO-1", type: "dispatch", status: "pending", requestedAt: new Date().toISOString() }); const response = await app.inject({ method: "POST", url: "/v1/approvals/APR-1/resolve", headers: { authorization: `Bearer ${token}` }, payload: { decision: "approved", note: "Parts confirmed" } }); expect(response.statusCode).toBe(200); expect(response.json().status).toBe("approved"); expect(store.audit[0]?.action).toBe("approval.approved"); });
  it("rejects invalid approval decision", async () => { store.approvals.set("APR-1", { id: "APR-1", workOrderId: "WO-1", type: "dispatch", status: "pending", requestedAt: new Date().toISOString() }); expect((await app.inject({ method: "POST", url: "/v1/approvals/APR-1/resolve", headers: { authorization: `Bearer ${token}` }, payload: { decision: "maybe" } })).statusCode).toBe(422); });
  it("returns 404 for unknown approval", async () => expect((await app.inject({ method: "POST", url: "/v1/approvals/nope/resolve", headers: { authorization: `Bearer ${token}` }, payload: { decision: "approved" } })).statusCode).toBe(404));
  for (let i = 0; i < 15; i++) it(`answers supported knowledge question ${i}`, async () => { const response = await app.inject({ method: "POST", url: "/v1/assistant/ask", headers: { authorization: `Bearer ${token}` }, payload: { question: `How should I confirm filter dimensions ${i}?` } }); expect(response.statusCode).toBe(200); expect(response.json().citations).toEqual(["KB-102"]); });
  it("deduplicates workflow event", async () => { const payload = { entityId: "WO-1" }; const headers = { authorization: `Bearer ${token}` }; expect((await app.inject({ method: "POST", url: "/v1/workflows/reminder", headers, payload })).json().accepted).toBe(true); expect((await app.inject({ method: "POST", url: "/v1/workflows/reminder", headers, payload })).json().duplicate).toBe(true); });
});
