import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useResendEmailVerification } from '../../hooks/useResendEmailVerification';
import { SignOutConfirmModal } from '../auth/SignOutConfirmModal';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import type { RootStackParamList } from '../../navigation/types';
import { AppNavMenu, type NavMenuTarget } from './AppNavMenu';
import { colors, gradients, radius, spacing } from '../../theme';

type Props = {
  showBack?: boolean;
  onBack?: () => void;
};

export function AppProfileHeader({ showBack, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, logout } = useAuth();
  const { resend, sending, email, emailConfirmed } = useResendEmailVerification();
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const displayName = profile?.fullName?.trim() || profile?.username || 'Signed in';

  function handleMenuNavigate(target: NavMenuTarget) {
    switch (target) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'builders':
        navigation.navigate('BuilderProjects');
        break;
      case 'ownerDashboard':
        navigation.navigate('OwnerDashboard');
        break;
      case 'builderDashboard':
        navigation.navigate('BuilderDashboard');
        break;
      case 'myChats':
        navigation.navigate('MyChats');
        break;
      case 'support':
        navigation.navigate('SupportTickets');
        break;
      default:
        break;
    }
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      setSignOutVisible(false);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <LinearGradient
      colors={[...gradients.hero]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, { paddingTop: insets.top + spacing.xs }]}
    >
      <View style={styles.row}>
        {showBack && onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.heroText} />
          </Pressable>
        ) : null}

        <View style={styles.brandBlock}>
          <ThaneFlatsLogo size={32} showWordmark onDark />
        </View>

        {emailConfirmed ? (
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
        ) : null}

        <Pressable
          onPress={() => setMenuVisible(true)}
          style={styles.menuBtn}
          hitSlop={8}
          accessibilityLabel="Open menu"
        >
          <Ionicons name="menu" size={22} color={colors.heroText} />
        </Pressable>

        <Pressable
          onPress={() => setSignOutVisible(true)}
          style={styles.logoutBtn}
          hitSlop={8}
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.heroText} />
        </Pressable>
      </View>

      <AppNavMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={handleMenuNavigate}
      />

      <SignOutConfirmModal
        visible={signOutVisible}
        profile={profile}
        signingOut={signingOut}
        onCancel={() => !signingOut && setSignOutVisible(false)}
        onConfirm={handleSignOut}
      />

      {!emailConfirmed && email ? (
        <Pressable
          style={styles.emailPill}
          onPress={resend}
          disabled={sending}
          accessibilityLabel="Resend verification email"
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fcd34d" />
          ) : (
            <Ionicons name="mail-unread" size={18} color="#fcd34d" />
          )}
          <View style={styles.emailTextCol}>
            <Text style={styles.emailAddress} numberOfLines={1}>
              {email}
            </Text>
            <Text style={styles.emailStatus}>Not verified · Tap to resend link</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(248,250,252,0.6)" />
        </Pressable>
      ) : emailConfirmed && email ? (
        <View style={styles.emailVerified}>
          <Ionicons name="mail-open" size={14} color="#6ee7b7" />
          <Text style={styles.emailVerifiedText} numberOfLines={1}>
            {email} · Verified
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 40,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.xs,
  },
  brandBlock: {
    flexShrink: 0,
    flex: 1,
    minWidth: 0,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.88)',
    textAlign: 'right',
    paddingHorizontal: spacing.xs,
  },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.45)',
  },
  emailTextCol: {
    flex: 1,
    minWidth: 0,
  },
  emailAddress: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.heroText,
  },
  emailStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fcd34d',
    marginTop: 2,
  },
  emailVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  emailVerifiedText: {
    flex: 1,
    fontSize: 10,
    color: 'rgba(248, 250, 252, 0.75)',
  },
});
