import {
  messageAlertKey,
  messageAlertTitle,
  truncateMessage,
} from '../src/utils/messageNotifications';
import type { MessageAlertPayload } from '../src/api/messageNotificationTypes';

describe('messageNotifications', () => {
  it('builds stable keys for preview items', () => {
    const item: MessageAlertPayload = {
      type: 'inquiry_reply',
      messageId: 42,
      inquiryId: 7,
      propertyId: 3,
      sentAtUtc: '2026-06-20T10:00:00Z',
    };
    expect(messageAlertKey(item)).toBe('m:42');
  });

  it('titles inquiry replies by sender role', () => {
    expect(
      messageAlertTitle({ type: 'inquiry_reply', senderRole: 'Agent' })
    ).toBe('New reply from agent');
    expect(messageAlertTitle({ type: 'inquiry_approved' })).toBe(
      'Chat request approved'
    );
  });

  it('truncates long previews', () => {
    const long = 'a'.repeat(140);
    expect(truncateMessage(long, 120).endsWith('…')).toBe(true);
  });
});
