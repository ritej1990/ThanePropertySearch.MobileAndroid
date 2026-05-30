import { Animated } from 'react-native';

export type AnimatedProgress = Animated.Value | Animated.AnimatedInterpolation<number>;

/** Smooth fade/slide for fixed header extras (email, plan bar, welcome). */
export function headerExtraMotion(progress: AnimatedProgress) {
  const opacity = progress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0.96, 1],
    extrapolate: 'clamp',
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
    extrapolate: 'clamp',
  });

  const scaleY = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.001, 0.96, 1],
    extrapolate: 'clamp',
  });

  return { opacity, translateY, scaleY };
}

/** Sticky compact bar — appears once list content scrolls past `revealAt`. */
export function stickyBarMotion(scrollY: Animated.Value, revealAt: number) {
  const start = Math.max(12, revealAt - 36);
  const end = Math.max(start + 28, revealAt);

  const opacity = scrollY.interpolate({
    inputRange: [start, end],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const translateY = scrollY.interpolate({
    inputRange: [start, end],
    outputRange: [-10, 0],
    extrapolate: 'clamp',
  });

  return { opacity, translateY };
}
