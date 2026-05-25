import React, { useEffect, useState } from 'react';
import { InteractionManager, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

type Props = {
  children: React.ReactNode;
  /** Wait after navigation animations before mounting (ms). */
  delayMs?: number;
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
  /** Light placeholder while deferred. */
  showPlaceholder?: boolean;
};

export function LazyMount({
  children,
  delayMs = 0,
  minHeight,
  style,
  showPlaceholder = true,
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handle = InteractionManager.runAfterInteractions(() => {
      timeoutId = setTimeout(() => {
        if (!cancelled) setReady(true);
      }, delayMs);
    });

    return () => {
      cancelled = true;
      handle.cancel();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delayMs]);

  if (ready) {
    return <>{children}</>;
  }

  if (!showPlaceholder) {
    return <View style={[{ minHeight }, style]} />;
  }

  return (
    <View style={[styles.placeholder, { minHeight }, style]}>
      <View style={styles.shimmer} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginBottom: 8,
  },
  shimmer: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.borderLight,
    opacity: 0.65,
  },
});
