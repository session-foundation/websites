import { client } from '@/lib/sanity/sanity.client';
import { notFound } from 'next/navigation';
import { getPostsSlugs } from '@session/sanity-cms/queries/getPosts';
import { getPostBySlug } from '@session/sanity-cms/queries/getPost';
import logger from '@/lib/logger';
import BlogPost from '@/app/(Site)/blog/[slug]/BlogPost';

/**
 * Force static rendering and cache the data of a layout or page by forcing `cookies()`, `headers()`
 * and `useSearchParams()` to return empty values.
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic}
 */
export const dynamic = 'force-static';
/**
 * Dynamic segments not included in generateStaticParams are generated on demand.
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams}
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPostsSlugs({ client });
  const slugs = new Set(posts.map((post) => post.slug.current));

  if (slugs.size === 0) {
    console.warn('No posts found. Not statically generating any posts.');
  }

  const postsToGenerate = Array.from(slugs);
  logger.info(`Generating static params for ${postsToGenerate.length} posts`);
  logger.info(postsToGenerate);
  return postsToGenerate;
}

type PageProps = {
  params: { slug?: string };
};

export default async function PostPage({ params }: PageProps) {
  const slug = params.slug;

  if (!slug) {
    logger.warn(
      "No slug provided for post page, this means next.js couldn't find the post home page. Returning not found"
    );
    return notFound();
  }

  logger.info(`Generating page for slug ${slug}`);

  const post = await getPostBySlug({
    client,
    slug,
  });

  if (!post) return notFound();

  return <BlogPost post={post} />;
}
