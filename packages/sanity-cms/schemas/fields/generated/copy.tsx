import { defineArrayMember, type PortableTextBlock } from 'sanity';
import { SplitVerticalIcon, TokenIcon, BillIcon, UnlinkIcon } from '@sanity/icons';
import { pickLinkField } from '../basic/links';
import { tilesFields } from '../component/tiles';
import { imageField } from '../basic/image';
import { cryptoAddressDisplayFields } from '../component/crypto-address-display';
import { donorboxFields } from '../component/donorbox';
import { anchorFields } from '../component/anchor';

export const copyFieldOf = [
  defineArrayMember({
    name: 'block',
    type: 'block',
    marks: {
      decorators: [
        { title: 'Strong', value: 'strong' },
        { title: 'Emphasis', value: 'em' },
        {
          title: 'Big Bold',
          value: 'big-bold',
          icon: () => (
            <strong>
              B<sup>+</sup>
            </strong>
          ),
          component: ({ children }) => (
            <strong className="text-lg font-semibold md:text-xl">{children}</strong>
          ),
        },
      ],
    },
  }),
  defineArrayMember(imageField),
  defineArrayMember({
    name: 'button',
    type: 'object',
    fields: [pickLinkField],
    icon: SplitVerticalIcon,
    // TODO: figure out how to make this work
    // marks: {
    //   decorators: [
    //     {
    //       title: 'Button',
    //       value: 'button',
    //       component: SanityButton,
    //     },
    //   ],
    // },
  }),
  defineArrayMember({
    type: 'object',
    name: 'tiles',
    icon: SplitVerticalIcon,
    fields: tilesFields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'cryptoAddressDisplay',
    icon: TokenIcon,
    fields: cryptoAddressDisplayFields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'donorbox',
    icon: BillIcon,
    fields: donorboxFields,
  }),
  defineArrayMember({
    type: 'object',
    name: 'anchor',
    icon: UnlinkIcon,
    fields: anchorFields,
  })
];

export type CopyFieldOfType = Array<PortableTextBlock>;
