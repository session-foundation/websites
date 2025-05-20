'use client';

import { TOS_LOCKED_PATHS, URL } from '@/lib/constants';
import { FEATURE_FLAG } from '@/lib/feature-flags';
import { useFeatureFlag } from '@/lib/feature-flags-client';
import { useSetTOS, useTOS } from '@/providers/tos-provider';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@session/ui/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormSubmitButton,
} from '@session/ui/components/ui/form';
import { XIcon } from '@session/ui/icons/XIcon';
import { toast } from '@session/ui/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@session/ui/ui/dialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { externalLink } from '@/lib/locale-defaults';

const FormSchema = z.object({
  accept: z
    .boolean()
    .default(false)
    .refine((value) => value),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export function TOSHandler() {
  const pathname = usePathname();
  const clearAcceptTOSFlag = useFeatureFlag(FEATURE_FLAG.CLEAR_ACCEPT_BUG_BOUNTY);
  const accepted = useTOS();
  const { acceptTOS } = useSetTOS();

  const dict = useTranslations('terms')

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      accept: false,
    },
  });

  function onSubmit(data: FormSchemaType) {
    if (!data.accept) {
      toast.error(
       dict.rich('mustAccept', {link: externalLink(URL.TERMS_AND_CONDITIONS)})
      );
    } else {
      toast.success(
       dict.rich('accepted', {link: externalLink(URL.TERMS_AND_CONDITIONS)})
      );
      acceptTOS(true);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies(acceptTOS): Don't need to worry about setters changing
  useEffect(() => {
    if (clearAcceptTOSFlag) {
      acceptTOS(false);
    }
  }, [clearAcceptTOSFlag]);

  return (
    <Dialog open={!accepted && TOS_LOCKED_PATHS.some((path) => pathname.startsWith(path))}>
      <DialogContent hideCloseButton className="bg-session-black text-session-white">
        <DialogHeader>
          <DialogTitle>
            {dict('title')}
            <Link
              href="/"
              prefetch
              className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Link>
          </DialogTitle>
          <DialogDescription className="text-session-white">
            {dict.rich('description', {link: externalLink(URL.TERMS_AND_CONDITIONS)})}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="accept"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 text-xs">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="leading-none">
                    {dict.rich('agree', {link: externalLink(URL.TERMS_AND_CONDITIONS)})}
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormSubmitButton data-testid={ButtonDataTestId.Agree_TOS}>{dict('button')}</FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
