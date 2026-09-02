import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import bcrypt from "bcryptjs";
import { answerFromKnowledge, idempotencyKey, rankCandidates, triageSafety, workOrderSchema } from "./domain.js";
import { MemoryStore } from "./store.js";

declare module "@fastify/jwt" { interface FastifyJWT { payload: { sub: string; role: "dispatcher" | "admin" | "technician" }; user: { sub: string; role: "dispatcher" | "admin" | "technician" } } }

export function buildApp(store = new MemoryStore(), options: { jwtSecret?: string } = {}) {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test", bodyLimit: 1_000_000 });
  app.register(helmet);
  app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? false });
  app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  app.register(jwt, { secret: options.jwtSecret ?? process.env.JWT_SECRET ?? "dev-only-change-me-32-characters-min" });
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => { try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: "unauthorized" }); } };
  const authorize = (...roles: string[]) => async (request: FastifyRequest, reply: FastifyReply) => { await authenticate(request, reply); if (reply.sent) return; if (!roles.includes(request.user.role)) return reply.code(403).send({ error: "forbidden" }); };

  app.get("/health", async () => ({ status: "ok", service: "northstar-api" }));
  app.post("/v1/auth/login", async (request, reply) => {
    const body = request.body as { email?: string; password?: string };
    const expectedHash = process.env.DEMO_PASSWORD_HASH ?? bcrypt.hashSync("DispatchDemo!2026", 10);
    if (body.email !== (process.env.DEMO_EMAIL ?? "dispatcher@northstar.local") || !body.password || !(await bcrypt.compare(body.password, expectedHash))) return reply.code(401).send({ error: "invalid_credentials" });
    const role = "dispatcher" as const; return { token: app.jwt.sign({ sub: body.email, role }, { expiresIn: "15m" }), user: { email: body.email, role } };
  });
  app.post("/v1/public/service-requests", { config: { rateLimit: { max: 12, timeWindow: "1 minute" } } }, async (request, reply) => {
    const parsed = workOrderSchema.safeParse(request.body); if (!parsed.success) return reply.code(422).send({ error: "validation_error", details: parsed.error.flatten() });
    const safety = triageSafety(parsed.data.issue); const id = `WO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const order = { id, ...parsed.data, assetId: undefined, status: safety.safeToAutomate ? "new_intake" : "safety_hold", safetyReason: safety.reason, createdAt: new Date().toISOString() };
    store.orders.set(id, order); store.log("public", "service_request.created", id, { safetyReason: safety.reason });
    if (!safety.safeToAutomate) store.approvals.set(`APR-${id}`, { id: `APR-${id}`, workOrderId: id, type: "safety_escalation", status: "pending", requestedAt: new Date().toISOString() });
    return reply.code(201).send({ order, safety });
  });
  app.get("/v1/work-orders", { preHandler: authenticate }, async () => ({ items: [...store.orders.values()] }));
  app.get("/v1/dispatch/recommendations", { preHandler: authenticate }, async () => ({ policyVersion: "dispatch-v1", finalDecisionBy: "human_dispatcher", items: rankCandidates(store.candidates) }));
  app.get("/v1/approvals", { preHandler: authenticate }, async () => ({ items: [...store.approvals.values()] }));
  app.post("/v1/approvals/:id/resolve", { preHandler: authorize("dispatcher", "admin") }, async (request, reply) => {
    const { id } = request.params as { id: string }; const body = request.body as { decision?: string; note?: string }; const approval = store.approvals.get(id);
    if (!approval) return reply.code(404).send({ error: "not_found" }); if (!['approved','rejected'].includes(body.decision ?? "")) return reply.code(422).send({ error: "invalid_decision" });
    approval.status = body.decision as "approved" | "rejected"; approval.resolvedBy = request.user.sub; approval.note = body.note?.slice(0, 500); store.log(request.user.sub, `approval.${body.decision}`, id, { note: approval.note }); return approval;
  });
  app.post("/v1/assistant/ask", { preHandler: authenticate }, async (request, reply) => {
    const question = (request.body as { question?: string }).question?.trim(); if (!question || question.length > 2000) return reply.code(422).send({ error: "invalid_question" });
    const result = answerFromKnowledge(question, store.articles); store.log(request.user.sub, "assistant.asked", "knowledge", { citations: result.citations, escalated: result.escalated }); return result;
  });
  app.post("/v1/workflows/:event", { preHandler: authenticate }, async (request) => {
    const { event } = request.params as { event: string }; const entityId = String((request.body as { entityId?: string }).entityId ?? "unknown"); const key = idempotencyKey("workflow", entityId, event);
    if (store.workflowKeys.has(key)) return { accepted: false, duplicate: true, key }; store.workflowKeys.add(key); store.log(request.user.sub, "workflow.accepted", entityId, { event, key }); return { accepted: true, duplicate: false, key };
  });
  app.get("/v1/audit", { preHandler: authorize("admin") }, async () => ({ items: store.audit }));
  app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => { const status = error.statusCode && error.statusCode < 500 ? error.statusCode : 500; reply.code(status).send({ error: status === 500 ? "internal_error" : error.name }); });
  return app;
}
