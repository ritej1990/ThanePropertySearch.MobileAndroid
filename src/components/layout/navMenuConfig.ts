import { Ionicons } from '@expo/vector-icons';
import { isBuilderRole, isOwnerRole, isUserRole } from '../../utils/roles';

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
  | 'postProperty';

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

export function buildNavMenuItems(role: string | null | undefined): NavMenuItem[] {
  const items: NavMenuItem[] = [
    {
      key: 'home',
      label: 'Property search',
      subtitle: 'Buy, rent & resale in Thane',
      icon: 'search',
      section: 'explore',
      accent: MENU_COLORS.teal,
      accentBg: MENU_COLORS.tealSoft,
    },
    {
      key: 'builders',
      label: 'Builder projects',
      subtitle: 'New developments & towers',
      icon: 'business',
      section: 'explore',
      accent: MENU_COLORS.builder,
      accentBg: MENU_COLORS.builderSoft,
    },
  ];

  if (isOwnerRole(role)) {
    items.push(
      {
        key: 'ownerDashboard',
        label: 'My listings',
        subtitle: 'Dashboard & inquiries',
        icon: 'home',
        section: 'explore',
        accent: MENU_COLORS.teal,
        accentBg: MENU_COLORS.tealSoft,
      },
      {
        key: 'postProperty',
        label: 'Post property',
        subtitle: 'Rent, sale, or PG listing',
        icon: 'add-circle',
        section: 'explore',
        accent: MENU_COLORS.gold,
        accentBg: MENU_COLORS.goldSoft,
      }
    );
  }

  if (isBuilderRole(role)) {
    items.push({
      key: 'builderDashboard',
      label: 'Builder dashboard',
      subtitle: 'Projects, leads & units',
      icon: 'construct',
      section: 'explore',
      accent: MENU_COLORS.builder,
      accentBg: MENU_COLORS.builderSoft,
    });
  } else if (!isOwnerRole(role)) {
    items.push({
      key: 'ownerDashboard',
      label: 'List your property',
      subtitle: 'Owner dashboard',
      icon: 'home-outline',
      section: 'explore',
      accent: MENU_COLORS.teal,
      accentBg: MENU_COLORS.tealSoft,
    });
  }

  if (isUserRole(role)) {
    items.push({
      key: 'essentialPlan',
      label: 'Essential plan',
      subtitle: 'Chat & formal requests',
      icon: 'flash',
      section: 'account',
      accent: MENU_COLORS.primary,
      accentBg: '#eff6ff',
    });
  }

  items.push(
    {
      key: 'profile',
      label: 'My profile',
      subtitle: 'Account & contact details',
      icon: 'person',
      section: 'account',
      accent: MENU_COLORS.navy,
      accentBg: MENU_COLORS.surfaceMuted,
    },
    {
      key: 'myPayments',
      label: 'My payments',
      subtitle: 'Plans & transaction history',
      icon: 'receipt',
      section: 'account',
      accent: MENU_COLORS.primary,
      accentBg: '#eff6ff',
    }
  );

  if (isUserRole(role) || isOwnerRole(role)) {
    items.push({
      key: 'myChats',
      label: 'My chats',
      subtitle: 'Negotiations with owners',
      icon: 'chatbubbles',
      section: 'account',
      accent: MENU_COLORS.primary,
      accentBg: '#eff6ff',
    });
  }

  items.push({
    key: 'support',
    label: 'Support',
    subtitle: 'Help desk & tickets',
    icon: 'help-buoy',
    section: 'support',
    accent: MENU_COLORS.teal,
    accentBg: MENU_COLORS.tealSoft,
  });

  return items;
}

export function buildQuickNavItems(role: string | null | undefined): QuickNavItem[] {
  const quick: QuickNavItem[] = [
    { key: 'home', label: 'Search', icon: 'search' },
    { key: 'builders', label: 'Builders', icon: 'business' },
  ];

  if (isOwnerRole(role)) {
    quick.push({ key: 'ownerDashboard', label: 'Listings', icon: 'home' });
    quick.push({ key: 'postProperty', label: 'Post', icon: 'add' });
  } else if (isBuilderRole(role)) {
    quick.push({ key: 'builderDashboard', label: 'Dashboard', icon: 'grid' });
  } else if (isUserRole(role)) {
    quick.push({ key: 'essentialPlan', label: 'Plans', icon: 'flash' });
  }

  quick.push({ key: 'myChats', label: 'Chats', icon: 'chatbubbles' });

  return quick;
}
