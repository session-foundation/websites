import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { QuestionIcon } from '../icons/QuestionIcon';
import { cn } from '../lib/utils';
import { Loading } from './loading';
import { Tooltip } from './ui/tooltip';
import { Button, type ButtonProps } from './ui/button';
import './Module.css';

export const outerModuleVariants = cva(
  'rounded-2xl transition-all overflow-hidden ease-in-out bg-blend-lighten shadow-md p-px',
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
    'rounded-[15px] w-full h-full flex align-middle flex-col bg-module',
    '[&>span]:font-medium [&>*>span]:font-medium'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-blend-lighten shadow-md gap-1',
          '[&>h3]:text-lg [&>*>h3]:text-lg',
          '[&>span]:text-3xl [&>*>span]:text-3xl [&>h3]:font-normal [&>*>h3]:font-normal'
        ),
        hero: cn(
          'gap-3 sm:gap-4 hover:brightness-125',
          '[&>h3]:text-3xl [&>h3]:font-normal [&>*>h3]:text-2xl [&>*>h3]:font-normal [&>h3]:text-session-white',
          '[&>span]:text-8xl [&>*>span]:text-8xl [&>span]:text-session-white [&>*>span]:text-session-white'
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
            props.onClick && 'hover:bg-session-green hover:text-session-black hover:cursor-pointer'
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
            'border-session-green group-hover:bg-session-green hover:bg-session-green border-2',
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
      className={cn('text-gradient-white overflow-hidden', className)}
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
  'flex flex-col align-middle justify-center w-full h-full text-center items-center',
  {
    variants: {
      variant: {
        default: '',
        underlay: 'absolute inset-0 -z-1',
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
        <div className={cn('absolute right-5 top-4 cursor-pointer', className)} {...props}>
          <QuestionIcon className="fill-session-text h-4 w-4" />
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
