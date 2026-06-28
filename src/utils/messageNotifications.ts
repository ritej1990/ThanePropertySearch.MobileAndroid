import type { MessageAlertPayload } from '../api/messageNotificationTypes';

export function messageAlertKey(item: MessageAlertPayload | null | undefined): string {
  if (!item) return '';
  if (item.type === 'inquiry_approved' && item.inquiryId != null) {
    return `a:${item.inquiryId}:${item.sentAtUtc ?? ''}`;
  }
  if (item.type === 'support' && item.ticketId != null) {
    return `s:${item.ticketId}:${item.sentAtUtc ?? ''}`;
  }
  if (item.type === 'agent_lead' && item.leadId != null) {
    return `l:${item.leadId}`;
  }
  if (item.messageId != null) return `m:${item.messageId}`;
  if (item.inquiryId != null) return `i:${item.inquiryId}:${item.sentAtUtc ?? ''}`;
  return '';
}

export function truncateMessage(text: string | undefined, max = 120): string {
  const t = (text ?? '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function messageAlertTitle(item: MessageAlertPayload): string {
  switch (item.type) {
    case 'support':
      return 'Support reply';
    case 'agent_lead':
      return 'New enquiry';
    case 'inquiry_new':
      return 'Someone wants to connect';
    case 'inquiry_reply':
      return item.senderRole === 'Agent' ? 'New reply from agent' : 'New reply from owner';
    case 'inquiry_approved':
      return 'Chat request approved';
    default:
      return 'New message';
  }
}

export function messageAlertActionLabel(item: MessageAlertPayload): string {
  switch (item.type) {
    case 'support':
      return 'View ticket';
    case 'agent_lead':
      return 'View leads';
    default:
      return 'Open chat';
  }
}

export function messageAlertContextLabel(item: MessageAlertPayload): string {
  if (item.type === 'support') {
    return item.propertyTitle ?? item.subject ?? 'Support ticket';
  }
  return item.propertyTitle ?? 'Listing';
}

export type MessageAlertIcon =
  | 'chatbubbles'
  | 'help-buoy'
  | 'person'
  | 'checkmark-circle'
  | 'arrow-undo';

export function messageAlertIcon(item: MessageAlertPayload): MessageAlertIcon {
  if (item.type === 'support') return 'help-buoy';
  if (item.type === 'agent_lead') return 'person';
  if (item.type === 'inquiry_approved') return 'checkmark-circle';
  if (item.type === 'inquiry_reply') return 'arrow-undo';
  return 'chatbubbles';
}
