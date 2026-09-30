export type SimilarityInput = {
  titleSimilarity: number;
  proposedTerms: string[];
  paperTitle: string;
  paperKeywords: string[];
  proposedTechnologies?: string[];
  paperTechnologies?: string[];
};

export type SimilarityResult = {
  score: number;
  matchedTerms: string[];
  matchedTechnologies: string[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s+#.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export function tokenize(value: string): string[] {
  return [...new Set(normalize(value).split(/[\s,;|/]+/u).filter((token) => token.length > 1))];
}

function overlap(proposed: string[], existing: string[]) {
  const existingTokens = new Set(existing.flatMap(tokenize));
  const existingValues = existing.map(normalize);
  const candidates = proposed.flatMap((item) => [normalize(item), ...tokenize(item)]);
  const matches = candidates.filter(
    (term) => term.length > 1 && (existingTokens.has(term) || existingValues.some((item) => item.includes(term))),
  );
  for (const existingValue of existingValues) {
    for (const candidate of candidates) {
      if (candidate.length > 1 && existingValue.includes(candidate)) matches.push(candidate);
      if (candidate.length > 1 && candidate.includes(existingValue)) matches.push(existingValue);
    }
  }
  return [...new Set(matches)].sort((a, b) => a.length - b.length);
}

export function scoreSimilarity(input: SimilarityInput): SimilarityResult {
  const matchedTerms = overlap(input.proposedTerms, [input.paperTitle, ...input.paperKeywords]);
  const matchedTechnologies = overlap(input.proposedTechnologies ?? [], input.paperTechnologies ?? []);
  const keywordScore = Math.min(1, matchedTerms.length / Math.max(1, new Set(input.proposedTerms.flatMap(tokenize)).size));
  const technologyScore = Math.min(1, matchedTechnologies.length / Math.max(1, new Set((input.proposedTechnologies ?? []).flatMap(tokenize)).size));
  const score = Math.round(Math.max(0, Math.min(100, (input.titleSimilarity * 0.65 + keywordScore * 0.2 + technologyScore * 0.15) * 100)));
  return { score, matchedTerms, matchedTechnologies };
}

export function similarityVerdict(score: number) {
  if (score > 70) return { label: "สูงมาก", message: "หัวข้อนี้เคยมีคนทำแล้ว ควรปรับมุมมอง", tone: "high" as const };
  if (score >= 40) return { label: "ปานกลาง", message: "มีงานใกล้เคียง ควรอ่านก่อน", tone: "medium" as const };
  return { label: "ต่ำ", message: "ยังไม่พบงานที่ใกล้เคียง", tone: "low" as const };
}
