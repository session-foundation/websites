import { type VariantProps, cva } from 'class-variance-authority';
import { type HTMLAttributes, forwardRef } from 'react';
import { QuestionIcon } from '../icons/QuestionIcon';
import { cn } from '../lib/utils';
import { Loading } from './loading';
import { Button, type ButtonProps } from './ui/button';
import { Tooltip } from './ui/tooltip';
import './Module.css';

export const outerModuleVariants = cva(
  'overflow-hidden rounded-2xl p-px bg-blend-lighten shadow-md transition-all ease-in-out',
  {
    variants: {
      variant: {
        default: '',
        hero: '',
      },
      size: {
        default: 'col-span-1',
        lg: 'col-span-1 sm:col-span-2',
      },
      outline: {
        true: 'bg-module-outline',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      outline: true,
    },
  }
);

const innerModuleVariants = cva(
  cn(
    'flex h-full w-full flex-col rounded-[15px] bg-module align-middle',
    '[&>*>span]:font-medium [&>span]:font-medium'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'gap-1 bg-blend-lighten shadow-md',
          '[&>*>h3]:text-lg [&>h3]:text-lg',
          '[&>*>h3]:font-normal [&>*>span]:text-3xl [&>h3]:font-normal [&>span]:text-3xl'
        ),
        hero: cn(
          'gap-3 hover:brightness-125 sm:gap-4',
          '[&>*>h3]:font-normal [&>*>h3]:text-2xl [&>h3]:font-normal [&>h3]:text-3xl [&>h3]:text-session-white',
          '[&>*>span]:text-8xl [&>*>span]:text-session-white [&>span]:text-8xl [&>span]:text-session-white'
        ),
      },
      size: {
        default: 'p-4 sm:p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ModuleProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof innerModuleVariants> {
  loading?: boolean;
  noPadding?: boolean;
}

const Module = forwardRef<HTMLDivElement, ModuleProps>(
  ({ className, variant, size, loading, children, noPadding, ...props }, ref) => {
    return (
      <div className={cn(outerModuleVariants({ size, variant, className }))}>
        <div
          className={cn(
            'relative',
            innerModuleVariants({ size, variant, className }),
            noPadding && 'p-0 sm:p-0',
            props.onClick && 'hover:cursor-pointer hover:bg-session-green hover:text-session-black'
          )}
          ref={ref}
          {...props}
          style={{
            containerType: 'inline-size',
            ...(variant === 'hero'
              ? {
                  background: 'url(/images/module-hero.png)',
                  backgroundPositionX: '35%',
                  backgroundPositionY: '35%',
                  backgroundSize: '150%',
                }
              : {}),
          }}
        >
          {loading ? <Loading /> : children}
        </div>
      </div>
    );
  }
);

Module.displayName = 'Module';

export interface ButtonModuleProps
  extends Omit<ButtonProps, 'size' | 'variant'>,
    VariantProps<typeof innerModuleVariants> {
  loading?: boolean;
  noPadding?: boolean;
}

const ButtonModule = forwardRef<HTMLButtonElement, ButtonModuleProps>(
  ({ className, variant, size, loading, children, noPadding, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn(
          outerModuleVariants({ size, variant, outline: disabled, className }),
          'relative h-full transition-all duration-300 disabled:opacity-100 group-hover:shadow-none motion-reduce:transition-none',
          !disabled &&
            'border-2 border-session-green hover:bg-session-green group-hover:bg-session-green',
          noPadding && 'p-0'
        )}
        variant="ghost"
        ref={ref}
        {...props}
        style={
          variant === 'hero'
            ? {
                background: 'url(/images/module-hero.png)',
                backgroundPositionX: '35%',
                backgroundPositionY: '35%',
                backgroundSize: '135%',
              }
            : undefined
        }
        disabled={disabled}
      >
        <div
          className={cn(
            innerModuleVariants({
              size,
              variant,
              className,
            }),
            !disabled &&
              'transition-all duration-300 group-hover:bg-none group-hover:shadow-none motion-reduce:transition-none'
          )}
        >
          {loading ? <Loading /> : children}
        </div>
      </Button>
    );
  }
);

ButtonModule.displayName = 'ButtonModule';

const moduleHeaderVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      overlay: 'absolute z-1',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ModuleHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof moduleHeaderVariants> {
  loading?: boolean;
}

const ModuleHeader = forwardRef<HTMLDivElement, ModuleHeaderProps>(
  ({ className, variant, loading, children, ...props }, ref) => {
    return (
      <div className={cn(moduleHeaderVariants({ variant, className }))} ref={ref} {...props}>
        {loading ? <Loading /> : children}
      </div>
    );
  }
);
ModuleHeader.displayName = 'ModuleHeader';

const moduleTitleClassName = 'text-gradient-white-mock truncate leading-none tracking-tight';

const ModuleTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn(moduleTitleClassName, className)} {...props} />
  )
);
ModuleTitle.displayName = 'ModuleTitle';

type ModuleTitleDynamicProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> & {
  longText: string;
  shortText?: string;
};

const ModuleTitleDynamic = forwardRef<HTMLHeadingElement, ModuleTitleDynamicProps>(
  ({ shortText, longText, ...props }, ref) => (
    <ModuleTitle ref={ref} {...props}>
      {shortText ? (
        <>
          <div className={cn('module-title-dynamic-short', moduleTitleClassName)}>{shortText}</div>
          <div className={cn('module-title-dynamic-long', moduleTitleClassName)}>{longText}</div>
        </>
      ) : (
        longText
      )}
    </ModuleTitle>
  )
);
ModuleTitleDynamic.displayName = 'ModuleTitleDynamic';

export type ModuleTextProps = HTMLAttributes<HTMLSpanElement> & { isLarge?: boolean };

const ModuleText = forwardRef<HTMLSpanElement, ModuleTextProps>(
  ({ className, isLarge, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('overflow-hidden text-gradient-white', className)}
      {...props}
      style={{ fontSize: isLarge ? 'clamp(24px, 12cqi, 48px)' : 'clamp(18px, 12cqi, 30px)' }}
    />
  )
);
ModuleText.displayName = 'ModuleText';

const ModuleDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-muted-foreground', className)} {...props} />
  )
);
ModuleDescription.displayName = 'ModuleDescription';

const moduleContentVariants = cva(
  'flex h-full w-full flex-col items-center justify-center text-center align-middle',
  {
    variants: {
      variant: {
        default: '',
        underlay: '-z-1 absolute inset-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ModuleContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof moduleContentVariants> {
  loading?: boolean;
}

const ModuleContent = forwardRef<HTMLDivElement, ModuleContentProps>(
  ({ className, variant, loading, children, ...props }, ref) => {
    return (
      <div className={cn(moduleContentVariants({ variant, className }))} ref={ref} {...props}>
        {loading ? <Loading /> : children}
      </div>
    );
  }
);

const ModuleTooltip = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <Tooltip ref={ref} tooltipContent={children} putContentInPortal>
        <div className={cn('absolute top-4 right-5 cursor-pointer', className)} {...props}>
          <QuestionIcon className='h-4 w-4 fill-session-text' />
        </div>
      </Tooltip>
    );
  }
);
ModuleTooltip.displayName = 'ModuleTooltip';

ModuleContent.displayName = 'ModuleContent';

export {
  Module,
  ModuleContent,
  ModuleDescription,
  ModuleHeader,
  ModuleText,
  ModuleTitle,
  ModuleTooltip,
  ButtonModule,
  ModuleTitleDynamic,
  innerModuleVariants as moduleVariants,
};
