import { DocumentIcon, EarthGlobeIcon, EditIcon, RobotIcon } from '@sanity/icons';
import type { DocumentFields } from '@session/sanity-types';
import { defineField, defineType } from 'sanity';
import { seoField } from './fields/basic/seo';
import { type CopyFieldOfType, copyFieldOf } from './fields/generated/copy';
import { routeFields } from './fields/groups/route';
import type { SchemaFieldsType } from './types';

export const pageFields = [
  ...routeFields,
  seoField,
  defineField({
    name: 'body',
    title: 'Body',
    group: 'content',
    description: 'Page content',
    type: 'array',
    of: copyFieldOf,
  }),
];

export const pageSchema = defineType({
  type: 'document',
  name: 'page',
  title: 'Page',
  icon: DocumentIcon,
  fields: pageFields,
  groups: [
    {
      title: 'Route',
      name: 'route',
      icon: EarthGlobeIcon,
    },
    {
      title: 'SEO',
      name: 'seo',
      icon: RobotIcon,
    },
    {
      title: 'Content',
      name: 'content',
      icon: EditIcon,
      default: true,
    },
  ],
  preview: {
    select: {
      title: 'label',
    },
    prepare({ title }) {
      return {
        subtitle: 'Page',
        title,
      };
    },
  },
});

export type PageSchemaType = DocumentFields<typeof pageSchema> &
  Omit<SchemaFieldsType<typeof pageFields>, 'body'> & {
    body: CopyFieldOfType;
  };
