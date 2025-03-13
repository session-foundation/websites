import { getBuildInfo } from '@session/util-js/build';
import { DevSheet } from '@/components/DevSheet';

export default async function DevSheetServerSide() {
  const buildInfo = getBuildInfo();

  return <DevSheet buildInfo={buildInfo} />;
}
