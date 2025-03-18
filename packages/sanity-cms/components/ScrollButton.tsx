'use client';

import { LongArrowIcon } from '@session/ui/icons/LongArrowIcon';
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { useState } from 'react';

export function ScrollButton({
  scrollText,
  parentId,
  tileContainerId,
  isRTLLocale,
  defaultScrollAmount = 240,
  className,
}: {
  scrollText: string;
  parentId: string;
  tileContainerId: string;
  isRTLLocale?: boolean;
  defaultScrollAmount?: number;
  className?: string;
}) {
  const [tileIndex, setTileIndex] = useState<number>(0);

  const handleClick = () => {
    const tiles = document.getElementById(tileContainerId)?.children;
    if (tiles) {
      const targetIndex = tileIndex >= tiles.length - 1 ? 0 : tileIndex + 1;
      const tile = tiles[targetIndex];
      if (tile) {
        tile.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
        setTileIndex(targetIndex);
      }
    } else {
      document.getElementById(parentId)?.scrollBy({
        behavior: 'smooth',
        left: isRTLLocale ? -defaultScrollAmount : defaultScrollAmount,
      });
    }
  };
  return (
    <div className="sticky top-0 left-2 mb-7">
      <Button
        className={cn('gap-2 fill-current px-1 text-session-text-black-secondary', className)}
        size="xs"
        rounded="md"
        variant="ghost"
        data-testid={`button:scroll-${parentId}`}
        onClick={handleClick}
      >
        {scrollText}
        <LongArrowIcon className={cn('h-6 w-12 fill-current', isRTLLocale && 'rotate-180')} />
      </Button>
    </div>
  );
}
