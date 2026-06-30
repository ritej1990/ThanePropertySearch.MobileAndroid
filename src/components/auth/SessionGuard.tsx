import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { ApiError } from '../../api/client';
import { usersApi } from '../../api/singleton';
import { notifySessionExpired, onSessionExpired } from '../../auth/sessionManager';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

/**
 * Clears auth state and shows a toast when the API reports an expired session.
 * Navigation falls back to Login via AppNavigator when token becomes null.
 */
export function SessionGuard() {
  const { logout, token, ready } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    return onSessionExpired(() => {
      void (async () => {
        await logout();
        showToast({
          message: SESSION_EXPIRED_MESSAGE,
          variant: 'error',
          durationMs: 12000,
        });
      })();
    });
  }, [logout, showToast]);

  useEffect(() => {
    if (!ready || !token) return;

    let cancelled = false;

    const validateSession = async () => {
      try {
        await usersApi.getMe();
      } catch (e) {
        if (!cancelled && e instanceof ApiError && e.status === 401) {
          notifySessionExpired();
        }
      }
    };

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        void validateSession();
      }
    };

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [ready, token]);

  return null;
}
