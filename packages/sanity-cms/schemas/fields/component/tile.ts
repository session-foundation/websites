import { defineField } from 'sanity';
import type { SchemaFieldsType } from '../../types';
import { imageFieldWithOutAltText } from '../basic/image';
import { internalLinkFieldDefinition } from '../basic/links';

export const tileFields = [
  defineField({
    name: 'title',
    title: 'Title',
    type: 'string',
    description: 'The title of the tile',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'description',
    title: 'Description',
    type: 'string',
    description: 'The text content of the tile',
  }),
  defineField({
    ...internalLinkFieldDefinition,
    name: 'badge',
    title: 'Badge Link',
    type: 'reference',
    to: [{ type: 'page' }, { type: 'post' }, { type: 'special' }, { type: 'cmsFile' }],
  }),
  defineField({
    name: 'badgeIcon',
    title: 'Badge Icon',
    type: 'string',
    options: {
      list: ['linkOut', 'key'],
    },
  }),
  imageFieldWithOutAltText,
];

export type TileSchemaType = SchemaFieldsType<typeof tileFields>;
