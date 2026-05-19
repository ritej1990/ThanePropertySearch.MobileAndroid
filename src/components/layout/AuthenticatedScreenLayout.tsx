import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProfileHeader } from './AppProfileHeader';
import { EmailVerificationReminder } from './EmailVerificationReminder';
import { FloatingSupportChat } from './FloatingSupportChat';
import { colors, spacing } from '../../theme';

type Props = {
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showFloatingActions?: boolean;
  floatingBottomOffset?: number;
};

/** Fixed header + scrollable body; Support/Chat float over content (no layout inset). */
export function AuthenticatedScreenLayout({
  children,
  showBack,
  onBack,
  showFloatingActions = true,
  floatingBottomOffset = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const floatBottom =
    Math.max(insets.bottom, spacing.sm) + spacing.sm + floatingBottomOffset;

  return (
    <View style={styles.screen}>
      <AppProfileHeader showBack={showBack} onBack={onBack} />
      <View style={styles.body}>{children}</View>
      <EmailVerificationReminder />
      {showFloatingActions ? (
        <View style={styles.floatingLayer} pointerEvents="box-none">
          <FloatingSupportChat bottomOffset={floatBottom} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    flex: 1,
  },
  /** Full-screen overlay; touches pass through except on FABs. */
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
});
