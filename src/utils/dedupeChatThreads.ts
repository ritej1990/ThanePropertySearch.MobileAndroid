import type { MyChatThread } from '../api/inquiryTypes';
import { threadActivityIso } from './chatFormat';

function pickNewer(a: MyChatThread, b: MyChatThread): MyChatThread {
  const aTime = Date.parse(threadActivityIso(a));
  const bTime = Date.parse(threadActivityIso(b));
  if (bTime > aTime) return b;
  if (bTime < aTime) return a;
  return b.id > a.id ? b : a;
}

function mergeThreads(primary: MyChatThread, other: MyChatThread): MyChatThread {
  const newer = pickNewer(primary, other);
  return {
    ...newer,
    unreadCount: (primary.unreadCount ?? 0) + (other.unreadCount ?? 0),
  };
}

/** Collapse duplicate buyer threads per listing (legacy rows before API dedup). */
export function dedupeChatThreads(threads: MyChatThread[]): MyChatThread[] {
  const owners = threads.filter((t) => t.isOwner);
  const buyerByProperty = new Map<number, MyChatThread>();

  for (const thread of threads.filter((t) => !t.isOwner)) {
    const existing = buyerByProperty.get(thread.propertyId);
    buyerByProperty.set(
      thread.propertyId,
      existing ? mergeThreads(existing, thread) : thread
    );
  }

  return [...owners, ...buyerByProperty.values()].sort(
    (a, b) => Date.parse(threadActivityIso(b)) - Date.parse(threadActivityIso(a))
  );
}
