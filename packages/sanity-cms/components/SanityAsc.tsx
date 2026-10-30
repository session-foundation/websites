import { DownloadFileButton } from './SanityFileDownload';

export type SanityAscProps = {
  src: string;
  url: URL;
  strings: {
    clickToDownload: string;
    clickToDownloadAria: string;
  };
};

export default function SanityAsc({ src, url, strings }: SanityAscProps) {
  if (!url || !src) return null;

  return (
    <main className="flex h-full min-h-screen w-full max-w-3xl flex-col items-start justify-start gap-4">
      <DownloadFileButton href={url.href} ariaLabel={strings.clickToDownloadAria}>
        {strings.clickToDownload}
      </DownloadFileButton>
      <iframe
        src={src}
        className="h-full min-h-screen w-full"
        style={{ border: 'none' }}
        title="ASC"
      />
    </main>
  );
}
