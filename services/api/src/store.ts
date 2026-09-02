import type { Candidate } from "./domain.js";

export type WorkOrder = { id: string; customerName: string; phone: string; address: string; issue: string; priority: string; status: string; createdAt: string; safetyReason: string | null };
export type Approval = { id: string; workOrderId: string; type: string; status: "pending" | "approved" | "rejected"; requestedAt: string; resolvedBy?: string; note?: string };

export class MemoryStore {
  orders = new Map<string, WorkOrder>();
  approvals = new Map<string, Approval>();
  audit: Array<{ id: string; actor: string; action: string; entity: string; at: string; metadata: unknown }> = [];
  workflowKeys = new Set<string>();
  candidates: Candidate[] = [
    { id: "tech-001", name: "Jordan Kim", skills: ["commercial-refrigeration", "heat-pump"], requiredSkill: "commercial-refrigeration", distanceKm: 8, requiredParts: ["contact-kit"], stockedParts: ["contact-kit", "filter-16x25"], activeJobs: 2, maxJobs: 5, firstTimeFixRate: 0.94 },
    { id: "tech-002", name: "Amir Shah", skills: ["heat-pump", "rtu"], requiredSkill: "commercial-refrigeration", distanceKm: 5, requiredParts: ["contact-kit"], stockedParts: ["filter-16x25"], activeJobs: 1, maxJobs: 5, firstTimeFixRate: 0.88 },
    { id: "tech-003", name: "Sofia Reyes", skills: ["commercial-refrigeration"], requiredSkill: "commercial-refrigeration", distanceKm: 18, requiredParts: ["contact-kit"], stockedParts: ["contact-kit"], activeJobs: 1, maxJobs: 4, firstTimeFixRate: 0.91 }
  ];
  articles = [
    { id: "KB-102", title: "Filter replacement preparation", body: "Confirm the equipment model and filter dimensions, power the unit down at the approved disconnect, and wait for a qualified technician if access is unsafe.", approved: true },
    { id: "KB-DRAFT", title: "Unapproved draft", body: "This draft must never be retrieved.", approved: false }
  ];
  log(actor: string, action: string, entity: string, metadata: unknown = {}) {
    this.audit.unshift({ id: crypto.randomUUID(), actor, action, entity, at: new Date().toISOString(), metadata });
  }
}
