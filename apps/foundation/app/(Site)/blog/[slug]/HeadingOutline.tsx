'use client';

import { navlinkVariants } from '@session/ui/components/NavLink';
import Typography from '@session/ui/components/Typography';
import { cn } from '@session/ui/lib/utils';

function scrollToHeading(text: string) {
  for (const heading of document.querySelectorAll('h2')) {
    if (text && heading.textContent && heading.textContent === text) {
      heading.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }
}

type HeadingOutlineProps = {
  headings: Array<string>;
  title: string;
};

export default function HeadingOutline({ title, headings }: HeadingOutlineProps) {
  return (
    <nav className="wrap sticky top-12 hidden h-max w-max max-w-[25vw] lg:block">
      <Typography variant="h2" className="mb-3">
        {title}
      </Typography>
      <ul className="flex flex-col gap-2 text-session-text-black-secondary">
        {headings.map((heading) => (
          <li key={`scroll-to-${heading}`}>
            <button
              onClick={() => {
                scrollToHeading(heading);
              }}
              className={cn(navlinkVariants({ active: false }), 'w-max text-wrap text-start')}
              type="button"
            >
              {heading}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
