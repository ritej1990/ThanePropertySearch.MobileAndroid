import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Animated,
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
import { useTranslation } from '../../context/LocaleContext';
import { useResendEmailVerification } from '../../hooks/useResendEmailVerification';
import { useEmailVerifyBanner } from '../../hooks/useEmailVerifyBanner';
import { paymentsApi } from '../../api/singleton';
import type { EssentialStatus } from '../../api/paymentTypes';
import { EssentialUsageBar } from '../plans/EssentialUsageBar';
import {
  getPlanHeaderDisplay,
  planHeaderPalette,
} from '../../utils/planUsage';
import { isUserRole } from '../../utils/roles';
import { SignOutConfirmModal } from '../auth/SignOutConfirmModal';
import { ScrollRevealPanel } from '../ui/ScrollRevealPanel';
import { LanguageToggle } from '../ui/LanguageToggle';
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
  /** Slim header for home — logo row only; shortcuts live in search toolbar & menu */
  density?: 'default' | 'compact';
  /** Scroll-linked visibility 1 = expanded, 0 = collapsed. */
  chromeVisible?: Animated.Value | Animated.AnimatedInterpolation<number>;
  /** True when scroll has collapsed header extras. */
  chromeCollapsed?: boolean;
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

export function AppProfileHeader({
  showBack,
  onBack,
  density = 'default',
  chromeCollapsed = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, logout } = useAuth();
  const { t } = useTranslation();
  const { resend, sending, email, emailConfirmed } = useResendEmailVerification();
  const { visible: showEmailBanner, dismiss: dismissEmailBanner } = useEmailVerifyBanner(
    email,
    emailConfirmed ?? false
  );
  const [essentialStatus, setEssentialStatus] = useState<EssentialStatus | null>(null);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const firstName = getProfileFirstName(profile?.fullName);
  const initials = getProfileInitials(profile?.fullName);
  const quickNav = buildQuickNavItems(profile?.role, t);

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

  const refreshEssential = useCallback(async () => {
    if (!isUserRole(profile?.role)) {
      setEssentialStatus(null);
      return;
    }
    try {
      const status = await paymentsApi.getEssentialStatus();
      setEssentialStatus(status);
    } catch {
      setEssentialStatus(null);
    }
  }, [profile?.role]);

  useFocusEffect(
    useCallback(() => {
      void refreshEssential();
    }, [refreshEssential])
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
      case 'agentDashboard':
        navigation.navigate('AgentDashboard');
        break;
      case 'agentPayments':
        navigation.navigate('AgentPayments');
        break;
      case 'builderPayments':
        navigation.navigate('BuilderPayments');
        break;
      case 'aiAdvisor':
        navigation.navigate('AiAdvisor');
        break;
      case 'areaExplorer':
        navigation.navigate('AreaExplorer');
        break;
      case 'homeLoanAdvisor':
        navigation.navigate('HomeLoanAdvisor');
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

  const backMode = showBack && onBack;
  const slimHome = density === 'compact' && !backMode;
  const showPlanUsage =
    isUserRole(profile?.role) && essentialStatus && essentialStatus.usageMax > 0;

  const planHeader =
    showPlanUsage && essentialStatus ? getPlanHeaderDisplay(essentialStatus, t) : null;
  const planUsagePalette = planHeader ? planHeaderPalette(planHeader.tone) : null;

  const planPercentChip =
    planHeader && planUsagePalette ? (
      <Pressable
        style={[
          styles.planPctChip,
          slimHome && styles.planPctChipSlim,
          {
            backgroundColor: planUsagePalette.bg,
            borderColor: planUsagePalette.border,
          },
        ]}
        onPress={() => navigation.navigate('EssentialService', undefined)}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={planHeader.accessibilityLabel}
      >
        <Text
          style={[
            styles.planPctText,
            slimHome && styles.planPctTextSlim,
            { color: planUsagePalette.text },
          ]}
        >
          {planHeader.text}
        </Text>
      </Pressable>
    ) : null;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.navyDeep, '#152238', '#1a4d6e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          backMode || slimHome ? styles.gradientCompact : null,
          { paddingTop: insets.top + (backMode || slimHome ? 4 : spacing.xs) },
        ]}
      >
        <View style={styles.mainRow}>
          {backMode ? (
            <Pressable
              onPress={onBack}
              style={styles.backBtn}
              hitSlop={8}
              accessibilityLabel={t('common.goBack')}
            >
              <Ionicons name="arrow-back" size={20} color={colors.heroText} />
            </Pressable>
          ) : null}

          <Pressable
            style={styles.brandPress}
            onPress={() => handleMenuNavigate('home')}
            accessibilityLabel={t('common.goHome')}
          >
            <ThaneFlatsLogo
              size={slimHome ? 26 : backMode ? 28 : 34}
              showWordmark
              onDark
              trailing={planPercentChip}
            />
            {!backMode && !slimHome ? (
              <Text style={styles.tagline}>{t('header.tagline')}</Text>
            ) : null}
          </Pressable>

          <View style={styles.actions}>
            {!backMode ? (
              <LanguageToggle variant="header" compact={slimHome} />
            ) : null}
            {!backMode ? (
              <HeaderIconButton
                icon="chatbubbles-outline"
                label={t('common.myChats')}
                badge={unreadChats}
                onPress={() => navigation.navigate('MyChats')}
              />
            ) : null}
            <HeaderIconButton
              icon="menu"
              label={t('common.openMenu')}
              onPress={() => setMenuVisible(true)}
            />
            <Pressable
              onPress={() => setMenuVisible(true)}
              style={styles.avatarBtn}
              accessibilityLabel={t('common.accountMenu')}
            >
              <LinearGradient
                colors={[colors.teal, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.avatarRing, slimHome && styles.avatarRingSlim]}
              >
                <View style={styles.avatarInner}>
                  <Text style={[styles.avatarText, slimHome && styles.avatarTextSlim]}>
                    {initials}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {slimHome ? (
          <LinearGradient
            colors={[colors.gold, colors.teal, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.slimAccent}
          />
        ) : null}

        {showPlanUsage && !slimHome ? (
          <ScrollRevealPanel visible={!chromeCollapsed} maxHeight={62}>
            <EssentialUsageBar
              status={essentialStatus!}
              compact={slimHome || Boolean(backMode)}
              onPress={() => navigation.navigate('EssentialService', undefined)}
            />
          </ScrollRevealPanel>
        ) : null}

        {!backMode && !slimHome ? (
          <ScrollRevealPanel visible={!chromeCollapsed} maxHeight={88}>
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
          </ScrollRevealPanel>
        ) : null}

        {!backMode && !slimHome && quickNav.length > 0 ? (
          <ScrollRevealPanel visible={!chromeCollapsed} maxHeight={52}>
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
                  {t('common.more')}
                </Text>
              </Pressable>
            </ScrollView>
          </ScrollRevealPanel>
        ) : null}
      </LinearGradient>

      {showEmailBanner && email ? (
        <ScrollRevealPanel visible={!chromeCollapsed} maxHeight={56} collapseFromTop>
          <View style={styles.emailBanner}>
            <Pressable
              style={styles.emailBannerMain}
              onPress={resend}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel={t('header.resendEmail')}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.goldAccent} />
              ) : (
                <Ionicons name="mail-unread" size={18} color={colors.goldAccent} />
              )}
              <View style={styles.emailBannerText}>
                <Text style={styles.emailBannerTitle} numberOfLines={1}>
                  {t('header.verifyEmailTitle')}
                </Text>
                <Text style={styles.emailBannerSub} numberOfLines={1}>
                  {t('header.verifyEmailSub', { email })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.goldAccent} />
            </Pressable>
            <Pressable
              style={styles.emailBannerClose}
              onPress={() => void dismissEmailBanner()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('header.dismissVerifyEmail')}
            >
              <Ionicons name="close" size={18} color="#b45309" />
            </Pressable>
          </View>
        </ScrollRevealPanel>
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
  slimAccent: {
    height: 2,
    borderRadius: 1,
    marginTop: spacing.sm,
    opacity: 0.85,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 40,
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
  planPctChip: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  planPctChipSlim: {
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  planPctText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  planPctTextSlim: {
    fontSize: 10,
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
  avatarRingSlim: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  avatarTextSlim: {
    fontSize: 11,
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
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  emailBannerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    minWidth: 0,
  },
  emailBannerClose: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
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
