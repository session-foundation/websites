'use client';

import { InfoNodeCard, NodeItem, NodeItemLabel, NodeItemValue } from '@/components/InfoNodeCard';
import useRelativeTime from '@/hooks/useRelativeTime';
import { ButtonDataTestId } from '@/testing/data-test-ids';
import type { Registration } from '@session/staking-api-js/client';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { type HTMLAttributes, forwardRef, useMemo } from 'react';

const NodeRegistrationCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { node: Registration }
>(({ className, node, ...props }, ref) => {
  const dictionary = useTranslations('nodeCard.pending');
  const dictRegistration = useTranslations('actionModules.registration.shared');
  const titleFormat = useTranslations('modules.title');
  const pathname = usePathname();

  const { pubkey_ed25519: pubKey, timestamp } = node;

  const preparedTimer = useRelativeTime(new Date(timestamp * 1000), { addSuffix: true });

  const isRegistrationFormOpen = useMemo(
    () => pathname === `/register/${pubKey}`,
    [pathname, pubKey]
  );

  // TODO - Include feature when we have user preference support
  /*const hideRegistrationsEnabled = useExperimentalFeatureFlag(
    EXPERIMENTAL_FEATURE_FLAG.HIDE_REGISTRATIONS
  );
  const hiddenPreparedRegistrations = useUserPreference('hiddenPreparedRegistrations');
  const { setUserPreference } = useSetUserPreference();
  const [toggleHiddenButtonFocused, setToggleHiddenButtonFocused] = useState<boolean>(false);


  const hidden = useMemo(
    () => hiddenPreparedRegistrations?.includes(pubKey),
    [hiddenPreparedRegistrations?.length, pubKey]
  );

  const handleHideButtonClick = () => {
    if (toggleHiddenButtonFocused) {
      if (hidden) {
        const newHiddenList = hiddenPreparedRegistrations?.filter((key) => key !== pubKey) ?? [];
        setUserPreference('hiddenPreparedRegistrations', newHiddenList);
      } else {
        const newHiddenList = new Set([...(hiddenPreparedRegistrations ?? []), pubKey]);
        setUserPreference('hiddenPreparedRegistrations', [...newHiddenList]);
      }
      setToggleHiddenButtonFocused(false);
    } else {
      setToggleHiddenButtonFocused(true);
    }
  };*/

  return (
    <InfoNodeCard
      ref={ref}
      className={className}
      pubKey={pubKey}
      isActive={isRegistrationFormOpen}
      /*buttonSiblings={
        hideRegistrationsEnabled ? (
          <Button
            variant={hidden ? 'outline' : 'destructive-outline'}
            size="sm"
            rounded="md"
            onClick={handleHideButtonClick}
            onBlur={() => setToggleHiddenButtonFocused(false)}
            data-testid={ButtonDataTestId.Hide_Prepared_Registration}
            className="group inline-flex gap-1 align-middle"
          >
            {hidden ? (
              <EyeIcon className="stroke-session-green group-hover:stroke-session-black h-5 w-5" />
            ) : (
              <EyeOffIcon className="stroke-destructive group-hover:stroke-session-black h-5 w-5" />
            )}
            {toggleHiddenButtonFocused ? (
              <span className="group-hover:text-session-black mt-0.5">
                {hidden ? 'Show' : 'Hide'}
              </span>
            ) : null}
          </Button>
        ) : null
      }*/
      button={
        !isRegistrationFormOpen
          ? {
              ariaLabel: dictionary('registerButton.ariaLabel'),
              text: dictionary('registerButton.text'),
              dataTestId: ButtonDataTestId.Node_Card_Register,
              link: `/register/${pubKey}`,
            }
          : undefined
      }
      {...props}
    >
      <NodeItem>
        <NodeItemLabel>
          {titleFormat('format', { title: dictRegistration('submit.preparedAt') })}
        </NodeItemLabel>
        <NodeItemValue>{preparedTimer}</NodeItemValue>
      </NodeItem>
    </InfoNodeCard>
  );
});

NodeRegistrationCard.displayName = 'NodeRegistrationCard';

export { NodeRegistrationCard };
