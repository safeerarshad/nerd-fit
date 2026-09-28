import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../design/tokens';

export function Button({ label, onPress, disabled = false, secondary = false }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}>
    <Text style={[styles.label, secondary && { color: colors.text }]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 52, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 16, fontWeight: '600', color: colors.accentInk, textAlign: 'center' },
});
