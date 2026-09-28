import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useDatabase } from '../../data/useDatabase';
import { listFood, dayTotals, getDayStatus, setDayStatus, undoFood, getSetting } from '../../data/repositories/journal';
import { dateFromParam, localDate } from '../../domain/dates';
import { Screen } from '../../components/Screen';
import { Surface } from '../../components/Surface';
import { Copy } from '../../components/Copy';
import { Button } from '../../components/Button';
import { DateTimeField } from '../../components/DateTimeField';
import { colors } from '../../design/tokens';
import { createDiaryLoader, type DiaryState } from './diaryLoader';

export function FoodScreen() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  // Returning from capture with a different route date starts that date's diary.
  return <DiaryScreen key={JSON.stringify(params.date ?? null)} dateParam={params.date} />;
}

function DiaryScreen({ dateParam }: { dateParam: string | string[] | undefined }) {
  const db = useDatabase();
  const [date, setDate] = useState(() => dateFromParam(dateParam));
  const day = localDate(date);
  const [limit, setLimit] = useState(30);
  const [state, setState] = useState<DiaryState | null>(null);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [mutationError, setMutationError] = useState<{ day: string; message: string } | null>(null);
  const readDiary = useCallback(async (selectedDay: string, pageLimit: number) => {
    const now = Date.now();
    const [rows, totals, status, glass] = await Promise.all([
      listFood(db, selectedDay, { limit: pageLimit }), dayTotals(db, selectedDay, now),
      getDayStatus(db, selectedDay), getSetting(db, 'glass'),
    ]);
    return { day: selectedDay, now, rows, totals, status, glass: glass ?? 'balanced' };
  }, [db]);
  const loader = useMemo(() => createDiaryLoader(readDiary, setState), [readDiary]);
  useFocusEffect(useCallback(() => {
    void loader.load(day, limit);
    return () => loader.cancel();
  }, [loader, day, limit]));

  // Guard the render before the new focus effect starts as well as the response.
  const data = state?.phase === 'ready' && state.data.day === day ? state.data : null;
  const loadError = state?.phase === 'error' && state.day === day ? state.message : null;
  async function mutate(operation: () => Promise<void>) {
    if (saving.current) return;
    saving.current = true; setBusy(true); setMutationError(null);
    try { await operation(); await loader.refresh(day); }
    catch (error) { setMutationError({ day, message: (error as Error).message }); }
    finally { saving.current = false; setBusy(false); }
  }

  return <Screen navigation glass={data?.glass} eyebrow="FOOD JOURNAL" title="Every meal belongs.">
    <DateTimeField value={date} onChange={selected => { loader.cancel(); setDate(selected); setLimit(30); setMutationError(null); }} dateOnly />
    {!data ? <Surface>
      <Copy muted>{loadError ?? 'Opening this date’s journal…'}</Copy>
      {loadError ? <Button label="Try again" onPress={() => { void loader.load(day, limit); }} /> : null}
    </Surface> : <>
      <Surface>
        <Text style={{ color: colors.accent, fontSize: 36, fontWeight: '600' }}>{Math.round(data.totals.kcal).toLocaleString()} kcal</Text>
        <Copy muted>Logged intake · future meals stay separate until their time</Copy>
        <Copy>Day status: {data.status.status.toLowerCase()}</Copy>
        {day <= localDate(new Date(data.now)) ? <View style={{ gap: 8 }}>
          <Button label="I've logged the whole day" secondary disabled={busy} onPress={() => Alert.alert('Mark day complete?', `Only mark ${day} complete when all food and drink for this date are recorded.`, [
            { text: 'Cancel', style: 'cancel' }, { text: 'Mark complete', onPress: () => { void mutate(() => setDayStatus(db, day, 'COMPLETE')); } },
          ])} />
          <Button label="Some food is missing" secondary disabled={busy} onPress={() => { void mutate(() => setDayStatus(db, day, 'PARTIAL')); }} />
          {data.rows.length === 0 ? <Button label="Confirm a full-day fast" secondary disabled={busy} onPress={() => Alert.alert('Confirm intentional fast?', `This records known zero intake for ${day}. Missing logs are not a fast.`, [
            { text: 'Cancel', style: 'cancel' }, { text: 'Confirm fast', onPress: () => { void mutate(() => setDayStatus(db, day, 'FASTING')); } },
          ])} /> : null}
        </View> : <Copy muted>Future day · planned meals</Copy>}
      </Surface>
      {data.rows.length === 0 ? <Surface><Copy>No meals on this date yet.</Copy></Surface> : data.rows.map(row => <Surface key={row.id}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '600', flexShrink: 1 }}>{row.name}</Text><Copy>{Math.round(row.kcal)} kcal</Copy>
        </View>
        <Copy muted>{row.quantityLabel} · {row.localTime.slice(0, 5)}{row.occurredAt > data.now ? ' · planned' : ''}</Copy>
        <Copy muted>P {Math.round(row.protein)}g · C {Math.round(row.carbs)}g · F {Math.round(row.fat)}g · entered by you</Copy>
        {row.nutritionWarning ? <Copy error>{row.nutritionWarning}</Copy> : null}
        <Button label={`Remove ${row.name}`} secondary disabled={busy} onPress={() => Alert.alert('Remove entry?', `${row.name} will be removed from ${day}.`, [
          { text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => { void mutate(() => undoFood(db, row.id)); } },
        ])} />
      </Surface>)}
      <Button label="Log food" onPress={() => router.push({ pathname: '/capture', params: { kind: 'food', date: day } })} />
      {data.rows.length === limit ? <Button label="Show older entries" secondary onPress={() => setLimit(Math.min(200, limit + 30))} disabled={limit >= 200 || busy} /> : null}
    </>}
    {mutationError?.day === day ? <Copy error>{mutationError.message}</Copy> : null}
  </Screen>;
}
