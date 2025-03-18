import { NavLink } from '@session/ui/components/NavLink';
import { Button } from '@session/ui/ui/button';
import type { SessionSanityClient } from '../lib/client';
import logger from '../lib/logger';
import { type PickLinkSchemaType, resolvePickLink } from '../schemas/fields/basic/links';

type SanityButtonProps = {
  value: {
    pickLink: PickLinkSchemaType;
  };
  client: SessionSanityClient;
  postBaseUrl?: string;
};

export async function SanityButton(props: SanityButtonProps) {
  const { value, client, postBaseUrl } = props;
  const { href, label } = await resolvePickLink(client, value.pickLink, postBaseUrl);

  if (!href || !label) {
    logger.warn('SanityButton: Missing href or label');
    return null;
  }

  return (
    <NavLink href={href} unStyled className="mt-4">
      <Button data-testid={`button:sanity-${label}`} variant="secondary" rounded="md">
        {label}
      </Button>
    </NavLink>
  );
}
