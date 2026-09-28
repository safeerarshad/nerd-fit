import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from './Button';
import { Copy } from './Copy';

export function DateTimeField({ value, onChange, dateOnly = false }: { value: Date; onChange: (date: Date) => void; dateOnly?: boolean }) {
  const [mode, setMode] = useState<'date' | 'time' | null>(null);
  return <View style={{ gap: 8 }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <Button label={value.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} secondary onPress={() => setMode('date')} />
      {!dateOnly ? <Button label={value.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} secondary onPress={() => setMode('time')} /> : null}
    </View>
    {!dateOnly ? <Copy muted>{Intl.DateTimeFormat().resolvedOptions().timeZone}</Copy> : null}
    {mode ? <DateTimePicker value={value} mode={mode} onChange={(event, selected) => {
      setMode(null); if (event.type !== 'set' || !selected) return;
      const next = new Date(value);
      if (mode === 'date') next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      else next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      onChange(next);
    }} /> : null}
  </View>;
}
