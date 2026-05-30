import { useCallback, useEffect, useState } from 'react';
import {
  useAuthenticatedScroll,
  useRegisterScrollToTop,
} from '../context/AuthenticatedScrollContext';
type ScrollHostLike = {
  scrollToOffset?: (params: { offset: number; animated?: boolean }) => void;
  scrollTo?: (params: { y: number; animated?: boolean }) => void;
};

type Options = {
  scrollRef?: React.RefObject<ScrollHostLike | null>;
  enableScrollToTop?: boolean;
  scrollToTopActive?: boolean;
  collapseEnabled?: boolean;
};

/** Shared scroll-linked chrome + scroll-to-top for list screens. */
export function useListScrollChrome(options: Options = {}) {
  const {
    scrollY,
    chromeVisible,
    goToTopVisible,
    onScroll,
    resetCompactHeader,
  } = useAuthenticatedScroll();

  const collapseEnabled = options.collapseEnabled !== false;

  useEffect(() => {
    if (!collapseEnabled) {
      resetCompactHeader();
    }
  }, [collapseEnabled, resetCompactHeader]);

  const scrollToTop = useCallback(() => {
    const host = options.scrollRef?.current;
    if (host?.scrollToOffset) {
      host.scrollToOffset({ offset: 0, animated: true });
    } else if (host?.scrollTo) {
      host.scrollTo({ y: 0, animated: true });
    }
    resetCompactHeader();
  }, [options.scrollRef, resetCompactHeader]);

  const fabActive =
    collapseEnabled &&
    options.scrollToTopActive !== false &&
    options.enableScrollToTop !== false;

  useRegisterScrollToTop(
    fabActive && goToTopVisible ? { visible: true, onPress: scrollToTop } : undefined
  );

  return {
    scrollY,
    chromeVisible,
    toolbarCollapsed: false,
    headerExpanded: true,
    goToTopVisible: collapseEnabled ? goToTopVisible : false,
    /** Pass through native Animated.event handler — do not wrap in a plain function. */
    onScroll: collapseEnabled ? onScroll : undefined,
    scrollToTop,
    resetCompactHeader,
  };
}

/** True when list content exceeds the viewport enough to allow header collapse. */
export function useScrollCollapseEligibility(threshold = 120) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const canCollapse =
    viewportHeight > 0 && contentHeight > viewportHeight + threshold;

  const bindScrollMetrics = {
    onLayout: (e: { nativeEvent: { layout: { height: number } } }) => {
      setViewportHeight(e.nativeEvent.layout.height);
    },
    onContentSizeChange: (_width: number, height: number) => {
      setContentHeight(height);
    },
  };

  return { canCollapse, bindScrollMetrics };
}
