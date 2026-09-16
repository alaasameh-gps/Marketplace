export interface PageParams {
  page: number;
  limit: number;
}

export function getPaginationDefaults(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return fallback;
}

export function buildPageResult<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): { items: T[]; total: number; page: number; limit: number; totalPages: number } {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return { items, total, page, limit, totalPages };
}