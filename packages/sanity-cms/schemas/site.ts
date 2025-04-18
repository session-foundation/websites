import { legalFields } from './fields/groups/legal';
import { seoField } from './fields/basic/seo';
import { defineField, defineType } from 'sanity';
import type { SchemaFieldsType } from './types';
import type { DocumentFields } from '@session/sanity-types';
import {
  type ExternalLinkArrayMember,
  externalLinkFieldDefinition,
  type InternalLinkArrayMember,
  internalLinkFieldDefinition,
  linksFieldDefinition,
  type SocialLinkArrayMember,
  socialLinkFieldDefinition,
} from './fields/basic/links';
import {
  BlockContentIcon,
  CogIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  RobotIcon,
} from '@sanity/icons';
import type { PageSchemaType } from './page';

const siteLinkFields = [
  defineField({
    ...linksFieldDefinition,
    type: 'array',
    group: 'header',
    title: 'Header Links',
    name: 'headerLinks',
  }),
  defineField({
    type: 'boolean',
    initialValue: false,
    name: 'differentFooterLinksFromHeader',
    group: 'footer',
    title: 'Different Footer Links from Header',
    description: 'Enable to define different links for the footer',
  }),
  defineField({
    ...linksFieldDefinition,
    title: 'Footer Links',
    group: 'footer',
    name: 'footerLinks',
    hidden: ({ document }) => !document?.differentFooterLinksFromHeader,
  }),
  defineField({
    type: 'boolean',
    initialValue: false,
    name: 'showSocialLinksInFooter',
    group: 'footer',
    title: 'Show Social Links in Footer',
    description: 'Enable to show social links in the footer',
  }),
  defineField({
    title: 'Footer Social Links',
    name: 'footerSocialLinks',
    description: 'Links to CMS content or external resources',
    group: 'footer',
    type: 'array' as const,
    of: [externalLinkFieldDefinition, internalLinkFieldDefinition, socialLinkFieldDefinition],
    hidden: ({ document }) => !document?.showSocialLinksInFooter,
  }),
  defineField({
    type: 'reference',
    name: 'landingPage',
    title: 'Landing Page',
    description: 'The page to show on "/".',
    to: [{ type: 'page' }],
    validation: (Rule) => Rule.required(),
  }),
];

export const siteFields = [
  ...siteLinkFields,
  ...legalFields,
  seoField,
  defineField({
    title: 'Blog SEO',
    name: 'blogSeo',
    description: 'SEO fields for Blog grid page and default SEO for blog posts',
    type: 'seoMetaFields',
    group: 'blogSeo',
  }),
];

export const siteSchema = defineType({
  type: 'document',
  name: 'site',
  title: 'Site Settings',
  icon: CogIcon,
  fields: siteFields,
  groups: [
    {
      title: 'Default Site SEO',
      icon: RobotIcon,
      name: 'seo',
    },
    {
      title: 'Blog SEO',
      icon: RobotIcon,
      name: 'blogSeo',
    },
    {
      title: 'Header',
      name: 'header',
      icon: InsertBelowIcon,
    },
    {
      title: 'Footer',
      name: 'footer',
      icon: InsertAboveIcon,
    },
    {
      title: 'Legal',
      name: 'legal',
      icon: BlockContentIcon,
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      };
    },
  },
});

export type SiteSchemaType = DocumentFields<typeof siteSchema> &
  Omit<SchemaFieldsType<typeof siteFields>, 'headerLinks' | 'footerLinks' | 'footerSocialLinks'> & {
    landingPage?: PageSchemaType;
    headerLinks: Array<ExternalLinkArrayMember | InternalLinkArrayMember>;
    footerLinks: Array<ExternalLinkArrayMember | InternalLinkArrayMember>;
    footerSocialLinks: Array<SocialLinkArrayMember>;
  };
