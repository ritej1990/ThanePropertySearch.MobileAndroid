import type { PolicyKind } from '../content/policies';

/** In-app policy document kinds (labels come from i18n). */
export const LEGAL_LINK_KINDS: PolicyKind[] = ['legal', 'privacy', 'terms', 'refund'];

export const LEGAL_COPYRIGHT_YEAR = new Date().getFullYear();
