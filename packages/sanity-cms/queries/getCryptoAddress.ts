import { groq } from 'next-sanity';
import { SessionSanityClient } from '../lib/client';
import logger from '../lib/logger';
import type { AuthorSchemaType } from '../schemas/author';
import type { CryptoAddressSchemaType } from '../schemas/crypto-address';

type QUERY_GET_CRYPTO_ADDRESS_RETURN_TYPE = CryptoAddressSchemaType[];
const QUERY_GET_CRYPTO_ADDRESS_WITH_ID = groq`*[_type == 'cryptoAddress' && _id == $id]`;

export async function getCryptoAddressById({
  client,
  id,
}: {
  client: SessionSanityClient;
  id: string;
}) {
  if (!id || id.length === 0) {
    logger.warn(`No id provided, returning null`);
    return null;
  }

  const [err, result] = await client.nextFetch<QUERY_GET_CRYPTO_ADDRESS_RETURN_TYPE>({
    query: QUERY_GET_CRYPTO_ADDRESS_WITH_ID,
    params: {
      id: id,
    },
  });

  if (err) {
    logger.error(err);
    return null;
  }

  const res = result[0];

  if (!res) {
    logger.info(`No crypto address found for id ${id}`);
    return null;
  }

  return res;
}
