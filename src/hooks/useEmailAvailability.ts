import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '../api/singleton';

export type EmailAvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

type State = {
  status: EmailAvailabilityStatus;
  message: string;
};

const DEBOUNCE_MS = 450;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEmailAvailability(email: string) {
  const [state, setState] = useState<State>({ status: 'idle', message: '' });
  const requestId = useRef(0);

  const runCheck = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setState({
        status: 'idle',
        message: trimmed.length > 0 ? 'Enter a valid email address' : '',
      });
      return;
    }

    const id = ++requestId.current;
    setState({ status: 'checking', message: 'Checking email…' });

    try {
      const res = await authApi.checkEmail(trimmed);
      if (id !== requestId.current) return;

      if (res.exists) {
        setState({ status: 'taken', message: res.message || 'Email is already registered' });
      } else {
        setState({ status: 'available', message: res.message || 'Email is available' });
      }
    } catch {
      if (id !== requestId.current) return;
      setState({ status: 'error', message: 'Unable to check email right now' });
    }
  }, []);

  useEffect(() => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setState({
        status: 'idle',
        message: trimmed.length > 0 ? 'Enter a valid email address' : '',
      });
      return;
    }

    const timer = setTimeout(() => {
      runCheck(trimmed);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [email, runCheck]);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState({ status: 'idle', message: '' });
  }, []);

  const isAvailable = state.status === 'available';

  return {
    ...state,
    isAvailable,
    checkNow: runCheck,
    reset,
  };
}
