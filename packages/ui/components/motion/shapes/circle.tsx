import { type VariantProps, cva } from 'class-variance-authority';
import {
  type AnimationControls,
  type MotionStyle,
  type TargetAndTransition,
  type VariantLabels,
  type Variants,
  motion,
} from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

export const circleVariants = cva('', {
  variants: {
    variant: {
      black: 'fill-indicator-black',
      grey: 'fill-indicator-grey',
      'grey-lighter': 'fill-indicator-grey-lighter',
      green: 'fill-indicator-green',
      blue: 'fill-indicator-blue',
      yellow: 'fill-indicator-yellow',
      red: 'fill-indicator-red',
    },
    strokeVariant: {
      black: 'stroke-indicator-black',
      grey: 'stroke-indicator-grey',
      'grey-lighter': 'stroke-indicator-grey-lighter',
      green: 'stroke-indicator-green',
      blue: 'stroke-indicator-blue',
      yellow: 'stroke-indicator-yellow',
      red: 'stroke-indicator-red',
    },
    glow: {
      black: '',
      grey: 'glow-grey drop-shadow-[0_0_8px_var(--indicator-grey)]',
      'grey-lighter': 'glow-grey-lighter drop-shadow-[0_0_8px_var(--indicator-grey-lighter)]',
      green: 'glow drop-shadow-[0_0_8px_var(--indicator-green)]',
      blue: 'glow-blue drop-shadow-[0_0_8px_var(--indicator-blue)]',
      yellow: 'glow-yellow drop-shadow-[0_0_8px_var(--indicator-yellow)]',
      red: 'glow-red drop-shadow-[0_0_8px_var(--indicator-red)]',
    },
    partial: {
      '100': '',
      '25': '[stroke-dasharray:25,100] [stroke-linecap:round]',
    },
  },
  defaultVariants: {
    variant: 'black',
    strokeVariant: 'black',
    glow: 'black',
    partial: '100',
  },
});

export type CircleVariantProps = VariantProps<typeof circleVariants>;

type CircleProps = CircleVariantProps & {
  cx: number | string;
  cy: number | string;
  r: number;
  strokeWidth?: number;
  className?: string;
  variants?: Variants;
  animate?: AnimationControls | TargetAndTransition | VariantLabels;
  style?: MotionStyle;
};

export const Circle = forwardRef<SVGCircleElement, CircleProps>(
  (
    {
      cx,
      cy,
      r,
      strokeWidth,
      className,
      style,
      variant,
      strokeVariant,
      partial,
      glow,
      animate,
      variants,
      ...props
    },
    ref
  ) => (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      strokeWidth={strokeWidth}
      className={cn(circleVariants({ variant, strokeVariant, partial, glow, className }))}
      style={style}
      ref={ref}
      variants={variants}
      animate={animate}
      {...props}
    />
  )
);
