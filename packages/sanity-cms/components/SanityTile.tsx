import type { TileSchemaType } from '../schemas/fields/component/tile';
import { SanityImage } from './SanityImage';
import type { SessionSanityClient } from '../lib/client';
import { cn } from '@session/ui/lib/utils';
import { TILES_VARIANT } from '../schemas/fields/component/tiles';
import { cleanSanityString } from '../lib/string';
import { resolveAmbiguousLink } from '../schemas/fields/basic/links';
import { Button } from '@session/ui/ui/button';
import Link from 'next/link';
import { LinkOutIcon } from '@session/ui/icons/LinkOutIcon';
import { KeyIcon } from '@session/ui/icons/KeyIcon';
import { safeTry } from '@session/util-js/try';

export async function SanityTile({
  value,
  variant,
  client,
}: {
  value: TileSchemaType;
  variant: TILES_VARIANT;
  client: SessionSanityClient;
}) {
  switch (variant) {
    case TILES_VARIANT.TEXT_OVERLAY_IMAGE:
      return <SanityTileTextOnTopOfImage value={value} client={client} />;
    case TILES_VARIANT.TEXT_UNDER_IMAGE:
      return <SanityTileTextUnderImage value={value} client={client} />;
    default:
      console.warn('Invalid variant for tile');
      return null;
  }
}

export function SanityTileTextOnTopOfImage({
  value,
  client,
}: {
  value: TileSchemaType;
  client: SessionSanityClient;
}) {
  if (!value.image) {
    console.warn('Missing image for tile');
    return null;
  }

  return (
    <div
      className={cn(
        'group',
        'flex h-full w-60 flex-col rounded-2xl border border-gray-200 shadow-md',
        'text-session-white relative h-80 items-center justify-center gap-2 overflow-hidden p-6 text-center',
        'transition-all duration-300 ease-in-out motion-reduce:transition-none'
      )}
    >
      <strong className="text-lg font-semibold [text-shadow:_0_0_8px_var(--session-black)] md:text-xl">
        {value.title}
      </strong>
      <p
        className={cn(
          'invisible h-max max-h-0 overflow-hidden text-sm opacity-0 md:text-base',
          'group-hover:visible group-hover:max-h-max group-hover:opacity-100',
          'group-active:visible group-active:max-h-max group-active:opacity-100',
          'transition-all duration-300 ease-in-out motion-reduce:transition-none'
        )}
        style={{
          // For some reason using leading-tight gets overriden so this is needed
          lineHeight: 1.25,
        }}
      >
        {value.description}
      </p>
      <SanityImage
        client={client}
        value={value.image}
        isInline={false}
        cover
        className={cn(
          'absolute inset-0 -z-10 h-full w-full rounded-2xl',
          'group-hover:darken group-hover:blur-sm group-hover:brightness-50',
          'group-active:darken group-active:blur-sm group-active:brightness-50',
          'transition-all duration-300 ease-in-out motion-reduce:transition-none'
        )}
      />
    </div>
  );
}

type BadgeIconType = 'linkOut' | 'key';

const isValidBadgeIcon = (val: string): val is BadgeIconType => {
  const cleanVal = cleanSanityString(val);
  return cleanVal === 'linkOut' || cleanVal === 'key';
};

type BadgeProps = {
  client: SessionSanityClient;
  icon: string;
  link: unknown;
};

async function Badge({ client, link, icon }: BadgeProps) {
  // @ts-expect-error -- These types are pretty rough, this is fine
  const [err, res] = await safeTry(resolveAmbiguousLink(client, link));

  if (err) {
    console.error(err);
    return null;
  }

  if (!res?.href) {
    console.warn(`A Badge was set without a href! ${link}`)
    return null;
  }

  return (
    <Link href={res.href} title={res.label}>
      <Button
        data-testid="button:tile-badge"
        size="icon"
        variant="ghost"
        className="h-5 w-5"
        aria-label={res.label}
      >
        {cleanSanityString(icon) === 'key' ? <KeyIcon className="h-3 w-3" /> : <LinkOutIcon className="h-3 w-3" />}
      </Button>
    </Link>
  );
}

export async function SanityTileTextUnderImage({
  value,
  client,
}: {
  value: TileSchemaType;
  client: SessionSanityClient;
}) {
  if (!value.image) {
    console.warn('Missing image for tile');
    return null;
  }

  return (
    <div className="flex h-max w-full flex-col gap-1">
      <SanityImage
        client={client}
        value={value.image}
        cover
        isInline={false}
        className="h-60 w-full rounded-2xl border border-gray-200 shadow-md"
      />
      <span className="ms-2 text-sm md:text-base">
        {value.title}
        {value.badge && value.badgeIcon && isValidBadgeIcon(value.badgeIcon) ? (
          <Badge client={client} icon={value.badgeIcon} link={value.badge} />
        ) : null}
      </span>
      <span className="ms-2 text-xs font-light md:text-sm">{value.description ?? ' '}</span>
    </div>
  );
}
