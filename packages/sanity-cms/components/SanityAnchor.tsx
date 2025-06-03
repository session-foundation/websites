import logger from '../lib/logger';
import type { AnchorSchemaType } from '../schemas/fields/component/anchor';

export async function SanityAnchor({ value }: { value: AnchorSchemaType }) {
  const { anchorId } = value;

  if (!anchorId) {
    logger.warn('SanityAnchor: Missing anchorId');
    return null;
  }

  return <div id={anchorId} className='w-0 h-0' />
}
