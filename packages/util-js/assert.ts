/**
 * Assertion functions only run when the APP_DEBUG environment variable is set.
 * @param condition - A function which resolves to a boolean
 * @param msg - Optional assertion failed message
 *
 * @throws Error - If the condition function resolves to false it throws.
 */
export function DEBUG_ASSERT(condition: () => boolean, msg?: string) {
  if (!process.env.APP_DEBUG) return;
  if (!condition()) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}
