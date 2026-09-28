export type ProfileInput = {
  age: number; heightCm: number; weightKg: number; equation: 'male' | 'female';
  units: 'metric' | 'imperial'; diet: 'veg' | 'non-veg' | 'eggetarian' | 'vegan';
  activity: 'low' | 'moderate' | 'high'; trainingDays: number;
  supportedPopulation: boolean; knownTdee?: number;
};
export type GoalInput = {
  mode: 'cut' | 'maintain' | 'bulk'; targetKg: number; ratePct: number;
  distribution: readonly number[]; proteinPerKg?: number; fatFraction?: number;
};
export type DailyTarget = { kcal: number; protein: number; carbs: number; fat: number };
export type InitialPlan = { status: 'tracking-only'; reasons: string[] } | {
  status: 'coached'; prior: number; resting: number; averageTarget: number; weeklyBudget: number;
  days: DailyTarget[]; requestedKgWeek: number; effectiveKgWeek: number;
  estimatedWeeksRange?: [number, number]; explanations: string[];
};

function finite(value: number, name: string, minimum = 0, maximum = Number.MAX_VALUE): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be a finite number between ${minimum} and ${maximum}.`);
  }
}

function oneOf(value: string, allowed: readonly string[], name: string): void {
  if (!allowed.includes(value)) throw new RangeError(`Unknown ${name}.`);
}

function validateWeights(weights: readonly number[]): void {
  if (!Array.isArray(weights) || weights.length !== 7) {
    throw new RangeError('Distribution requires seven positive weights, Monday to Sunday.');
  }
  for (const weight of weights) finite(weight, 'Distribution weight', Number.MIN_VALUE);
}

/** Largest remainders, with Monday first for ties. No input arrays are modified. */
export function allocateWeek(budget: number, weights: readonly number[]): number[] {
  if (!Number.isSafeInteger(budget) || budget <= 0) {
    throw new RangeError('Weekly budget must be a positive safe integer.');
  }
  validateWeights(weights);
  // Rescale first so even seven individually finite weights cannot overflow their sum.
  const maximum = Math.max(...weights);
  const scaled = weights.map(weight => weight / maximum);
  const sum = scaled.reduce((total, weight) => total + weight, 0);
  const quotas = scaled.map(weight => budget * (weight / sum));
  const allocated = quotas.map(Math.floor);
  const remaining = budget - allocated.reduce((total, kcal) => total + kcal, 0);
  const order = quotas.map((quota, index) => ({ index, fraction: quota - Math.floor(quota) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  if (remaining < 0 || remaining > 7) throw new RangeError('Weekly allocation exceeds numeric precision.');
  for (let index = 0; index < remaining; index++) {
    const day = order[index]!.index;
    allocated[day] = allocated[day]! + 1;
  }
  return allocated;
}

function validateInputs(profile: ProfileInput, goal: GoalInput): void {
  finite(profile.age, 'Age');
  if (!Number.isInteger(profile.age)) throw new RangeError('Age must be a whole number of years.');
  finite(profile.heightCm, 'Height', Number.MIN_VALUE);
  finite(profile.weightKg, 'Weight', Number.MIN_VALUE);
  finite(profile.trainingDays, 'Training days', 0, 7);
  if (!Number.isInteger(profile.trainingDays)) throw new RangeError('Training days must be a whole number.');
  oneOf(profile.equation, ['male', 'female'], 'equation');
  oneOf(profile.units, ['metric', 'imperial'], 'units');
  oneOf(profile.diet, ['veg', 'non-veg', 'eggetarian', 'vegan'], 'diet');
  oneOf(profile.activity, ['low', 'moderate', 'high'], 'activity');
  if (typeof profile.supportedPopulation !== 'boolean') throw new RangeError('Supported population must be explicit.');
  if (profile.knownTdee !== undefined) finite(profile.knownTdee, 'Known TDEE', 1200, 6000);
  oneOf(goal.mode, ['cut', 'maintain', 'bulk'], 'goal mode');
  finite(goal.targetKg, 'Target weight', Number.MIN_VALUE);
  finite(goal.ratePct, 'Goal rate', 0, goal.mode === 'bulk' ? 0.5 : 1);
  if (goal.mode === 'maintain' ? goal.ratePct !== 0 : goal.ratePct === 0) {
    throw new RangeError('Maintenance requires zero rate; cut and bulk require a positive rate.');
  }
  if (goal.proteinPerKg !== undefined) finite(goal.proteinPerKg, 'Protein preference', 1, 2.2);
  if (goal.fatFraction !== undefined) finite(goal.fatFraction, 'Fat preference', 0.2, 0.35);
  validateWeights(goal.distribution);
}

/**
 * Startup planning only: these development coefficients are not a clinical model,
 * a universal tissue density, or the empirical expenditure estimator.
 */
export function buildInitialPlan(profile: ProfileInput, goal: GoalInput): InitialPlan {
  validateInputs(profile, goal);
  const reasons: string[] = [];
  if (!profile.supportedPopulation) reasons.push('Automatic coaching is outside the acknowledged supported population. Tracking remains available.');
  if (profile.age < 18 || profile.age > 78) reasons.push('Automatic planning currently supports ages 18–78.');
  if (profile.weightKg < 40 || profile.weightKg > 250) reasons.push('Current weight is outside the development planning range of 40–250 kg.');
  if (profile.heightCm < 130 || profile.heightCm > 220) reasons.push('Height is outside the development planning range of 130–220 cm.');
  if (goal.targetKg < 40 || goal.targetKg > 250) reasons.push('Target weight is outside the development planning range of 40–250 kg.');
  if (reasons.length) return { status: 'tracking-only', reasons };
  if ((goal.mode === 'cut' && goal.targetKg >= profile.weightKg) ||
      (goal.mode === 'bulk' && goal.targetKg <= profile.weightKg)) {
    throw new RangeError('Cut target must be below current weight; bulk target must be above it.');
  }

  const resting = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age +
    (profile.equation === 'male' ? 5 : -161);
  const activityFactor = { low: 1.35, moderate: 1.55, high: 1.75 }[profile.activity];
  const prior = profile.knownTdee ?? resting * activityFactor;
  const sign = goal.mode === 'cut' ? -1 : goal.mode === 'bulk' ? 1 : 0;
  const requestedKgWeek = sign * profile.weightKg * goal.ratePct / 100;
  const coefficient = goal.mode === 'bulk' ? 5500 : 7700;
  const requestedAdjustment = requestedKgWeek * coefficient / 7;
  if (sign !== 0 && Math.abs(requestedAdjustment) * 7 < 0.5) {
    throw new RangeError('Goal rate is below the precision of an integer weekly calorie budget.');
  }
  const adjustment = Math.max(-0.2 * prior, Math.min(0.1 * prior, requestedAdjustment));
  const roundedBudget = Math.round((prior + adjustment) * 7);
  const weeklyBudget = goal.mode === 'cut'
    ? Math.max(roundedBudget, Math.ceil(prior * 0.8 * 7))
    : goal.mode === 'bulk'
      ? Math.min(roundedBudget, Math.floor(prior * 1.1 * 7))
      : roundedBudget;
  const averageTarget = weeklyBudget / 7;
  // The effective rate describes the actual rounded plan, not its unrounded draft.
  const effectiveKgWeek = sign === 0 ? 0 : (averageTarget - prior) * 7 / coefficient;
  if (sign !== 0 && sign * effectiveKgWeek <= 0) {
    throw new RangeError('Goal rate cannot be represented at this weekly budget precision.');
  }
  const minimumDay = Math.max(resting, 0.75 * prior);
  const maximumDay = 1.5 * prior;
  const calories = allocateWeek(weeklyBudget, goal.distribution);
  if (calories.some(kcal => kcal < minimumDay || kcal > maximumDay)) {
    throw new RangeError(`Distribution exceeds daily planning bounds (${Math.ceil(minimumDay)}–${Math.floor(maximumDay)} kcal). Try flatter weights or review the starting estimate.`);
  }
  const proteinPerKg = goal.proteinPerKg ?? (goal.mode === 'cut' ? 1.8 : profile.trainingDays > 0 ? 1.6 : 1.2);
  const protein = profile.weightKg * proteinPerKg;
  const fatFraction = goal.fatFraction ?? 0.25;
  const days = calories.map(kcal => {
    const fat = kcal * fatFraction / 9;
    const carbs = (kcal - protein * 4 - fat * 9) / 4;
    if (carbs < 0) throw new RangeError('Macro preferences are infeasible: protein and fat exceed a daily energy target. Review the preferences or distribution.');
    return { kcal, protein, carbs, fat };
  });
  const explanations = [
    profile.knownTdee === undefined
      ? 'Starting expenditure is a Mifflin resting estimate multiplied by overall activity, including training. It is not measured expenditure.'
      : 'Starting expenditure uses your supplied TDEE estimate; the resting estimate still contributes to daily planning bounds.',
    'These development planning bounds do not establish medical safety or energy availability.',
    `Protein uses current weight (${profile.weightKg} kg); fat and carbohydrate complete each day’s target.`,
    'Daily calories are rounded while preserving the weekly budget; protein and macro calculations retain full precision.',
  ];
  if (Math.abs(adjustment - requestedAdjustment) > 1e-8) {
    explanations.push('The requested pace exceeds the startup energy adjustment limit. The effective pace is slower.');
  }
  if (goal.mode === 'maintain') return {
    status: 'coached', resting, prior, weeklyBudget, averageTarget, days,
    requestedKgWeek, effectiveKgWeek, explanations,
  };
  const sensitivity = goal.mode === 'cut' ? [6000, 9500] : [3500, 9000];
  const weeklyEnergy = (averageTarget - prior) * 7;
  const weeks = sensitivity.map(density => {
    const weeklyFraction = weeklyEnergy / density / profile.weightKg;
    return Math.log(goal.targetKg / profile.weightKg) / Math.log1p(weeklyFraction);
  }).sort((a, b) => a - b);
  explanations.push(`Startup energy allowance uses ${coefficient} kcal/kg; the approximate duration varies it from ${sensitivity[0]} to ${sensitivity[1]}. This is an unvalidated planning approximation, not a tissue-growth cost or empirical expenditure formula.`);
  explanations.push('The duration range compounds percentage change as mass changes, assuming the present relative energy adjustment persists. It is a sensitivity scenario, not a predicted completion date or statistical interval.');
  return {
    status: 'coached', resting, prior, weeklyBudget, averageTarget, days, requestedKgWeek,
    effectiveKgWeek, estimatedWeeksRange: [weeks[0]!, weeks[1]!], explanations,
  };
}

const KG_PER_POUND = 0.45359237;

export function toKg(weight: number, units: ProfileInput['units']): number {
  finite(weight, 'Weight', Number.MIN_VALUE);
  oneOf(units, ['metric', 'imperial'], 'units');
  const converted = units === 'imperial' ? weight * KG_PER_POUND : weight;
  finite(converted, 'Converted weight', Number.MIN_VALUE);
  return converted;
}

export function fromKg(weight: number, units: ProfileInput['units']): number {
  finite(weight, 'Weight', Number.MIN_VALUE);
  oneOf(units, ['metric', 'imperial'], 'units');
  const converted = units === 'imperial' ? weight / KG_PER_POUND : weight;
  finite(converted, 'Converted weight', Number.MIN_VALUE);
  return converted;
}
