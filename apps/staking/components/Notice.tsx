import type { PREFERENCE } from '@/lib/constants';
import type { ButtonDataTestId, CheckboxDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormSubmitButton,
  useForm,
} from '@session/ui/components/ui/form';
import { cn } from '@session/ui/lib/utils';
import { Button, type ButtonVariantProps } from '@session/ui/ui/button';
import { Checkbox } from '@session/ui/ui/checkbox';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { usePreferences } from 'usepref';
import { z } from 'zod';

const FormSchema = z.object({
  dontShowAgain: z.boolean().optional().default(false),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export type NoticeProps = {
  cancelButtonDataTestId?: ButtonDataTestId;
  cancelButtonVariant?: ButtonVariantProps['variant'];
  cancelButtonText?: string;
  children?: ReactNode;
  confirmButtonDataTestId: ButtonDataTestId;
  confirmButtonVariant?: ButtonVariantProps['variant'];
  confirmButtonText?: string;
  dontShowAgainDataTestId?: CheckboxDataTestId;
  dontShowAgainPreference?: PREFERENCE;
  onCancel?: () => void;
  onContinue: () => void;
};

export function Notice({
  cancelButtonDataTestId,
  cancelButtonVariant,
  confirmButtonText,
  children,
  confirmButtonDataTestId,
  confirmButtonVariant,
  cancelButtonText,
  dontShowAgainDataTestId,
  dontShowAgainPreference,
  onCancel,
  onContinue,
}: NoticeProps) {
  const dict = useTranslations('infoNotice');

  const { setItem } = usePreferences();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dontShowAgain: false,
    },
  });

  function onSubmit(data: FormSchemaType) {
    onContinue();
    if (data.dontShowAgain && typeof dontShowAgainPreference !== 'undefined') {
      setItem(dontShowAgainPreference, true);
    }
  }

  return (
    <>
      {children}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-4">
          <FormField
            control={form.control}
            name="dontShowAgain"
            render={({ field }) => (
              <FormItem
                className={cn(
                  'my-4 flex flex-row items-center gap-2 space-y-0 align-middle text-xs',
                  typeof dontShowAgainPreference === 'undefined' ? 'hidden' : ''
                )}
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid={dontShowAgainDataTestId}
                  />
                </FormControl>
                <FormLabel className="leading-none">{dict('dontShowAgain')}</FormLabel>
              </FormItem>
            )}
          />
          <FormSubmitButton
            data-testid={confirmButtonDataTestId}
            allowNonDirtySubmission
            variant={confirmButtonVariant ?? 'default'}
          >
            {confirmButtonText ?? dict('confirm')}
          </FormSubmitButton>
          {typeof onCancel === 'function' && cancelButtonDataTestId ? (
            <Button
              data-testid={cancelButtonDataTestId}
              onClick={onCancel}
              type="reset"
              variant={cancelButtonVariant ?? 'destructive'}
            >
              {cancelButtonText ?? dict('cancel')}
            </Button>
          ) : null}
        </form>
      </Form>
    </>
  );
}
