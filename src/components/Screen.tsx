import { useRef, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../design/tokens';
import { BlurTargetView } from 'expo-blur';
import { GlassDock } from './GlassDock';

export function Screen({ title, eyebrow, children, navigation = false, glass }: PropsWithChildren<{ title: string; eyebrow?: string; navigation?: boolean; glass?: string }>) {
  const { width } = useWindowDimensions();
  const target = useRef<View | null>(null);
  return <SafeAreaView style={styles.safe}>
    <BlurTargetView ref={target} style={{ flex: 1 }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingHorizontal: width < 600 ? 16 : 32, paddingBottom: navigation ? 120 : 32 }]}>
      <View style={styles.content}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        {children}
      </View>
    </ScrollView></KeyboardAvoidingView></BlurTargetView>
    {navigation ? <GlassDock target={target} glass={glass} /> : null}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingTop: 28, paddingBottom: 32 },
  content: { width: '100%', maxWidth: 1100, alignSelf: 'center', gap: 20 },
  eyebrow: { color: colors.accent, fontSize: 13, fontWeight: '600', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 32, fontWeight: '600', letterSpacing: -0.8 },
});
