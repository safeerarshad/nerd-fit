import { buildInitialPlan, fromKg, toKg, type ProfileInput, type GoalInput, type InitialPlan } from './planning.ts';

type Units = ProfileInput['units'];
type CoachedPlan = Extract<InitialPlan, { status: 'coached' }>;

function positiveDraft(draft: string): number | null {
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(draft.trim())) return null;
  const value = Number(draft);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Drafts may be incomplete. Keep strict domain conversion out of the render path. */
export function weightDraftKg(draft: string, units: Units): number | null {
  const value = positiveDraft(draft);
  if (value === null) return null;
  try { return toKg(value, units); } catch { return null; }
}

export function convertMeasurementDraft(draft: string, kind: 'weight' | 'height', from: Units, to: Units): string {
  if (!draft || from === to) return draft;
  const value = positiveDraft(draft);
  if (value === null) return draft;
  try {
    const converted = kind === 'weight' ? fromKg(toKg(value, from), to) : value * (to === 'imperial' ? 1 / 2.54 : 2.54);
    if (!Number.isFinite(converted) || converted <= 0) return draft;
    const rounded = Math.round(converted * 10) / 10;
    return String(Number.isFinite(rounded) && rounded > 0 ? rounded : converted);
  } catch { return draft; }
}

export function buildStepPlan(profile: ProfileInput, goal: GoalInput | null, step: number): InitialPlan {
  if (step === 0) return buildInitialPlan(profile, { mode: 'maintain', targetKg: profile.weightKg, ratePct: 0, distribution: [1, 1, 1, 1, 1, 1, 1] });
  if (!goal) throw new Error('Enter your goal.');
  // The saved split may no longer fit a changed goal. Let the user reach its editor.
  return buildInitialPlan(profile, step < 3 ? { ...goal, distribution: [1, 1, 1, 1, 1, 1, 1] } : goal);
}

export function averageMacros(plan: CoachedPlan): { protein: number; carbs: number; fat: number } {
  return plan.days.reduce((average, day) => ({
    protein: average.protein + day.protein / plan.days.length,
    carbs: average.carbs + day.carbs / plan.days.length,
    fat: average.fat + day.fat / plan.days.length,
  }), { protein: 0, carbs: 0, fat: 0 });
}

export function paceInUnits(kgWeek: number, units: Units): number {
  return kgWeek === 0 ? 0 : Math.sign(kgWeek) * fromKg(Math.abs(kgWeek), units);
}
