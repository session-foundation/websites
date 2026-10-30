import { TokenIcon } from '@sanity/icons';
import type { DocumentFields } from '@session/sanity-types';
import { defineField } from 'sanity';
import type { SchemaFieldsType } from './types';

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
    type: 'string',
    options: {
      list: ['Ethereum', 'Arbitrum', 'Bitcoin', 'Bitcoin Cash', 'BNB'],
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

type IconType = 'Ethereum' | 'Arbitrum' | 'Bitcoin' | 'BNB' | 'Bitcoin Cash';
export type CryptoAddressSchemaType = DocumentFields<typeof cryptoAddressSchema> &
  SchemaFieldsType<typeof cryptoAddressFields> & { icon: IconType };
