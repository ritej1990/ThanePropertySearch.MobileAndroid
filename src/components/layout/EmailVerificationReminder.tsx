import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  markEmailVerificationToastShown,
  wasEmailVerificationToastShown,
} from '../../utils/emailVerificationSession';

export { resetEmailVerificationToastSession } from '../../utils/emailVerificationSession';

const VERIFY_TOAST_MESSAGE =
  'Welcome! Please verify your email now. Tap your email in the top menu to resend the link.';

/** Shows a one-time toast when the user is signed in but email is not verified (matches web). */
export function EmailVerificationReminder() {
  const { token, profile, ready, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const shownRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (token) void refreshProfile();
    }, [token, refreshProfile])
  );

  useEffect(() => {
    if (!ready || !token || !profile) return;
    if (profile.emailConfirmed) return;
    if (wasEmailVerificationToastShown() || shownRef.current) return;

    markEmailVerificationToastShown();
    shownRef.current = true;
    showToast({
      message: VERIFY_TOAST_MESSAGE,
      variant: 'email',
      durationMs: 10000,
    });
  }, [ready, token, profile, showToast]);

  return null;
}
