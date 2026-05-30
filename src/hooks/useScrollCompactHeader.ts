import { useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
/** Scroll offset where fixed header extras begin fading (px). */
export const CHROME_FADE_START = 6;
/** Scroll offset where fixed header extras are fully hidden (px). */
export const CHROME_FADE_END = 52;const GO_TO_TOP_AFTER_Y = 220;

/**
 * Scroll-linked header chrome — driven on the native thread via `Animated.event`.
 * `chromeVisible`: 1 = fully expanded, 0 = fully collapsed.
 */
export function useScrollCompactHeader() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [goToTopVisible, setGoToTopVisible] = useState(false);
  const lastGoToTop = useRef(false);

  const chromeVisible = scrollY.interpolate({
    inputRange: [0, CHROME_FADE_START, CHROME_FADE_END],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const y = Math.max(0, e.nativeEvent.contentOffset.y);
          const showFab = y >= GO_TO_TOP_AFTER_Y;
          if (showFab !== lastGoToTop.current) {
            lastGoToTop.current = showFab;
            setGoToTopVisible(showFab);
          }
        },
      }),
    [scrollY]
  );

  const reset = useMemo(
    () => () => {
      scrollY.setValue(0);
      lastGoToTop.current = false;
      setGoToTopVisible(false);
    },
    [scrollY]
  );

  return {
    scrollY,
    chromeVisible,
    goToTopVisible,
    onScroll,
    resetCompactHeader: reset,
  };
}
