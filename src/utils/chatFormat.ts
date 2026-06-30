import type { AppLocale } from '../i18n/types';
import { localeToCulture } from '../i18n/types';
import type { TranslateFn } from '../i18n';

export function formatChatTime(iso: string, locale: AppLocale): string {
  try {
    return new Date(iso).toLocaleTimeString(localeToCulture(locale), {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function formatChatDayLabel(
  iso: string,
  locale: AppLocale,
  t: TranslateFn
): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round(
      (startOfToday.getTime() - startOfDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays === 0) return t('propertyChat.today');
    if (diffDays === 1) return t('propertyChat.yesterday');

    return date.toLocaleDateString(localeToCulture(locale), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

export function formatRelativeActivity(
  iso: string,
  locale: AppLocale,
  t: TranslateFn
): string {
  try {
    const date = new Date(iso);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return t('chats.justNow');
    if (diffMins < 60) return t('chats.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('chats.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('chats.daysAgo', { count: diffDays });

    return date.toLocaleDateString(localeToCulture(locale), {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

export function sameChatDay(a: string, b: string): boolean {
  try {
    const da = new Date(a);
    const db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear()
      && da.getMonth() === db.getMonth()
      && da.getDate() === db.getDate()
    );
  } catch {
    return false;
  }
}

export function threadActivityIso(thread: {
  lastActivityAtUtc?: string;
  createdAtUtc: string;
}): string {
  return thread.lastActivityAtUtc ?? thread.createdAtUtc;
}
