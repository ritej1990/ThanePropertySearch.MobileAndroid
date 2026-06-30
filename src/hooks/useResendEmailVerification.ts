import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { authApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LocaleContext';
import { useToast } from '../context/ToastContext';

export function useResendEmailVerification() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);

  const resend = useCallback(async () => {
    if (!profile?.email) {
      Alert.alert(t('header.emailMissing'), t('header.emailMissingBody'));
      return;
    }
    if (profile.emailConfirmed) {
      showToast({
        message: t('header.emailAlreadyVerified'),
        variant: 'success',
        durationMs: 5000,
      });
      return;
    }

    setSending(true);
    try {
      const res = await authApi.resendVerification();
      showToast({
        message: res.message ?? t('header.verificationEmailSent'),
        variant: 'email',
        durationMs: 8000,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : t('header.couldNotSendVerification');
      showToast({ message: msg, variant: 'error', durationMs: 8000 });
    } finally {
      setSending(false);
    }
  }, [profile, showToast, t]);

  return { resend, sending, email: profile?.email, emailConfirmed: profile?.emailConfirmed };
}
