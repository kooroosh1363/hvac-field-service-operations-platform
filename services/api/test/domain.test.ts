import { describe, expect, it } from "vitest";
import { answerFromKnowledge, idempotencyKey, rankCandidates, scoreCandidate, triageSafety, workOrderSchema, type Candidate } from "../src/domain.js";

const base: Candidate = { id: "t1", name: "Tech", skills: ["heat-pump"], requiredSkill: "heat-pump", distanceKm: 10, requiredParts: ["p1"], stockedParts: ["p1"], activeJobs: 1, maxJobs: 5, firstTimeFixRate: .9 };

describe("transparent dispatch scoring", () => {
  for (let distance = 0; distance <= 50; distance += 2) it(`scores distance ${distance} km within policy bounds`, () => { const result = scoreCandidate({ ...base, distanceKm: distance }); expect(result.total).toBeGreaterThanOrEqual(0); expect(result.total).toBeLessThanOrEqual(100); expect(result.explanation.travel).toBeCloseTo(35 * (1 - distance / 50), 1); });
  for (let active = 0; active <= 10; active++) it(`never rewards overloaded candidate at load ${active}`, () => { const result = scoreCandidate({ ...base, activeJobs: active, maxJobs: 5 }); expect(result.explanation.capacity).toBeGreaterThanOrEqual(0); expect(result.explanation.capacity).toBeLessThanOrEqual(20); });
  for (let rate = 0; rate <= 1; rate += .05) it(`maps first-time-fix ${rate.toFixed(2)} into quality points`, () => { const result = scoreCandidate({ ...base, firstTimeFixRate: rate }); expect(result.explanation.quality).toBeCloseTo(20 * rate, 1); });
  it("hard-gates missing required skill", () => { const result = scoreCandidate({ ...base, skills: [] }); expect(result.eligible).toBe(false); expect(result.total).toBe(0); });
  it("is deterministic and tie-breaks by id", () => { const ranked = rankCandidates([{ ...base, id: "z" }, { ...base, id: "a" }]); expect(ranked.map(x => x.id)).toEqual(["a", "z"]); });
  it("scores no required parts as fully ready", () => { expect(scoreCandidate({ ...base, requiredParts: [] }).explanation.parts).toBe(25); });
});

describe("safety triage", () => {
  const hazards = ["I smell gas", "بوی گاز میاد", "carbon monoxide alarm", "CO detector alarm", "electrical fire", "wires are sparking", "جرقه از پنل", "there is smoke", "آتش گرفته", "refrigerant leak", "نشتی مبرد"];
  hazards.forEach((message, i) => it(`blocks hazardous statement ${i + 1}`, () => { const result = triageSafety(message); expect(result.safeToAutomate).toBe(false); expect(result.reason).toBeTruthy(); }));
  const routine = ["filter is dirty", "unit makes a mild noise", "annual maintenance", "thermostat battery", "cooling is weak", "book a tune up", "replace filter", "temperature uneven", "heat pump lockout", "invoice question"];
  routine.forEach((message, i) => it(`allows structured intake ${i + 1}`, () => expect(triageSafety(message).safeToAutomate).toBe(true)));
});

describe("grounded assistant", () => {
  const articles = [{ id: "A1", title: "Filter replacement", body: "Confirm equipment model and filter dimensions before replacement.", approved: true }, { id: "D1", title: "Secret draft", body: "Never retrieve this draft.", approved: false }];
  for (let i = 0; i < 20; i++) it(`returns approved citation for supported query ${i + 1}`, () => { const result = answerFromKnowledge(`How do I confirm filter replacement dimensions ${i}`, articles); expect(result.escalated).toBe(false); expect(result.citations).toEqual(["A1"]); });
  for (let i = 0; i < 15; i++) it(`escalates unsupported query ${i + 1}`, () => { const result = answerFromKnowledge(`unrelated frobnicator ${i}`, articles); expect(result.escalated).toBe(true); expect(result.citations).toEqual([]); });
  it("never retrieves an unapproved article", () => { const result = answerFromKnowledge("secret draft", articles); expect(result.citations).not.toContain("D1"); });
  it("prioritizes safety over retrieval", () => { expect(answerFromKnowledge("filter with gas smell", articles).reason).toBe("suspected_gas_leak"); });
});

describe("validation and idempotency", () => {
  for (let length = 2; length <= 20; length++) it(`accepts customer length ${length}`, () => { const result = workOrderSchema.safeParse({ customerName: "A".repeat(length), phone: "6045550101", address: "101 Main Street", issue: "Unit is not cooling correctly" }); expect(result.success).toBe(true); });
  for (let length = 0; length < 8; length++) it(`rejects issue length ${length}`, () => { const result = workOrderSchema.safeParse({ customerName: "Acme", phone: "6045550101", address: "101 Main Street", issue: "x".repeat(length) }); expect(result.success).toBe(false); });
  for (let i = 0; i < 20; i++) it(`creates stable workflow key ${i}`, () => { const one = idempotencyKey("workflow", `WO ${i}`, "reminder.sent"); expect(one).toBe(idempotencyKey("workflow", `WO ${i}`, "reminder.sent")); expect(one).not.toContain(" "); });
});
