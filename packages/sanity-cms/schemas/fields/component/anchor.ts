import { defineField } from 'sanity';
import type { SchemaFieldsType } from '../../types';

export const anchorFields = [
  defineField({
    name: 'anchorId',
    title: 'Anchor Tag Identifier',
    type: 'string',
    description: 'Adds a navigable #tag. Adding this tag to the end of a url will scroll the screens so the top of the page is at this point. The value here should not include the # symbol.'
  }),
];

export type AnchorSchemaType = SchemaFieldsType<typeof anchorFields>;
