export enum REG_TAB {
  START,
  //
  REWARDS_ADDRESS_INPUT_SOLO,
  SUBMIT_SOLO,
  SUCCESS_SOLO,
  ERROR_SOLO,
  //
  STAKE_AMOUNT,
  OPERATOR_FEE,
  REWARDS_ADDRESS,
  REWARDS_ADDRESS_INPUT_MULTI,
  RESERVE_SLOTS,
  RESERVE_SLOTS_INPUT,
  AUTO_ACTIVATE,
  SUBMIT_MULTI,
  SUCCESS_MULTI,
  ERROR_MULTI,
}

export function parseTab(tab: REG_TAB) {
  switch (tab) {
    case REG_TAB.START:
      return 'start';
    // SOLO
    case REG_TAB.REWARDS_ADDRESS_INPUT_SOLO:
      return 'rewardsAddressInputSolo';
    case REG_TAB.SUBMIT_SOLO:
      return 'submitSolo';
    // MULTI
    case REG_TAB.REWARDS_ADDRESS_INPUT_MULTI:
      return 'rewardsAddressInputMulti';
    case REG_TAB.STAKE_AMOUNT:
      return 'stakeAmount';
    case REG_TAB.OPERATOR_FEE:
      return 'operatorFee';
    case REG_TAB.REWARDS_ADDRESS:
      return 'rewardsAddress';
    case REG_TAB.RESERVE_SLOTS:
      return 'reserveSlots';
    case REG_TAB.RESERVE_SLOTS_INPUT:
      return 'reserveSlotsInput';
    case REG_TAB.AUTO_ACTIVATE:
      return 'autoActivate';
    case REG_TAB.SUBMIT_MULTI:
      return 'submitMulti';
    case REG_TAB.SUCCESS_MULTI:
      return 'successMulti';
    case REG_TAB.ERROR_MULTI:
      return 'errorMulti';
    default:
      throw new Error(`Unknown tab: ${tab}`);
  }
}

export enum NODE_TYPE {
  SOLO = 'solo',
  MULTI = 'multi',
}

export enum REG_MODE {
  EXPRESS = 'express',
  GUIDED = 'guided',
  EDIT = 'edit',
}

export type UserSelectableRegistrationMode = Exclude<REG_MODE, REG_MODE.EDIT>;

const registrationModes = Object.values(REG_MODE);

export const isRegistrationMode = (mode: string): mode is REG_MODE =>
  registrationModes.includes(mode as REG_MODE);

export const isUserSelectableRegistrationMode = (
  mode: string
): mode is UserSelectableRegistrationMode => isRegistrationMode(mode) && mode !== REG_MODE.EDIT;
