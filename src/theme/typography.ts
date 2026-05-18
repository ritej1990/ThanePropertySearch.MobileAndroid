export const typography = {
  heroTitle: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
  heroLead: { fontSize: 14, lineHeight: 22 },
  cardTitle: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2.2,
    textTransform: 'uppercase' as const,
  },
  label: { fontSize: 13, fontWeight: '600' as const },
  body: { fontSize: 16 },
  button: { fontSize: 16, fontWeight: '700' as const },
  link: { fontSize: 15, fontWeight: '600' as const },
  feature: { fontSize: 13, lineHeight: 19 },
} as const;
