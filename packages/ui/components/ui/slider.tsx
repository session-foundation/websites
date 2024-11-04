'use client';

import * as React from 'react';
import { useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';
import { Circle } from '../motion/shapes/circle';

const circleRadius = 6;
const extraRad = 1.875;
const height = (circleRadius + extraRad) * 2 + 2;
const width = height;
const circleVariant = 'green';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ value, max, className, children, ...props }, ref) => {
  const [showPercent, setShowPercent] = useState<boolean>(false);
  const decimalPercent =
    value?.[0] !== undefined && max !== undefined && max !== 0 ? value[0] / max : 0;
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      value={value}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track className="bg-indicator-grey relative mx-1 h-0.5 w-full grow rounded-full">
        <SliderPrimitive.Range className="bg-session-green absolute h-full" />
        <div className="absolute left-0 right-0 flex h-full items-center justify-center">
          <svg
            height={10}
            width={10}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -left-0.5 cursor-pointer"
          >
            <Circle cx="50%" cy="50%" r={4} variant="green" strokeVariant="green" />
          </svg>
          <svg
            height={10}
            width={10}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -right-0.5 cursor-pointer"
          >
            <Circle cx="50%" cy="50%" r={4} variant="grey" strokeVariant="grey" />
          </svg>
          <svg
            height={10}
            width={10}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute cursor-pointer"
            style={{
              left: `calc(${25}%)`,
            }}
          >
            <Circle
              cx="50%"
              cy="50%"
              r={4}
              variant={decimalPercent > 0.25 ? 'green' : 'grey'}
              strokeVariant={decimalPercent > 0.25 ? 'green' : 'grey'}
            />
          </svg>
          <svg
            height={10}
            width={10}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute cursor-pointer"
            style={{
              left: `calc(${50}% - 8px)`,
            }}
          >
            <Circle
              cx="50%"
              cy="50%"
              r={4}
              variant={decimalPercent > 0.5 ? 'green' : 'grey'}
              strokeVariant={decimalPercent > 0.5 ? 'green' : 'grey'}
            />
          </svg>
          <svg
            height={10}
            width={10}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute cursor-pointer"
            style={{
              left: `calc(${75}% - 8px)`,
            }}
          >
            <Circle
              cx="50%"
              cy="50%"
              r={4}
              variant={decimalPercent > 0.75 ? 'green' : 'grey'}
              strokeVariant={decimalPercent > 0.75 ? 'green' : 'grey'}
            />
          </svg>
          {children}
        </div>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        onMouseEnter={() => setShowPercent(true)}
        onMouseLeave={() => setShowPercent(false)}
        style={{ width, height }}
        className="relative block cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
      >
        <svg height={height} width={width} xmlns="http://www.w3.org/2000/svg" className="absolute">
          <Circle cx="50%" cy="50%" r={circleRadius + extraRad} variant={circleVariant} />
        </svg>
        <svg height={height} width={width} xmlns="http://www.w3.org/2000/svg" className="absolute">
          <Circle cx="50%" cy="50%" r={circleRadius} strokeWidth={1.125} variant={circleVariant} />
        </svg>
        {showPercent ? (
          <span
            className={cn(
              'absolute -top-8',
              'text-session-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-session-black border-px z-50 max-w-[90svw] flex-wrap overflow-hidden text-wrap rounded-lg border border-[#1C2624] bg-opacity-50 px-1.5 py-1 text-xs shadow-xl outline-none md:max-w-xl'
            )}
            style={{ left: -circleRadius - extraRad }}
          >
            {new Intl.NumberFormat(undefined, {
              style: 'percent',
              minimumFractionDigits: 0,
              maximumFractionDigits: 1,
            }).format(decimalPercent)}
          </span>
        ) : null}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
