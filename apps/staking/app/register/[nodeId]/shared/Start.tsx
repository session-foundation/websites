import { useRegistrationWizard } from '@/app/register/[nodeId]/Registration';
import {
  NODE_TYPE,
  REG_MODE,
  isUserSelectableRegistrationMode,
} from '@/app/register/[nodeId]/types';
import { ActionModuleTooltip } from '@/components/ActionModule';
import { PREFERENCE, prefDetails } from '@/lib/constants';
import { REMOTE_FEATURE_FLAG } from '@/lib/feature-flags';
import { useRemoteFeatureFlagQuery } from '@/lib/feature-flags-client';
import { ButtonDataTestId, RadioDataTestId } from '@/testing/data-test-ids';
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
import { cn } from '@session/ui/lib/utils';
import { Button } from '@session/ui/ui/button';
import { RadioGroup, RadioGroupItem } from '@session/ui/ui/radio-group';
import { Tooltip } from '@session/ui/ui/tooltip';
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

  const { enabled: soloDisabled } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION_SOLO
  );
  const { enabled: multiDisabled } = useRemoteFeatureFlagQuery(
    REMOTE_FEATURE_FLAG.DISABLE_NODE_REGISTRATION_MULTI
  );

  const form = useForm<z.infer<typeof RegistrationStartFormSchema>>({
    resolver: zodResolver(RegistrationStartFormSchema),
    defaultValues: {
      mode: isUserSelectableRegistrationMode(mode)
        ? mode
        : prefDetails[PREFERENCE.PREF_REGISTRATION_MODE].defaultValue,
      nodeType: NODE_TYPE.SOLO,
    },
  });

  const soloButton = (
    <Button
      className={cn('uppercase', soloDisabled && 'w-full')}
      disabled={soloDisabled}
      data-testid={ButtonDataTestId.Registration_Start_Button_Solo}
      aria-label={dict('start.buttonSolo.aria')}
      onClick={() => {
        form.setValue('nodeType', NODE_TYPE.SOLO);
      }}
      type="submit"
    >
      {dict('start.buttonSolo.text')}
    </Button>
  );

  const multiButton = (
    <Button
      className={cn('uppercase', multiDisabled && 'w-full')}
      disabled={multiDisabled}
      data-testid={ButtonDataTestId.Registration_Start_Button_Multi}
      aria-label={dict('start.buttonMulti.aria')}
      onClick={() => {
        form.setValue('nodeType', NODE_TYPE.MULTI);
      }}
      type="submit"
    >
      {dict('start.buttonMulti.text')}
    </Button>
  );

  return (
    <Form {...form}>
      <form className="flex w-full flex-col gap-6" onSubmit={form.handleSubmit(setStartData)}>
        <div className="flex flex-col gap-4">
          {!soloDisabled ? (
            soloButton
          ) : (
            <Tooltip tooltipContent={dict('start.registrationDisabledSolo')}>
              <div className="w-full">{soloButton}</div>
            </Tooltip>
          )}
          {!multiDisabled ? (
            multiButton
          ) : (
            <Tooltip tooltipContent={dict('start.registrationDisabledMulti')}>
              <div className="w-full">{multiButton}</div>
            </Tooltip>
          )}
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
                      <RadioGroupItem
                        value={REG_MODE.EXPRESS}
                        data-testid={RadioDataTestId.Registration_Start_Radio_Express}
                      />
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
                      <RadioGroupItem
                        value={REG_MODE.GUIDED}
                        data-testid={RadioDataTestId.Registration_Start_Radio_Guided}
                      />
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
