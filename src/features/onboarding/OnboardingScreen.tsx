import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../components/Screen';
import { Surface } from '../../components/Surface';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { ChoiceGroup } from '../../components/ChoiceGroup';
import { Copy } from '../../components/Copy';
import { colors } from '../../design/tokens';
import { buildInitialPlan, fromKg, toKg, type GoalInput, type ProfileInput, type InitialPlan } from '../../domain/planning';
import { buildStepPlan, convertMeasurementDraft } from '../../domain/draftPresentation';
import { adaptExpo } from '../../data/sqlite/expoAdapter';
import { completeOnboarding, getActiveGoal, getProfile, savePlan } from '../../data/repositories/profile';
import { PlanPreview, weekdays } from './PlanPreview';

const titles = ['Make it yours.', 'Choose your direction.', 'Find your pace.', 'Make room for life.', 'Your next chapter.'];
export function OnboardingScreen({ editing = false }: { editing?: boolean }) {
  const raw = useSQLiteContext();
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState<ProfileInput['units']>('metric');
  const [age, setAge] = useState(''); const [height, setHeight] = useState(''); const [weight, setWeight] = useState('');
  const [equation, setEquation] = useState<ProfileInput['equation'] | ''>('');
  const [diet, setDiet] = useState<ProfileInput['diet']>('non-veg');
  const [eligible, setEligible] = useState(false);
  const [mode, setMode] = useState<GoalInput['mode']>('maintain');
  const [target, setTarget] = useState(''); const [rate, setRate] = useState(0.5);
  const [activity, setActivity] = useState<ProfileInput['activity']>('low');
  const [training, setTraining] = useState('3');
  const [distribution, setDistribution] = useState('even');
  const [weights, setWeights] = useState(['1','1','1','1','1','1','1']);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    let active = true;
    (async () => {
      const db = adaptExpo(raw);
      const p = await getProfile(db); const g = await getActiveGoal(db);
      if (!active || !p || !g) return;
      setUnits(p.units); setAge(String(p.age)); setHeight(String(p.units === 'metric' ? p.heightCm : Math.round(p.heightCm / 2.54 * 10) / 10));
      setWeight(String(Math.round(fromKg(p.weightKg, p.units) * 10) / 10)); setEquation(p.equation); setDiet(p.diet);
      setEligible(p.supportedPopulation); setActivity(p.activity); setTraining(String(p.trainingDays));
      setMode(g.input.mode); setTarget(String(Math.round(fromKg(g.input.targetKg, p.units) * 10) / 10));
      setRate(g.input.ratePct || 0.5); setWeights(g.input.distribution.map(String)); setDistribution('custom');
    })().catch((e: Error) => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editing, raw]);

  function profile(): ProfileInput {
    if (!age.trim() || !height.trim() || !weight.trim() || !equation) throw new Error('Enter your age, height, weight and equation choice.');
    return { age: Number(age), heightCm: Number(height) * (units === 'imperial' ? 2.54 : 1), weightKg: toKg(Number(weight), units),
      equation, units, diet, activity, trainingDays: Number(training), supportedPopulation: eligible };
  }
  function goal(p: ProfileInput): GoalInput {
    return { mode, targetKg: mode === 'maintain' ? p.weightKg : toKg(Number(target), units),
      ratePct: mode === 'maintain' ? 0 : rate, distribution: weights.map(Number) };
  }
  let preview: InitialPlan | null = null; let previewError = '';
  if (step >= 3) { try { const p = profile(); preview = buildInitialPlan(p, goal(p)); } catch (e) { previewError = (e as Error).message; } }
  function changeUnits(next: ProfileInput['units']) {
    if (next === units) return;
    setWeight(convertMeasurementDraft(weight, 'weight', units, next));
    setTarget(convertMeasurementDraft(target, 'weight', units, next));
    setHeight(convertMeasurementDraft(height, 'height', units, next));
    setUnits(next);
  }
  function next() {
    try {
      setError(''); const p = profile();
      buildStepPlan(p, step === 0 ? null : goal(p), step);
      setStep(step + 1);
    } catch (e) { setError((e as Error).message); }
  }
  async function done() {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError('');
    try {
      const p = profile(); const context = { now: Date.now(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
      await (editing ? savePlan : completeOnboarding)(adaptExpo(raw), p, goal(p), context);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/');
    } catch (e) { setError((e as Error).message); }
    finally { submitting.current = false; setBusy(false); }
  }
  if (loading) return <Screen title="Your plan"><Copy muted>Opening your saved plan…</Copy></Screen>;
  return <Screen eyebrow={step < 4 ? `NERD FIT  /  ${step + 1} OF 4` : 'YOUR ROADMAP'} title={titles[step]!}>
    <View style={styles.form}>
    {step === 0 ? <>
      <Copy muted>A few details to build your starting estimate. Your journal stays on this device.</Copy>
      <ChoiceGroup label="Units" value={units} onChange={changeUnits} options={[{ value: 'metric', label: 'kg · cm' }, { value: 'imperial', label: 'lb · in' }]} />
      <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" suffix="years" />
      <ChoiceGroup label="Resting-energy equation" value={equation} onChange={setEquation} options={[{ value: 'female', label: 'Female equation' }, { value: 'male', label: 'Male equation' }]} />
      <Copy muted>This equation uses a sex coefficient from its original study; it is an estimate, not a measurement.</Copy>
      <Field label="Height" value={height} onChangeText={setHeight} keyboardType="decimal-pad" suffix={units === 'metric' ? 'cm' : 'in'} />
      <Field label="Current weight" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" suffix={units === 'metric' ? 'kg' : 'lb'} />
      <ChoiceGroup label="Diet preference" value={diet} onChange={setDiet} options={[{value:'veg',label:'Veg'},{value:'non-veg',label:'Non Veg'},{value:'eggetarian',label:'Eggetarian'},{value:'vegan',label:'Vegan'}]} />
      <Surface><Copy>Automatic coaching is intended for adults 18–78, outside pregnancy, breastfeeding, eating-disorder treatment or a clinician-managed diet.</Copy>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: eligible }} onPress={() => setEligible(!eligible)} style={styles.check}>
          <Text style={styles.checkBox}>{eligible ? '✓' : '○'}</Text><Text style={styles.checkText}>This applies to me. Use automatic coaching.</Text>
        </Pressable><Copy muted>Leave this off to use a journal without generated targets.</Copy>
      </Surface>
    </> : null}
    {step === 1 ? <>
      <Copy muted>Pick what matters now. You can change direction later without losing your history.</Copy>
      <ChoiceGroup label="Your goal" value={mode} onChange={(v) => { setMode(v); setRate(v === 'bulk' ? 0.15 : 0.5); }} options={[{value:'cut',label:'Cut'},{value:'maintain',label:'Maintain'},{value:'bulk',label:'Bulk'}]} />
      <Surface><Copy>{mode === 'cut' ? 'Lose weight at a measured pace while keeping your plan practical.' : mode === 'bulk' ? 'Aim for gradual weight gain. The scale cannot tell us how much gain is muscle.' : 'Build consistency around your current weight.'}</Copy></Surface>
      {mode !== 'maintain' ? <Field label="Target weight" value={target} onChangeText={setTarget} keyboardType="decimal-pad" suffix={units === 'metric' ? 'kg' : 'lb'} /> : null}
    </> : null}
    {step === 2 ? <>
      {mode !== 'maintain' ? <Surface><Text style={styles.rate}>{rate.toFixed(2)}% <Text style={styles.small}>bodyweight / week</Text></Text>
        <Slider accessibilityLabel="Goal rate percent per week" minimumValue={mode === 'cut' ? 0.1 : 0.05} maximumValue={mode === 'cut' ? 1 : 0.5}
          step={0.05} value={rate} onValueChange={setRate} minimumTrackTintColor={colors.accent} maximumTrackTintColor={colors.border} thumbTintColor={colors.accent} style={{ height: 52 }} />
        <Copy muted>{mode === 'cut' ? 'Suggested starting band: 0.25–0.75%' : 'Suggested starting band: 0.10–0.25%'}. These are planning defaults, not a guarantee of safety.</Copy>
        <Copy>About {(Number(weight) * rate / 100).toFixed(2)} {units === 'metric' ? 'kg' : 'lb'} / week</Copy>
      </Surface> : <Copy muted>Maintenance begins near your estimated expenditure.</Copy>}
      <ChoiceGroup label="Overall daily activity" value={activity} onChange={setActivity} options={[{value:'low',label:'Mostly seated'},{value:'moderate',label:'On my feet'},{value:'high',label:'Very active'}]} />
      <Copy muted>Include your usual training in this choice. We do not add exercise calories a second time.</Copy>
      <Field label="Resistance training days per week" value={training} onChangeText={setTraining} keyboardType="number-pad" help="Used for your starting protein recommendation. Enter 0–7." />
    </> : null}
    {step === 3 ? <>
      <Copy muted>Same weekly budget. A little flexibility for the days you enjoy more food.</Copy>
      <ChoiceGroup label="Calorie rhythm" value={distribution} onChange={(v) => {
        setDistribution(v); setWeights((v === 'weekend' ? [0.95,0.95,0.95,0.95,0.95,1.125,1.125] : v === 'weekday' ? [1.04,1.04,1.04,1.04,1.04,0.9,0.9] : [1,1,1,1,1,1,1]).map(String));
      }} options={[{value:'even',label:'Even'},{value:'weekend',label:'Weekend heavy'},{value:'weekday',label:'Weekday heavy'},{value:'custom',label:'Custom'}]} />
      {distribution === 'custom' ? <Surface><Copy muted>Relative portions of the weekly budget. 1 is even; 1.1 gives that day slightly more.</Copy>
        {weekdays.map((day, i) => <Field key={day} label={`${day} share`} value={weights[i]!} keyboardType="decimal-pad" onChangeText={(v) => setWeights(weights.map((w, j) => i === j ? v : w))} />)}
      </Surface> : null}
      {preview ? <PlanPreview plan={preview} units={units} /> : <Copy error>{previewError}</Copy>}
    </> : null}
    {step === 4 && preview ? <><Copy muted>{editing ? 'Your changes begin tomorrow. Earlier targets and journal entries stay in your history.' : 'Your plan starts today. Log what you actually eat and use the numbers as a starting point.'}</Copy><PlanPreview plan={preview} units={units} /><Copy muted>This first test build uses a starting estimate. Adaptive expenditure and weekly coaching are still in development.</Copy></> : null}
    {error ? <Copy error>{error}</Copy> : null}
    {step < 4 ? <Button label={step === 3 ? 'See my roadmap' : 'Continue'} onPress={next} /> : <Button label={busy ? 'Saving…' : editing ? 'Save plan' : 'Done — open my journal'} disabled={busy || !preview} onPress={() => { void done(); }} />}
    {step > 0 ? <Button label="Back" secondary disabled={busy} onPress={() => { setError(''); setStep(step - 1); }} /> : editing ? <Button label="Cancel" secondary onPress={() => router.back()} /> : null}
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  form: { width: '100%', maxWidth: 560, gap: 22, alignSelf: 'center' },
  check: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 52 },
  checkBox: { color: colors.accent, fontSize: 26 }, checkText: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 24 },
  rate: { color: colors.accent, fontSize: 36, fontWeight: '600' }, small: { fontSize: 15, color: colors.secondary },
});
