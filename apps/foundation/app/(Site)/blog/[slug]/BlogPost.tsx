import HeadingOutline from '@/app/(Site)/blog/[slug]/HeadingOutline';
import PostInfoBlock from '@/app/(Site)/blog/[slug]/PostInfoBlock';
import PortableText from '@/components/PortableText';
import { SANITY_SCHEMA_URL } from '@/lib/constants';
import logger from '@/lib/logger';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { FormattedPostType } from '@session/sanity-cms/queries/getPost';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLangDir } from 'rtl-detect';

export type PostProps = {
  post: FormattedPostType;
};

export default async function BlogPost({ post }: PostProps) {
  const blogDictionary = await getTranslations('blog');
  const locale = await getLocale();
  const direction = getLangDir(locale);

  const body = post.body;

  if (!body) {
    logger.error(`No body found for post: ${post.slug}`);
    return notFound();
  }

  const allH2s = body.filter((block) => block._type === 'block' && block.style === 'h2');

  const headings: Array<string> = allH2s
    .map((block) =>
      'children' in block && Array.isArray(block.children) ? block.children[0].text : null
    )
    .filter(Boolean);

  return (
    <article className="mt-4 mb-32 flex max-w-screen-xl flex-col items-start">
      <Link href={SANITY_SCHEMA_URL.POST} prefetch>
        <Button
          data-testid={ButtonDataTestId.Back_To_Blog}
          className={cn('my-2 gap-2 fill-current px-1 text-session-text-black-secondary')}
          size="sm"
          rounded="md"
          variant="ghost"
        >
          <span className={cn(direction === 'rtl' && 'rotate-180')}>←</span>
          {blogDictionary('backToBlog')}
        </Button>
      </Link>
      <PostInfoBlock
        className="h-max w-full"
        postInfo={post}
        renderWithPriority
        mobileImagePosition="below"
      />
      <div className="mt-6 flex h-max flex-row justify-center gap-12 md:mt-12">
        <PortableText
          body={body}
          className={cn(headings.length && 'max-w-screen-md')}
          wrapperComponent="section"
        />
        {headings.length ? (
          <HeadingOutline headings={headings} title={blogDictionary('inThisArticle')} />
        ) : null}
      </div>
    </article>
  );
}
