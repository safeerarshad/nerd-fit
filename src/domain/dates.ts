export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dateFromParam(param: string | string[] | undefined, reference = new Date()): Date {
  const fallback = new Date(reference);
  if (typeof param !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(param)) return fallback;
  const [year, month, day] = param.split('-').map(Number) as [number, number, number];
  const candidate = new Date(reference);
  candidate.setFullYear(year, month - 1, day);
  return localDate(candidate) === param ? candidate : fallback;
}
