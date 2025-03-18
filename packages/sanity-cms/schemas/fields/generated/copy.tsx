import { SplitVerticalIcon } from '@sanity/icons';
import { type PortableTextBlock, defineArrayMember } from 'sanity';
import { imageField } from '../basic/image';
import { pickLinkField } from '../basic/links';
import { tilesFields } from '../component/tiles';

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
            <strong className="font-semibold text-lg md:text-xl">{children}</strong>
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
];

export type CopyFieldOfType = Array<PortableTextBlock>;
