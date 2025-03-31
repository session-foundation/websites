import type { ArbitrumEvent } from '@session/staking-api-js/schema';

/**
 * Events are sorted in descending order by block number and then by log index.
 * @param a - first event
 * @param b - second event
 */
export function sortEvents(a: ArbitrumEvent, b: ArbitrumEvent) {
  if (a.block === b.block) {
    return b.log_index - a.log_index;
  }
  return b.block - a.block;
}
