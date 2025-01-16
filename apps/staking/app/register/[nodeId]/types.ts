export enum REG_TAB {
  START = 0,
  //
  REWARDS_ADDRESS_INPUT_SOLO = 1,
  SUBMIT_SOLO = 2,
  SUCCESS_SOLO = 3,
  //
  STAKE_AMOUNT = 4,
  OPERATOR_FEE = 5,
  REWARDS_ADDRESS = 6,
  REWARDS_ADDRESS_INPUT_MULTI = 7,
  RESERVE_SLOTS = 8,
  RESERVE_SLOTS_INPUT = 9,
  AUTO_ACTIVATE = 10,
  SUBMIT_MULTI = 11,
  SUCCESS_MULTI = 12,
  // Already Registered
  ALREADY_REGISTERED_RUNNING = 13,
  ALREADY_REGISTERED_MULTI = 14,
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
    case REG_TAB.SUCCESS_SOLO:
      return 'successSolo';
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
    // Already Registered
    case REG_TAB.ALREADY_REGISTERED_RUNNING:
      return 'alreadyRegisteredRunning';
    case REG_TAB.ALREADY_REGISTERED_MULTI:
      return 'alreadyRegisteredMulti';
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
