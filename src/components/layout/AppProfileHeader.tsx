import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useResendEmailVerification } from '../../hooks/useResendEmailVerification';
import { SignOutConfirmModal } from '../auth/SignOutConfirmModal';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import type { RootStackParamList } from '../../navigation/types';
import { AppNavMenu, type NavMenuTarget } from './AppNavMenu';
import { buildQuickNavItems } from './navMenuConfig';
import { propertiesApi } from '../../api/singleton';
import {
  getProfileFirstName,
  getProfileInitials,
  getRoleLabel,
} from '../../utils/profileDisplay';
import { colors, radius, spacing } from '../../theme';

type Props = {
  showBack?: boolean;
  onBack?: () => void;
};

function HeaderIconButton({
  icon,
  onPress,
  label,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.iconBtn}
      hitSlop={6}
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={colors.heroText} />
      {badge != null && badge > 0 ? (
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function AppProfileHeader({ showBack, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, logout } = useAuth();
  const { resend, sending, email, emailConfirmed } = useResendEmailVerification();
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);

  const firstName = getProfileFirstName(profile?.fullName);
  const initials = getProfileInitials(profile?.fullName);
  const quickNav = buildQuickNavItems(profile?.role);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await propertiesApi.getMyMessageCount();
      setUnreadChats(res.count ?? 0);
    } catch {
      setUnreadChats(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUnread();
    }, [refreshUnread])
  );

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
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'myPayments':
        navigation.navigate('MyPayments', undefined);
        break;
      case 'essentialPlan':
        navigation.navigate('EssentialService', undefined);
        break;
      case 'postProperty':
        navigation.navigate('PostProperty');
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

  const compact = showBack && onBack;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.navyDeep, '#152238', '#1a4d6e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          compact ? styles.gradientCompact : null,
          { paddingTop: insets.top + (compact ? 4 : spacing.xs) },
        ]}
      >
        <View style={styles.mainRow}>
          {compact ? (
            <Pressable
              onPress={onBack}
              style={styles.backBtn}
              hitSlop={8}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={colors.heroText} />
            </Pressable>
          ) : null}

          <Pressable
            style={styles.brandPress}
            onPress={() => handleMenuNavigate('home')}
            accessibilityLabel="Go to home"
          >
            <ThaneFlatsLogo size={compact ? 28 : 34} showWordmark onDark />
            {!compact ? (
              <Text style={styles.tagline}>Thane property search</Text>
            ) : null}
          </Pressable>

          <View style={styles.actions}>
            {!compact ? (
              <HeaderIconButton
                icon="chatbubbles-outline"
                label="My chats"
                badge={unreadChats}
                onPress={() => navigation.navigate('MyChats')}
              />
            ) : null}
            <HeaderIconButton
              icon="menu"
              label="Open menu"
              onPress={() => setMenuVisible(true)}
            />
            <Pressable
              onPress={() => setMenuVisible(true)}
              style={styles.avatarBtn}
              accessibilityLabel="Account menu"
            >
              <LinearGradient
                colors={[colors.teal, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {!compact ? (
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeHi}>Hi, {firstName}</Text>
              <View style={styles.welcomeMeta}>
                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{getRoleLabel(profile?.role)}</Text>
                </View>
                {emailConfirmed ? (
                  <View style={styles.verifiedChip}>
                    <Ionicons name="checkmark-circle" size={12} color="#6ee7b7" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        {!compact && quickNav.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickNav}
          >
            {quickNav.map((item) => (
              <Pressable
                key={item.key}
                style={styles.quickPill}
                onPress={() => handleMenuNavigate(item.key)}
              >
                <Ionicons name={item.icon} size={15} color={colors.heroText} />
                <Text style={styles.quickPillText}>{item.label}</Text>
                {item.key === 'myChats' && unreadChats > 0 ? (
                  <View style={styles.quickBadge}>
                    <Text style={styles.quickBadgeText}>
                      {unreadChats > 9 ? '9+' : unreadChats}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
            <Pressable
              style={[styles.quickPill, styles.quickPillMore]}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="grid-outline" size={15} color={colors.goldAccent} />
              <Text style={[styles.quickPillText, styles.quickPillMoreText]}>
                More
              </Text>
            </Pressable>
          </ScrollView>
        ) : null}
      </LinearGradient>

      {!emailConfirmed && email ? (
        <Pressable
          style={styles.emailBanner}
          onPress={resend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.goldAccent} />
          ) : (
            <Ionicons name="mail-unread" size={18} color={colors.goldAccent} />
          )}
          <View style={styles.emailBannerText}>
            <Text style={styles.emailBannerTitle} numberOfLines={1}>
              Verify your email
            </Text>
            <Text style={styles.emailBannerSub} numberOfLines={1}>
              {email} · Tap to resend
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.goldAccent} />
        </Pressable>
      ) : null}

      <AppNavMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={handleMenuNavigate}
        onSignOut={() => setSignOutVisible(true)}
        unreadChats={unreadChats}
      />

      <SignOutConfirmModal
        visible={signOutVisible}
        profile={profile}
        signingOut={signingOut}
        onCancel={() => !signingOut && setSignOutVisible(false)}
        onConfirm={handleSignOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 100,
    backgroundColor: colors.surface,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  gradientCompact: {
    paddingBottom: spacing.sm,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandPress: {
    flex: 1,
    minWidth: 0,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.65)',
    marginTop: 2,
    marginLeft: 42,
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.navyDeep,
  },
  iconBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.heroText,
  },
  avatarBtn: {
    marginLeft: 2,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.navyMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.heroText,
  },
  welcomeRow: {
    marginTop: spacing.md,
  },
  welcomeText: {
    gap: 6,
  },
  welcomeHi: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.3,
  },
  welcomeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  roleChip: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(13, 148, 136, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.4)',
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99f6e4',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6ee7b7',
  },
  quickNav: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.md,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickPillMore: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
    borderColor: 'rgba(252, 211, 77, 0.35)',
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.heroText,
  },
  quickPillMoreText: {
    color: colors.goldAccent,
  },
  quickBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  quickBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.heroText,
  },
  emailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  emailBannerText: {
    flex: 1,
    minWidth: 0,
  },
  emailBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
  },
  emailBannerSub: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
  },
});
