import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useDatabase } from '../../data/useDatabase';
import { getActiveGoal, getProfile, getTarget, type StoredGoal, type StoredTarget } from '../../data/repositories/profile';
import { dayTotals, getSetting, latestWeight, type DayTotals, type WeightRow } from '../../data/repositories/journal';
import { type ProfileInput, fromKg } from '../../domain/planning';
import { localDate } from '../../domain/dates';
import { Screen } from '../../components/Screen';
import { Surface } from '../../components/Surface';
import { Button } from '../../components/Button';
import { Copy } from '../../components/Copy';
import { colors } from '../../design/tokens';

export function HomeScreen() {
  const db = useDatabase(); const { width } = useWindowDimensions();
  const [data, setData] = useState<{ profile: ProfileInput; goal: StoredGoal | null; target: StoredTarget | null; totals: DayTotals; weight: WeightRow | null; glass: string } | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    let active = true;
    (async () => {
      const profile = await getProfile(db);
      if (!active) return;
      if (!profile) { router.replace('/onboarding'); return; }
      const today = localDate(new Date());
      const [goal,target,totals,weight,glass] = await Promise.all([getActiveGoal(db),getTarget(db,today),dayTotals(db,today,Date.now()),latestWeight(db),getSetting(db,'glass')]);
      if (active) { setData({profile,goal,target,totals,weight,glass:glass ?? 'balanced'}); setError(''); }
    })().catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [db]);
  useFocusEffect(load);
  return <Screen navigation={!!data} glass={data?.glass} eyebrow={`TODAY  /  ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`} title="Your day, in balance.">
    {error ? <Surface><Copy error>{error}</Copy><Button label="Try again" onPress={load} /></Surface> : null}
    {!data ? <Copy muted>Opening your journal…</Copy> : <>
      <View style={[styles.columns, width >= 720 && { flexDirection: 'row' }]}>
        <Surface style={{ flex: 1 }}>
          <Text style={styles.label}>{data.target ? data.target.kcal - data.totals.kcal >= 0 ? 'ENERGY REMAINING' : 'ABOVE TODAY’S PLAN' : 'ENERGY LOGGED'}</Text>
          <Text style={styles.hero}>{Math.round(data.target ? Math.abs(data.target.kcal-data.totals.kcal) : data.totals.kcal).toLocaleString()}<Text style={styles.unit}> kcal</Text></Text>
          <Copy muted>{Math.round(data.totals.kcal).toLocaleString()} eaten{data.target ? `  /  ${data.target.kcal.toLocaleString()} planned` : ' · tracking without targets'}</Copy>
          <View style={{ gap: 18, marginTop: 12 }}>{(['protein','carbs','fat'] as const).map((key,i) => <View key={key} style={{ gap: 8 }}>
            <View style={styles.row}><Copy>{['Protein','Carbs','Fat'][i]}</Copy><Copy muted>{Math.round(data.totals[key])}g{data.target ? ` / ${Math.round(data.target[key])}g` : ''}</Copy></View>
            {data.target ? <View accessibilityRole="progressbar" accessibilityValue={{ min:0,max:Math.round(data.target[key]),now:Math.round(data.totals[key]) }} style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, data.totals[key]/Math.max(1,data.target[key])*100)}%`, backgroundColor: i===1 ? colors.information : i===2 ? colors.warning : colors.accent }]} /></View> : null}
          </View>)}</View>
          <Button label="Log a meal" onPress={() => router.push('/capture')} />
        </Surface>
        <View style={{ flex: 1, gap: 20 }}>
          <Surface><Text style={styles.label}>YOUR DIRECTION</Text><Text style={styles.section}>{data.goal?.input.mode === 'cut' ? 'A measured cut.' : data.goal?.input.mode === 'bulk' ? 'Room to grow.' : 'Steady feels good.'}</Text>
            <Copy muted>{data.target ? 'Starting estimate · log honestly and build consistency.' : 'Your journal is open. No automatic calorie prescription.'}</Copy>
            <Button label="View my plan" secondary onPress={() => router.push('/strategy')} />
          </Surface>
          <Surface><Text style={styles.label}>LATEST WEIGH-IN</Text>
            <Text style={styles.section}>{data.weight ? `${fromKg(data.weight.kg,data.profile.units).toFixed(1)} ${data.profile.units==='metric'?'kg':'lb'}` : 'A starting point awaits.'}</Text>
            <Copy muted>{data.weight ? `${data.weight.localDate} · raw scale weight` : 'A single reading is just one part of your story.'}</Copy>
            <Button label="Log weight" secondary onPress={() => router.push({pathname:'/capture',params:{kind:'weight'}})} />
          </Surface>
        </View>
      </View>
      <Copy muted>Your data stays here. This test build needs no account or internet for tracking.</Copy>
    </>}
  </Screen>;
}
const styles = StyleSheet.create({
  columns: { gap: 20 }, label: { color: colors.secondary, fontSize: 12, letterSpacing: 1.6, fontWeight: '600' },
  hero: { color: colors.accent, fontSize: 56, fontWeight: '600', letterSpacing: -2 }, unit: { color: colors.secondary, fontSize: 18, letterSpacing: 0 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  section: { color: colors.text, fontSize: 26, fontWeight: '500', letterSpacing: -0.5 },
  track: { height: 6, borderRadius: 4, backgroundColor: colors.raised, overflow: 'hidden' }, fill: { height: 6, borderRadius: 4 },
});
