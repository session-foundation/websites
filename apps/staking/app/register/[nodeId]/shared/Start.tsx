import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import {
  NODE_TYPE,
  REG_MODE,
  isUserSelectableRegistrationMode,
} from '@/app/register/[nodeId]/types';
import { ActionModuleTooltip } from '@/components/ActionModule';
import { PREFERENCE, prefDetails } from '@/lib/constants';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@session/ui/components/ui/form';
import { Button } from '@session/ui/ui/button';
import { RadioGroup, RadioGroupItem } from '@session/ui/ui/radio-group';
import { z } from 'zod';

export const RegistrationStartFormSchema = z.object({
  mode: z.enum([REG_MODE.EXPRESS, REG_MODE.GUIDED], {
    required_error: 'You need to select a mode.',
  }),
  nodeType: z.enum([NODE_TYPE.SOLO, NODE_TYPE.MULTI], {
    required_error: 'You need to select a node type.',
  }),
});

export function StartTab() {
  const { dict, setStartData, mode } = useRegistrationWizard();

  const form = useForm<z.infer<typeof RegistrationStartFormSchema>>({
    resolver: zodResolver(RegistrationStartFormSchema),
    defaultValues: {
      mode: isUserSelectableRegistrationMode(mode)
        ? mode
        : prefDetails[PREFERENCE.PREF_REGISTRATION_MODE].defaultValue,
      nodeType: NODE_TYPE.SOLO,
    },
  });

  return (
    <Form {...form}>
      <form className="flex w-full flex-col gap-6" onSubmit={form.handleSubmit(setStartData)}>
        <div className="flex flex-col gap-4">
          <Button
            className="uppercase"
            data-testid={ButtonDataTestId.Registration_Start_Button_Solo}
            aria-label={dict('start.buttonSolo.aria')}
            onClick={() => {
              form.setValue('nodeType', NODE_TYPE.SOLO);
            }}
            type="submit"
          >
            {dict('start.buttonSolo.text')}
          </Button>
          <Button
            className="uppercase"
            data-testid={ButtonDataTestId.Registration_Start_Button_Multi}
            aria-label={dict('start.buttonMulti.aria')}
            onClick={() => {
              form.setValue('nodeType', NODE_TYPE.MULTI);
            }}
            type="submit"
          >
            {dict('start.buttonMulti.text')}
          </Button>
        </div>
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-3">
              <FormLabel className="font-semibold">{dict('start.chooseMode.title')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-3"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={REG_MODE.EXPRESS} />
                    </FormControl>
                    <FormLabel className="inline-flex items-center gap-1.5 align-middle font-normal">
                      {dict('start.chooseMode.express.text')}
                      <ActionModuleTooltip>
                        {dict('start.chooseMode.express.tooltip')}
                      </ActionModuleTooltip>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={REG_MODE.GUIDED} />
                    </FormControl>
                    <FormLabel className="inline-flex items-center gap-1.5 align-middle font-normal">
                      {dict('start.chooseMode.guided.text')}
                      <ActionModuleTooltip>
                        {dict('start.chooseMode.guided.tooltip')}
                      </ActionModuleTooltip>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
