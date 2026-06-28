import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { propertiesApi } from '../api/singleton';

type UnreadMessagesContextValue = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnread: () => Promise<void>;
  activeInquiryId: number | null;
  setActiveInquiryId: (inquiryId: number | null) => void;
  /** Bumps when inbox is opened so notification listener re-baselines. */
  readEpoch: number;
  markInboxSeen: () => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(null);

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeInquiryId, setActiveInquiryId] = useState<number | null>(null);
  const [readEpoch, setReadEpoch] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await propertiesApi.getMyMessageCount();
      setUnreadCount(res.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const markInboxSeen = useCallback(() => {
    setReadEpoch((epoch) => epoch + 1);
    void refreshUnread();
  }, [refreshUnread]);

  const value = useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      refreshUnread,
      activeInquiryId,
      setActiveInquiryId,
      readEpoch,
      markInboxSeen,
    }),
    [unreadCount, refreshUnread, activeInquiryId, readEpoch, markInboxSeen]
  );

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages(): UnreadMessagesContextValue {
  const ctx = useContext(UnreadMessagesContext);
  if (!ctx) {
    throw new Error('useUnreadMessages must be used within UnreadMessagesProvider');
  }
  return ctx;
}

export function useUnreadMessagesOptional(): UnreadMessagesContextValue | null {
  return useContext(UnreadMessagesContext);
}
