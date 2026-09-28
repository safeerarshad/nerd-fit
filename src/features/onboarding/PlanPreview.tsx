import { StyleSheet, Text, View } from 'react-native';
import type { InitialPlan, ProfileInput } from '../../domain/planning';
import { averageMacros, paceInUnits } from '../../domain/draftPresentation';
import { Surface } from '../../components/Surface';
import { Copy } from '../../components/Copy';
import { colors } from '../../design/tokens';

export const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function PlanPreview({ plan, units = 'metric' }: { plan: InitialPlan; units?: ProfileInput['units'] }) {
  if (plan.status === 'tracking-only') return <Surface><Text style={styles.heading}>Your journal, without targets</Text>
    {plan.reasons.map((reason) => <Copy key={reason}>{reason}</Copy>)}
    <Copy muted>You can still record meals and weight. Nerd Fit will not generate a calorie prescription for this profile.</Copy>
  </Surface>;
  const macros = averageMacros(plan);
  return <>
    <Surface>
      <Text style={styles.heading}>Your starting plan</Text>
      <Text style={styles.number}>{Math.round(plan.averageTarget).toLocaleString()}<Text style={styles.unit}> kcal / day</Text></Text>
      <Copy muted>Weekly average · a starting estimate, ready to refine with your feedback.</Copy>
      <View style={styles.macros}>{[['Protein', macros.protein], ['Carbs', macros.carbs], ['Fat', macros.fat]].map(([name, value]) =>
        <View key={name} style={{ flex: 1, minWidth: 75 }}><Text style={styles.heading}>{Math.round(Number(value))}g</Text><Copy muted>{name}</Copy></View>)}</View>
      <Copy muted>Average daily macros, rounded to whole grams.</Copy>
      <Copy>Starting expenditure: {Math.round(plan.prior).toLocaleString()} kcal</Copy>
      <Copy>Estimated change: {paceInUnits(plan.effectiveKgWeek, units).toFixed(2)} {units === 'metric' ? 'kg' : 'lb'} / week</Copy>
      {plan.estimatedWeeksRange ? <Copy muted>Approximate goal window: {Math.round(plan.estimatedWeeksRange[0])}–{Math.round(plan.estimatedWeeksRange[1])} weeks. Actual progress can differ.</Copy> : null}
    </Surface>
    <Surface><Text style={styles.heading}>Your week</Text>
      {plan.days.map((day, index) => <View key={index} style={styles.day}><Copy>{weekdays[index]}</Copy><Copy>{day.kcal.toLocaleString()} kcal</Copy></View>)}
      <Copy muted>{plan.weeklyBudget.toLocaleString()} kcal across the week. Protein stays steady.</Copy>
    </Surface>
    {plan.explanations.map((explanation) => <Copy muted key={explanation}>{explanation}</Copy>)}
  </>;
}
const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 20, fontWeight: '600' },
  number: { color: colors.accent, fontSize: 44, fontWeight: '600', letterSpacing: -1.5 },
  unit: { color: colors.secondary, fontSize: 16, letterSpacing: 0 },
  macros: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 10 },
  day: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
});
