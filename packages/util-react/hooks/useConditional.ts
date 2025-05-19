import { type DependencyList, useEffect } from 'react';

/**
 * Executes an effect if all dependencies are truthy
 * @param callback The effect callback
 * @param conditions The condition dependency array
 */
export const useConditional = (callback: () => void, conditions: DependencyList) =>
  // biome-ignore lint/correctness/useExhaustiveDependencies: callback and conditions array have to be constant
  useEffect(() => {
    if (conditions.every((condition) => !!condition)) {
      return callback;
    }
  }, conditions);
