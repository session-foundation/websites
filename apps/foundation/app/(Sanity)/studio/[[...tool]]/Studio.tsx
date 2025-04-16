'use client';

import { sanityConfig } from '@/lib/sanity/sanity.config';
import SanityStudio from '@session/sanity-cms/components/SanityStudio';

export default function Studio() {
  return <SanityStudio config={sanityConfig} />;
}
