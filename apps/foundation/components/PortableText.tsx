import { components } from '@/lib/sanity/sanity-components';
import {
  SanityPortableText,
  type SanityPortableTextProps,
} from '@session/sanity-cms/components/SanityPortableText';
import type { PortableTextBlock } from 'sanity';

type PortableTextProps = Omit<SanityPortableTextProps, 'value'> & {
  body: Array<PortableTextBlock>;
};

export default function PortableText({ body, ...props }: PortableTextProps) {
  return <SanityPortableText value={body} components={components} {...props} />;
}
