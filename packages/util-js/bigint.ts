/** If the value is a string with only integers and a `n` character at the end, it is a serialized BigInt. */
export const serializedBigIntPattern = /^[0-9]+n$/;

/**
 * Checks if the given value is a serialized BigInt.
 * @param value The value to check.
 * @returns True if the value is a serialized BigInt, false otherwise.
 *
 * @see {@link serializedBigIntPattern}
 */
export const isSerializedBigInt = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  return serializedBigIntPattern.test(value);
};

/**
 * Serializes a BigInt to a string with the `n` character at the end.
 * @param value The BigInt to serialize.
 * @returns The serialized BigInt.
 */
export function serializeBigInt(value: bigint): string {
  return `${value.toString()}n`;
}

/**
 * Deserializes a serialized BigInt to a BigInt.
 * @param value The serialized BigInt to deserialize.
 * @returns The deserialized BigInt.
 */
export function deserializeBigInt(value: string): bigint {
  return BigInt(value.slice(0, -1));
}

/**
 * Replacer function for JSON.stringify to handle BigInts.
 * @param _key The key of the property to replace. (Unused)
 * @param value The value of the property to replace.
 * @returns The replaced value.
 *
 * @see {@link jsonBigIntReviver} for the reviver function.
 */
export function jsonBigIntReplacer(_key: string, value: unknown) {
  if (typeof value === 'bigint') {
    return serializeBigInt(value);
  }
  return value;
}

/**
 * Reviver function for JSON.parse to handle serialized BigInts.
 * @param _key The key of the property to revive. (Unused)
 * @param value The value of the property to revive.
 * @returns The revived value.
 *
 * @see {@link jsonBigIntReplacer} for the replacer function.
 */
export function jsonBigIntReviver(_key: string, value: unknown) {
  if (isSerializedBigInt(value)) {
    return deserializeBigInt(value);
  }
  return value;
}
