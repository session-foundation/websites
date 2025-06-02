import { defineField } from 'sanity';
import type { SchemaFieldsType } from '../../types';
import { urlField } from '../basic/url';

export const donorboxFields = [
  defineField({
    name: 'showDonorbox',
    title: 'Show Donorbox',
    type: 'boolean',
    description: 'Show a the Donorbox component',
    initialValue: false,
  }),
  defineField({
    name: 'enablePaypalExpress',
    title: 'Enable PayPal Express',
    type: 'boolean',
    description: "Don't touch this unless you know what you are doing",
    initialValue: false,
  }),
  urlField,
];

export type DonorboxSchemaType = SchemaFieldsType<typeof donorboxFields>;
