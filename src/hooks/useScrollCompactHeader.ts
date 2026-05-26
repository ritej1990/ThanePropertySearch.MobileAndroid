import { useCallback, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const SHOW_AFTER_Y = 72;
const HIDE_NEAR_TOP_Y = 40;
const GO_TO_TOP_AFTER_Y = 220;
const SCROLL_DELTA = 6;

/** Show compact bar when user scrolls down the list; hide near top or when scrolling up. */
export function useScrollCompactHeader() {
  const [visible, setVisible] = useState(false);
  const [goToTopVisible, setGoToTopVisible] = useState(false);
  const lastY = useRef(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const delta = y - lastY.current;

    if (y <= HIDE_NEAR_TOP_Y) {
      setVisible(false);
      setGoToTopVisible(false);
    } else if (delta > SCROLL_DELTA && y > SHOW_AFTER_Y) {
      setVisible(true);
    } else if (delta < -SCROLL_DELTA && y < SHOW_AFTER_Y + 48) {
      setVisible(false);
    }

    if (y >= GO_TO_TOP_AFTER_Y) {
      setGoToTopVisible(true);
    } else if (y <= HIDE_NEAR_TOP_Y) {
      setGoToTopVisible(false);
    }

    lastY.current = y;
  }, []);

  function reset() {
    setVisible(false);
    setGoToTopVisible(false);
    lastY.current = 0;
  }

  return {
    compactHeaderVisible: visible,
    goToTopVisible,
    onScroll,
    resetCompactHeader: reset,
  };
}
