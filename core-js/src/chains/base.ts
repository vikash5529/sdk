import { NetworkConfig, SDKProvider } from '../types';
import { ChainInterface } from '../core/chain-interface';

export class BaseChain implements ChainInterface {
  protected provider: SDKProvider;
  protected network: NetworkConfig;

  constructor(network: NetworkConfig, provider: SDKProvider) {
    this.network = network;
    this.provider = provider;
  }

  async getAccounts(): Promise<string[]> {
    return this.provider.getAccounts();
  }

  async getBalance(address?: string): Promise<string> {
    return this.provider.getBalance(address);
  }

  async signMessage(message: string): Promise<string> {
    return this.provider.signMessage(message);
  }

  async sendTransaction(transaction: any): Promise<string> {
    return this.provider.sendTransaction(transaction);
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
  }

  getNetwork(): NetworkConfig {
    return this.network;
  }

  getProvider(): SDKProvider {
    return this.provider;
  }

  async init(): Promise<void> {
    // Base implementation
  }

  async getChainId(): Promise<string | number> {
    return this.network.id;
  }
} 