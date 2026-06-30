import type { TranslateFn } from '../i18n';
import { isAgentRole, isBuilderRole, isOwnerRole } from './roles';

export function getProfileInitials(fullName?: string | null): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return 'TF';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function getProfileFirstName(fullName?: string | null): string {
  return fullName?.trim().split(/\s+/)[0] ?? 'there';
}

export function getRoleLabel(role?: string | null, t?: TranslateFn): string {
  if (t) {
    if (isOwnerRole(role)) return t('roles.owner');
    if (isBuilderRole(role)) return t('roles.builder');
    if (isAgentRole(role)) return t('roles.agent');
    return t('roles.user');
  }
  if (isOwnerRole(role)) return 'Owner';
  if (isBuilderRole(role)) return 'Builder';
  if (isAgentRole(role)) return 'Agent';
  return 'User';
}
