import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ScrollToTopAction } from '../components/layout/FloatingSupportChat';
import { useScrollCompactHeader } from '../hooks/useScrollCompactHeader';

type ScrollChrome = ReturnType<typeof useScrollCompactHeader>;

type AuthenticatedScrollContextValue = ScrollChrome & {
  scrollToTop: ScrollToTopAction | undefined;
  setScrollToTop: (action: ScrollToTopAction | undefined) => void;
};

const AuthenticatedScrollContext = createContext<AuthenticatedScrollContextValue | null>(
  null
);

export function AuthenticatedScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollChrome = useScrollCompactHeader();
  const [scrollToTop, setScrollToTop] = useState<ScrollToTopAction | undefined>();

  const value = useMemo(
    () => ({
      ...scrollChrome,
      scrollToTop,
      setScrollToTop,
    }),
    [
      scrollChrome.scrollY,
      scrollChrome.chromeVisible,
      scrollChrome.goToTopVisible,
      scrollChrome.onScroll,
      scrollChrome.resetCompactHeader,
      scrollToTop,
    ]
  );

  return (
    <AuthenticatedScrollContext.Provider value={value}>
      {children}
    </AuthenticatedScrollContext.Provider>
  );
}

export function useAuthenticatedScroll() {
  const ctx = useContext(AuthenticatedScrollContext);
  if (!ctx) {
    throw new Error('useAuthenticatedScroll must be used within AuthenticatedScrollProvider');
  }
  return ctx;
}

/** Register floating “scroll to top” from screen content (layout reads this). */
export function useRegisterScrollToTop(action: ScrollToTopAction | undefined) {
  const { setScrollToTop } = useAuthenticatedScroll();

  const onPress = action?.onPress;
  const visible = action?.visible ?? false;

  const stableOnPress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  React.useEffect(() => {
    if (!visible || !onPress) {
      setScrollToTop(undefined);
      return () => setScrollToTop(undefined);
    }
    setScrollToTop({ visible: true, onPress: stableOnPress });
    return () => setScrollToTop(undefined);
  }, [visible, onPress, stableOnPress, setScrollToTop]);
}
