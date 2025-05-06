import type { Address } from 'viem';
import type { Ed25519PublicKey } from './refine';
import type {
  BlsExitSignatureResponse,
  BlsRewardsResponse,
  BlsRewardsSignatureResponse,
  ContributionContractByKeyResponse,
  ContributionContractResponse,
  ExitLiquidationListResponse,
  NetworkInfoResponse,
  NodesBlsKeysResponse,
  RegistrationsResponse,
  StakesResponse,
} from './schema';

export interface RequestOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: BodyInit;
}

export interface StakingBackendResponse<T> {
  data: T | null;
  status: number;
  statusText: string;
}

export interface SSBClientConfig {
  baseUrl: string;
  logger?: typeof console;
  errorOn404?: boolean;
  debug?: boolean;
}

/**
 * Client for interacting with the Session Staking Backend API.
 */
export class SessionStakingClient {
  readonly baseUrl: string;
  private readonly debug?: boolean;
  private readonly logger = console;
  private readonly errorOn404: boolean = false;

  constructor(config: SSBClientConfig) {
    const { baseUrl, debug, logger, errorOn404 } = config;
    this.debug = debug;

    if (this.debug) {
      this.logger.debug('Initializing session staking backend client');
    }

    if (logger) {
      this.logger = logger;
    }

    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    if (!this.baseUrl) {
      throw new Error('baseUrl is required');
    }

    if (errorOn404) {
      this.errorOn404 = errorOn404;
    }
  }

  private async request<T>({
    endpoint,
    method,
    body,
  }: RequestOptions): Promise<StakingBackendResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      if (this.debug) {
        this.logger.time(url);
        if (body) this.logger.debug(body);
      }
      const res = await fetch(url, {
        method,
        body,
      });

      let data: T | null = null;
      if (!res.ok) {
        const errorMessage = `Staking Backend request failed (${res.status}): ${res.statusText}`;
        if (this.errorOn404) {
          throw new Error(errorMessage);
        }
        this.logger.error(errorMessage);
        data = null;
      } else {
        data = await res.json();
      }

      return { data, status: res.status, statusText: res.statusText };
    } finally {
      if (this.debug) this.logger.timeEnd(url);
    }
  }

  /**
   * Retrieves general network information.
   * @returns Network information.
   */
  public async getNetworkInfo(): Promise<StakingBackendResponse<NetworkInfoResponse>> {
    const options: RequestOptions = {
      endpoint: '/info',
      method: 'GET',
    };
    return await this.request<NetworkInfoResponse>(options);
  }

  public async getContributionContracts(): Promise<
    StakingBackendResponse<ContributionContractResponse>
  > {
    const options: RequestOptions = {
      endpoint: '/contract/contribution',
      method: 'GET',
    };
    return await this.request<ContributionContractResponse>(options);
  }

  public async getContributionContractForNodePubkey({
    nodePubKey,
  }: {
    nodePubKey: string;
  }): Promise<StakingBackendResponse<ContributionContractByKeyResponse>> {
    const options: RequestOptions = {
      endpoint: `/contract/contribution/${nodePubKey}`,
      method: 'GET',
    };
    return await this.request<ContributionContractByKeyResponse>(options);
  }

  /**
   * Retrieves service nodes associated with the given wallet address.
   * @param address Wallet address.
   * @returns stakes, historical stakes, and wallet information.
   */
  public async getStakesForWalletAddress({
    address,
  }: {
    address: string;
  }): Promise<StakingBackendResponse<StakesResponse>> {
    const options: RequestOptions = {
      endpoint: `/stakes/${address}`,
      method: 'GET',
    };
    return await this.request<StakesResponse>(options);
  }

  public async getNodesBlsKeys(): Promise<StakingBackendResponse<NodesBlsKeysResponse>> {
    const options: RequestOptions = {
      endpoint: '/nodes/bls',
      method: 'GET',
    };
    return await this.request<NodesBlsKeysResponse>(options);
  }

  public async getRewardsInfo({
    address,
  }: {
    address: string;
  }): Promise<StakingBackendResponse<BlsRewardsResponse>> {
    const options: RequestOptions = {
      endpoint: `/rewards/${address}`,
      method: 'GET',
    };
    return await this.request<BlsRewardsResponse>(options);
  }

  public async getRewardsClaimSignature({
    address,
  }: {
    address: string;
  }): Promise<StakingBackendResponse<BlsRewardsSignatureResponse>> {
    const options: RequestOptions = {
      endpoint: `/rewards/${address}`,
      method: 'POST',
    };
    return await this.request<BlsRewardsSignatureResponse>(options);
  }

  public async getNodeExitSignatures({
    nodePubKey,
  }: {
    nodePubKey: string;
  }): Promise<StakingBackendResponse<BlsExitSignatureResponse>> {
    const options: RequestOptions = {
      endpoint: `/exit/${nodePubKey}`,
      method: 'GET',
    };
    return await this.request<BlsExitSignatureResponse>(options);
  }

  public async getNodeLiquidation({
    nodePubKey,
  }: {
    nodePubKey: string;
  }): Promise<StakingBackendResponse<BlsExitSignatureResponse>> {
    const options: RequestOptions = {
      endpoint: `/liquidation/${nodePubKey}`,
      method: 'GET',
    };
    return await this.request<BlsExitSignatureResponse>(options);
  }

  public async exitLiquidationList() {
    const options: RequestOptions = {
      endpoint: '/exit_liquidation_list',
      method: 'GET',
    };
    return await this.request<ExitLiquidationListResponse>(options);
  }

  public async getNodes(): Promise<StakingBackendResponse<StakesResponse>> {
    const options: RequestOptions = {
      endpoint: '/nodes',
      method: 'GET',
    };
    return await this.request<StakesResponse>(options);
  }

  /**
   * Retrieves stored registrations associated with the given operator wallet.
   * @param operator Operator wallet address (Ethereum).
   * @returns Registrations.
   */
  public async getOperatorRegistrations({
    operator,
  }: {
    operator: Address | Ed25519PublicKey;
  }): Promise<StakingBackendResponse<RegistrationsResponse>> {
    const options: RequestOptions = {
      endpoint: `/registrations/${operator}`,
      method: 'GET',
    };
    return await this.request<RegistrationsResponse>(options);
  }
}

/**
 * Creates a new instance of the SessionStakingClient.
 *
 * @param config The configuration object for the SSB client.
 * @returns A new instance of the SessionStakingClient.
 */
export const createSessionStakingClient = (config: SSBClientConfig): SessionStakingClient =>
  new SessionStakingClient(config);
