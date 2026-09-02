import { z } from "zod";

export const priorities = ["emergency", "urgent", "routine"] as const;
export const workOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  address: z.string().trim().min(4).max(240),
  issue: z.string().trim().min(8).max(2000),
  priority: z.enum(priorities).default("routine"),
  assetId: z.string().uuid().optional()
});

export type Candidate = {
  id: string; name: string; skills: string[]; requiredSkill: string;
  distanceKm: number; requiredParts: string[]; stockedParts: string[];
  activeJobs: number; maxJobs: number; firstTimeFixRate: number;
};

export type DispatchScore = Candidate & {
  eligible: boolean; total: number; explanation: Record<string, number | boolean>;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function scoreCandidate(candidate: Candidate): DispatchScore {
  const skillMatch = candidate.skills.includes(candidate.requiredSkill);
  const partsRatio = candidate.requiredParts.length === 0 ? 1 : candidate.requiredParts.filter(p => candidate.stockedParts.includes(p)).length / candidate.requiredParts.length;
  const travel = 35 * clamp(1 - candidate.distanceKm / 50);
  const parts = 25 * partsRatio;
  const capacity = 20 * clamp(1 - candidate.activeJobs / Math.max(1, candidate.maxJobs));
  const quality = 20 * clamp(candidate.firstTimeFixRate);
  const total = skillMatch ? Math.round((travel + parts + capacity + quality) * 10) / 10 : 0;
  return { ...candidate, eligible: skillMatch, total, explanation: { skillGate: skillMatch, travel: Math.round(travel * 10) / 10, parts: Math.round(parts * 10) / 10, capacity: Math.round(capacity * 10) / 10, quality: Math.round(quality * 10) / 10 } };
}

export function rankCandidates(candidates: Candidate[]): DispatchScore[] {
  return candidates.map(scoreCandidate).sort((a, b) => b.total - a.total || a.distanceKm - b.distanceKm || a.id.localeCompare(b.id));
}

const safetyRules: Array<[RegExp, string]> = [
  [/gas smell|smell (?:of )?gas|بوی گاز/i, "suspected_gas_leak"],
  [/carbon monoxide|\bco\b|مونوکسید/i, "carbon_monoxide"],
  [/sparks?|electrical fire|سوختگی برق|جرقه/i, "electrical_hazard"],
  [/fire|smoke|آتش|دود/i, "fire_or_smoke"],
  [/refrigerant leak|نشتی مبرد|نشتی گاز کولر/i, "refrigerant_exposure"]
];

export function triageSafety(text: string) {
  const reason = safetyRules.find(([pattern]) => pattern.test(text))?.[1] ?? null;
  return reason
    ? { safeToAutomate: false, reason, action: "Stop automation, show emergency guidance, and notify the on-call dispatcher." }
    : { safeToAutomate: true, reason: null, action: "Continue structured intake; a human still approves dispatch." };
}

export function answerFromKnowledge(question: string, articles: Array<{ id: string; title: string; body: string; approved: boolean }>) {
  const safety = triageSafety(question);
  if (!safety.safeToAutomate) return { answer: "I cannot troubleshoot this remotely. Leave the area if needed, contact emergency services for immediate danger, and wait for a qualified dispatcher.", citations: [], escalated: true, reason: safety.reason };
  const terms = question.toLowerCase().split(/\W+/).filter(x => x.length > 3);
  const approved = articles.filter(a => a.approved);
  const ranked = approved.map(article => ({ article, hits: terms.filter(t => `${article.title} ${article.body}`.toLowerCase().includes(t)).length })).sort((a, b) => b.hits - a.hits);
  const match = ranked[0];
  if (!match || match.hits === 0) return { answer: "I do not have enough approved evidence to answer. A service advisor should review this request.", citations: [], escalated: true, reason: "insufficient_evidence" };
  return { answer: match.article.body, citations: [match.article.id], escalated: false, reason: null };
}

export function idempotencyKey(scope: string, entityId: string, event: string) {
  return `${scope}:${entityId}:${event}`.toLowerCase().replace(/[^a-z0-9:_-]/g, "-").slice(0, 160);
}
