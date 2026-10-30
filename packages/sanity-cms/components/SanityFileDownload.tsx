'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { cleanSanityString } from '../lib/string';
import SanityAsc from './SanityAsc';
import SanityPdf from './SanityPdf';

type FileDownloadProps = {
  fileName: string;
  src: string;
  strings: {
    fetching: string;
    clickToDownload: string;
    clickToDownloadAria: string;
    openPdfInNewTab: string;
    openPdfInNewTabAria: string;
    openFileInNewTab: string;
    openFileInNewTabAria: string;
  };
};

type DownloadFileButtonProps = {
  href: string;
  ariaLabel: string;
  children: ReactNode;
};

export function DownloadFileButton({ href, ariaLabel, children }: DownloadFileButtonProps) {
  return (
    <a
      href={href}
      className="group"
      target="_blank"
      rel="noopener noreferrer"
      download
      aria-label={ariaLabel}
    >
      <button
        className="mt-1 w-max text-sm underline decoration-session-black hover:decoration-session-green group-hover:underline group-hover:decoration-session-green"
        type="button"
      >
        {children}
      </button>
    </a>
  );
}

export default function FileDownload({ fileName, src, strings }: FileDownloadProps) {
  const [downloaded, setDownloaded] = useState(false);
  const router = useRouter();
  if (!src || !fileName) return null;

  const name = cleanSanityString(fileName);
  const srcWithParams = new URL(src);
  srcWithParams.searchParams.set('dl', name);

  if (src.endsWith('.pdf')) {
    return <SanityPdf src={src} url={srcWithParams} strings={strings} />;
  }

  if (src.endsWith('.asc')) {
    return <SanityAsc src={src} url={srcWithParams} strings={strings} />;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies lint/correctness/useHookAtTopLevel: Download file on mount
  useEffect(() => {
    if (!downloaded) {
      setDownloaded(true);
      router.push(srcWithParams.href);
    }
  }, []);

  return (
    <div className="my-12 flex flex-col items-center justify-center gap-2">
      <p className="text-center text-sm">{strings.fetching.replace('{name}', fileName)}</p>
      <DownloadFileButton href={srcWithParams.href} ariaLabel={strings.clickToDownloadAria}>
        {strings.clickToDownload}
      </DownloadFileButton>
    </div>
  );
}
