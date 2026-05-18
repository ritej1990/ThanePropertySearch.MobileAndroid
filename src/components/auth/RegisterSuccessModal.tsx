import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { GradientButton } from '../ui/GradientButton';
import { colors, radius, spacing } from '../../theme';

type Props = {
  visible: boolean;
  message: string;
  email?: string;
  onSignIn: () => void;
};

export function RegisterSuccessModal({
  visible,
  message,
  email,
  onSignIn,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#0f766e', '#0c4a6e', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.checkRing}>
              <Ionicons name="checkmark-circle" size={48} color="#6ee7b7" />
            </View>
          </LinearGradient>

          <View style={styles.body}>
            <ThaneFlatsLogo size={28} />
            <Text style={styles.title}>You're all set!</Text>
            <Text style={styles.message}>{message}</Text>
            {email ? (
              <View style={styles.emailBox}>
                <Ionicons name="mail-unread" size={18} color={colors.gold} />
                <Text style={styles.emailText} numberOfLines={1}>
                  Verify {email} before signing in
                </Text>
              </View>
            ) : null}
            <GradientButton label="Go to sign in" onPress={onSignIn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 15, 28, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  checkRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.sm,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.slateLight,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: spacing.md,
  },
  emailText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
});
