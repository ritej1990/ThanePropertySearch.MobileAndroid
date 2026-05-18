import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import {
  getProfileInitials,
  getRoleLabel,
} from '../../utils/profileDisplay';
import { colors, gradients, radius, spacing } from '../../theme';

type ProfileInfo = {
  fullName?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
};

type Props = {
  visible: boolean;
  profile: ProfileInfo | null;
  signingOut?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SignOutConfirmModal({
  visible,
  profile,
  signingOut,
  onCancel,
  onConfirm,
}: Props) {
  const displayName =
    profile?.fullName?.trim() || profile?.username?.trim() || 'Signed in';
  const initials = getProfileInitials(profile?.fullName);
  const roleLabel = getRoleLabel(profile?.role);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={signingOut ? undefined : onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={signingOut ? undefined : onCancel}
          accessibilityLabel="Dismiss"
        />

        <View style={styles.cardWrap} pointerEvents="box-none">
          <View style={styles.card}>
            <LinearGradient
              colors={['#1e3a5f', '#0f766e', '#0c1829']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHero}
            >
              <View style={styles.iconRing}>
                <Ionicons name="log-out-outline" size={28} color={colors.heroText} />
              </View>
            </LinearGradient>

            <View style={styles.body}>
              <ThaneFlatsLogo size={28} />
              <Text style={styles.title}>Sign out?</Text>
              <Text style={styles.subtitle}>
                You will need to sign in again to browse listings, chat with owners,
                and manage your plans.
              </Text>

              <View style={styles.profileChip}>
                <LinearGradient
                  colors={[...gradients.goldBadge]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>
                <View style={styles.profileText}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {profile?.email ? (
                    <Text style={styles.profileEmail} numberOfLines={1}>
                      {profile.email}
                    </Text>
                  ) : null}
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{roleLabel}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={[styles.stayBtn, signingOut && styles.btnDisabled]}
                  onPress={onCancel}
                  disabled={signingOut}
                >
                  <Ionicons name="shield-checkmark" size={18} color="#0f766e" />
                  <Text style={styles.stayBtnText}>Stay signed in</Text>
                </Pressable>

                <Pressable
                  style={[styles.signOutBtn, signingOut && styles.btnDisabled]}
                  onPress={onConfirm}
                  disabled={signingOut}
                >
                  <LinearGradient
                    colors={['#dc2626', '#b91c1c', '#991b1b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.signOutGradient}
                  >
                    {signingOut ? (
                      <ActivityIndicator color={colors.heroText} size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="log-out"
                          size={18}
                          color={colors.heroText}
                        />
                        <Text style={styles.signOutText}>Sign out</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 15, 28, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  cardHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.md,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.slateMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navyDeep,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  stayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#6ee7b7',
  },
  stayBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f766e',
  },
  signOutBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.heroText,
  },
  btnDisabled: {
    opacity: 0.65,
  },
});
