import { isValidOptionalGst, normalizeGst } from '../src/utils/gstNumber';
import {
  normalizeIndianMobile,
  formatIndianMobileInput,
} from '../src/utils/phoneNumber';
import {
  sanitizeUsername,
  buildUsernameCandidatesFromFullName,
} from '../src/utils/username';
import { normalizeAuthResponse } from '../src/utils/normalizeAuthResponse';
import {
  isAgentRole,
  isOwnerRole,
  isUserRole,
  isBuilderRole,
} from '../src/utils/roles';

describe('GST validation (registration)', () => {
  it('treats blank as valid (optional)', () => {
    expect(isValidOptionalGst('')).toBe(true);
    expect(isValidOptionalGst('   ')).toBe(true);
  });

  it('accepts a well-formed GSTIN regardless of case/spacing', () => {
    expect(isValidOptionalGst('27aapfu0939f1zv')).toBe(true);
    expect(isValidOptionalGst(' 27AAPFU0939F1ZV ')).toBe(true);
  });

  it('rejects malformed GSTIN', () => {
    expect(isValidOptionalGst('27AAPFU0939F1Z')).toBe(false); // too short
    expect(isValidOptionalGst('ABCDEFGHIJKLMNO')).toBe(false);
  });

  it('normalizes to upper, trimmed, no spaces', () => {
    expect(normalizeGst(' 27aapf u0939f1zv ')).toBe('27AAPFU0939F1ZV');
  });
});

describe('Indian mobile normalization (registration / contact)', () => {
  it('accepts a clean 10-digit mobile', () => {
    expect(normalizeIndianMobile('9876543210')).toBe('9876543210');
  });

  it('strips +91 / 91 country code', () => {
    expect(normalizeIndianMobile('+91 98765 43210')).toBe('9876543210');
    expect(normalizeIndianMobile('919876543210')).toBe('9876543210');
  });

  it('strips a leading 0', () => {
    expect(normalizeIndianMobile('09876543210')).toBe('9876543210');
  });

  it('rejects invalid leading digit or wrong length', () => {
    expect(normalizeIndianMobile('1234567890')).toBeNull(); // starts < 6
    expect(normalizeIndianMobile('98765')).toBeNull();
    expect(normalizeIndianMobile('')).toBeNull();
    expect(normalizeIndianMobile(null)).toBeNull();
  });

  it('caps live input at 10 digits and drops country/zero prefixes', () => {
    expect(formatIndianMobileInput('98765432109999')).toBe('9876543210');
    expect(formatIndianMobileInput('+91-98765 43210')).toBe('9876543210');
  });
});

describe('Username generation (registration)', () => {
  it('sanitizes to identity-safe chars', () => {
    expect(sanitizeUsername('  Ritesh Kumar! ')).toBe('ritesh.kumar');
    expect(sanitizeUsername('a@@@b')).toBe('ab');
    expect(sanitizeUsername('..dot..dot..')).toBe('dot.dot');
  });

  it('builds dedup candidates from full name (min length 3)', () => {
    const out = buildUsernameCandidatesFromFullName('Ritesh Kumar');
    expect(out).toContain('ritesh.kumar');
    expect(out).toContain('riteshkumar');
    expect(out).toContain('ritesh');
    // no duplicates
    expect(new Set(out).size).toBe(out.length);
  });

  it('returns [] for empty name', () => {
    expect(buildUsernameCandidatesFromFullName('   ')).toEqual([]);
  });
});

describe('Auth response normalization (login)', () => {
  it('accepts camelCase JSON', () => {
    const r = normalizeAuthResponse({
      token: 't',
      fullName: 'Ritesh',
      username: 'ritesh1990',
      email: 'r@x.com',
      role: 'Agent',
      userId: 'u1',
      emailConfirmed: true,
    });
    expect(r.role).toBe('Agent');
    expect(r.emailConfirmed).toBe(true);
  });

  it('accepts PascalCase JSON and defaults role to User', () => {
    const r = normalizeAuthResponse({ Token: 't', UserId: 'u2' });
    expect(r.token).toBe('t');
    expect(r.userId).toBe('u2');
    expect(r.role).toBe('User');
    expect(r.emailConfirmed).toBe(false);
  });

  it('survives null/garbage input', () => {
    const r = normalizeAuthResponse(null);
    expect(r.token).toBe('');
    expect(r.role).toBe('User');
  });
});

describe('Role guards', () => {
  it('matches case-insensitively and trims', () => {
    expect(isAgentRole(' Agent ')).toBe(true);
    expect(isOwnerRole('OWNER')).toBe(true);
    expect(isUserRole('user')).toBe(true);
    expect(isBuilderRole('Builder')).toBe(true);
  });
  it('rejects mismatches / nullish', () => {
    expect(isAgentRole('owner')).toBe(false);
    expect(isAgentRole(null)).toBe(false);
    expect(isOwnerRole(undefined)).toBe(false);
  });
});
