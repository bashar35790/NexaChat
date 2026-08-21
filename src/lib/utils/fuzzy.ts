/**
 * Lightweight subsequence fuzzy matcher ,no dependency. Returns a score
 * (higher = better) or null when the query isn't a subsequence of the text.
 * Scoring favors word-boundary and consecutive matches, case-insensitive.
 */
export function fuzzyScore(query: string, text: string): number | null {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const boundary = new RegExp(`(^|[\\s\\-_.@·])${escapeRegExp(q)}`).test(t);
  if (boundary) return 1000;

  let score = 0;
  let qi = 0;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak += 1;
      // Consecutive hits beat scattered ones; earlier hits beat later ones.
      score += 10 + streak * 4 + Math.max(0, 8 - qi);
      qi += 1;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : null;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
