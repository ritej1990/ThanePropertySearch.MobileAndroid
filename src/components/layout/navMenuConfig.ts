import { Ionicons } from '@expo/vector-icons';
import type { TranslateFn } from '../../i18n';
import { isBuilderRole, isOwnerRole, isUserRole, isAgentRole } from '../../utils/roles';
import { BUILDER_PORTAL_ENABLED } from '../../config/env';

type IconName = keyof typeof Ionicons.glyphMap;

export type NavMenuTarget =
  | 'home'
  | 'builders'
  | 'ownerDashboard'
  | 'builderDashboard'
  | 'myChats'
  | 'support'
  | 'profile'
  | 'myPayments'
  | 'essentialPlan'
  | 'postProperty'
  | 'agentDashboard'
  | 'agentPayments'
  | 'builderPayments'
  | 'aiAdvisor'
  | 'homeLoanAdvisor'
  | 'areaExplorer';

export type NavMenuItem = {
  key: NavMenuTarget;
  label: string;
  subtitle: string;
  icon: IconName;
  section: 'explore' | 'account' | 'support';
  accent: string;
  accentBg: string;
};

export type QuickNavItem = {
  key: NavMenuTarget;
  label: string;
  icon: IconName;
};

const MENU_COLORS = {
  teal: '#0d9488',
  tealSoft: '#ecfdf5',
  builder: '#7c3aed',
  builderSoft: '#f5f3ff',
  gold: '#c9a227',
  goldSoft: '#fffbeb',
  primary: '#2563eb',
  navy: '#0f172a',
  surfaceMuted: '#f8fafc',
};

export function buildNavMenuItems(
  role: string | null | undefined,
  t: TranslateFn
): NavMenuItem[] {
  const items: NavMenuItem[] = [
    {
      key: 'home',
      label: t('nav.propertySearch'),
      subtitle: t('nav.propertySearchSub'),
      icon: 'search',
      section: 'explore',
      accent: MENU_COLORS.teal,
      accentBg: MENU_COLORS.tealSoft,
    },
  ];

  if (BUILDER_PORTAL_ENABLED) {
    items.push({
      key: 'builders',
      label: t('nav.builderProjects'),
      subtitle: t('nav.builderProjectsSub'),
      icon: 'business',
      section: 'explore',
      accent: MENU_COLORS.builder,
      accentBg: MENU_COLORS.builderSoft,
    });
  }

  if (isOwnerRole(role)) {
    items.push(
      {
        key: 'ownerDashboard',
        label: t('nav.myListings'),
        subtitle: t('nav.myListingsSub'),
        icon: 'home',
        section: 'explore',
        accent: MENU_COLORS.teal,
        accentBg: MENU_COLORS.tealSoft,
      },
      {
        key: 'postProperty',
        label: t('nav.postProperty'),
        subtitle: t('nav.postPropertySub'),
        icon: 'add-circle',
        section: 'explore',
        accent: MENU_COLORS.gold,
        accentBg: MENU_COLORS.goldSoft,
      }
    );
  }

  if (isAgentRole(role)) {
    items.push(
      {
        key: 'agentDashboard',
        label: t('nav.agentDashboard'),
        subtitle: t('nav.agentDashboardSub'),
        icon: 'briefcase',
        section: 'explore',
        accent: MENU_COLORS.primary,
        accentBg: '#eff6ff',
      },
      {
        key: 'postProperty',
        label: t('nav.postListing'),
        subtitle: t('nav.postListingSub'),
        icon: 'add-circle',
        section: 'explore',
        accent: MENU_COLORS.gold,
        accentBg: MENU_COLORS.goldSoft,
      },
      {
        key: 'agentPayments',
        label: t('nav.agentPlans'),
        subtitle: t('nav.agentPlansSub'),
        icon: 'card',
        section: 'account',
        accent: MENU_COLORS.primary,
        accentBg: '#eff6ff',
      }
    );
  }

  if (BUILDER_PORTAL_ENABLED && isBuilderRole(role)) {
    items.push({
      key: 'builderDashboard',
      label: t('nav.builderDashboard'),
      subtitle: t('nav.builderDashboardSub'),
      icon: 'construct',
      section: 'explore',
      accent: MENU_COLORS.builder,
      accentBg: MENU_COLORS.builderSoft,
    });
    items.push({
      key: 'builderPayments',
      label: t('nav.builderPlans'),
      subtitle: t('nav.builderPlansSub'),
      icon: 'cloud-upload',
      section: 'account',
      accent: MENU_COLORS.builder,
      accentBg: MENU_COLORS.builderSoft,
    });
  } else if (!isOwnerRole(role) && !isAgentRole(role)) {
    items.push({
      key: 'ownerDashboard',
      label: t('nav.listYourProperty'),
      subtitle: t('nav.listYourPropertySub'),
      icon: 'home-outline',
      section: 'explore',
      accent: MENU_COLORS.teal,
      accentBg: MENU_COLORS.tealSoft,
    });
  }

  if (isUserRole(role)) {
    items.push({
      key: 'essentialPlan',
      label: t('nav.essentialPlan'),
      subtitle: t('nav.essentialPlanSub'),
      icon: 'flash',
      section: 'account',
      accent: MENU_COLORS.primary,
      accentBg: '#eff6ff',
    });
  }

  if (isUserRole(role) || isOwnerRole(role)) {
    items.push({
      key: 'aiAdvisor',
      label: t('nav.aiPropertyAdvisor'),
      subtitle: t('nav.aiPropertyAdvisorSub'),
      icon: 'sparkles',
      section: 'explore',
      accent: '#7c3aed',
      accentBg: '#f5f3ff',
    });
  }

  items.push(
    {
      key: 'areaExplorer',
      label: t('nav.aiAreaExplorer'),
      subtitle: t('nav.aiAreaExplorerSub'),
      icon: 'map',
      section: 'explore',
      accent: '#7c3aed',
      accentBg: '#f5f3ff',
    },
    {
      key: 'homeLoanAdvisor',
      label: t('nav.homeLoanAdvisor'),
      subtitle: t('nav.homeLoanAdvisorSub'),
      icon: 'cash',
      section: 'explore',
      accent: '#7c3aed',
      accentBg: '#f5f3ff',
    }
  );

  items.push({
    key: 'profile',
    label: t('nav.myProfile'),
    subtitle: t('nav.myProfileSub'),
    icon: 'person',
    section: 'account',
    accent: MENU_COLORS.navy,
    accentBg: MENU_COLORS.surfaceMuted,
  });

  if (!isOwnerRole(role)) {
    items.push({
      key: 'myPayments',
      label: t('nav.myPayments'),
      subtitle: t('nav.myPaymentsSub'),
      icon: 'receipt',
      section: 'account',
      accent: MENU_COLORS.primary,
      accentBg: '#eff6ff',
    });
  }

  if (isUserRole(role) || isOwnerRole(role)) {
    items.push({
      key: 'myChats',
      label: t('common.myChats'),
      subtitle: t('nav.myChatsSub'),
      icon: 'chatbubbles',
      section: 'account',
      accent: MENU_COLORS.primary,
      accentBg: '#eff6ff',
    });
  }

  items.push({
    key: 'support',
    label: t('nav.support'),
    subtitle: t('nav.supportSub'),
    icon: 'help-buoy',
    section: 'support',
    accent: MENU_COLORS.teal,
    accentBg: MENU_COLORS.tealSoft,
  });

  return items;
}

