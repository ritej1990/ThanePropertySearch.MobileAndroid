import type { PolicyKind } from '../content/policies';

/** In-app policy documents (same content as website footer pages). */
export const LEGAL_LINKS: { label: string; kind: PolicyKind }[] = [
  { label: 'Legal', kind: 'legal' },
  { label: 'Privacy', kind: 'privacy' },
  { label: 'Terms', kind: 'terms' },
  { label: 'Refund Policy', kind: 'refund' },
];

export const LEGAL_COPYRIGHT_YEAR = new Date().getFullYear();
