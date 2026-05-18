import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '../api/singleton';

export type UsernameAvailabilityStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'error';

type State = {
  status: UsernameAvailabilityStatus;
  message: string;
  suggestions: string[];
};

const DEBOUNCE_MS = 450;
const MIN_LENGTH = 3;

export function useUsernameAvailability(username: string) {
  const [state, setState] = useState<State>({
    status: 'idle',
    message: '',
    suggestions: [],
  });
  const requestId = useRef(0);

  const runCheck = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < MIN_LENGTH) {
      setState({
        status: 'idle',
        message:
          trimmed.length > 0
            ? `Username must be at least ${MIN_LENGTH} characters`
            : '',
        suggestions: [],
      });
      return;
    }

    const id = ++requestId.current;
    setState((s) => ({
      ...s,
      status: 'checking',
      message: 'Checking username…',
      suggestions: [],
    }));

    try {
      const res = await authApi.checkUsername(trimmed);
      if (id !== requestId.current) return;

      if (res.exists) {
        setState({
          status: 'taken',
          message: res.message || 'Username is already taken',
          suggestions: res.suggestions ?? [],
        });
      } else {
        setState({
          status: 'available',
          message: res.message || 'Username is available',
          suggestions: [],
        });
      }
    } catch {
      if (id !== requestId.current) return;
      setState({
        status: 'error',
        message: 'Unable to check username right now',
        suggestions: [],
      });
    }
  }, []);

  useEffect(() => {
    const trimmed = username.trim();
    if (trimmed.length < MIN_LENGTH) {
      setState({
        status: 'idle',
        message:
          trimmed.length > 0
            ? `Username must be at least ${MIN_LENGTH} characters`
            : '',
        suggestions: [],
      });
      return;
    }

    const timer = setTimeout(() => {
      runCheck(trimmed);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [username, runCheck]);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState({ status: 'idle', message: '', suggestions: [] });
  }, []);

  const isAvailable = state.status === 'available';

  return {
    ...state,
    isAvailable,
    checkNow: runCheck,
    reset,
    minLength: MIN_LENGTH,
  };
}
