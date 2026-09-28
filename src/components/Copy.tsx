import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';
import { colors } from '../design/tokens';

export function Copy({ children, muted = false, error = false }: PropsWithChildren<{ muted?: boolean; error?: boolean }>) {
  return <Text accessibilityLiveRegion={error ? 'polite' : 'none'} style={{ color: error ? colors.warning : muted ? colors.secondary : colors.text, fontSize: 16, lineHeight: 24 }}>{children}</Text>;
}
