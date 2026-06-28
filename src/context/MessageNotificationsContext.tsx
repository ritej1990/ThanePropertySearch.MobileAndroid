import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { API_BASE_URL } from '../config/env';
import type { MessageAlertPayload } from '../api/messageNotificationTypes';
import { propertiesApi } from '../api/singleton';
import { useAuth } from './AuthContext';
import { useUnreadMessages } from './UnreadMessagesContext';
import { MessageAlertToast } from '../components/notifications/MessageAlertToast';
import { navigationRef } from '../navigation/navigationRef';
import { messageAlertKey } from '../utils/messageNotifications';

const POLL_MS = 30000;
const TOAST_MS = 12000;

function navigateToAlert(item: MessageAlertPayload) {
  if (!navigationRef.isReady()) return;
  if (item.type === 'support' && item.ticketId != null) {
    navigationRef.navigate('SupportTicketDetails', {
      ticketId: item.ticketId,
      subject: item.propertyTitle ?? item.subject,
    });
    return;
  }
  if (item.type === 'agent_lead') {
    navigationRef.navigate('AgentLeads');
    return;
  }
  if (item.inquiryId != null && item.propertyId != null) {
    navigationRef.navigate('PropertyChat', {
      inquiryId: item.inquiryId,
      propertyId: item.propertyId,
      title: item.propertyTitle,
    });
    return;
  }
  navigationRef.navigate('MyChats');
}

export function MessageNotificationsListener() {
  const { token, ready } = useAuth();
  const { activeInquiryId, setUnreadCount, readEpoch } = useUnreadMessages();
  const [toastItem, setToastItem] = useState<MessageAlertPayload | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastUnread, setToastUnread] = useState(0);
  const knownKeysRef = useRef<Record<string, boolean> | null>(null);
  const lastCountRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const activeInquiryRef = useRef<number | null>(null);

  activeInquiryRef.current = activeInquiryId;

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastVisible(false);
  }, []);

  const showAlert = useCallback(
    (item: MessageAlertPayload, totalUnread: number) => {
      const activeId = activeInquiryRef.current;
      if (activeId != null && item.inquiryId === activeId) return;

      setToastItem(item);
      setToastUnread(totalUnread);
      setToastVisible(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setToastVisible(false);
        toastTimerRef.current = null;
      }, TOAST_MS);
    },
    []
  );

  const processPreview = useCallback(
    (count: number, items: MessageAlertPayload[]) => {
      setUnreadCount(count);
      const keys = items.map(messageAlertKey).filter(Boolean);
      const keySet: Record<string, boolean> = {};
      keys.forEach((k) => {
        keySet[k] = true;
      });

      if (knownKeysRef.current === null) {
        knownKeysRef.current = keySet;
        lastCountRef.current = count;
        return;
      }

      const activeId = activeInquiryRef.current;
      items.forEach((item) => {
        const key = messageAlertKey(item);
        if (!key || knownKeysRef.current?.[key]) return;
        if (activeId != null && item.inquiryId === activeId) return;
        showAlert(item, count);
      });

      knownKeysRef.current = keySet;
      lastCountRef.current = count;
    },
    [setUnreadCount, showAlert]
  );

  const poll = useCallback(async () => {
    if (!token) return;
    try {
      const data = await propertiesApi.getMyUnreadPreview();
      processPreview(data.count ?? 0, data.items ?? []);
    } catch {
      /* ignore */
    }
  }, [token, processPreview]);

  useEffect(() => {
    knownKeysRef.current = null;
    if (token) void poll();
  }, [readEpoch, token, poll]);

  const handleRealtimeAlert = useCallback(
    (item: MessageAlertPayload) => {
      if (!item) return;
      const activeId = activeInquiryRef.current;
      if (activeId != null && item.inquiryId === activeId) return;

      const key = messageAlertKey(item);
      if (key) {
        if (knownKeysRef.current === null) knownKeysRef.current = {};
        if (knownKeysRef.current[key]) return;
        knownKeysRef.current[key] = true;
      }

      const count = (lastCountRef.current ?? 0) + 1;
      lastCountRef.current = count;
      setUnreadCount(count);
      showAlert(item, count);
      setTimeout(() => {
        void poll();
      }, 1500);
    },
    [poll, setUnreadCount, showAlert]
  );

  useEffect(() => {
    if (!ready || !token) {
      knownKeysRef.current = null;
      lastCountRef.current = null;
      setUnreadCount(0);
      hideToast();
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      void connectionRef.current?.stop();
      connectionRef.current = null;
      return;
    }

    void poll();
    pollRef.current = setInterval(() => {
      void poll();
    }, POLL_MS);

    const hubUrl = `${API_BASE_URL}/hubs/user-notifications?access_token=${encodeURIComponent(token)}`;
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(__DEV__ ? LogLevel.Information : LogLevel.Warning)
      .build();

    connection.on('NewMessageAlert', handleRealtimeAlert);
    connection
      .start()
      .catch(() => {
        /* polling fallback remains active */
      });
    connectionRef.current = connection;

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void poll();
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      sub.remove();
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      hideToast();
      void connection.stop();
      connectionRef.current = null;
    };
  }, [ready, token, poll, handleRealtimeAlert, hideToast, setUnreadCount]);

  const openToast = useCallback(() => {
    if (!toastItem) return;
    hideToast();
    navigateToAlert(toastItem);
  }, [toastItem, hideToast]);

  if (!token) return null;

  return (
    <MessageAlertToast
      visible={toastVisible}
      item={toastItem}
      totalUnread={toastUnread}
      onDismiss={hideToast}
      onOpen={openToast}
    />
  );
}
