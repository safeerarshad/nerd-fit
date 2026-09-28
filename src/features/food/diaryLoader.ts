import type { FoodRow, DayTotals, DayStatusRow } from '../../data/repositories/journal.ts';

export type DiarySnapshot = { day: string; now: number; rows: FoodRow[]; totals: DayTotals; status: DayStatusRow; glass: string };
export type DiaryState = { phase: 'loading'; day: string } | { phase: 'error'; day: string; message: string } | { phase: 'ready'; data: DiarySnapshot };

export function createDiaryLoader(read: (day: string, limit: number) => Promise<DiarySnapshot>, publish: (state: DiaryState) => void) {
  let revision = 0;
  let active: { day: string; limit: number } | null = null;
  async function load(day: string, limit: number) {
    const request = ++revision;
    active = { day, limit };
    publish({ phase: 'loading', day });
    try {
      const data = await read(day, limit);
      if (request === revision) publish({ phase: 'ready', data });
    } catch (error) {
      if (request === revision) publish({ phase: 'error', day, message: (error as Error).message });
    }
  }
  return {
    load,
    cancel() { revision++; active = null; },
    async refresh(day: string) { if (active?.day === day) await load(day, active.limit); },
  };
}
