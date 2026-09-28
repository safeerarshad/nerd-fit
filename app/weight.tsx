import { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { Surface } from '../src/components/Surface';
import { Copy } from '../src/components/Copy';
import { Button } from '../src/components/Button';
import { useDatabase } from '../src/data/useDatabase';
import { getProfile } from '../src/data/repositories/profile';
import { getSetting, listWeights, undoWeight, type WeightRow } from '../src/data/repositories/journal';
import { fromKg, type ProfileInput } from '../src/domain/planning';
import { colors } from '../src/design/tokens';

const PAGE_SIZE = 100;
const MAX_QUERY = 1000;
const influenceLabels: Record<WeightRow['influence'], string> = {
  normal: 'Use normally', reduced: 'Reduced influence', ignored: 'Ignored for future trend',
};

function recordedDate(row: WeightRow): string {
  return new Date(`${row.localDate}T12:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
}

function recordedOffset(minutes: number): string {
  const absolute = Math.abs(minutes);
  return `UTC${minutes < 0 ? '−' : '+'}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(Math.floor(absolute % 60)).padStart(2, '0')}`;
}

export default function Weight() {
  const db = useDatabase();
  const [rows, setRows] = useState<WeightRow[]>([]);
  const [units, setUnits] = useState<ProfileInput['units']>('metric');
  const [glass, setGlass] = useState('balanced');
  const [hasProfile, setHasProfile] = useState(false);
  const [page, setPage] = useState(0);
  const [hasOlder, setHasOlder] = useState(false);
  const [atLimit, setAtLimit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const focused = useRef(false);
  const request = useRef(0);
  const removalInFlight = useRef(false);
  const confirmationOpen = useRef(false);

  const loadPage = useCallback(async (nextPage: number) => {
    const ticket = ++request.current;
    setLoading(true);
    setError('');
    try {
      // The repository currently supports a bounded limit, not an offset.
      // Query one extra row when possible, and render only the requested page.
      const limit = Math.min(MAX_QUERY, (nextPage + 1) * PAGE_SIZE + 1);
      const [weights, profile, appearance] = await Promise.all([listWeights(db, { limit }), getProfile(db), getSetting(db, 'glass')]);
      if (!focused.current || ticket !== request.current) return;
      const lastPage = Math.max(0, Math.ceil(weights.length / PAGE_SIZE) - 1);
      const resolvedPage = Math.min(nextPage, lastPage);
      setRows(weights.slice(resolvedPage * PAGE_SIZE, (resolvedPage + 1) * PAGE_SIZE));
      setPage(resolvedPage);
      setHasOlder(weights.length > (resolvedPage + 1) * PAGE_SIZE);
      setAtLimit(limit === MAX_QUERY && weights.length === MAX_QUERY && resolvedPage === MAX_QUERY / PAGE_SIZE - 1);
      setUnits(profile?.units ?? 'metric');
      setHasProfile(profile !== null);
      setGlass(appearance ?? 'balanced');
    } catch (cause) {
      if (focused.current && ticket === request.current) setError(cause instanceof Error ? cause.message : 'Could not load your weigh-ins.');
    } finally {
      if (focused.current && ticket === request.current) setLoading(false);
    }
  }, [db]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    if (!removalInFlight.current) setRemoving(false);
    setNotice('');
    void loadPage(0);
    return () => { focused.current = false; request.current++; };
  }, [loadPage]));

  const remove = async (row: WeightRow) => {
    if (removalInFlight.current) return;
    removalInFlight.current = true;
    setRemoving(true);
    setError('');
    setNotice('');
    try {
      await undoWeight(db, row.id);
      if (focused.current) {
        setNotice('Weigh-in removed.');
        await loadPage(page);
      }
    } catch (cause) {
      if (focused.current) setError(cause instanceof Error ? cause.message : 'Could not remove this weigh-in.');
    } finally {
      removalInFlight.current = false;
      if (focused.current) setRemoving(false);
    }
  };

  const confirmRemove = (row: WeightRow) => {
    if (confirmationOpen.current || removalInFlight.current || loading) return;
    confirmationOpen.current = true;
    Alert.alert('Remove this weigh-in?', `${fromKg(row.kg, units).toFixed(2)} ${units === 'metric' ? 'kg' : 'lb'} · ${recordedDate(row)} at ${row.localTime.slice(0, 8)}. This removes the recorded reading from your journal.`, [
      { text: 'Keep reading', style: 'cancel', onPress: () => { confirmationOpen.current = false; } },
      { text: 'Remove', style: 'destructive', onPress: () => { confirmationOpen.current = false; void remove(row); } },
    ], { cancelable: true, onDismiss: () => { confirmationOpen.current = false; } });
  };

  return <Screen eyebrow="YOUR WEIGH-INS" title="The scale, in context." navigation glass={glass}>
    <Copy muted>These are your recorded scale readings. Trend calculations are not part of this first test build.</Copy>
    <Button label="Add a weigh-in" disabled={loading || removing || !hasProfile} onPress={() => router.push({ pathname: '/capture', params: { kind: 'weight' } })} />
    {loading ? <Copy muted>Loading your weight history…</Copy> : null}
    {error ? <Surface><Copy error>{error}</Copy><Button label="Try again" secondary disabled={loading || removing} onPress={() => { void loadPage(page); }} /></Surface> : null}
    {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
    {!loading && !error && !hasProfile ? <Surface><Copy>Set up your profile to start your journal.</Copy><Button label="Set up Nerd Fit" onPress={() => router.replace('/onboarding')} /></Surface> : null}
    {!loading && !error && hasProfile && rows.length === 0 ? <Surface><Text accessibilityRole="header" style={styles.heading}>Your first reading starts here.</Text><Copy muted>Log a weigh-in whenever it works for you. Your saved date, time and measurement stay together.</Copy></Surface> : null}
    {rows.length > 0 ? <>
      <Copy muted>Readings {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + rows.length} · newest first · {units === 'metric' ? 'kilograms' : 'pounds'}</Copy>
      {rows.map(row => <Surface key={row.id}>
        <View style={styles.row}>
          <View style={styles.reading}>
            <Text accessibilityRole="header" style={styles.value}>{fromKg(row.kg, units).toFixed(2)} <Text style={styles.unit}>{units === 'metric' ? 'kg' : 'lb'}</Text></Text>
            <Copy>{recordedDate(row)} · {row.localTime.slice(0, 8)}</Copy>
            <Copy muted>{row.timeZone} · {recordedOffset(row.offsetMinutes)}</Copy>
          </View>
          <View style={styles.remove}><Button label="Remove reading" secondary disabled={loading || removing} onPress={() => confirmRemove(row)} /></View>
        </View>
        <Copy muted>Trend preference: {influenceLabels[row.influence]}</Copy>
      </Surface>)}
      <View style={styles.pages}>
        {page > 0 ? <Button label="Newer readings" secondary disabled={loading || removing} onPress={() => { void loadPage(page - 1); }} /> : null}
        {hasOlder ? <Button label="Older readings" secondary disabled={loading || removing} onPress={() => { void loadPage(page + 1); }} /> : null}
      </View>
      {atLimit ? <Copy muted>This first build can display your latest 1,000 readings. Earlier readings remain saved.</Copy> : null}
    </> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  reading: { flexGrow: 1, flexBasis: 220, gap: 6 },
  remove: { flexGrow: 1, flexBasis: 170, maxWidth: 280 },
  value: { color: colors.text, fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] },
  unit: { color: colors.secondary, fontSize: 18, fontWeight: '400' },
  heading: { color: colors.text, fontSize: 20, fontWeight: '600' },
  pages: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  notice: { color: colors.accent, fontSize: 16, lineHeight: 24 },
});
