/** API `investmentScore` is already 0–10 (matches web `portal-card-rating-float`). */
export function normalizeAiInvestmentScore(raw: number | null | undefined): number | null {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) return null;
  return Math.min(10, Math.max(0, Math.round(raw * 10) / 10));
}

export function formatAiInvestmentScore(raw: number | null | undefined): string | null {
  const score = normalizeAiInvestmentScore(raw);
  if (score == null) return null;
  return `AI ${score.toFixed(1)}`;
}
