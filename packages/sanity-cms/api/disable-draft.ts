import { draftMode } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import logger from '../lib/logger';

export const createDisableDraftHandler = () => {
  const enableDraftHandler = async (req: NextRequest) => {
    (await draftMode()).disable();
    logger.info(`Disabled draft mode for ${req.url}`);
    // req.url has next start's own origin (localhost:<port>) behind the reverse proxy, so keep the redirect relative.
    return new NextResponse(null, { status: 307, headers: { Location: '/' } });
  };
  return { GET: enableDraftHandler };
};
