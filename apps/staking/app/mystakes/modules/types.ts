import type { ModuleProps } from '@session/ui/components/Module';
import type { Address } from 'viem';

export type GenericModuleProps = ModuleProps & {
  titleOverride?: string;
};

export type AddressModuleProps = GenericModuleProps & {
  addressOverride?: Address;
};