export function buildQuickNavItems(
  role: string | null | undefined,
  t: TranslateFn
): QuickNavItem[] {
  if (BUILDER_PORTAL_ENABLED && isBuilderRole(role)) {
    return [
      { key: 'builderDashboard', label: t('common.dashboard'), icon: 'grid' },
      { key: 'builders', label: t('common.builders'), icon: 'business' },
      { key: 'builderPayments', label: t('common.plans'), icon: 'card' },
    ];
  }
  if (isAgentRole(role)) {
    return [
      { key: 'agentDashboard', label: t('common.dashboard'), icon: 'briefcase' },
      { key: 'postProperty', label: t('common.post'), icon: 'add' },
      { key: 'agentPayments', label: t('common.plans'), icon: 'card' },
    ];
  }

  const quick: QuickNavItem[] = [{ key: 'home', label: t('common.search'), icon: 'search' }];
  if (BUILDER_PORTAL_ENABLED) {
    quick.push({ key: 'builders', label: t('common.builders'), icon: 'business' });
  }

  if (isOwnerRole(role)) {
    quick.push({ key: 'ownerDashboard', label: t('common.listings'), icon: 'home' });
    quick.push({ key: 'postProperty', label: t('common.post'), icon: 'add' });
  } else if (isUserRole(role)) {
    quick.push({ key: 'essentialPlan', label: t('common.plans'), icon: 'flash' });
  }

  quick.push({ key: 'myChats', label: t('common.chats'), icon: 'chatbubbles' });

  return quick;
}

export function buildQuickMenuKeys(role: string | null | undefined): NavMenuTarget[] {
  if (BUILDER_PORTAL_ENABLED && isBuilderRole(role)) {
    return ['builderDashboard', 'builders', 'builderPayments'];
  }
  if (isAgentRole(role)) {
    return ['agentDashboard', 'postProperty', 'agentPayments'];
  }
  if (isOwnerRole(role)) {
    return ['ownerDashboard', 'home', 'myChats'];
  }
  return BUILDER_PORTAL_ENABLED ? ['home', 'builders', 'myChats'] : ['home', 'myChats'];
}

export function quickMenuLabel(key: NavMenuTarget, t: TranslateFn): string {
  switch (key) {
    case 'home':
      return t('common.search');
    case 'builders':
      return t('common.projects');
    case 'builderDashboard':
      return t('common.dashboard');
    case 'builderPayments':
      return t('common.plans');
    case 'agentDashboard':
      return t('common.dashboard');
    case 'postProperty':
      return t('common.post');
    case 'agentPayments':
      return t('common.plans');
    case 'ownerDashboard':
      return t('common.listings');
    case 'myChats':
      return t('common.chats');
    case 'aiAdvisor':
      return t('common.aiAdvisor');
    case 'areaExplorer':
      return t('common.areaExplorer');
    case 'homeLoanAdvisor':
      return t('common.homeLoan');
    default:
      return t('common.open');
  }
}

export function navSectionLabel(
  section: NavMenuItem['section'],
  t: TranslateFn
): string {
  switch (section) {
    case 'explore':
      return t('nav.sectionExplore');
    case 'account':
      return t('nav.sectionAccount');
    case 'support':
      return t('nav.sectionSupport');
  }
}
