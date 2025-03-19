import Sqids from 'sqids';
import { type Address, checksumAddress } from 'viem';

const sqids = new Sqids();

function createNumberArrayFromHex(hex: string) {
  const numberArray: Array<number> = [];
  for (let i = 0; i < hex.length; i += 2) {
    const byteString = hex.slice(i, i + 2);
    // Parse each hex byte to an integer
    const byteValue = Number.parseInt(byteString, 16);
    if (Number.isNaN(byteValue)) {
      throw new Error(`Invalid hex character detected: ${byteString}`);
    }
    numberArray.push(byteValue);
  }
  return numberArray;
}

function ethereumAddressToNumberArray(address: string) {
  const parsedAddress = address.toLowerCase().startsWith('0x') ? address.slice(2) : address;

  if (parsedAddress.length !== 40) {
    throw new Error('Invalid Ethereum address length');
  }

  return createNumberArrayFromHex(parsedAddress);
}

/**
 * Encode an Ethereum address to a hash ID.
 * @param address The Ethereum address to encode.
 * @param salt The salt to use for the hash ID. The salt is added to each byte of the address.
 * @param pepper The pepper to use for the hash ID. The pepper is added to the end of the address.
 */
export const encodeAddressToHashId = (address: Address, salt = 0, pepper?: string) => {
  const formattedAddress = checksumAddress(address);
  const addressArray = ethereumAddressToNumberArray(formattedAddress);
  const pepperArray = pepper ? createNumberArrayFromHex(pepper) : [];

  return sqids.encode(addressArray.concat(pepperArray).map((n, i) => (i % 2 ? n : n + salt)));
};
