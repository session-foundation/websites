import { UserIcon } from '@sanity/icons';
import type { DocumentFields } from '@session/sanity-types';
import { defineField } from 'sanity';
import type { SchemaFieldsType } from './types';

export const authorFields = [
  defineField({
    name: 'name',
    title: 'Name',
    type: 'string',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'bio',
    title: 'Bio',
    type: 'text',
  }),
  defineField({
    name: 'avatar',
    title: 'Avatar',
    type: 'image',
    options: {
      hotspot: true,
    },
  }),
];

export const authorSchema = {
  name: 'author',
  type: 'document',
  title: 'Author',
  icon: UserIcon,
  fields: authorFields,
};

export type AuthorSchemaType = DocumentFields<typeof authorSchema> &
  SchemaFieldsType<typeof authorFields>;
