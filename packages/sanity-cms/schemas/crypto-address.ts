import type { SchemaFieldsType } from './types';
import type { DocumentFields } from '@session/sanity-types';
import { defineField } from 'sanity';
import { TokenIcon, UserIcon } from '@sanity/icons';

export const cryptoAddressFields = [
  defineField({
    name: 'name',
    title: 'Name',
    type: 'string',
    description: 'The address this is for, eg: Ethereum Address',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'address',
    title: 'Address',
    type: 'string',
    description: 'The crypto address',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'icon',
    title: 'Icon',
    type: 'text',
    options: {
      list: ['Ethereum', 'Arbitrum', 'Bitcoin'],
    },
    validation: (Rule) => Rule.required(),
  }),
];

export const cryptoAddressSchema = {
  name: 'cryptoAddress' as const,
  type: 'document',
  title: 'Crypto Address',
  icon: TokenIcon,
  fields: cryptoAddressFields,
};

export type CryptoAddressSchemaType = DocumentFields<typeof cryptoAddressSchema> &
  SchemaFieldsType<typeof cryptoAddressFields>;
