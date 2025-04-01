'use client';

import { Registration } from '@/app/register/[nodeId]/Registration';
import { useStakes } from '@/hooks/useStakes';
import { areHexesEqual } from '@session/util-crypto/string';
import { useCallback, useEffect, useMemo } from 'react';

import { NodeRegistrationFormSkeleton } from '@/app/register/[nodeId]/NodeRegistrationFormSkeleton';
import { useRegistrationsForCurrentActor } from '@/hooks/useRegistrationsForCurrentActor';
import logger from '@/lib/logger';
import { getNodeRegistrationsForSnKey } from '@/lib/queries/getNodeRegistrationsForSnKey';
import { useStakingBackendBrowserClient } from '@/lib/staking-api-client';
import { useVesting } from '@/providers/vesting-provider';
import { isEd25519PublicKey } from '@session/staking-api-js/refine';
import { safeTrySync, safeTrySyncWithFallback } from '@session/util-js/try';
import { useWallet } from '@session/wallet/hooks/useWallet';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function NodeRegistration({ nodeId }: { nodeId: string }) {
  const pathname = usePathname();
  const stakingBackendClient = useStakingBackendBrowserClient();

  const { address: walletAddress } = useWallet();

  const { data: registrationsData, isLoading: isLoadingRegistrations } =
    useRegistrationsForCurrentActor();

  const {
    connectToVestingContract,
    disconnectFromVestingContract,
    activeContract,
    contracts,
    setShowVestingSelectionDialog,
  } = useVesting();

  const dict = useTranslations('actionModules.registration.shared');

  const { isLoading: isLoadingStakes } = useStakes();

  const registration = useMemo(
    () =>
      registrationsData &&
      'registrations' in registrationsData &&
      Array.isArray(registrationsData.registrations)
        ? registrationsData.registrations.find((node) => areHexesEqual(node.pubkey_ed25519, nodeId))
        : null,
    [registrationsData, nodeId]
  );

  /**
   * Handles if the /register page is visited with a specific SNKey. eg: /register/potato
   * We want to be in the appropriate mode to show the registration if we can find who owns it.
   * A. If the registration is in the wallets' registration list:
   *   - If connected to a vesting contract, disconnect from it.
   *   - Else do nothing. (we're acting as the wallet)
   * B. If the registration is in one of the wallets' vesting contracts' registration list, we
   * enter vesting mode for that contract if we aren't already connected to it.
   *
   * If a valid registration is found, we hide the vesting selection dialog (if its open).
   */
  const handleRegistration = useCallback(
    async (snKey: string) => {
      if (!isEd25519PublicKey(snKey)) {
        logger.warn(`Invalid SNKey for registration: ${snKey}`);
        return;
      }

      logger.debug(`Handling registration for ${snKey}`);
      const res = await getNodeRegistrationsForSnKey(stakingBackendClient, { snKey });
      const [regError, registrations] = safeTrySyncWithFallback(
        () => res.data?.registrations ?? [],
        []
      );
      if (regError) logger.error(regError);

      const latestRegistration = registrations.sort((a, b) => b.timestamp - a.timestamp)[0];
      if (!latestRegistration) {
        logger.debug(`No registrations found for ${snKey}`);
        return;
      }

      const [opError, operator] = safeTrySync(() => latestRegistration.operator);

      if (opError) {
        logger.error(opError);
        return;
      }

      if (activeContract && areHexesEqual(operator, walletAddress)) {
        logger.debug('Registration is for the wallet, disconnecting from vesting contract');
        disconnectFromVestingContract();
        return;
      }

      const contract = contracts.find((contract) => areHexesEqual(contract.address, operator));
      if (contract) {
        logger.debug(`Contract found! Connecting to vesting contract: ${contract.address}`);
        connectToVestingContract(contract);
        setShowVestingSelectionDialog(false);
        return;
      }
    },
    [
      walletAddress,
      activeContract,
      contracts,
      connectToVestingContract,
      disconnectFromVestingContract,
      stakingBackendClient,
      setShowVestingSelectionDialog,
    ]
  );

  /**
   * Handle showing the vesting selection dialog if the user has not yet connected to a vesting contract this session.
   * TODO (NTH): Handle all of this server-side
   */
  useEffect(() => {
    const snKey = pathname.split('/')[2];
    if (snKey) {
      void handleRegistration(snKey);
    }
  }, [handleRegistration, pathname]);

  return isLoadingRegistrations || isLoadingStakes ? (
    <NodeRegistrationFormSkeleton />
  ) : registration ? (
    <Registration
      ed25519PubKey={registration.pubkey_ed25519}
      ed25519Signature={registration.sig_ed25519}
      blsKey={registration.pubkey_bls}
      blsSignature={registration.sig_bls}
      preparedAt={new Date(registration.timestamp * 1000)}
    />
  ) : (
    <span>{dict('nodeNotFound')}</span>
  );
}
