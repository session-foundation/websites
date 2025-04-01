import { CONTRIBUTION_CONTRACT_STATUS } from '@session/staking-api-js/enums';
import type { ContributionContractContributor } from '@session/staking-api-js/schema';
import type { Address } from 'viem';
// In these tests we assume that these helper functions/constants are imported in parseContracts.
// We mock them to control behavior.
import { parseContracts } from '../hooks/parseContracts';
import {
  CONTRACT_ADDRESS,
  CONTRIBUTOR,
  DEPLOY_ARB_EVENT,
  ED25519_ADDRESS,
  FINALIZED_ARB_EVENT,
  WALLET_ADDRESS,
} from './testUtils';

const fakePino = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const fakePinoFunc = () => {
  return fakePino;
};
fakePinoFunc.destination = jest.fn();

jest.doMock('../lib/logger', () => {
  return fakePinoFunc;
});
const _pino = require('../lib/logger');

// A dummy wallet address used in tests.
const walletAddress = WALLET_ADDRESS[1];
// A sample minimum lifespan for a node in arb blocks.
const nodeMinLifespanArbBlocks = 100;

describe('parseContracts', () => {
  it('should add a contract to visibleContracts when not duplicate and not finalized', () => {
    const contract = {
      address: CONTRACT_ADDRESS[1],
      contributors: [],
      events: [DEPLOY_ARB_EVENT(50)],
      operator_address: WALLET_ADDRESS[1],
      service_node_pubkey: ED25519_ADDRESS[1],
      status: CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib,
      fee: 10,
      manual_finalize: false,
      pubkey_bls: 'key1',
    };

    const result = parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });

    expect(result.visibleContracts).toHaveLength(1);
    expect(result.visibleContracts[0]).toEqual(contract);
    expect(result.joiningContracts).toHaveLength(0);
    expect(result.hiddenContractsWithStakes).toHaveLength(0);
  });

  it('should not add contract when its a a duplicate of a newer shown contract', () => {
    const contract1 = {
      address: CONTRACT_ADDRESS[1],
      contributors: [],
      events: [DEPLOY_ARB_EVENT(60)],
      operator_address: WALLET_ADDRESS[1],
      service_node_pubkey: ED25519_ADDRESS[1],
      status: CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib,
      fee: 10,
      manual_finalize: false,
      pubkey_bls: 'dupKey',
    };

    const contract2 = {
      address: CONTRACT_ADDRESS[2],
      contributors: [],
      events: [DEPLOY_ARB_EVENT(70)],
      operator_address: WALLET_ADDRESS[2],
      service_node_pubkey: ED25519_ADDRESS[2],
      status: CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib,
      fee: 10,
      manual_finalize: false,
      pubkey_bls: 'dupKey',
    };

    const contract3 = {
      address: CONTRACT_ADDRESS[3],
      contributors: [],
      events: [DEPLOY_ARB_EVENT(65)],
      operator_address: WALLET_ADDRESS[3],
      service_node_pubkey: ED25519_ADDRESS[3],
      status: CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib,
      fee: 10,
      manual_finalize: false,
      pubkey_bls: 'dupKey',
    };

    const result = parseContracts({
      contracts: [contract1, contract2, contract3],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });

    expect(result.visibleContracts).toHaveLength(1);
    expect(result.visibleContracts[0]).toEqual(contract2);
    expect(result.joiningContracts).toHaveLength(0);
    expect(result.hiddenContractsWithStakes).toHaveLength(0);
  });

  it('should hide a duplicate contract with no stake', () => {
    // Duplicate: pubkey exists in addedBlsKeys.
    const contract = {
      address: CONTRACT_ADDRESS[1],
      contributors: [],
      events: [DEPLOY_ARB_EVENT(60)],
      operator_address: WALLET_ADDRESS[1],
      service_node_pubkey: ED25519_ADDRESS[1],
      status: CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib,
      fee: 20,
      manual_finalize: false,
      pubkey_bls: 'dupKey',
    };

    const result = parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys: { dupKey: 1 },
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });

    // Since the pubkey is already in networkBlsKeys and there is no stake, the contract is skipped.
    expect(result.visibleContracts).toHaveLength(0);
    expect(result.joiningContracts).toHaveLength(0);
    expect(result.hiddenContractsWithStakes).toHaveLength(0);
  });

  const basicContract = {
    address: CONTRACT_ADDRESS[2],
    contributors: [],
    events: [DEPLOY_ARB_EVENT(70)],
    operator_address: WALLET_ADDRESS[2],
    service_node_pubkey: ED25519_ADDRESS[2],
    status: CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib,
    fee: 30,
    manual_finalize: false,
    pubkey_bls: 'dupKey2',
  };

  function hiddenWithStakeTestTemplate(
    contributorArray: Array<ContributionContractContributor>,
    operatorAddress?: Address
  ) {
    const contract = {
      ...basicContract,
      contributors: contributorArray,
      operator_address: operatorAddress ?? basicContract.operator_address,
    };

    return parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(['dupKey2']),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });
  }

  it('should not add a duplicate contract to hiddenContractsWithStakes when stake exists (0 staked)', () => {
    const result = hiddenWithStakeTestTemplate([CONTRIBUTOR(walletAddress)]);

    expect(result.hiddenContractsWithStakes).toHaveLength(0);
    // It should not appear in visibleContracts.
    expect(result.visibleContracts).toHaveLength(0);
  });

  it('should add a duplicate contract to hiddenContractsWithStakes when stake exists (>0 staked)', () => {
    const result = hiddenWithStakeTestTemplate([CONTRIBUTOR(walletAddress, 1000n)]);

    // With a positive stake, the duplicate is added to hiddenContractsWithStakes.
    expect(result.hiddenContractsWithStakes).toHaveLength(1);
    expect(result.hiddenContractsWithStakes[0]?.pubkey_bls).toBe('dupKey2');
    // It should not appear in visibleContracts.
    expect(result.visibleContracts).toHaveLength(0);
  });

  it('should add a duplicate contract to hiddenContractsWithStakes when stake exists (0 staked, operator address)', () => {
    const result = hiddenWithStakeTestTemplate([CONTRIBUTOR(walletAddress, 1000n)], walletAddress);

    // With a positive stake, the duplicate is added to hiddenContractsWithStakes.
    expect(result.hiddenContractsWithStakes).toHaveLength(1);
    expect(result.hiddenContractsWithStakes[0]?.pubkey_bls).toBe('dupKey2');
    // It should not appear in visibleContracts.
    expect(result.visibleContracts).toHaveLength(0);
  });

  it('should add a finalized contract with no Finalized event to visibleContracts', () => {
    // Contract with status Finalized but missing a "Finalized" event.
    const contract = {
      address: CONTRACT_ADDRESS[3],
      contributors: [],
      events: [
        DEPLOY_ARB_EVENT(80),
        // Note: no Finalized event provided.
      ],
      operator_address: WALLET_ADDRESS[3],
      service_node_pubkey: ED25519_ADDRESS[3],
      status: CONTRIBUTION_CONTRACT_STATUS.Finalized,
      fee: 40,
      manual_finalize: false,
      pubkey_bls: 'key4',
    };

    const result = parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });

    // With no Finalized event, a warning is logged and the contract is treated as visible.
    expect(result.visibleContracts).toHaveLength(1);
    expect(result.visibleContracts[0]).toEqual(contract);
    expect(result.joiningContracts).toHaveLength(0);
    expect(result.hiddenContractsWithStakes).toHaveLength(0);
  });

  it('should add a finalized contract with a Finalized event block less than nodeMinLifespanArbBlocks to joiningContracts', () => {
    const contract = {
      address: CONTRACT_ADDRESS[4],
      contributors: [],
      events: [
        DEPLOY_ARB_EVENT(90),
        FINALIZED_ARB_EVENT(50), // block 50 is less than nodeMinLifespanArbBlocks (100)
      ],
      operator_address: WALLET_ADDRESS[4],
      service_node_pubkey: ED25519_ADDRESS[4],
      status: CONTRIBUTION_CONTRACT_STATUS.Finalized,
      fee: 50,
      manual_finalize: false,
      pubkey_bls: 'key5',
    };

    const result = parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks: 100,
      blockHeight: 1000,
    });

    // Since the Finalized event's block (50) is less than the lifespan limit (nodeMinLifespanArbBlocks), it should be added to joiningContracts.
    expect(result.joiningContracts).toHaveLength(1);
    expect(result.joiningContracts[0]?.pubkey_bls).toBe('key5');
    // It should not be in visibleContracts.
    expect(result.visibleContracts).toHaveLength(0);
  });

  it('should hide a finalized contract with a Finalized event block greater or equal to nodeMinLifespanArbBlocks', () => {
    const contract = {
      address: CONTRACT_ADDRESS[5],
      contributors: [],
      events: [
        DEPLOY_ARB_EVENT(100),
        FINALIZED_ARB_EVENT(150), // block 150 is >= nodeMinLifespanArbBlocks (100)
      ],
      operator_address: WALLET_ADDRESS[5],
      service_node_pubkey: ED25519_ADDRESS[5],
      status: CONTRIBUTION_CONTRACT_STATUS.Finalized,
      fee: 60,
      manual_finalize: false,
      pubkey_bls: 'key6',
    };

    const result = parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks: 100,
      blockHeight: 1000,
    });

    // The finalized contract with a high block should be hidden (i.e. not added to any array).
    expect(result.visibleContracts).toHaveLength(0);
    expect(result.joiningContracts).toHaveLength(0);
    expect(result.hiddenContractsWithStakes).toHaveLength(0);
  });

  it('should correctly derive networkBlsKeys and networkContractIds from addedBlsKeys', () => {
    const contract = {
      address: CONTRACT_ADDRESS[6],
      contributors: [],
      events: [DEPLOY_ARB_EVENT(70)],
      operator_address: WALLET_ADDRESS[6],
      service_node_pubkey: ED25519_ADDRESS[6],
      status: CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib,
      fee: 70,
      manual_finalize: false,
      pubkey_bls: 'key7',
    };

    const addedBlsKeys = {
      networkKey1: 0,
      networkKey2: 1,
    };

    const result = parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys,
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });

    expect(result.networkBlsKeys).toEqual(new Set(['networkKey1', 'networkKey2']));
    expect(result.networkContractIds).toEqual(new Set([0, 1]));
  });

  it('should handle an empty contracts array', () => {
    const result = parseContracts({
      contracts: [],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });

    expect(result.visibleContracts).toHaveLength(0);
    expect(result.joiningContracts).toHaveLength(0);
    expect(result.hiddenContractsWithStakes).toHaveLength(0);
  });
  
  it('should not show contracts that are finalized', () => {
   const contract = {
      address: CONTRACT_ADDRESS[6],
      contributors: [{
        address: WALLET_ADDRESS[4],
        beneficiary_address: null,
        amount: 5000000000000n,
        reserved: 5000000000000n,
      }],
      events: [DEPLOY_ARB_EVENT(70), FINALIZED_ARB_EVENT(1000)],
      operator_address: WALLET_ADDRESS[6],
      service_node_pubkey: ED25519_ADDRESS[6],
      status: CONTRIBUTION_CONTRACT_STATUS.Finalized,
      fee: 70,
      manual_finalize: false,
      pubkey_bls: 'key7',
    };
    const result = parseContracts({
      contracts: [contract],
      address: walletAddress,
      addedBlsKeys: {},
      runningStakesBlsKeysSet: new Set(),
      nodeMinLifespanArbBlocks,
      blockHeight: 1000,
    });

    expect(result.visibleContracts).toHaveLength(0);
    expect(result.joiningContracts).toHaveLength(0);
    expect(result.hiddenContractsWithStakes).toHaveLength(0);
  });
});
