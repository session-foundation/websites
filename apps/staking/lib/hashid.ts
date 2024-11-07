import Sqids from 'sqids';
import { type Address, checksumAddress } from 'viem';

const sqids = new Sqids();

function ethereumAddressToNumberArray(address: string) {
  const parsedAddress = address.toLowerCase().startsWith('0x') ? address.slice(2) : address;

  // Step 2: Validate the address length (should be 40 characters for 20 bytes)
  if (parsedAddress.length !== 40) {
    throw new Error('Invalid Ethereum address length');
  }

  // Step 3 and 4: Split into byte pairs and convert to numbers
  const numberArray = [];
  for (let i = 0; i < parsedAddress.length; i += 2) {
    const byteString = parsedAddress.slice(i, i + 2);
    // Parse each hex byte to an integer
    const byteValue = parseInt(byteString, 16);
    if (isNaN(byteValue)) {
      throw new Error(`Invalid hex character detected: ${byteString}`);
    }
    numberArray.push(byteValue);
  }

  return numberArray;
}

export const encodeAddressToHashId = (address: Address) => {
  const formattedAddress = checksumAddress(address);
  const int = ethereumAddressToNumberArray(formattedAddress);
  return sqids.encode(int);
};
