'use client';

import type { createSanityConfig } from '@session/sanity-cms/lib/config';
import { NextStudio } from 'next-sanity/studio';
import type { NextStudioProps } from 'next-sanity/studio/client-component';

export type SanityStudioProps = Omit<NextStudioProps, 'config'> & {
  config: ReturnType<typeof createSanityConfig>;
};

export default function SanityStudio(props: SanityStudioProps) {
  return <NextStudio {...props} />;
}
