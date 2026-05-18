import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { authApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useResendEmailVerification() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);

  const resend = useCallback(async () => {
    if (!profile?.email) {
      Alert.alert('Email missing', 'No email on your account.');
      return;
    }
    if (profile.emailConfirmed) {
      showToast({
        message: 'Your email is already verified.',
        variant: 'success',
        durationMs: 5000,
      });
      return;
    }

    setSending(true);
    try {
      const res = await authApi.resendVerification();
      showToast({
        message: res.message ?? 'Verification email sent. Check your inbox.',
        variant: 'email',
        durationMs: 8000,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Could not send verification email.';
      showToast({ message: msg, variant: 'error', durationMs: 8000 });
    } finally {
      setSending(false);
    }
  }, [profile, showToast]);

  return { resend, sending, email: profile?.email, emailConfirmed: profile?.emailConfirmed };
}
