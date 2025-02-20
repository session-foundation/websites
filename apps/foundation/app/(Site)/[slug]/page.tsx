import { getPageBySlug } from '@session/sanity-cms/queries/getPage';
import { client } from '@/lib/sanity/sanity.client';
import { getPagesSlugs } from '@session/sanity-cms/queries/getPages';
import { notFound } from 'next/navigation';
import { getLandingPageSlug } from '@/lib/sanity/sanity-server';
import PortableText from '@/components/PortableText';
import logger from '@/lib/logger';
import { NEXTJS_EXPLICIT_IGNORED_ROUTES, NEXTJS_IGNORED_PATTERNS } from '@/lib/constants';
import type { Metadata, ResolvingMetadata } from 'next';
import { generateSanityMetadata } from '@session/sanity-cms/lib/metadata';
import { getFileBySlug } from '@session/sanity-cms/queries/getFile';
import FileDownload from '@session/sanity-cms/components/SanityFileDownload';
import { getTranslations } from 'next-intl/server';

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

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  if (!slug) {
    logger.warn(`No slug provided for metadata generation`);
    return {};
  }

  if (
    NEXTJS_EXPLICIT_IGNORED_ROUTES.includes(slug) ||
    NEXTJS_IGNORED_PATTERNS.some((pattern) => slug.includes(pattern))
  ) {
    return {};
  }

  logger.info(`Generating metadata for slug ${slug}`);

  const page = await getPageBySlug({ client, slug });

  if (!page) {
    logger.warn(`No page found for slug ${slug}`);
    return {};
  }
  const parentMetadata = await parent;
  return generateSanityMetadata(client, {
    seo: page.seo,
    parentMetadata,
    type: 'website',
  });
}

export async function generateStaticParams() {
  const pages = await getPagesSlugs({ client });
  const slugs = new Set(pages.map((page) => page.slug.current));

  const landingPageSlug = await getLandingPageSlug();
  if (landingPageSlug) {
    slugs.delete(landingPageSlug);
  } else {
    console.warn('No landing page set in settings to statically generate');
  }

  const pagesToGenerate = Array.from(slugs);
  logger.info(`Generating static params for ${pagesToGenerate.length} pages`);
  logger.info(pagesToGenerate);
  return pagesToGenerate;
}

type PageProps = {
  params: { slug?: string };
};

export default async function UniversalPage({ params }: PageProps) {
  const slug = params.slug;
  if (!slug) return notFound();

  if (
    NEXTJS_EXPLICIT_IGNORED_ROUTES.includes(slug) ||
    NEXTJS_IGNORED_PATTERNS.some((pattern) => slug.includes(pattern))
  ) {
    return;
  }

  logger.info(`Generating page for slug ${slug}`);

  const page = await getPageBySlug({
    client,
    slug,
  });

  if (!page) {
    const file = await getFileBySlug({
      client,
      slug,
    });

    if (file?.src && file?.fileName) {
      const fileDictionary = await getTranslations('fileDownload');
      return (
        <FileDownload
          fileName={file.fileName}
          src={file.src}
          strings={{
            fetching: fileDictionary('fetching'),
            clickToDownload: fileDictionary('clickToDownload'),
            clickToDownloadAria: fileDictionary('clickToDownloadAria'),
            openPdfInNewTab: fileDictionary('openPdfInNewTab'),
            openPdfInNewTabAria: fileDictionary('openPdfInNewTabAria'),
          }}
        />
      );
    }

    return notFound();
  }

  return <PortableText body={page.body} className="max-w-screen-md" wrapperComponent="main" />;
}
