// NOTE: This is a duplicate of the same enum in the ServiceNodeContribution.sol contract
// Definitions
// Track the status of the multi-contribution contract. At any point in the
// contract's lifetime, `reset` can be invoked to set the contract back to
// `WaitForOperatorContrib`.
export enum CONTRIBUTION_CONTRACT_STATUS {
  // Contract is initialised w/ no contributions. Call `contributeFunds`
  // to transition into `OpenForPublicContrib`
  WaitForOperatorContrib = 0,

  // Contract has been initially funded by operator. Public and reserved
  // contributors can now call `contributeFunds`. When the contract is
  // collaterialised with exactly the staking requirement, the contract
  // transitions into `WaitForFinalized` state.
  OpenForPublicContrib = 1,

  // Operator must invoke `finalizeNode` to transfer the tokens and the
  // node registration details to the `stakingRewardsContract` to
  // transition to `Finalized` state.
  WaitForFinalized = 2,

  // Contract interactions are blocked until `reset` is called.
  Finalized = 3,
}

export enum EXIT_TYPE {
  /** The node is deregistered by consensus */
  DEREGISTER = 'deregister',
  /** The node is exited by contributor request */
  EXIT = 'exit',
}

export enum ARBITRUM_EVENT {
  //////////////////////////////////////////////////////////////
  //          ServiceNodeContributionFactory Events           //
  //////////////////////////////////////////////////////////////
  /** New contribution contract. Emitted by the ServiceNodeContributionFactory contract */
  NewServiceNodeContributionContract = 'NewServiceNodeContributionContract',
  //////////////////////////////////////////////////////////////
  //               ServiceNodeContribution Events             //
  //////////////////////////////////////////////////////////////
  /** The contribution contract has been finalized. Emitted by the ServiceNodeContribution contract */
  Finalized = 'Finalized',
  /** A new contribution has been made. Emitted by the ServiceNodeContribution contract */
  NewContribution = 'NewContribution',
  /** Contract is open for public contributions. Emitted by the ServiceNodeContribution contract @see {@link CONTRIBUTION_CONTRACT_STATUS.OpenForPublicContrib} */
  OpenForPublicContribution = 'OpenForPublicContribution',
  /** Contract is filled. Emitted by the ServiceNodeContribution contract @see {@link CONTRIBUTION_CONTRACT_STATUS.Filled} */
  Filled = 'Filled',
  /** A Contribution has been withdrawn. Emitted by the ServiceNodeContribution contract */
  WithdrawContribution = 'WithdrawContribution',
  /** The staker's beneficiary address has been updated. Emitted by the ServiceNodeContribution contract */
  UpdateStakerBeneficiary = 'UpdateStakerBeneficiary',
  /** The contract's manual finalize flag has been updated. Emitted by the ServiceNodeContribution contract */
  UpdateManualFinalize = 'UpdateManualFinalize',
  /** The contract's fee has been updated. Emitted by the ServiceNodeContribution contract */
  UpdateFee = 'UpdateFee',
  /** The contract's pubkeys have been updated. Emitted by the ServiceNodeContribution contract */
  UpdatePubkeys = 'UpdatePubkeys',
  /** The contract's reserved contributors have been updated. Emitted by the ServiceNodeContribution contract */
  UpdateReservedContributors = 'UpdateReservedContributors',
  /** The contract has been reset. Emitted by the ServiceNodeContribution contract */
  Reset = 'Reset',
  //////////////////////////////////////////////////////////////
  //                ServiceNodeRewards Events                 //
  //////////////////////////////////////////////////////////////
  /** A new seeded service node has been created. Emitted by the ServiceNodeRewards contract */
  NewSeededServiceNode = 'NewSeededServiceNode',
  /** A new service node has been created. Emitted by the ServiceNodeRewards contract */
  NewServiceNodeV2 = 'NewServiceNodeV2',
  /** A service node exit request has been made. Emitted by the ServiceNodeRewards contract */
  ServiceNodeExitRequest = 'ServiceNodeExitRequest',
  /** A service node has exited. Emitted by the ServiceNodeRewards contract */
  ServiceNodeExit = 'ServiceNodeExit',
  /** A service node has been liquidated. Emitted by the ServiceNodeRewards contract */
  ServiceNodeLiquidated = 'ServiceNodeLiquidated',
  /** Rewards have been claimed. Emitted by the ServiceNodeRewards contract */
  RewardsClaimed = 'RewardsClaimed',
  /** The staking requirement has been updated. Emitted by the ServiceNodeRewards contract */
  StakingRequirementUpdated = 'StakingRequirementUpdated',
  /** The claim threshold has been updated. Emitted by the ServiceNodeRewards contract */
  ClaimThresholdUpdated = 'ClaimThresholdUpdated',
  /** The claim cycle has been updated. Emitted by the ServiceNodeRewards contract */
  ClaimCycleUpdated = 'ClaimCycleUpdated',
  /** The liquidation ratios have been updated. Emitted by the ServiceNodeRewards contract */
  LiquidationRatiosUpdated = 'LiquidationRatiosUpdated',
  /** The BLS non signer indices have been updated. Emitted by the ServiceNodeRewards contract */
  BLSNonSignerIndicesUpdated = 'BLSNonSignerIndicesUpdated',
  //////////////////////////////////////////////////////////////
  //                         Token Events                     //
  //////////////////////////////////////////////////////////////
  /** A token transfer has occurred. Emitted by the Token contract */
  Transfer = 'Transfer',
  /** An approval has occurred. Emitted by the Token contract */
  Approval = 'Approval',
}
