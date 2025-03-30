import { isAddress } from 'viem';
import { z } from 'zod';
import { ARBITRUM_EVENT, CONTRIBUTION_CONTRACT_STATUS, EXIT_TYPE } from './enums';
import { isEd25519PublicKey } from './refine';

//////////////////////////////////////////////////////////////
//                                                          //
//                      Base Schemas                        //
//                                                          //
//////////////////////////////////////////////////////////////

export const ethereumAddressSchema = z.string().refine(isAddress);
export const ed25519PublicKeySchema = z.string().refine(isEd25519PublicKey);
export const nonSignerIndicesSchema = z.array(z.coerce.bigint());

//////////////////////////////////////////////////////////////
//                                                          //
//                      Network Info                        //
//                                                          //
//////////////////////////////////////////////////////////////
export const networkInfoSchema = z.object({
  /** The number of active (non-decommissioned) nodes on the network */
  active_node_count: z.number(),
  /** Hash of the latest appchain block */
  block_hash: z.string(),
  /** Height of the latest appchain block */
  block_height: z.number(),
  /** Timestamp (seconds) of the latest appchain block */
  block_timestamp: z.number(),
  /** Current hard fork */
  hard_fork: z.number(),
  /** Hash of the last immutable appchain block */
  immutable_block_hash: z.string(),
  /** Height of the last immutable appchain block */
  immutable_block_height: z.number(),
  /** Maximum number of stakers allowed in a single node */
  max_stakers: z.number(),
  /** Median operator fee of registered nodes */
  median_operator_fee: z.number(),
  /** Minimum operator contribution required to register a node */
  min_operator_contribution: z.number(),
  /** Network type eg: mainnet, testnet */
  nettype: z.string(),
  /** Number of nodes on the network @see {@link networkInfoSchema.active_node_count} for active nodes */
  node_count: z.number(),
  /** Target timestamp for the next block */
  pulse_target_timestamp: z.number(),
  /** Current staking requirement for a single node */
  staking_requirement: z.number(),
  /** Version of the node the backend is running */
  version: z.string(),
});

export type NetworkInfo = z.infer<typeof networkInfoSchema>;

export const networkInfoResponseSchema = z.object({
  network: networkInfoSchema,
  t: z.number(),
});

export type NetworkInfoResponse = z.infer<typeof networkInfoResponseSchema>;

//////////////////////////////////////////////////////////////
//                                                          //
//                     Added BLS Keys                       //
//                                                          //
//////////////////////////////////////////////////////////////

export const addedBlsKeysSchema = z.record(z.string(), z.number());

export type AddedBlsKeys = z.infer<typeof addedBlsKeysSchema>;

export const nodesBlsKeysResponseSchema = z.object({
  network: networkInfoSchema,
  bls_keys: addedBlsKeysSchema,
  t: z.number(),
});

export type NodesBlsKeysResponse = z.infer<typeof nodesBlsKeysResponseSchema>;

//////////////////////////////////////////////////////////////
//                                                          //
//                    Arbitrum Events                       //
//                                                          //
//////////////////////////////////////////////////////////////

export const arbitrumEventSchema = z.object({
  /** Event data arguments, should be parseable as a JSON object */
  args: z.unknown(),
  /** Block this event was emitted in */
  block: z.number(),
  /** Index of this event in the block */
  log_index: z.number(),
  /** Main argument of the event. NOTE: This is super subjective and determined by the backend. It's the "most useful"
   *  argument, if the event is not emitted from a singleton contract it will be the contract's address, otherwise it
   *  will be something indexable or important. TODO (chore): document main_arg for each contract and event name */
  main_arg: z.string().nullable(),
  /** Event name */
  name: z.nativeEnum(ARBITRUM_EVENT),
  /** Hash of the transaction this event was emitted in */
  tx: z.string(),
});

export type ArbitrumEvent = z.infer<typeof arbitrumEventSchema>;

