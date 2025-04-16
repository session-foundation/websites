import { DevSheet } from '@/components/DevSheet';
import { client } from '@/lib/sanity/sanity.client';
import { isDraftModeEnabled } from '@session/sanity-cms/lib/util';
import { getPagesInfo } from '@session/sanity-cms/queries/getPages';
import { getBuildInfo } from '@session/util-js/build';

export default async function DevSheetServerSide() {
  const pages = await getPagesInfo({ client });
  const isDraftMode = await isDraftModeEnabled();
  const buildInfo = getBuildInfo();

  return <DevSheet buildInfo={buildInfo} pages={pages} isDraftMode={isDraftMode} />;
}
