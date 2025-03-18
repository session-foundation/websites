import { SANITY_UTIL_PATH } from '@/lib/constants';
import {
  NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_PROJECT_ID,
} from '@/lib/env';
import { createSanityClient } from '@session/sanity-cms/lib/client';
import { Environment, getEnvironment } from '@session/util-js/env';

const token = process.env.SANITY_API_READ_TOKEN;
if (!token) {
  throw new Error('SANITY_API_READ_TOKEN is not defined');
}

export const client = createSanityClient({
  draftToken: token,
  dataset: NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: NEXT_PUBLIC_SANITY_API_VERSION,
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  studioUrl: SANITY_UTIL_PATH.STUDIO,
  disableCaching: getEnvironment() === Environment.DEV,
});
