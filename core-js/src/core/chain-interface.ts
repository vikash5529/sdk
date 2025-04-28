import { NetworkConfig, SDKProvider } from '../types';

export class ChainInterface {
  private provider: SDKProvider;
  private network: NetworkConfig;

  constructor(provider: SDKProvider, network: NetworkConfig) {
    this.provider = provider;
    this.network = network;
  }

  async getChainId(): Promise<string | number> {
    return this.provider.getChainId();
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
    return this.provider.disconnect();
  }

  getNetwork(): NetworkConfig {
    return this.network;
  }
} 