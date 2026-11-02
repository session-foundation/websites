import { DeadLinks, Preflight } from '@planetary/sanity-plugin-preflight';
import { DesktopIcon, EditIcon, RocketIcon } from '@sanity/icons';
import { Iframe } from 'sanity-plugin-iframe-pane';
import type { DefaultDocumentNodeResolver } from 'sanity/structure';
import type { RouteFieldsSchemaType } from '../schemas/fields/groups/route';

type CreateDefaultDocumentNodeOptions = {
  /** The path posts are served under, e.g. `/blog/`. */
  postBasePath?: string;
  /** The path of the enable drafts endpoint. */
  enableDraftsPath?: string;
};

// Import this into the deskTool() plugin
export const createDefaultDocumentNode = ({
  postBasePath = '/',
  enableDraftsPath = '/api/draft/enable',
}: CreateDefaultDocumentNodeOptions): DefaultDocumentNodeResolver => {
  const iframeOptions = {
    url: {
      origin: 'same-origin',
      preview: (document: RouteFieldsSchemaType & { _type?: string }) => {
        const slug = document?.slug?.current;
        if (!slug) return new Error('Missing slug');
        return document._type === 'post' ? `${postBasePath}${slug}` : slug;
      },
      draftMode: enableDraftsPath, // the route you enable draft mode, see: https://github.com/sanity-io/visual-editing/tree/main/packages/preview-url-secret#sanitypreview-url-secret
    },
    showDisplayUrl: true,
    defaultSize: 'desktop',
    reload: {
      button: true,
    },
  };

  return (S) =>
    S.document().views([
      S.view.form().icon(EditIcon),
      S.view.component(Iframe).options(iframeOptions).title('Preview').icon(DesktopIcon),
      S.view
        .component(
          Preflight({
            plugins: [DeadLinks()],
          })
        )
        .title('Preflight')
        .icon(RocketIcon),
    ]);
};
