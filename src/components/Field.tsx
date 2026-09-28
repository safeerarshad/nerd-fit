import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { colors } from '../design/tokens';

export function Field({ label, value, onChangeText, suffix, keyboardType = 'default', help, multiline = false }: {
  label: string; value: string; onChangeText: (text: string) => void; suffix?: string;
  keyboardType?: KeyboardTypeOptions; help?: string; multiline?: boolean;
}) {
  return <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText}
        keyboardType={keyboardType} style={styles.input} selectionColor={colors.accent}
        placeholderTextColor={colors.secondary} multiline={multiline} autoCorrect={keyboardType === 'default'} />
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
    {help ? <Text style={styles.help}>{help}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 8 }, label: { color: colors.text, fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.background },
  input: { flex: 1, minHeight: 52, color: colors.text, fontSize: 18, paddingHorizontal: 16, paddingVertical: 12 },
  suffix: { paddingRight: 16, color: colors.secondary, fontSize: 14 },
  help: { color: colors.secondary, fontSize: 13, lineHeight: 20 },
});
