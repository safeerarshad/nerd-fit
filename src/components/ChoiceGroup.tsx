import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../design/tokens';

export function ChoiceGroup<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void;
}) {
  return <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View accessibilityRole="radiogroup" style={styles.options}>
      {options.map((option) => <Pressable key={option.value} accessibilityRole="radio"
        accessibilityLabel={`${label}: ${option.label}`} accessibilityState={{ checked: option.value === value }}
        onPress={() => onChange(option.value)} style={[styles.option, option.value === value && styles.selected]}>
        <Text style={[styles.text, option.value === value && styles.selectedText]}>{option.label}</Text>
      </Pressable>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 10 }, label: { color: colors.text, fontSize: 15, fontWeight: '500' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 48, minWidth: 60, justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { color: colors.text, fontSize: 15 }, selectedText: { color: colors.accentInk, fontWeight: '600' },
});
