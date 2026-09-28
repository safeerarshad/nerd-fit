import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radii } from '../design/tokens';

export function Surface({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.surface, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.medium, padding: 20, gap: 14 },
});
