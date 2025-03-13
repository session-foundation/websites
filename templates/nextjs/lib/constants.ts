import { Social, type SocialLink } from '@session/ui/components/SocialLinkList';

export const BASE_URL = ``;

export const SOCIALS = {
  [Social.Github]: { name: Social.Github, link: 'https://github.com/session-foundation/websites' },
} satisfies Partial<Record<Social, SocialLink>>;

