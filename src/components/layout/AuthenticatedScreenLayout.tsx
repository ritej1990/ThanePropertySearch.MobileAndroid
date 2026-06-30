import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthenticatedScrollProvider, useAuthenticatedScroll } from '../../context/AuthenticatedScrollContext';
import { AppProfileHeader } from './AppProfileHeader';
import { EmailVerificationReminder } from './EmailVerificationReminder';
import {
  FloatingSupportChat,
  type ScrollToTopAction,
} from './FloatingSupportChat';
import { LegalFooter } from './LegalFooter';
import { colors, spacing } from '../../theme';

type Props = {
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  headerDensity?: 'default' | 'compact';
  showFloatingActions?: boolean;
  floatingBottomOffset?: number;
  /** Extra padding from the right edge for the FAB stack (e.g. above a sticky action bar). */
  floatingRightInset?: number;
  showLegalFooter?: boolean;
  scrollToTop?: ScrollToTopAction;
};

function AuthenticatedScreenLayoutInner({
  children,
  showBack,
  onBack,
  headerDensity = 'default',
  showFloatingActions = true,
  floatingBottomOffset = 0,
  floatingRightInset = 0,
  showLegalFooter = true,
  scrollToTop: scrollToTopProp,
}: Props) {
  const insets = useSafeAreaInsets();
  const { chromeVisible, chromeCollapsed, scrollToTop: scrollToTopCtx } =
    useAuthenticatedScroll();
  const scrollToTop = scrollToTopProp ?? scrollToTopCtx;
  const legalFooterInset = showLegalFooter ? 52 : 0;
  const floatBottom =
    Math.max(insets.bottom, spacing.sm) +
    spacing.sm +
    floatingBottomOffset +
    legalFooterInset;

  return (
    <View style={styles.screen}>
      <AppProfileHeader
        showBack={showBack}
        onBack={onBack}
        density={headerDensity}
        chromeVisible={chromeVisible}
        chromeCollapsed={chromeCollapsed}
      />
      <View style={styles.body}>{children}</View>
      {showLegalFooter ? <LegalFooter variant="onLight" /> : null}
      <EmailVerificationReminder />
      {showFloatingActions ? (
        <View style={styles.floatingLayer} pointerEvents="box-none">
          <FloatingSupportChat
            bottomOffset={floatBottom}
            rightInset={floatingRightInset}
            scrollToTop={scrollToTop}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Fixed header + scrollable body; Support/Chat float over content (no layout inset). */
export function AuthenticatedScreenLayout(props: Props) {
  return (
    <AuthenticatedScrollProvider>
      <AuthenticatedScreenLayoutInner {...props} />
    </AuthenticatedScrollProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  body: {
    flex: 1,
  },
  /** Full-screen overlay; FABs align bottom-right via flex. */
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
