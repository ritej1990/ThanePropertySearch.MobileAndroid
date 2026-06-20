import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  stickyBarMotion,
  stickyBarRevealStart,
  type AnimatedProgress,
} from '../../utils/scrollChromeMotion';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  overlay?: boolean;
  /** Preferred — sticky appears after this scroll offset (px). */
  scrollY?: Animated.Value;
  revealAt?: number;
  /** @deprecated use scrollY + revealAt */
  chromeVisible?: AnimatedProgress;
};

/** Compact bar that fades in once the user scrolls past the main toolbar. */
export function ScrollChromeBar({
  children,
  style,
  overlay = false,
  scrollY,
  revealAt = 160,
  chromeVisible,
}: Props) {
  const revealStart = stickyBarRevealStart(revealAt);
  const [touchEnabled, setTouchEnabled] = useState(!overlay);

  useEffect(() => {
    if (!overlay) {
      setTouchEnabled(true);
      return;
    }

    if (scrollY != null) {
      const listenerId = scrollY.addListener(({ value }) => {
        setTouchEnabled(value >= revealStart);
      });
      return () => scrollY.removeListener(listenerId);
    }

    if (chromeVisible != null) {
      const listenerId = chromeVisible.addListener(({ value }) => {
        setTouchEnabled(value <= 0.15);
      });
      return () => chromeVisible.removeListener(listenerId);
    }
  }, [overlay, scrollY, revealStart, chromeVisible]);

  const motion =
    scrollY != null
      ? stickyBarMotion(scrollY, revealAt)
      : chromeVisible != null
        ? {
            opacity: chromeVisible.interpolate({
              inputRange: [0, 0.35],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            translateY: chromeVisible.interpolate({
              inputRange: [0, 0.35],
              outputRange: [0, -8],
              extrapolate: 'clamp',
            }),
          }
        : null;

  if (!motion) return null;

  return (
    <Animated.View
      style={[
        overlay ? styles.overlay : styles.inFlow,
        style,
        { opacity: motion.opacity, transform: [{ translateY: motion.translateY }] },
      ]}
      pointerEvents={touchEnabled ? 'box-none' : 'none'}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  inFlow: {
    zIndex: 2,
  },
});
