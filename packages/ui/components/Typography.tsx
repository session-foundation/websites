import { type VariantProps, cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

const typographyVariants = cva('text-sm md:text-base', {
  variants: {
    variant: {
      h1: 'font-semibold text-3xl md:text-4xl',
      h2: 'font-semibold text-xl md:text-3xl',
      h3: 'font-semibold text-lg md:text-xl',
      h4: 'font-semibold text-base md:text-lg',
      h5: 'font-semibold text-base md:text-lg',
      h6: 'font-semibold',
      li: 'list-disc',
      ol: 'list-decimal',
      ul: 'list-disc',
      strong: 'font-semibold',
      em: 'italic',
      p: '',
      span: '',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export type TypographyVariantProps = VariantProps<typeof typographyVariants>;

export type TypographyProps = TypographyVariantProps & {
  children: ReactNode;
  className?: string;
};

export default function Typography({ variant, className, children }: TypographyProps) {
  const Comp = variant ?? 'p';
  return <Comp className={cn(typographyVariants({ variant, className }))}>{children}</Comp>;
}
