import { defineField } from 'sanity';
import type { SchemaFieldsType } from '../../types';
import type { CryptoAddressSchemaType } from '../../crypto-address';

export const cryptoAddressDisplayFields = [
  defineField({
    type: 'reference',
    name: 'cryptoAddress' as const,
    title: 'Crypto Address',
    to: [{ type: 'cryptoAddress' as const }],
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'showCopyToClipboardButton',
    title: 'Show Copy To Clipboard Button',
    type: 'boolean',
    description: 'Show a copy to clipboard button in the display',
    initialValue: true,
  }),
  defineField({
    name: 'showIcon',
    title: 'Show Icon',
    type: 'boolean',
    description: 'Show the icon before the display',
    initialValue: true,
  }),
];

export type CryptoAddressDisplaySchemaType = Omit<
  SchemaFieldsType<typeof cryptoAddressDisplayFields>,
  'cryptoAddress'
> & {
  cryptoAddress?: CryptoAddressSchemaType;
};
