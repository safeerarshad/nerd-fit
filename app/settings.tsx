import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { Screen } from '../src/components/Screen';
import { Surface } from '../src/components/Surface';
import { Copy } from '../src/components/Copy';
import { Button } from '../src/components/Button';
import { ChoiceGroup } from '../src/components/ChoiceGroup';
import { useDatabase } from '../src/data/useDatabase';
import { getSetting, setSetting, type SettingKey } from '../src/data/repositories/journal';
import { colors } from '../src/design/tokens';

type Units = 'metric' | 'imperial';
type Glass = 'clear' | 'balanced' | 'tinted';

export default function Settings() {
  const db = useDatabase();
  const [units, setUnits] = useState<Units>('metric');
  const [glass, setGlass] = useState<Glass>('balanced');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const focused = useRef(false);
  const request = useRef(0);
  const savingRef = useRef(false);

  const load = useCallback(async () => {
    const ticket = ++request.current;
    setLoading(true);
    setError('');
    try {
      const [savedUnits, savedGlass] = await Promise.all([getSetting(db, 'units'), getSetting(db, 'glass')]);
      if (!focused.current || ticket !== request.current) return;
      setUnits(savedUnits === 'imperial' ? 'imperial' : 'metric');
      setGlass(savedGlass === 'clear' || savedGlass === 'tinted' ? savedGlass : 'balanced');
    } catch (cause) {
      if (focused.current && ticket === request.current) setError(cause instanceof Error ? cause.message : 'Could not load settings.');
    } finally {
      if (focused.current && ticket === request.current) setLoading(false);
    }
  }, [db]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    if (!savingRef.current) setSaving(false);
    setNotice('');
    void load();
    return () => { focused.current = false; request.current++; };
  }, [load]));

  const save = async (key: SettingKey, value: string) => {
    if (loading || savingRef.current || (key === 'units' ? units : glass) === value) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await setSetting(db, key, value);
      if (focused.current) {
        await load();
        if (focused.current) setNotice(key === 'units' ? 'Units saved.' : 'Appearance saved.');
      }
    } catch (cause) {
      if (focused.current) setError(cause instanceof Error ? cause.message : 'Could not save this setting.');
    } finally {
      savingRef.current = false;
      if (focused.current) setSaving(false);
    }
  };

  const version = Constants.expoConfig?.version ?? 'Unavailable';
  const build = Constants.expoConfig?.android?.versionCode ?? 'Unavailable';
  const applicationId = Constants.expoConfig?.android?.package ?? 'dev.safeerarshad.nerdfit';

  return <Screen eyebrow="MAKE IT YOURS" title="Your journal, your way." navigation glass={glass}>
    {loading ? <Copy muted>Loading your preferences…</Copy> : null}
    {error ? <Surface><Copy error>{error}</Copy><Button label="Reload settings" secondary disabled={loading || saving} onPress={() => { void load(); }} /></Surface> : null}
    {notice || saving ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{saving ? 'Saving your preference…' : notice}</Text> : null}
    <Surface>
      <Text accessibilityRole="header" style={styles.heading}>Measurements</Text>
      <View pointerEvents={loading || saving ? 'none' : 'auto'} style={{ opacity: loading || saving ? 0.5 : 1 }}>
        <ChoiceGroup<Units> label="Display units" value={units} options={[{ value: 'metric', label: 'Metric · kg' }, { value: 'imperial', label: 'Imperial · lb' }]} onChange={value => { void save('units', value); }} />
      </View>
      <Copy muted>Your saved readings stay the same. Weight displays and new entries use this preference.</Copy>
    </Surface>
    <Surface>
      <Text accessibilityRole="header" style={styles.heading}>Navigation appearance</Text>
      <View pointerEvents={loading || saving ? 'none' : 'auto'} style={{ opacity: loading || saving ? 0.5 : 1 }}>
        <ChoiceGroup<Glass> label="Glass finish" value={glass} options={[{ value: 'clear', label: 'Clear' }, { value: 'balanced', label: 'Balanced' }, { value: 'tinted', label: 'Tinted' }]} onChange={value => { void save('glass', value); }} />
      </View>
      <Copy muted>Preview your choice in the navigation bar below. Tinted uses a solid backdrop.</Copy>
    </Surface>
    <Surface>
      <Text accessibilityRole="header" style={styles.heading}>Your direction</Text>
      <Copy muted>Review your accepted plan, pace and weekly calorie layout.</Copy>
      <Button label="View my strategy" secondary onPress={() => router.push('/strategy')} />
    </Surface>
    <Surface>
      <Text accessibilityRole="header" style={styles.heading}>Local by default</Text>
      <Copy>Your food, weight and plan history are stored on this device. No account is needed for your journal.</Copy>
      <Copy muted>Uninstalling Nerd Fit or clearing its app storage removes the local journal. Backup and export are not included in this test build.</Copy>
    </Surface>
    <Surface>
      <Text accessibilityRole="header" style={styles.heading}>About Nerd Fit</Text>
      <Copy>Version {version} · Android build {build}</Copy>
      <Text selectable style={styles.identifier}>{applicationId}</Text>
      <Copy muted>First test release. Initial nutrition plans and manual logging are available; adaptive coaching is still in development.</Copy>
    </Surface>
  </Screen>;
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 20, fontWeight: '600' },
  notice: { color: colors.accent, fontSize: 16, lineHeight: 24 },
  identifier: { color: colors.secondary, fontSize: 14, lineHeight: 22 },
});
