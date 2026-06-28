import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { siteMaintenanceApi } from '../api/singleton';

const POLL_VISIBLE_MS = 8000;
const POLL_HIDDEN_MS = 20000;

export const MAINTENANCE_BANNER_BODY_HEIGHT = 38;

type SiteMaintenanceState = {
  enabled: boolean;
  message: string;
};

const SiteMaintenanceContext = createContext<SiteMaintenanceState>({
  enabled: false,
  message: '',
});

export function SiteMaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SiteMaintenanceState>({ enabled: false, message: '' });
  const enabledRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  const schedulePoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const ms = enabledRef.current ? POLL_VISIBLE_MS : POLL_HIDDEN_MS;
    pollRef.current = setInterval(() => {
      void refreshRef.current();
    }, ms);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await siteMaintenanceApi.getStatus();
      const live = Boolean(data.enabled && data.message?.trim());
      enabledRef.current = live;
      setState({ enabled: live, message: live ? data.message.trim() : '' });
      schedulePoll();
    } catch {
      /* keep last state */
    }
  }, [schedulePoll]);

  refreshRef.current = refresh;

  useEffect(() => {
    void refresh();
    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') void refresh();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => {
      sub.remove();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  const value = useMemo(() => state, [state.enabled, state.message]);

  return (
    <SiteMaintenanceContext.Provider value={value}>
      {children}
    </SiteMaintenanceContext.Provider>
  );
}

export function useSiteMaintenance(): SiteMaintenanceState {
  return useContext(SiteMaintenanceContext);
}
