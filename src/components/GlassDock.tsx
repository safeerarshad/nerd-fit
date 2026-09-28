import type { RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../design/tokens';

export function GlassDock({ target, glass = 'balanced' }: { target: RefObject<View | null>; glass?: string }) {
  const path = usePathname(); const insets = useSafeAreaInsets();
  return <View style={[styles.position, { bottom: Math.max(insets.bottom, 12) }]}>
    <BlurView blurTarget={target} blurMethod={glass === 'tinted' ? 'none' : 'dimezisBlurViewSdk31Plus'} intensity={glass === 'clear' ? 35 : 65} tint="dark" style={styles.dock}>
      {([{ path: '/', label: 'Home' }, { path: '/food', label: 'Food' }] as const).map(item => <Pressable key={item.path} accessibilityRole="tab" accessibilityState={{ selected: path === item.path }} onPress={() => router.replace(item.path)} style={styles.item}><Text style={[styles.text, path === item.path && styles.active]}>{item.label}</Text></Pressable>)}
      <Pressable accessibilityRole="button" accessibilityLabel="Log food or weight" onPress={() => router.push('/capture')} style={styles.capture}><Text style={styles.plus}>+</Text></Pressable>
      {([{ path: '/weight', label: 'Weight' }, { path: '/settings', label: 'Settings' }] as const).map(item => <Pressable key={item.path} accessibilityRole="tab" accessibilityState={{ selected: path === item.path }} onPress={() => router.replace(item.path)} style={styles.item}><Text style={[styles.text, path === item.path && styles.active]}>{item.label}</Text></Pressable>)}
    </BlurView>
  </View>;
}
const styles = StyleSheet.create({
  position: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  dock: { width: '100%', maxWidth: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderRadius: 28, overflow: 'hidden', backgroundColor: '#1A2420EB', borderWidth: 1, borderColor: colors.border, padding: 7, gap: 2 },
  item: { flex: 1, minHeight: 52, minWidth: 48, alignItems: 'center', justifyContent: 'center', padding: 2 },
  text: { color: colors.secondary, fontSize: 12, fontWeight: '500', textAlign: 'center' }, active: { color: colors.accent },
  capture: { minWidth: 52, minHeight: 52, borderRadius: 20, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  plus: { color: colors.accentInk, fontSize: 32, lineHeight: 38 },
});
