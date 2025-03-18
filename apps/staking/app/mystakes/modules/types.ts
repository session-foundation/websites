import type { Address } from 'viem';

export type GenericModuleProps = {
  titleOverride?: string;
};

export type AddressModuleProps = GenericModuleProps & {
  addressOverride?: Address;
};
