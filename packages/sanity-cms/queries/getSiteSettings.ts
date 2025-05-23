import { groq } from 'next-sanity';
import { SessionSanityClient } from '../lib/client';
import logger from '../lib/logger';
import type { SiteSchemaType } from '../schemas/site';

export const QUERY_GET_SITE_SETTINGS = groq`*[_type == 'site']{ ..., landingPage->{ label, slug } }`;
export type QUERY_GET_SITE_SETTINGS_RETURN_TYPE = Array<SiteSchemaType>;

export async function getSiteSettings({ client }: { client: SessionSanityClient }) {
  const [err, result] = await client.nextFetch<QUERY_GET_SITE_SETTINGS_RETURN_TYPE>({
    query: QUERY_GET_SITE_SETTINGS,
  });

  if (err) {
    logger.error(err);
    return null;
  }

  const siteSettings = result[0];

  if (!siteSettings) {
    logger.info(`Site settings not found`);
    return null;
  }

  return siteSettings;
}
