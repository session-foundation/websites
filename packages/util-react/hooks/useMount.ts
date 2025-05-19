import { type EffectCallback, useEffect } from 'react';

/**
 * Executes the effect on component mount.
 * @note Under the hood this is just `useEffect(()=> func(),[])`
 * @param effect The effect callback
 */
export const useMount = (effect: EffectCallback) => useEffect(effect, []);
