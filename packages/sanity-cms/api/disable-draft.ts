import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import logger from '../lib/logger';

export const createDisableDraftHandler = () => {
  const enableDraftHandler = async (req: NextRequest) => {
    (await draftMode()).disable();
    logger.info(`Disabled draft mode for ${req.url}`);
    return NextResponse.redirect(new URL('/', req.url));
  };
  return { GET: enableDraftHandler };
};
