import type { ArbitrumEvent } from '@session/staking-api-js/schema';

/**
 * Returns true if every event in the event array is sorted correctly
 * @param events - {@link ArbitrumEvent} array
 *
 * NOTE: this should only be used in dev environments as a utility function
 */
export function isEventArraySorted(events: Array<ArbitrumEvent>) {
  return events.every((event, index) => {
    if (index === 0) return true;

    const prev = events[index - 1];
    const curr = event;

    if (!prev || !curr) {
      return false;
    }

    // Same logic as your sortEvents function
    if (prev.block === curr.block) {
      return prev.log_index >= curr.log_index; // Should be descending
    }
    return prev.block >= curr.block; // Should be descending
  });
}