//////////////////////////////////////////////////////////////
//                                                          //
//                Contribution Contracts                    //
//                                                          //
//////////////////////////////////////////////////////////////

export const contributionContractContributorSchema = z.object({
  /** Contract address contributed to */
  address: ethereumAddressSchema,
  /** Beneficiary address of the contributor. This address will receive the rewards */
  beneficiary_address: ethereumAddressSchema.nullable(),
  /** Amount contributed to the contract (atomic) */
  amount: z.coerce.bigint(),
  /** Amount reserved for the contributor (atomic) */
  reserved: z.coerce.bigint(),
});

export type ContributionContractContributor = z.infer<typeof contributionContractContributorSchema>;

export const isContributionContractContributor = (
  value: object
): value is ContributionContractContributor => {
  // Because of the bigint coercion this needs to be explicitly checked before parsing
  if (!value || !('reserved' in value) || value.reserved === undefined) return false;
  return contributionContractContributorSchema.safeParse(value).success;
};

const contributionContractBaseSchema = z.object({
  /** Contract address */
  address: ethereumAddressSchema,
  /** Contributors to the contract */
  contributors: z.array(contributionContractContributorSchema),
  /** Events emitted by the contract */
  events: z.array(arbitrumEventSchema),
  /** Address of the node operator */
  operator_address: ethereumAddressSchema,
  /** Public ed25519 key of the node. This is the node's "SN key" */
  service_node_pubkey: ed25519PublicKeySchema,
  /** Status of the contract @see {@link CONTRIBUTION_CONTRACT_STATUS} */
  status: z
    .nativeEnum(CONTRIBUTION_CONTRACT_STATUS)
    .default(CONTRIBUTION_CONTRACT_STATUS.WaitForOperatorContrib),
});

export const contributionContractNotReadySchema = contributionContractBaseSchema.extend({
  /**
   * Basis points node fee (divide by 10,000 to get a decimal percentage)
   * Nullable because it's set ~250ms after the contract is created
   */
  fee: z.number().nullable(),
  /** If true, the contract must be manually finalized by the operator before it will join the network */
  manual_finalize: z.coerce.boolean(),
  /** Nullable because it's set ~250ms after the contract is created */
  pubkey_bls: z.string().nullable(),
});

export const contributionContractSchema = contributionContractBaseSchema.extend({
  /**
   * Basis points node fee (divide by 10,000 to get a decimal percentage)
   * Nullable because it's set ~250ms after the contract is created
   */
  fee: z.number(),
  /** If true, the contract must be manually finalized by the operator before it will join the network */
  manual_finalize: z.coerce.boolean(),
  /** Nullable because it's set ~250ms after the contract is created */
  pubkey_bls: z.string(),
});

export type ContributionContractNotReady = z.infer<typeof contributionContractNotReadySchema>;
export type ContributionContract = z.infer<typeof contributionContractSchema>;

export const contributionContractResponseSchema = z.object({
  network: networkInfoSchema,
  t: z.number(),
  contracts: z.array(contributionContractNotReadySchema),
  added_bls_keys: addedBlsKeysSchema,
});

export type ContributionContractResponse = z.infer<typeof contributionContractResponseSchema>;

export const contributionContractByKeyResponseSchema = z.object({
  network: networkInfoSchema,
  contract: contributionContractNotReadySchema.nullable(),
  t: z.number(),
});

export type ContributionContractByKeyResponse = z.infer<
  typeof contributionContractByKeyResponseSchema
>;

//////////////////////////////////////////////////////////////
//                                                          //
//                    Vesting Contracts                     //
//                                                          //
//////////////////////////////////////////////////////////////

export const vestingContractSchema = z.object({
  /** Contract address */
  address: ethereumAddressSchema,
  /** Beneficiary address of the contract. This is the contract's owner/controller */
  beneficiary: ethereumAddressSchema,
  /** Initial amount of tokens in the contract */
  initial_amount: z.coerce.bigint(),
  /** Initial beneficiary address of the contract */
  initial_beneficiary: ethereumAddressSchema,
  /** Address of the contract revoker. This address can effectively take control of the contract */
  revoker: ethereumAddressSchema,
  /** Timestamp when the contract's lock period ends */
  time_end: z.coerce.number(),
  /** Timestamp when the contract's lock period starts */
  time_start: z.coerce.number(),
  /** Whether the beneficiary address is transferable */
  transferable_beneficiary: z.coerce.boolean(),
});

