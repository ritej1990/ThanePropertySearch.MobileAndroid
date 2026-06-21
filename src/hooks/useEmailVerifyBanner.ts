import { useCallback, useEffect, useState } from 'react';
import {
  dismissEmailVerifyBanner,
  isEmailVerifyBannerDismissed,
} from '../storage/emailBannerStorage';

/** Whether the header "Verify your email" strip is hidden for this address. */
export function useEmailVerifyBanner(email: string | null | undefined, emailConfirmed: boolean) {
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (emailConfirmed || !email?.trim()) {
      setDismissed(false);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    setLoaded(false);
    void (async () => {
      const hidden = await isEmailVerifyBannerDismissed(email);
      if (!cancelled) {
        setDismissed(hidden);
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, emailConfirmed]);

  const dismiss = useCallback(async () => {
    if (!email?.trim()) return;
    setDismissed(true);
    await dismissEmailVerifyBanner(email);
  }, [email]);

  const visible = loaded && !emailConfirmed && Boolean(email?.trim()) && !dismissed;

  return { visible, dismiss };
}