export type VestingContract = z.infer<typeof vestingContractSchema>;

//////////////////////////////////////////////////////////////
//                                                          //
//                  Node Registrations                      //
//                                                          //
//////////////////////////////////////////////////////////////

export const nodeRegistrationSchema = z.object({
  /** Ethereum address of the node operator */
  operator: ethereumAddressSchema,
  /** BLS public key of the node */
  pubkey_bls: z.string(),
  /** Ed25519 public key of the node. This is the node's "SN key" */
  pubkey_ed25519: ed25519PublicKeySchema,
  /** BLS signature of the node */
  sig_bls: z.string(),
  /** Ed25519 signature of the node */
  sig_ed25519: z.string(),
  /** Timestamp of when the registration command was executed */
  timestamp: z.number(),
});

export type Registration = z.infer<typeof nodeRegistrationSchema>;

export const registrationsResponseSchema = z.object({
  network: networkInfoSchema,
  registrations: z.array(nodeRegistrationSchema),
});

export type RegistrationsResponse = z.infer<typeof registrationsResponseSchema>;

//////////////////////////////////////////////////////////////
//                                                          //
//                         Rewards                          //
//                                                          //
//////////////////////////////////////////////////////////////

export const blsRewardsResponseSchema = z.object({
  rewards: z.coerce.bigint(),
  network: networkInfoSchema,
  t: z.number(),
});

export type BlsRewardsResponse = z.infer<typeof blsRewardsResponseSchema>;

export const blsRewardsSignatureSchema = z.object({
  aggregate_pubkey: z.string(),
  /** The lifetime amount that the address can submit to the smart contract (the claimed amount
   *  allowed will be this minus any previously claimed amounts)*/
  amount: z.coerce.bigint(),
  /** The appchain blockchain height that the rewards have been calculated for */
  height: z.number(),
  /** The message that has been signed by the network */
  msg_to_sign: z.string(),
  /** Non signer contract ids (The nodes that didn't sign the rewards amount) */
  non_signer_indices: nonSignerIndicesSchema,
  /** Aggregate BLS signature for the rewards amount */
  signature: z.string(),
});

export type BlsRewardsSignature = z.infer<typeof blsRewardsSignatureSchema>;

export const blsRewardsSignatureResponseSchema = z.object({
  network: networkInfoSchema,
  rewards: blsRewardsSignatureSchema,
  t: z.number(),
});

export type BlsRewardsSignatureResponse = z.infer<typeof blsRewardsSignatureResponseSchema>;

//////////////////////////////////////////////////////////////
//                                                          //
//                  Exits & Liquidations                    //
//                                                          //
//////////////////////////////////////////////////////////////

export const blsExitSignatureSchema = z.object({
  /** The bls pubkey of the node to exit/liquidate */
  bls_pubkey: z.string(),
  /** The message that has been signed by the network */
  msg_to_sign: z.string(),
  /** Non signer contract ids (The nodes that didn't sign the exit) */
  non_signer_indices: nonSignerIndicesSchema,
  /** Exit BLS signature */
  signature: z.string(),
  /** Timestamp of when the exit signature was created */
  timestamp: z.number(),
});

export type BlsExitSignature = z.infer<typeof blsExitSignatureSchema>;

export const blsExitSignatureResponseSchema = z.object({
  network: networkInfoSchema,
  result: blsExitSignatureSchema,
  t: z.number(),
});

export type BlsExitSignatureResponse = z.infer<typeof blsExitSignatureResponseSchema>;

export const exitLiquidationListItemSchema = z.object({
  info: z.object({
    bls_public_key: z.string(),
  }),
  height: z.number(),
  liquidation_height: z.number(),
  service_node_pubkey: z.string(),
  type: z.string(),
  version: z.string(),
});

export type ExitLiquidationListItem = z.infer<typeof exitLiquidationListItemSchema>;

export const exitLiquidationListSchema = z.object({
  network: networkInfoSchema,
  result: z.array(exitLiquidationListItemSchema),
  t: z.number(),
});

export type ExitLiquidationListResponse = z.infer<typeof exitLiquidationListSchema>;

//////////////////////////////////////////////////////////////
//                                                          //
//                         Stakes                           //
//                                                          //
//////////////////////////////////////////////////////////////

export const stakeContributorSchema = z.object({
  address: ethereumAddressSchema,
  beneficiary: ethereumAddressSchema,
  amount: z.coerce.bigint(),
});

export type StakeContributor = z.infer<typeof stakeContributorSchema>;

export const stakeSchema = z.object({
  /** Whether the stake is running. If false, the stake is decommissioned */
  active: z.coerce.boolean(),
  /** Contract id of the stake. It's integer id in the sn rewards contract */
  contract_id: z.number(),
  /** Contributors to the stake */
  contributors: z.array(stakeContributorSchema),
  // decommission_count: z.number(),
  deregistration_height: z.number().nullable(),
  /** Number of blocks earned towards decommissioning (if currently active),
   *  or the number of blocks remaining until the service node is eligible
   *  for deregistration (if currently decommissioned). */
  earned_downtime_blocks: z.number(),
  /** Arbitrum events associated with the stake */
  events: z.array(arbitrumEventSchema),
  exit_type: z.nativeEnum(EXIT_TYPE).nullable(),
  // fetched_block_height: z.number(),
  // funded: z.coerce.boolean(),
  // is_liquidatable: z.coerce.boolean(),
  // is_removable: z.coerce.boolean(),
  /** Last appchain block height the rewards awarded for */
  last_reward_block_height: z.number(),
  /** Last appchain block height the node sent an uptime proof */
  last_uptime_proof: z.number(),
  liquidation_height: z.number().nullable(),
  // lokinet_version: z.array(z.number()).nullable(),
  /** Ethereum address of the node operator */
  operator_address: ethereumAddressSchema,
  operator_fee: z.number(),
  // payable: z.coerce.boolean(),
  /** BLS public key of the node */
  pubkey_bls: z.string(),
  /** Ed25519 public key of the node */
  pubkey_ed25519: ed25519PublicKeySchema,
  // public_ip: z.string().nullable(),
  // pulse_votes: z.object({
  //   missed: z.array(z.array(z.number())),
  // }),
  // quorumnet_port: z.number().nullable(),
  /** Appchain blockchain height that the registration finalized */
  registration_height: z.number(),
  // registration_hf_version: z.string(),
  /** Appchain blockchain height that the node requested to unlock */
  requested_unlock_height: z.number(),
  /** Ed25519 public key of the node */
  service_node_pubkey: ed25519PublicKeySchema,
  // service_node_version: z.array(z.number()),
  /** Total stake amount required for the node at registration time */
  staking_requirement: z.coerce.bigint(),
  // state_height: z.number(),
  // storage_lmq_port: z.number().nullable(),
  // storage_port: z.number().nullable(),
  // storage_server_version: z.array(z.number()),
  // swarm: z.string().nullable(),
  // swarm_id: z.string().nullable(),
  /** Total amount contributed to the node */
  total_contributed: z.coerce.bigint(),
});

export type Stake = z.infer<typeof stakeSchema>;

export const stakesResponseSchema = z.object({
  network: networkInfoSchema,
  contracts: z.array(contributionContractNotReadySchema),
  stakes: z.array(stakeSchema),
  vesting: z.array(vestingContractSchema),
  added_bls_keys: addedBlsKeysSchema,
  t: z.number(),
});

export type StakesResponse = z.infer<typeof stakesResponseSchema>;
